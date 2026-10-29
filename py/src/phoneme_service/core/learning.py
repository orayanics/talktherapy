"""Offline dataset eligibility checks; never enroll or train on inference requests."""

from __future__ import annotations

from collections import defaultdict
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TrainingExample(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    recording_id: str = Field(min_length=1, max_length=200)
    child_id: str = Field(min_length=1, max_length=200)
    # Household/site grouping is assigned by the approved dataset curator.
    split_group: str = Field(min_length=1, max_length=200)
    prompt_version: str = Field(min_length=1, max_length=200)
    partition: Literal["train", "validation", "calibration", "test"]
    consent_version: str = Field(min_length=1, max_length=200)
    training_consented: bool
    withdrawn: bool
    rights_review_id: str = Field(min_length=1, max_length=200)
    label: Literal["supported_match", "supported_error", "uncertain"]
    annotator_ids: list[str] = Field(min_length=1, max_length=10)
    adjudicated: bool


def validate_dataset(examples: list[TrainingExample]) -> dict[str, int]:
    """Fail closed on leakage, duplicates, ineligible consent and weak test labels.

    This validates a curator export, not the underlying legal consent or clinical
    judgment. Dataset approval and independent label review remain release gates.
    """
    if not examples:
        raise ValueError("Dataset is empty")
    recordings: set[str] = set()
    partitions: dict[str, set[str]] = defaultdict(set)
    counts: dict[str, int] = defaultdict(int)
    for example in examples:
        if not example.training_consented or example.withdrawn:
            raise ValueError("Dataset includes ineligible recording")
        if example.recording_id in recordings:
            raise ValueError("Dataset contains duplicate recording")
        recordings.add(example.recording_id)
        for key in (f"child:{example.child_id}", f"group:{example.split_group}"):
            partitions[key].add(example.partition)
            if len(partitions[key]) > 1:
                raise ValueError("Speaker or group leakage across partitions")
        if example.partition in {"test", "calibration"}:
            if len(set(example.annotator_ids)) < 2 or not example.adjudicated:
                raise ValueError("Evaluation labels require independent review and adjudication")
        counts[example.partition] += 1
    if set(counts) != {"train", "validation", "calibration", "test"}:
        raise ValueError("Separate train, validation, calibration and test partitions are required")
    return dict(counts)
