from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    service_token: str
    max_upload_bytes: int = 10 * 1024 * 1024
    ffmpeg_timeout_seconds: int = 20


def load_settings() -> Settings:
    return Settings(service_token=os.getenv("PHONEME_SERVICE_TOKEN", "").strip())


SETTINGS = load_settings()
