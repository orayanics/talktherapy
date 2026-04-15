from __future__ import annotations

import math
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class ScoringConfig:
    sigmoid_k: float = 0.85
    sigmoid_x0: float = -3.4
    threshold_accurate: float = 72.0
    threshold_needs_work: float = 65.0
    min_reliable_frames: int = 3
    transcript_cer_threshold: float = 0.25


def _safe_parse_float(raw: str, default: float) -> float:
    try:
        return float(raw)
    except (TypeError, ValueError):
        return default


def _safe_parse_int(raw: str, default: int) -> int:
    try:
        return int(raw)
    except (TypeError, ValueError):
        return default


def _load_yaml_with_pyyaml(path: str) -> dict:
    try:
        import yaml  # type: ignore
    except ImportError:
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data if isinstance(data, dict) else {}
    except OSError:
        return {}


def load_scoring_config(path: str = "config/scoring.yaml") -> ScoringConfig:
    defaults = ScoringConfig()

    absolute_path = path
    if not os.path.isabs(path):
        absolute_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), path)

    data = _load_yaml_with_pyyaml(absolute_path)

    sigmoid = data.get("sigmoid", {}) if isinstance(data.get("sigmoid"), dict) else {}
    thresholds = data.get("thresholds", {}) if isinstance(data.get("thresholds"), dict) else {}
    alignment = data.get("alignment", {}) if isinstance(data.get("alignment"), dict) else {}

    return ScoringConfig(
        sigmoid_k=_safe_parse_float(sigmoid.get("k"), defaults.sigmoid_k),
        sigmoid_x0=_safe_parse_float(sigmoid.get("x0"), defaults.sigmoid_x0),
        threshold_accurate=_safe_parse_float(
            thresholds.get("accurate"), defaults.threshold_accurate
        ),
        threshold_needs_work=_safe_parse_float(
            thresholds.get("needs_work"), defaults.threshold_needs_work
        ),
        min_reliable_frames=_safe_parse_int(
            alignment.get("min_reliable_frames"), defaults.min_reliable_frames
        ),
        transcript_cer_threshold=_safe_parse_float(
            alignment.get("transcript_cer_threshold"),
            defaults.transcript_cer_threshold,
        ),
    )


SCORING_CONFIG = load_scoring_config()


def _sigmoid(x: float, k: float, x0: float) -> float:
    return 1.0 / (1.0 + math.exp(-k * (x - x0)))


def score_phoneme(
    raw_score: float,
    duration_frames: int,
    alignment_confidence: float,
    config: ScoringConfig = SCORING_CONFIG,
) -> float:
    acoustic_confidence = _sigmoid(raw_score, config.sigmoid_k, config.sigmoid_x0) * 100.0

    if duration_frames < 1:
        acoustic_confidence *= 0.65
    elif duration_frames < 2:
        acoustic_confidence *= 0.85
    elif duration_frames < config.min_reliable_frames:
        acoustic_confidence *= 0.95

    penalty = max(0.0, min(1.0, alignment_confidence))
    final_confidence = acoustic_confidence * penalty

    return max(0.0, min(100.0, final_confidence))
