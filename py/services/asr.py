from __future__ import annotations

from functools import lru_cache

import torch
from faster_whisper import WhisperModel


@lru_cache(maxsize=1)
def get_whisper_model() -> WhisperModel:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"
    return WhisperModel("base", device=device, compute_type=compute_type)


def transcribe(audio_path: str) -> str:
    model = get_whisper_model()
    segments, _ = model.transcribe(audio_path, language="en")
    return " ".join(s.text for s in segments).strip()
