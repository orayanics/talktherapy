from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    service_token: str
    asr_model: str = "base"
    asr_revision: str | None = None
    max_upload_bytes: int = 10 * 1024 * 1024
    ffmpeg_timeout_seconds: int = 20

    @property
    def model_identity(self) -> str:
        revision = f"@{self.asr_revision}" if self.asr_revision else ""
        return f"faster-whisper-{self.asr_model}{revision}-unverified"


def load_settings() -> Settings:
    return Settings(
        service_token=os.getenv("PHONEME_SERVICE_TOKEN", "").strip(),
        asr_model=os.getenv("PHONEME_ASR_MODEL", "base"),
        asr_revision=os.getenv("PHONEME_ASR_REVISION") or None,
    )


SETTINGS = load_settings()
