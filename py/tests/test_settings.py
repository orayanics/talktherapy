from phoneme_service.config.settings import load_settings


def test_model_identity_uses_configured_model_and_revision(monkeypatch):
    monkeypatch.setenv("PHONEME_ASR_MODEL", "small")
    monkeypatch.setenv("PHONEME_ASR_REVISION", "provisioned-revision")
    settings = load_settings()
    assert settings.asr_model == "small"
    assert settings.asr_revision == "provisioned-revision"
    assert settings.model_identity == "faster-whisper-small@provisioned-revision-unverified"
