import pytest

from phoneme_service.core.practice import build_practice_response, transcript_agreement_error


@pytest.mark.parametrize(
    "transcript, expected",
    [
        ("Sun!", "review_required"),
        ("a completely different phrase", "task_mismatch"),
        ("", "unscorable"),
    ],
)
def test_practice_abstains_from_phone_judgments(transcript, expected):
    result = build_practice_response("sun", transcript, model_version="whisper-base")
    assert result.meta.status == expected
    assert result.meta.schemaVersion == "2.0"
    assert result.meta.measurement == "transcript_agreement_only"
    assert result.meta.learningEligible is False
    assert result.analysis.structured.overall.status == "unknown"
    assert result.analysis.lowScoring == []
    assert result.analysis.structured.accurateUnits == []
    assert result.analysis.structured.needsWorkUnits == []


def test_asr_agreement_is_not_pronunciation_accuracy():
    result = build_practice_response("sun", "sun", model_version="whisper-base")
    assert result.meta.cer == 0
    assert result.meta.calibrationVersion == "none"
    assert "listen" in result.feedback.text.lower()


def test_blank_reference_is_rejected():
    with pytest.raises(ValueError):
        build_practice_response(" ", "sun", model_version="whisper-base")


def test_filipino_unicode_letters_are_preserved_and_canonicalized():
    assert transcript_agreement_error("niño", "nin\u0303o") == 0
    assert transcript_agreement_error("niño", "nino") > 0


def test_punctuation_only_transcript_is_unscorable():
    assert build_practice_response("sun", "...", model_version="test").meta.status == "unscorable"
