"""One warmed inference process with a killable deadline (including on Windows)."""

from __future__ import annotations

import multiprocessing as mp
import time
from collections.abc import Callable
from multiprocessing.connection import Connection


def inference_process(connection: Connection) -> None:
    try:
        from phoneme_service.services.asr import get_whisper_model, transcribe

        get_whisper_model()
        connection.send(("ready", None))
        while True:
            path, language = connection.recv()
            try:
                connection.send(("result", transcribe(path, language)))
            except Exception:
                connection.send(("error", "inference_failure"))
    except (EOFError, BrokenPipeError):
        pass
    except Exception:
        try:
            connection.send(("error", "model_unavailable"))
        except (EOFError, BrokenPipeError):
            pass
    finally:
        connection.close()


class InferenceWorker:
    def __init__(self, target: Callable = inference_process):
        self.target = target
        self.process = None
        self.connection = None
        self._ready = False

    @property
    def ready(self) -> bool:
        process = self.process
        try:
            return self._ready and process is not None and process.is_alive()
        except ValueError:
            return False

    def close(self) -> None:
        self._ready = False
        if self.process is not None:
            if self.process.is_alive():
                self.process.terminate()
            self.process.join(timeout=2)
            if self.process.is_alive():
                self.process.kill()
                self.process.join(timeout=2)
            self.process.close()
            self.process = None
        if self.connection is not None:
            self.connection.close()
            self.connection = None

    def _receive(self, deadline: float, expected: str):
        if not self.connection.poll(max(0, deadline - time.monotonic())):
            raise TimeoutError("Inference deadline exceeded")
        kind, value = self.connection.recv()
        if kind != expected:
            raise RuntimeError("Inference worker unavailable")
        return value

    def start(self, timeout: float = 120) -> None:
        self.close()
        context = mp.get_context("spawn")
        self.connection, child = context.Pipe()
        self.process = context.Process(target=self.target, args=(child,), daemon=True)
        self.process.start()
        child.close()
        try:
            self._receive(time.monotonic() + timeout, "ready")
            self._ready = True
        except Exception:
            self.close()
            raise

    def transcribe(self, path: str, timeout: float, language: str = "en") -> str:
        deadline = time.monotonic() + timeout
        try:
            if not self.ready:
                self.start(timeout=max(0, deadline - time.monotonic()))
            self.connection.send((path, language))
            result = self._receive(deadline, "result")
            if not isinstance(result, str) or len(result) > 5000:
                raise RuntimeError("Invalid inference result")
            return result
        except Exception:
            self.close()
            raise
