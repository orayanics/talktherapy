from __future__ import annotations

import asyncio
import logging
import os
import subprocess
import tempfile
from typing import Optional

from fastapi import APIRouter, Form, HTTPException, UploadFile
import torchaudio
from torchaudio.pipelines import MMS_FA as bundle

from core.alignment import get_phoneme_scores
from core.assessment import build_structured_assessment, format_feedback_from_structured
from core.phonemization import configure_allowed_alignment_chars
from core.scoring import SCORING_CONFIG
from models.dto import AssessAnalysis, AssessFeedback, AssessMeta, AssessResponse
from services.asr import transcribe
from services.llm import fetch_llm_feedback

router = APIRouter()
log = logging.getLogger("phoneme_service")

_fa_model = bundle.get_model()
_tokenizer = bundle.get_tokenizer()
_aligner = bundle.get_aligner()
configure_allowed_alignment_chars(set(_tokenizer.dictionary.keys()))


def convert_to_wav(input_path: str) -> str:
    output_path = input_path + ".wav"
    subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, "-ac", "1", "-ar", "16000", output_path],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
    )
    return output_path


@router.post("/assess", response_model=AssessResponse)
async def assess(audio: UploadFile, referenceText: str = Form(..., min_length=1, max_length=800)):
    suffix = os.path.splitext(audio.filename or "recording.webm")[1] or ".webm"

    raw_path: Optional[str] = None
    wav_path: Optional[str] = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await audio.read())
            raw_path = tmp.name

        wav_path = await asyncio.to_thread(convert_to_wav, raw_path)

        transcript = transcribe(wav_path)
        log.info("Transcript: %r", transcript)

        alignment = get_phoneme_scores(
            audio_path=wav_path,
            reference_text=referenceText,
            transcript=transcript,
            fa_model=_fa_model,
            tokenizer=_tokenizer,
            aligner=_aligner,
            fa_sample_rate=bundle.sample_rate,
        )

        structured_assessment = build_structured_assessment(
            reference_text=referenceText,
            transcript=transcript,
            phoneme_scores=alignment.phoneme_scores,
        )
        feedback_text = format_feedback_from_structured(structured_assessment)

        llm_feedback, llm_error = await fetch_llm_feedback(structured_assessment)

        low_scoring = [
            p
            for p in alignment.phoneme_scores
            if p.score < SCORING_CONFIG.threshold_needs_work
        ]

        return AssessResponse(
            meta=AssessMeta(
                alignmentSource=alignment.alignment_source,
                cer=round(alignment.cer, 4),
            ),
            analysis=AssessAnalysis(
                transcript=transcript,
                lowScoring=low_scoring,
                structured=structured_assessment,
            ),
            feedback=AssessFeedback(
                text=feedback_text,
                structured=llm_feedback,
                llmError=llm_error,
            ),
        )

    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except subprocess.CalledProcessError as exc:
        raise HTTPException(status_code=422, detail=f"Audio conversion failed: {exc}") from exc
    except HTTPException:
        raise
    except Exception as exc:
        log.exception("Assessment failed")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {exc}") from exc
    finally:
        for path in (raw_path, wav_path):
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except OSError as exc:
                    log.warning("Could not remove temp file %s: %s", path, exc)
