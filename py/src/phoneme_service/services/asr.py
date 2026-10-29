from __future__ import annotations

import os
from functools import lru_cache

import torch
from faster_whisper import WhisperModel


@lru_cache(maxsize=1)
def get_whisper_model() -> WhisperModel:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"
    return WhisperModel(
        os.getenv("PHONEME_ASR_MODEL", "base"),
        device=device,
        compute_type=compute_type,
        revision=os.getenv("PHONEME_ASR_REVISION") or None,
        local_files_only=True,
    )


def transcribe(audio_path: str, language: str = "en") -> str:
    if language not in {"en", "tl"}:
        raise ValueError("Unsupported practice language")
    model = get_whisper_model()
    segments, _ = model.transcribe(audio_path, language=language)
    return " ".join(s.text for s in segments).strip()
