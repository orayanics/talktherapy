from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class PhonemeScore(BaseModel):
    phoneme: str
    score: float = Field(ge=0.0, le=100.0)
    word: Optional[str] = None
    wordIndex: Optional[int] = None


class LowScoringUnit(BaseModel):
    unit: str
    score: float = Field(ge=0.0, le=100.0)


class WordAssessment(BaseModel):
    word: Optional[str] = None
    avgScore: float = Field(ge=0.0, le=100.0)
    status: str
    lowUnits: list[LowScoringUnit] = Field(default_factory=list)


class UnitAssessment(BaseModel):
    unit: str
    avgScore: float = Field(ge=0.0, le=100.0)
    examples: list[str] = Field(default_factory=list)


class OverallAssessment(BaseModel):
    avgScore: float = Field(ge=0.0, le=100.0)
    percentAboveNeedsWork: float = Field(ge=0.0, le=100.0)
    status: str


class StructuredAssessment(BaseModel):
    reference: str
    transcript: str
    overall: OverallAssessment
    words: list[WordAssessment] = Field(default_factory=list)
    accurateUnits: list[UnitAssessment] = Field(default_factory=list)
    needsWorkUnits: list[UnitAssessment] = Field(default_factory=list)


class LLMFeedbackNote(BaseModel):
    unit: str
    note: str


class LLMFeedback(BaseModel):
    overallSummary: str
    needsWork: list[LLMFeedbackNote] = Field(default_factory=list)
    accurate: list[LLMFeedbackNote] = Field(default_factory=list)
    nextPractice: list[str] = Field(default_factory=list)


class AssessMeta(BaseModel):
    alignmentSource: str
    cer: float = Field(ge=0.0)


class AssessAnalysis(BaseModel):
    transcript: str
    # phonemeScores: list[PhonemeScore]
    lowScoring: list[PhonemeScore]
    structured: StructuredAssessment


class AssessFeedback(BaseModel):
    text: str
    structured: Optional[LLMFeedback] = None
    llmError: Optional[str] = None


class AssessResponse(BaseModel):
    meta: AssessMeta
    analysis: AssessAnalysis
    feedback: AssessFeedback
