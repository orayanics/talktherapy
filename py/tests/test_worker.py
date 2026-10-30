import time

import pytest

from phoneme_service.services.worker import InferenceWorker


def fake_inference(connection):
    connection.send(("ready", None))
    while True:
        value, _language = connection.recv()
        if value == "hang":
            time.sleep(30)
        elif value == "crash":
            connection.close()
            return
        else:
            connection.send(("result", value))


def test_timeout_kills_process_and_next_request_recovers():
    worker = InferenceWorker(target=fake_inference)
    try:
        worker.start(timeout=5)
        assert worker.transcribe("sun", timeout=2) == "sun"
        with pytest.raises(TimeoutError):
            worker.transcribe("hang", timeout=0.05)
        assert not worker.ready
        assert worker.transcribe("fish", timeout=5) == "fish"
    finally:
        worker.close()


def test_crashed_worker_is_cleaned_up():
    worker = InferenceWorker(target=fake_inference)
    try:
        worker.start(timeout=5)
        with pytest.raises((EOFError, OSError)):
            worker.transcribe("crash", timeout=2)
        assert not worker.ready
    finally:
        worker.close()
