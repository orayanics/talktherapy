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


def _safe_parse_float(raw: object, default: float) -> float:
    if raw is None:
        return default
    try:
        return float(raw)
    except (TypeError, ValueError) as exc:
        raise ValueError("Scoring configuration contains an invalid number") from exc


def _safe_parse_int(raw: object, default: int) -> int:
    if raw is None:
        return default
    if isinstance(raw, bool) or not isinstance(raw, int):
        raise ValueError("Scoring configuration contains an invalid integer")
    try:
        return int(raw)
    except (TypeError, ValueError) as exc:
        raise ValueError("Scoring configuration contains an invalid integer") from exc


def _load_yaml_with_pyyaml(path: str) -> dict:
    try:
        import yaml
    except ImportError as exc:
        raise RuntimeError("PyYAML is required to load scoring configuration") from exc

    try:
        with open(path, encoding="utf-8") as f:
            data = yaml.safe_load(f)
    except OSError as exc:
        raise RuntimeError(f"Could not read scoring configuration: {path}") from exc
    if not isinstance(data, dict):
        raise ValueError("Scoring configuration must be a mapping")
    return data


def load_scoring_config(path: str = "config/scoring.yaml") -> ScoringConfig:
    defaults = ScoringConfig()

    absolute_path = path
    if not os.path.isabs(path):
        absolute_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), path)

    data = _load_yaml_with_pyyaml(absolute_path)

    sigmoid = data.get("sigmoid", {}) if isinstance(data.get("sigmoid"), dict) else {}
    thresholds = data.get("thresholds", {}) if isinstance(data.get("thresholds"), dict) else {}
    alignment = data.get("alignment", {}) if isinstance(data.get("alignment"), dict) else {}

    config = ScoringConfig(
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
    numeric_values = (
        config.sigmoid_k,
        config.sigmoid_x0,
        config.threshold_accurate,
        config.threshold_needs_work,
        config.transcript_cer_threshold,
    )
    if not all(math.isfinite(value) for value in numeric_values):
        raise ValueError("Scoring configuration values must be finite")
    if config.sigmoid_k <= 0:
        raise ValueError("Sigmoid k must be positive")
    if not 0 <= config.threshold_needs_work <= config.threshold_accurate <= 100:
        raise ValueError("Scoring thresholds must satisfy 0 <= needs_work <= accurate <= 100")
    if config.min_reliable_frames < 1:
        raise ValueError("min_reliable_frames must be positive")
    if not 0 <= config.transcript_cer_threshold <= 1:
        raise ValueError("transcript_cer_threshold must be between 0 and 1")
    return config


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
