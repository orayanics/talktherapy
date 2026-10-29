from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class PhonemeScore(BaseModel):
    phoneme: str
    score: float = Field(ge=0.0, le=100.0)
    word: str | None = None
    wordIndex: int | None = None


class LowScoringUnit(BaseModel):
    unit: str
    score: float = Field(ge=0.0, le=100.0)


class WordAssessment(BaseModel):
    word: str | None = None
    avgScore: float = Field(ge=0.0, le=100.0)
    status: Literal["accurate", "mixed", "needs_work"]
    lowUnits: list[LowScoringUnit] = Field(default_factory=list)


class UnitAssessment(BaseModel):
    unit: str
    avgScore: float = Field(ge=0.0, le=100.0)
    examples: list[str] = Field(default_factory=list)


class OverallAssessment(BaseModel):
    avgScore: float = Field(ge=0.0, le=100.0)
    percentAboveNeedsWork: float = Field(ge=0.0, le=100.0)
    status: Literal["accurate", "mixed", "needs_work", "unknown"]


class StructuredAssessment(BaseModel):
    reference: str
    transcript: str
    overall: OverallAssessment
    words: list[WordAssessment] = Field(default_factory=list)
    accurateUnits: list[UnitAssessment] = Field(default_factory=list)
    needsWorkUnits: list[UnitAssessment] = Field(default_factory=list)


class AssessMeta(BaseModel):
    alignmentSource: Literal["reference", "transcript"]
    cer: float = Field(ge=0.0)


class AssessAnalysis(BaseModel):
    transcript: str
    # phonemeScores: list[PhonemeScore]
    lowScoring: list[PhonemeScore]
    structured: StructuredAssessment


class AssessFeedback(BaseModel):
    text: str


class AssessResponse(BaseModel):
    meta: AssessMeta
    analysis: AssessAnalysis
    feedback: AssessFeedback
