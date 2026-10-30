import math

import pytest

from phoneme_service.core.scoring import load_scoring_config, score_phoneme


def test_scoring_is_bounded() -> None:
    assert score_phoneme(-100, 0, 1) == pytest.approx(0, abs=0.01)
    assert 0 <= score_phoneme(100, 10, 1) <= 100
    assert math.isfinite(score_phoneme(0, 3, 0.5))


def test_invalid_threshold_order_is_rejected(tmp_path) -> None:
    config = tmp_path / "scoring.yaml"
    config.write_text("thresholds:\n  accurate: 50\n  needs_work: 70\n", encoding="utf-8")

    with pytest.raises(ValueError, match="threshold"):
        load_scoring_config(str(config))


def test_invalid_number_is_not_silently_defaulted(tmp_path) -> None:
    config = tmp_path / "scoring.yaml"
    config.write_text("sigmoid:\n  k: invalid\n", encoding="utf-8")

    with pytest.raises(ValueError, match="invalid number"):
        load_scoring_config(str(config))
