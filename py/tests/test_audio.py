import struct
import wave

import pytest

from phoneme_service.services.audio import validate_wav


def write_audio(path, frames, amplitude=1000):
    with wave.open(str(path), "wb") as audio:
        audio.setparams((1, 2, 16000, 0, "NONE", "not compressed"))
        audio.writeframes(struct.pack("<h", amplitude) * frames)


def test_supported_audio_duration(tmp_path):
    path = tmp_path / "audio.wav"
    write_audio(path, 32000)
    assert validate_wav(path) == 2


@pytest.mark.parametrize("frames, amplitude", [(0, 1000), (160, 1000), (976000, 1000), (16000, 0)])
def test_rejects_empty_short_long_and_silent_audio(tmp_path, frames, amplitude):
    path = tmp_path / "audio.wav"
    write_audio(path, frames, amplitude)
    with pytest.raises(ValueError):
        validate_wav(path)
