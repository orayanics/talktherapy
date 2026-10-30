"""Practice feedback without unvalidated acoustic correctness judgments."""

from __future__ import annotations

import re
import unicodedata

from phoneme_service.models.dto import (
    AssessAnalysis,
    AssessFeedback,
    AssessMeta,
    AssessResponse,
    OverallAssessment,
    StructuredAssessment,
)


def _normalize(text: str) -> str:
    text = unicodedata.normalize("NFC", text).casefold()
    return " ".join(re.findall(r"[^\W_]+(?:'[^\W_]+)*", text))


def transcript_agreement_error(reference: str, transcript: str) -> float:
    reference, transcript = _normalize(reference), _normalize(transcript)
    if not reference:
        raise ValueError("Reference contains no supported words")
    previous = list(range(len(transcript) + 1))
    for index, expected in enumerate(reference, 1):
        current = [index]
        for offset, observed in enumerate(transcript, 1):
            current.append(
                min(
                    current[-1] + 1,
                    previous[offset] + 1,
                    previous[offset - 1] + (expected != observed),
                )
            )
        previous = current
    return previous[-1] / len(reference)


def build_practice_response(
    reference: str, transcript: str, *, model_version: str, language: str = "en"
) -> AssessResponse:
    cer = transcript_agreement_error(reference, transcript)
    status = "review_required"
    feedback = (
        "Thanks for trying! Listen to your recording together, then try again or take a break."
    )
    if not _normalize(transcript):
        status = "unscorable"
        feedback = "That was hard for me to hear. Try again somewhere quieter, or take a break."
    elif cer > 0.25:
        status = "task_mismatch"
        feedback = "I heard something different. Listen together and check the practice word."
    return AssessResponse(
        meta=AssessMeta(
            alignmentSource="none",
            cer=round(cer, 4),
            status=status,
            modelVersion=model_version,
            language=language,
        ),
        analysis=AssessAnalysis(
            transcript=transcript,
            lowScoring=[],
            structured=StructuredAssessment(
                reference=reference,
                transcript=transcript,
                # Compatibility envelope only: status unknown means these zeros
                # are placeholders, never measured pronunciation percentages.
                overall=OverallAssessment(avgScore=0, percentAboveNeedsWork=0, status="unknown"),
            ),
        ),
        feedback=AssessFeedback(text=feedback),
    )
