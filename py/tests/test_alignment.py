import pytest

pytest.importorskip("torch")
pytest.importorskip("torchaudio")
pytest.importorskip("phonemizer")

from phoneme_service.core.alignment import _duration_frames, _select_alignment_text


class Span:
    def __init__(self, start: int, end: int) -> None:
        self.start = start
        self.end = end


def test_duration_counts_frames_not_span_objects() -> None:
    assert _duration_frames([Span(2, 5), Span(8, 10)]) == 5


def test_empty_transcript_is_unscorable() -> None:
    with pytest.raises(ValueError, match="No speech"):
        _select_alignment_text("hello", "")
