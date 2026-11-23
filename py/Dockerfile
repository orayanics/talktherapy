# syntax=docker/dockerfile:1
FROM python:3.13-slim-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg espeak-ng libsndfile1 build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY pyproject.toml ./
RUN --mount=type=cache,target=/root/.cache/pip python - <<'PY'
import subprocess
import sys
import tomllib

with open('pyproject.toml', 'rb') as manifest:
    dependencies = tomllib.load(manifest)['project']['dependencies']
subprocess.check_call([sys.executable, '-m', 'pip', 'install', *dependencies])
PY
# Faster Whisper's output_dir option passes a symlink flag removed by Hugging Face Hub.
RUN --mount=type=cache,target=/root/.cache/huggingface \
    python -c "from shutil import copytree; from faster_whisper.utils import download_model; copytree(download_model('base'), '/models/base')"

COPY src ./src
RUN --mount=type=cache,target=/root/.cache/pip pip install --no-deps .

ENV PHONEME_ASR_MODEL=/models/base
EXPOSE 8001
CMD ["uvicorn", "phoneme_service.main:app", "--host", "0.0.0.0", "--port", "8001"]
