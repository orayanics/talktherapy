import os
import tempfile
import subprocess
import difflib
import json
import re
import statistics

from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

import torchaudio
import torch

from faster_whisper import WhisperModel
from phonemizer import phonemize
from torchaudio.pipelines import MMS_FA as bundle

import httpx

app = FastAPI()

# --- Models ---
whisper = WhisperModel("base", device="cpu", compute_type="int8")

fa_model = bundle.get_model()
tokenizer = bundle.get_tokenizer()
aligner = bundle.get_aligner()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|192\.168\.1\.10)(:\d+)?$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# --- Alignment config ---
ALLOWED_ALIGNMENT_CHARS = set(tokenizer.dictionary.keys())

IPA_REPLACEMENTS = [
    ("tʃ", "ch"),
    ("dʒ", "j"),
    ("ʃ", "sh"),
    ("ʒ", "zh"),
    ("θ", "th"),
    ("ð", "dh"),
    ("ŋ", "ng"),
    ("ɑ", "a"),
    ("æ", "a"),
    ("ɒ", "o"),
    ("ɔ", "o"),
    ("ɛ", "e"),
    ("ɪ", "i"),
    ("ʊ", "u"),
    ("ə", "e"),
    ("ɜ", "e"),
    ("ɹ", "r"),
    ("ɾ", "r"),
    ("ʌ", "u"),
    ("ː", ""),
    ("ˈ", ""),
    ("ˌ", ""),
]


WORD_RE = re.compile(r"[A-Za-z0-9']+")

SCORE_THRESHOLDS = {
    "accurate": 85.0,
    "needs_work": 70.0,
}

DIGRAPHS = {
    "ch",
    "sh",
    "zh",
    "th",
    "dh",
    "ng",
}


# ----------------------------
# Audio utilities
# ----------------------------
def convert_to_wav(input_path: str) -> str:
    output_path = input_path + ".wav"

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-ac",
            "1",
            "-ar",
            "16000",
            output_path,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )

    return output_path


# ----------------------------
# Text → phoneme tokens
# ----------------------------
def build_alignment_tokens(text: str):
    ipa = phonemize(
        text,
        backend="espeak",
        language="en-us",
        with_stress=False,
    ).lower()

    for src, tgt in IPA_REPLACEMENTS:
        ipa = ipa.replace(src, tgt)

    tokens = [c for c in ipa if c in ALLOWED_ALIGNMENT_CHARS]

    if not tokens:
        raise ValueError("No valid alignment tokens after IPA normalization")

    return tokens


def tokenize_reference_with_word_map(reference_text: str):
    words = WORD_RE.findall(reference_text.lower())

    tokens: list[str] = []
    token_word_indices: list[int] = []
    kept_words: list[str] = []

    for word in words:
        try:
            word_tokens = build_alignment_tokens(word)
        except Exception:
            # Skip words that can't be phonemized/tokenized (e.g., only punctuation)
            continue

        if not word_tokens:
            continue

        word_index = len(kept_words)
        kept_words.append(word)
        tokens.extend(word_tokens)
        token_word_indices.extend([word_index] * len(word_tokens))

    if not tokens:
        raise ValueError("No valid alignment tokens for reference text")

    return tokens, token_word_indices, kept_words


def merge_digraph_units(phoneme_scores: list[dict]):
    merged: list[dict] = []
    i = 0
    while i < len(phoneme_scores):
        cur = phoneme_scores[i]
        nxt = phoneme_scores[i + 1] if i + 1 < len(phoneme_scores) else None

        if (
            nxt is not None
            and cur.get("wordIndex") is not None
            and cur.get("wordIndex") == nxt.get("wordIndex")
        ):
            candidate = f"{cur.get('phoneme', '')}{nxt.get('phoneme', '')}"
            if candidate in DIGRAPHS:
                merged.append(
                    {
                        "unit": candidate,
                        "score": round((float(cur.get("score", 0.0)) + float(nxt.get("score", 0.0))) / 2.0, 2),
                        "word": cur.get("word"),
                        "wordIndex": cur.get("wordIndex"),
                    }
                )
                i += 2
                continue

        merged.append(
            {
                "unit": cur.get("phoneme"),
                "score": float(cur.get("score", 0.0)),
                "word": cur.get("word"),
                "wordIndex": cur.get("wordIndex"),
            }
        )
        i += 1

    return merged


