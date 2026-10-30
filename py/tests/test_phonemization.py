from unittest.mock import patch

import pytest

from phoneme_service.core.phonemization import tokenize_text_with_word_map


def test_preserves_word_coverage_and_mapping():
    with patch(
        "phoneme_service.core.phonemization._cached_word_tokens",
        side_effect=[("s", "i"), ("s", "e", "l")],
    ):
        assert tokenize_text_with_word_map("See sail") == (
            ["s", "i", "s", "e", "l"],
            [0, 0, 1, 1, 1],
            ["see", "sail"],
        )


@pytest.mark.parametrize("failure", [ValueError("private word"), RuntimeError("private word")])
def test_rejects_partial_coverage_without_exposing_words(failure, caplog):
    with patch(
        "phoneme_service.core.phonemization._cached_word_tokens",
        side_effect=[("s",), failure],
    ):
        with pytest.raises(ValueError, match="Expected word could not be phonemized") as error:
            tokenize_text_with_word_map("see private")
    assert "private" not in str(error.value)
    assert "private" not in caplog.text


def test_unexpected_programming_errors_are_not_hidden():
    with patch(
        "phoneme_service.core.phonemization._cached_word_tokens",
        side_effect=TypeError("unexpected bug"),
    ):
        with pytest.raises(TypeError):
            tokenize_text_with_word_map("see")
