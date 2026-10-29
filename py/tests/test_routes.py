import io
import shutil
import struct
import wave
from dataclasses import replace
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from phoneme_service.api import routes
from phoneme_service.main import app


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(routes, "SETTINGS", replace(routes.SETTINGS, service_token="test-secret"))
    monkeypatch.setattr(routes, "convert_to_wav", shutil.copyfile)
    monkeypatch.setattr(routes, "worker", Mock(transcribe=Mock(return_value="sun")))
    # No lifespan: inference boundary is faked, no model download or native inference.
    return TestClient(app)


def recording(amplitude=1000):
    output = io.BytesIO()
    with wave.open(output, "wb") as audio:
        audio.setparams((1, 2, 16000, 0, "NONE", "not compressed"))
        audio.writeframes(struct.pack("<h", amplitude) * 16000)
    return output.getvalue()


def submit(client, audio=None):
    return client.post(
        "/v1/assess",
        headers={"X-Service-Token": "test-secret"},
        files={"audio": ("recording.wav", recording() if audio is None else audio, "audio/wav")},
        data={"referenceText": "sun"},
    )


def test_authenticated_upload_returns_versioned_review_result(client):
    response = submit(client)
    assert response.status_code == 200
    assert response.json()["meta"]["schemaVersion"] == "2.0"
    assert response.json()["meta"]["status"] == "review_required"
    assert response.json()["analysis"]["lowScoring"] == []


def test_silence_rejected_before_inference(client):
    assert submit(client, recording(amplitude=0)).status_code == 422
    routes.worker.transcribe.assert_not_called()


def test_timeout_is_safe_and_admission_recovers(client):
    routes.worker.transcribe.side_effect = TimeoutError("private path")
    response = submit(client)
    assert response.status_code == 504
    assert "private" not in response.text
    routes.worker.transcribe.side_effect = None
    assert submit(client).status_code == 200


def test_missing_credential_does_not_run_inference(client):
    response = client.post(
        "/v1/assess", files={"audio": ("x.wav", recording())}, data={"referenceText": "sun"}
    )
    assert response.status_code == 401
    routes.worker.transcribe.assert_not_called()


def test_filipino_language_reaches_inference_and_result(client):
    response = client.post(
        "/v1/assess",
        headers={"X-Service-Token": "test-secret"},
        files={"audio": ("recording.wav", recording(), "audio/wav")},
        data={"referenceText": "araw", "language": "tl"},
    )
    assert response.status_code == 200
    assert response.json()["meta"]["language"] == "tl"
    assert routes.worker.transcribe.call_args.kwargs["language"] == "tl"


def test_unsupported_language_is_rejected(client):
    response = client.post(
        "/v1/assess",
        headers={"X-Service-Token": "test-secret"},
        files={"audio": ("recording.wav", recording(), "audio/wav")},
        data={"referenceText": "araw", "language": "unknown"},
    )
    assert response.status_code == 422
    routes.worker.transcribe.assert_not_called()