def build_structured_assessment(reference_text: str, transcript: str, phoneme_scores: list[dict]):
    if not phoneme_scores:
        return {
            "reference": reference_text,
            "transcript": transcript,
            "overall": {
                "avgScore": 0.0,
                "percentAboveNeedsWork": 0.0,
                "status": "unknown",
            },
            "words": [],
            "accurateUnits": [],
            "needsWorkUnits": [],
        }

    unit_scores = merge_digraph_units(phoneme_scores)

    all_scores = [float(p.get("score", 0.0)) for p in unit_scores]
    avg_score = statistics.fmean(all_scores) if all_scores else 0.0
    pct_above = (
        (sum(1 for s in all_scores if s >= SCORE_THRESHOLDS["needs_work"]) / len(all_scores))
        * 100.0
        if all_scores
        else 0.0
    )

    if avg_score >= SCORE_THRESHOLDS["accurate"]:
        overall_status = "accurate"
    elif avg_score >= SCORE_THRESHOLDS["needs_work"]:
        overall_status = "mixed"
    else:
        overall_status = "needs_work"

    # Per-word breakdown
    per_word: dict[int, dict] = {}
    for unit in unit_scores:
        idx = unit.get("wordIndex")
        if idx is None:
            continue
        idx = int(idx)
        if idx not in per_word:
            per_word[idx] = {
                "word": unit.get("word"),
                "avgScore": 0.0,
                "status": "unknown",
                "lowUnits": [],
            }
        per_word[idx].setdefault("_scores", []).append(float(unit.get("score", 0.0)))
        if float(unit.get("score", 0.0)) < SCORE_THRESHOLDS["needs_work"]:
            per_word[idx]["lowUnits"].append({"unit": unit.get("unit"), "score": float(unit.get("score", 0.0))})

    words_out: list[dict] = []
    for idx in sorted(per_word.keys()):
        scores = per_word[idx].pop("_scores", [])
        word_avg = statistics.fmean(scores) if scores else 0.0
        per_word[idx]["avgScore"] = round(word_avg, 2)
        if word_avg >= SCORE_THRESHOLDS["accurate"]:
            per_word[idx]["status"] = "accurate"
        elif word_avg >= SCORE_THRESHOLDS["needs_work"]:
            per_word[idx]["status"] = "mixed"
        else:
            per_word[idx]["status"] = "needs_work"
        # sort low units ascending (worst first)
        per_word[idx]["lowUnits"] = sorted(per_word[idx]["lowUnits"], key=lambda x: x["score"])
        words_out.append(per_word[idx])

    # Unit aggregates across words
    agg: dict[str, dict] = {}
    for unit in unit_scores:
        u = str(unit.get("unit"))
        if not u or u == "None":
            continue
        agg.setdefault(u, {"unit": u, "scores": [], "words": set()})
        agg[u]["scores"].append(float(unit.get("score", 0.0)))
        if unit.get("word"):
            agg[u]["words"].add(str(unit.get("word")))

    unit_avgs = []
    for u, data in agg.items():
        scores = data["scores"]
        if not scores:
            continue
        unit_avgs.append(
            {
                "unit": u,
                "avgScore": round(statistics.fmean(scores), 2),
                "examples": sorted(list(data["words"]))[:5],
            }
        )

    accurate_units = sorted(
        [u for u in unit_avgs if u["avgScore"] >= SCORE_THRESHOLDS["accurate"]],
        key=lambda x: (-x["avgScore"], x["unit"]),
    )
    needs_work_units = sorted(
        [u for u in unit_avgs if u["avgScore"] < SCORE_THRESHOLDS["needs_work"]],
        key=lambda x: (x["avgScore"], x["unit"]),
    )

    return {
        "reference": reference_text,
        "transcript": transcript,
        "overall": {
            "avgScore": round(avg_score, 2),
            "percentAboveNeedsWork": round(pct_above, 2),
            "status": overall_status,
        },
        "words": words_out,
        "accurateUnits": accurate_units[:10],
        "needsWorkUnits": needs_work_units[:10],
    }


