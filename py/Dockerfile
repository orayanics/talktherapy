FROM python:3.13-slim-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg espeak-ng libsndfile1 build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY pyproject.toml ./
COPY src ./src
RUN pip install --no-cache-dir . \
    && python -c "from faster_whisper.utils import download_model; download_model('base', output_dir='/models/base')"

ENV PHONEME_ASR_MODEL=/models/base
EXPOSE 8001
CMD ["uvicorn", "phoneme_service.main:app", "--host", "0.0.0.0", "--port", "8001"]
