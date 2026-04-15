from __future__ import annotations

import statistics
from typing import Optional

from core.phonemization import DIGRAPHS
from core.scoring import SCORING_CONFIG
from models.dto import (
    LowScoringUnit,
    PhonemeScore,
    StructuredAssessment,
    UnitAssessment,
    WordAssessment,
)


def merge_digraph_units(phoneme_scores: list[PhonemeScore]) -> list[dict]:
    merged: list[dict] = []
    i = 0
    while i < len(phoneme_scores):
        cur = phoneme_scores[i]
        nxt = phoneme_scores[i + 1] if i + 1 < len(phoneme_scores) else None

        if nxt is not None and cur.wordIndex is not None and cur.wordIndex == nxt.wordIndex:
            candidate = f"{cur.phoneme}{nxt.phoneme}"
            if candidate in DIGRAPHS:
                merged.append(
                    {
                        "unit": candidate,
                        "score": round((cur.score + nxt.score) / 2.0, 2),
                        "word": cur.word,
                        "wordIndex": cur.wordIndex,
                    }
                )
                i += 2
                continue

        merged.append(
            {
                "unit": cur.phoneme,
                "score": cur.score,
                "word": cur.word,
                "wordIndex": cur.wordIndex,
            }
        )
        i += 1

    return merged


def _score_status(score: float) -> str:
    if score >= SCORING_CONFIG.threshold_accurate:
        return "accurate"
    if score >= SCORING_CONFIG.threshold_needs_work:
        return "mixed"
    return "needs_work"


def build_structured_assessment(
    reference_text: str,
    transcript: str,
    phoneme_scores: list[PhonemeScore],
) -> StructuredAssessment:
    if not phoneme_scores:
        return StructuredAssessment(
            reference=reference_text,
            transcript=transcript,
            overall={
                "avgScore": 0.0,
                "percentAboveNeedsWork": 0.0,
                "status": "unknown",
            },
            words=[],
            accurateUnits=[],
            needsWorkUnits=[],
        )

    unit_scores = merge_digraph_units(phoneme_scores)
    all_scores = [float(u["score"]) for u in unit_scores]
    avg_score = statistics.fmean(all_scores)
    pct_above = (
        sum(1 for s in all_scores if s >= SCORING_CONFIG.threshold_needs_work) / len(all_scores)
    ) * 100.0

    per_word: dict[int, dict] = {}
    for unit in unit_scores:
        idx = unit.get("wordIndex")
        if idx is None:
            continue
        entry = per_word.setdefault(
            int(idx),
            {
                "word": unit.get("word"),
                "scores": [],
                "lowUnits": [],
            },
        )
        score = float(unit["score"])
        entry["scores"].append(score)
        if score < SCORING_CONFIG.threshold_needs_work:
            entry["lowUnits"].append(LowScoringUnit(unit=str(unit["unit"]), score=round(score, 2)))

    words_out: list[WordAssessment] = []
    for idx in sorted(per_word):
        word_entry = per_word[idx]
        scores = word_entry["scores"]
        word_avg = statistics.fmean(scores) if scores else 0.0
        words_out.append(
            WordAssessment(
                word=word_entry["word"],
                avgScore=round(word_avg, 2),
                status=_score_status(word_avg),
                lowUnits=sorted(word_entry["lowUnits"], key=lambda x: x.score),
            )
        )

    agg: dict[str, dict] = {}
    for unit in unit_scores:
        key = str(unit.get("unit") or "")
        if not key:
            continue
        rec = agg.setdefault(key, {"scores": [], "words": set()})
        rec["scores"].append(float(unit["score"]))
        if unit.get("word"):
            rec["words"].add(str(unit["word"]))

    unit_avgs: list[UnitAssessment] = []
    for unit, data in agg.items():
        score = statistics.fmean(data["scores"])
        unit_avgs.append(
            UnitAssessment(
                unit=unit,
                avgScore=round(score, 2),
                examples=sorted(data["words"])[:5],
            )
        )

    accurate_units = sorted(
        [u for u in unit_avgs if u.avgScore >= SCORING_CONFIG.threshold_accurate],
        key=lambda x: (-x.avgScore, x.unit),
    )[:10]

    needs_work_units = sorted(
        [u for u in unit_avgs if u.avgScore < SCORING_CONFIG.threshold_needs_work],
        key=lambda x: (x.avgScore, x.unit),
    )[:10]

    return StructuredAssessment(
        reference=reference_text,
        transcript=transcript,
        overall={
            "avgScore": round(avg_score, 2),
            "percentAboveNeedsWork": round(pct_above, 2),
            "status": _score_status(avg_score),
        },
        words=words_out,
        accurateUnits=accurate_units,
        needsWorkUnits=needs_work_units,
    )


def format_feedback_from_structured(structured: StructuredAssessment) -> str:
    overall = structured.overall
    lines = [
        "Pronunciation Assessment",
        f"Overall: {overall.avgScore:.1f}% avg  |  {overall.percentAboveNeedsWork:.1f}% of units >= {SCORING_CONFIG.threshold_needs_work:.0f}%  |  Status: {overall.status}",
    ]

    if structured.words:
        lines.append("\nWord breakdown:")
        for w in structured.words[:15]:
            focus_parts = [f"{x.unit}({x.score:.0f}%)" for x in w.lowUnits[:5]]
            suffix = f" | focus: {', '.join(focus_parts)}" if focus_parts else ""
            word = w.word or "(unknown)"
            lines.append(f"  {word}: {w.avgScore:.1f}% ({w.status}){suffix}")

    if structured.needsWorkUnits:
        lines.append("\nNeeds improvement (lowest-scoring units):")
        for item in structured.needsWorkUnits:
            suffix = f" | e.g. {', '.join(item.examples)}" if item.examples else ""
            lines.append(f"  {item.unit}: {item.avgScore:.1f}%{suffix}")

    if structured.accurateUnits:
        lines.append("\nAccurate (highest-scoring units):")
        for item in structured.accurateUnits:
            suffix = f" | e.g. {', '.join(item.examples)}" if item.examples else ""
            lines.append(f"  {item.unit}: {item.avgScore:.1f}%{suffix}")

    return "\n".join(lines).strip()