def format_feedback_from_structured(structured: dict):
    overall = structured.get("overall", {})
    lines = []
    lines.append("Pronunciation assessment (score-based)")
    lines.append(
        f"Overall: avg {overall.get('avgScore', 0.0)}% • {overall.get('percentAboveNeedsWork', 0.0)}% of units ≥ {SCORE_THRESHOLDS['needs_work']:.0f}%"
    )

    words = structured.get("words", []) or []
    if words:
        lines.append("\nWord breakdown:")
        for w in words[:12]:
            word = w.get("word") or "(unknown)"
            avg = w.get("avgScore", 0.0)
            status = w.get("status", "unknown")
            low = w.get("lowUnits", []) or []
            focus = ", ".join(f"{x.get('unit')}({float(x.get('score', 0.0)):.0f}%)" for x in low[:4])
            if focus:
                lines.append(f"- {word}: {avg:.1f}% ({status}) — focus: {focus}")
            else:
                lines.append(f"- {word}: {avg:.1f}% ({status})")

    needs = structured.get("needsWorkUnits", []) or []
    if needs:
        lines.append("\nNeeds improvement (lowest-scoring units):")
        for item in needs[:10]:
            ex = ", ".join(item.get("examples", []) or [])
            suffix = f" — e.g. {ex}" if ex else ""
            lines.append(f"- {item.get('unit')}: {float(item.get('avgScore', 0.0)):.1f}%{suffix}")

    accurate = structured.get("accurateUnits", []) or []
    if accurate:
        lines.append("\nAccurate (highest-scoring units):")
        for item in accurate[:10]:
            ex = ", ".join(item.get("examples", []) or [])
            suffix = f" — e.g. {ex}" if ex else ""
            lines.append(f"- {item.get('unit')}: {float(item.get('avgScore', 0.0)):.1f}%{suffix}")

    return "\n".join(lines).strip()


# ----------------------------
# ASR
# ----------------------------
def transcribe(audio_path: str) -> str:
    segments, _ = whisper.transcribe(audio_path, language="en")
    return " ".join(s.text for s in segments).strip()


# ----------------------------
# Phoneme scoring (FIXED)
# ----------------------------
def get_phoneme_scores(audio_path: str, reference_text: str, transcript: str):
    waveform, sample_rate = torchaudio.load(audio_path)

    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    if sample_rate != bundle.sample_rate:
        waveform = torchaudio.functional.resample(
            waveform,
            sample_rate,
            bundle.sample_rate,
        )

    ref_tokens, ref_word_indices, ref_words = tokenize_reference_with_word_map(reference_text)
    transcript_tokens = build_alignment_tokens(transcript) if transcript else []
    tokenized = tokenizer(ref_tokens)

    with torch.inference_mode():
        emission, _ = fa_model(waveform)
        emission = emission.squeeze(0)

        aligned = aligner(emission, tokenized)

    phoneme_scores = []
    similarity_ratio = 0.0
    if transcript_tokens:
        similarity_ratio = difflib.SequenceMatcher(None, ref_tokens, transcript_tokens).ratio()

    for idx, (token, spans) in enumerate(zip(ref_tokens, aligned)):
        score = -10.0

        if spans is None:
            score = -10.0

        elif isinstance(spans, list):
            if len(spans) > 0:
                score = max(getattr(s, "score", -10.0) for s in spans)

        else:
            score = getattr(spans, "score", -10.0)

        # FIX: no exp, no arbitrary scaling, no saturation
        # map roughly [-10, 0] → [0, 100]
        confidence = (score + 10.0) * 10.0
        confidence = max(0.0, min(100.0, confidence))
        if similarity_ratio < 0.9:
            confidence *= similarity_ratio

        word_index = ref_word_indices[idx] if idx < len(ref_word_indices) else None
        word = ref_words[word_index] if word_index is not None and word_index < len(ref_words) else None

        phoneme_scores.append(
            {
                "phoneme": token,
                "score": round(confidence, 2),
                "word": word,
                "wordIndex": word_index,
            }
        )

    return phoneme_scores


