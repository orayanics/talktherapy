"""Validate bounded, canonical PCM before handing audio to an inference model."""

from __future__ import annotations

import math
import sys
import wave
from array import array
from pathlib import Path


def validate_wav(path: Path) -> float:
    try:
        with wave.open(str(path), "rb") as audio:
            if (audio.getnchannels(), audio.getsampwidth(), audio.getframerate()) != (1, 2, 16000):
                raise ValueError("Unsupported decoded audio")
            frames = audio.getnframes()
            if not 1600 <= frames <= 60 * 16000:
                raise ValueError("Decoded duration is outside supported bounds")
            data = audio.readframes(frames)
            if len(data) != frames * 2:
                raise ValueError("Truncated decoded audio")
            samples = array("h", data)
            if sys.byteorder != "little":
                samples.byteswap()
            if math.sqrt(sum(value * value for value in samples) / len(samples)) < 10:
                raise ValueError("Insufficient audio energy")
            return frames / 16000
    except (wave.Error, EOFError) as exc:
        raise ValueError("Invalid decoded audio") from exc
