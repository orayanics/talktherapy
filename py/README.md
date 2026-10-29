# Phoneme analysis service

Private FastAPI inference service for TalkTherapy. It transcribes an English recording, aligns speech against reference text, and returns heuristic pronunciation feedback. The output is not a diagnosis and is not approved for clinical use.

## Layout

```text
py/
|-- src/phoneme_service/
|   |-- api/       # Internal HTTP boundary
|   |-- config/    # Environment and scoring configuration
|   |-- core/      # Alignment, scoring and assessment logic
|   |-- models/    # Pydantic response models
|   `-- services/  # ASR adapter
|-- tests/
`-- pyproject.toml
```

## Setup

Install Python 3.11-3.13, FFmpeg, and espeak-ng first. From `py/`:

```sh
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

Copy `.env.example` to `.env`, set a long random `PHONEME_SERVICE_TOKEN`, and load it into the process environment. The service intentionally does not read `.env` itself in production.

```sh
uvicorn phoneme_service.main:app --host 127.0.0.1 --port 8001
```

Startup loads the Whisper and TorchAudio models and can download weights on the first run. Production images must provision and verify model artifacts before startup. Do not expose port 8001 to browsers or the public network.

Internal endpoints:

- `GET /v1/health/live` - process liveness
- `GET /v1/health/ready` - model/configuration readiness
- `POST /v1/assess` - multipart `audio` plus `referenceText`; requires `X-Service-Token`

## Checks

```sh
python -m pytest -q
python -m ruff check src tests
python -m compileall -q src tests
```

See [the phoneme-analysis specification](../docs/migration/modules/SPEC-phoneme-analysis.md) and [the tracked release gates](../tasks/todo.md#phoneme-analysis). The Laravel proxy, process-level inference deadline, decoded-duration validation, reproducible model lock/image, and clinical calibration remain required before enabling the feature.
