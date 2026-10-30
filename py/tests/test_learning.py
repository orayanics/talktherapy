import pytest

from phoneme_service.core.learning import TrainingExample, validate_dataset


def dataset():
    return [
        TrainingExample(
            recording_id=f"recording-{index}",
            child_id=f"child-{index}",
            split_group=f"group-{index}",
            prompt_version="sun-v1",
            partition=partition,
            consent_version="consent-v1",
            training_consented=True,
            withdrawn=False,
            rights_review_id="review-1",
            label="supported_match",
            annotator_ids=["slp-1", "slp-2"],
            adjudicated=True,
        )
        for index, partition in enumerate(["train", "validation", "calibration", "test"])
    ]


def test_accepts_independent_consented_reviewed_dataset():
    assert validate_dataset(dataset()) == {"train": 1, "validation": 1, "calibration": 1, "test": 1}


@pytest.mark.parametrize(
    "field,value",
    [
        ("training_consented", False),
        ("withdrawn", True),
        ("annotator_ids", ["slp-1"]),
        ("annotator_ids", ["slp-1", "slp-1"]),
        ("adjudicated", False),
    ],
)
def test_rejects_ineligible_or_unreviewed_evaluation_data(field, value):
    examples = dataset()
    examples[-1] = examples[-1].model_copy(update={field: value})
    with pytest.raises(ValueError):
        validate_dataset(examples)


@pytest.mark.parametrize("field", ["child_id", "split_group", "recording_id"])
def test_rejects_speaker_household_and_recording_leakage(field):
    examples = dataset()
    examples[-1] = examples[-1].model_copy(update={field: getattr(examples[0], field)})
    with pytest.raises(ValueError):
        validate_dataset(examples)


def test_requires_separate_calibration_and_test_partitions():
    with pytest.raises(ValueError):
        validate_dataset(dataset()[:-1])
