from __future__ import annotations

import logging
import statistics
from dataclasses import dataclass

import torch
import torchaudio

from core.phonemization import normalize_text, tokenize_text_with_word_map
from core.scoring import SCORING_CONFIG, score_phoneme
from models.dto import PhonemeScore

log = logging.getLogger("phoneme_service")


@dataclass
class AlignmentResult:
    phoneme_scores: list[PhonemeScore]
    alignment_source: str
    cer: float


def _levenshtein_distance(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)

    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, start=1):
        current = [i]
        for j, cb in enumerate(b, start=1):
            insert_cost = current[j - 1] + 1
            delete_cost = prev[j] + 1
            substitute_cost = prev[j - 1] + (ca != cb)
            current.append(min(insert_cost, delete_cost, substitute_cost))
        prev = current

    return prev[-1]


def char_error_rate(reference: str, hypothesis: str) -> float:
    if not reference:
        return 1.0
    return _levenshtein_distance(reference, hypothesis) / max(len(reference), 1)


def _select_alignment_text(reference_text: str, transcript: str) -> tuple[str, str, float, float]:
    reference_norm = normalize_text(reference_text)
    transcript_norm = normalize_text(transcript)

    if not transcript_norm:
        return reference_text, "reference", 1.0, 1.0

    cer = char_error_rate(reference_norm, transcript_norm)
    alignment_confidence = max(0.0, 1.0 - cer)

    if cer <= SCORING_CONFIG.transcript_cer_threshold:
        return transcript, "transcript", alignment_confidence, cer

    return reference_text, "reference", alignment_confidence, cer


def get_phoneme_scores(
    audio_path: str,
    reference_text: str,
    transcript: str,
    fa_model,
    tokenizer,
    aligner,
    fa_sample_rate: int,
) -> AlignmentResult:
    waveform, sample_rate = torchaudio.load(audio_path)

    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    if sample_rate != fa_sample_rate:
        waveform = torchaudio.functional.resample(waveform, sample_rate, fa_sample_rate)

    alignment_text, alignment_source, alignment_confidence, cer = _select_alignment_text(
        reference_text, transcript
    )

    tokens, token_word_indices, words = tokenize_text_with_word_map(alignment_text)

    tokenized = tokenizer(tokens)

    with torch.inference_mode():
        emission, _ = fa_model(waveform)
        emission = emission.squeeze(0)
        aligned = aligner(emission, tokenized)

    phoneme_scores: list[PhonemeScore] = []

    raw_scores = [
        statistics.fmean(getattr(s, "score", -10.0) for s in spans)
        for spans in aligned
        if spans
    ]
    if raw_scores:
        log.info(
            "Raw score distribution - min: %.2f, mean: %.2f, max: %.2f",
            min(raw_scores),
            statistics.fmean(raw_scores),
            max(raw_scores),
        )

    for idx, (token, spans) in enumerate(zip(tokens, aligned)):
        if spans:
            raw_score = statistics.fmean(getattr(s, "score", -10.0) for s in spans)
            duration_frames = len(spans)
        else:
            raw_score = -10.0
            duration_frames = 0

        confidence = score_phoneme(raw_score, duration_frames, alignment_confidence)

        word_index = token_word_indices[idx] if idx < len(token_word_indices) else None
        word = words[word_index] if word_index is not None and word_index < len(words) else None

        phoneme_scores.append(
            PhonemeScore(
                phoneme=token,
                score=round(confidence, 2),
                word=word,
                wordIndex=word_index,
            )
        )

    return AlignmentResult(
        phoneme_scores=phoneme_scores,
        alignment_source=alignment_source,
        cer=cer,
    )
