from __future__ import annotations

import asyncio
import hmac
import logging
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, Form, Header, HTTPException, UploadFile, status

from phoneme_service.config.settings import SETTINGS
from phoneme_service.core.practice import build_practice_response
from phoneme_service.models.dto import AssessResponse
from phoneme_service.services.audio import validate_wav
from phoneme_service.services.worker import InferenceWorker

router = APIRouter(prefix="/v1")
log = logging.getLogger("phoneme_service")
inference_slot = asyncio.Semaphore(1)

worker = InferenceWorker()


def initialize_models() -> None:
    if shutil.which("ffmpeg") is None:
        raise RuntimeError("FFmpeg is unavailable on PATH")
    worker.start()


def shutdown_models() -> None:
    worker.close()


def models_ready() -> bool:
    return worker.ready


def convert_to_wav(input_path: Path, output_path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-nostdin",
            "-v",
            "error",
            "-y",
            "-protocol_whitelist",
            "file,pipe",
            "-f",
            "wav" if input_path.suffix == ".wav" else "matroska",
            "-i",
            str(input_path),
            "-map",
            "0:a:0",
            "-vn",
            "-sn",
            "-dn",
            "-t",
            "61",
            "-threads",
            "1",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-c:a",
            "pcm_s16le",
            str(output_path),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True,
        timeout=SETTINGS.ffmpeg_timeout_seconds,
    )


async def save_bounded_upload(audio: UploadFile, destination: Path) -> int:
    total = 0
    with destination.open("wb") as output:
        while chunk := await audio.read(1024 * 1024):
            total += len(chunk)
            if total > SETTINGS.max_upload_bytes:
                raise HTTPException(
                    status_code=413,
                    detail="Audio exceeds the 10 MiB limit.",
                )
            output.write(chunk)
    if total == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Audio is empty."
        )
    return total


def require_service_token(x_service_token: str | None = Header(default=None)) -> None:
    if not SETTINGS.service_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service is not configured.",
        )
    if not x_service_token or not hmac.compare_digest(x_service_token, SETTINGS.service_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid service credential.",
        )


@router.get("/health/live")
def liveness() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/ready")
def readiness() -> dict[str, str]:
    if not SETTINGS.service_token or not models_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service is not ready.",
        )
    return {"status": "ready"}


@router.post(
    "/assess",
    response_model=AssessResponse,
    dependencies=[Depends(require_service_token)],
)
async def assess(
    audio: UploadFile,
    referenceText: str = Form(..., min_length=1, max_length=800),
    language: Literal["en", "tl"] = Form("en"),
):
    # Dead workers recover within the next admitted request's inference budget.
    reference_text = referenceText.strip()
    if not reference_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Reference text is required.",
        )
    suffix = Path(audio.filename or "recording.webm").suffix.lower()
    if suffix not in {".webm", ".wav"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only WebM and WAV audio are supported.",
        )

    try:
        await asyncio.wait_for(inference_slot.acquire(), timeout=0.05)
    except TimeoutError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Analysis service is busy.",
        ) from exc
    try:
        with tempfile.TemporaryDirectory(prefix="phoneme-") as temp_dir:
            raw_path = Path(temp_dir) / f"input{suffix}"
            wav_path = Path(temp_dir) / "audio.wav"
            byte_count = await save_bounded_upload(audio, raw_path)

            def analyze_recording() -> str:
                deadline = time.monotonic() + 40
                convert_to_wav(raw_path, wav_path)
                validate_wav(wav_path)
                return worker.transcribe(
                    str(wav_path), timeout=max(0, deadline - time.monotonic()), language=language
                )

            task = asyncio.create_task(asyncio.to_thread(analyze_recording))
            try:
                transcript = await asyncio.shield(task)
            except asyncio.CancelledError:
                # Keep temporary files and admission until bounded work finishes.
                try:
                    await task
                except Exception:
                    pass
                raise
            log.info("Practice completed: bytes=%d schema=2.0", byte_count)

        return build_practice_response(
            reference_text,
            transcript,
            model_version="faster-whisper-base-unverified",
            language=language,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Audio or reference text could not be analyzed.",
        ) from exc
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail="Analysis deadline exceeded.") from exc
    except (RuntimeError, EOFError, BrokenPipeError) as exc:
        raise HTTPException(status_code=503, detail="Analysis worker unavailable.") from exc
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise HTTPException(status_code=422, detail="Audio conversion failed.") from exc
    except HTTPException:
        raise
    except Exception as exc:
        log.error("Assessment failed: reason=inference_failure")
        raise HTTPException(status_code=500, detail="Assessment failed.") from exc
    finally:
        inference_slot.release()