# ----------------------------
# API
# ----------------------------
@app.post("/assess")
async def assess(audio: UploadFile, referenceText: str = Form(...)):
    suffix = os.path.splitext(audio.filename or "recording.webm")[1] or ".webm"

    raw_path = None
    wav_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await audio.read())
            raw_path = tmp.name

        wav_path = convert_to_wav(raw_path)

        transcript = ""
        phoneme_scores = []
        low_scoring = []
        feedback = ""
        feedback_structured = None
        error = None

        # --- transcription ---
        try:
            transcript = transcribe(wav_path)
        except Exception as e:
            error = f"transcription failed: {str(e)}"

        # --- alignment ---
        if error is None:
            try:
                phoneme_scores = get_phoneme_scores(wav_path, referenceText, transcript)
                low_scoring = [p for p in phoneme_scores if p["score"] < 70]
            except Exception as e:
                error = f"alignment failed: {str(e)}"

        # --- Structured assessment (score-driven) ---
        if error is None:
            try:
                feedback_structured = build_structured_assessment(referenceText, transcript, phoneme_scores)
                # default deterministic feedback
                feedback = format_feedback_from_structured(feedback_structured)
            except Exception as e:
                error = f"feedback build failed: {str(e)}"

        # --- Optional LLM phrasing (strict JSON, temperature=0) ---
        if error is None and feedback_structured is not None:
            schema_hint = {
                "overallSummary": "string (1-2 short sentences)",
                "needsWork": [
                    {
                        "unit": "string (MUST be one of needsWorkUnits[].unit)",
                        "avgScore": "number (copy from needsWorkUnits)",
                        "note": "string (short, clinical cue)",
                    }
                ],
                "accurate": [
                    {
                        "unit": "string (MUST be one of accurateUnits[].unit)",
                        "avgScore": "number (copy from accurateUnits)",
                        "note": "string (short reinforcement)",
                    }
                ],
                "nextPractice": ["string", "string"],
            }

            prompt = (
                "You are a speech-language pathology assistant.\n"
                "Use ONLY the provided score analysis to write feedback.\n"
                "Do NOT invent units/phonemes, words, or scores.\n"
                "Return ONLY valid JSON matching this shape:\n"
                + json.dumps(schema_hint, indent=2)
                + "\n\nHere is the score analysis JSON (ground truth):\n"
                + json.dumps(feedback_structured, indent=2)
            )

            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        f"{OLLAMA_BASE_URL}/api/chat",
                        json={
                            "model": "qwen2.5:3b",
                            "messages": [{"role": "user", "content": prompt}],
                            "stream": False,
                            "options": {
                                "temperature": 0,
                                "top_p": 1,
                                "seed": 42,
                            },
                        },
                        timeout=httpx.Timeout(connect=10.0, read=300.0, write=30.0, pool=10.0),
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    content = data.get("message", {}).get("content", "")

                # Parse LLM JSON; if it fails, keep deterministic feedback
                llm_obj = None
                try:
                    llm_obj = json.loads(content)
                except Exception:
                    llm_obj = None

                if isinstance(llm_obj, dict):
                    # Attach for clients that want it
                    feedback_structured["llm"] = llm_obj
            except httpx.HTTPError as e:
                status = getattr(e.response, "status_code", "unknown") if hasattr(e, "response") else "unknown"
                body = ""
                if hasattr(e, "response") and e.response is not None:
                    body = e.response.text[:500]
                feedback_structured = feedback_structured or {}
                feedback_structured["llmError"] = f"{type(e).__name__} status={status} body={body}"
            except Exception as e:
                feedback_structured = feedback_structured or {}
                feedback_structured["llmError"] = f"{type(e).__name__} {str(e)}"

        return {
            "transcript": transcript,
            "phonemeScores": phoneme_scores,
            "lowScoring": low_scoring or [],
            "feedback": feedback,
            "feedbackStructured": feedback_structured,
            "error": error,
        }

    finally:
        if raw_path and os.path.exists(raw_path):
            os.remove(raw_path)
        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)