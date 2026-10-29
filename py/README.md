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

Install Python 3.11-3.13, FFmpeg, and eSpeak NG first. PyAV is pinned to 18.1.0 because the pinned faster-whisper release passes an argument removed in PyAV 19. SoundFile provides TorchAudio's WAV backend on Windows.

### Windows 11 (PowerShell)

From the repository root:

```powershell
py -3.13 --version
Set-Location .\py
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python --version
python -m pip install --upgrade pip
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
python -m pip install -e ".[dev]"
```

Set a long random `PHONEME_SERVICE_TOKEN` in `py/.env` and the same value in `server/.env`. Also set the installed eSpeak NG DLL path in `py/.env` so Phonemizer can find it:

```env
PHONEMIZER_ESPEAK_LIBRARY=C:/Program Files/eSpeak NG/libespeak-ng.dll
```

Make sure FFmpeg's `bin` folder is on `PATH`. For a portable install, add it for this PowerShell session before starting the service:

```powershell
$env:PATH = "C:\ffmpeg\bin;$env:PATH"
Get-Command ffmpeg
ffmpeg -version
```

Start Uvicorn with `--env-file .env`; without it, the local token is not loaded.

```powershell
uvicorn phoneme_service.main:app --host 127.0.0.1 --port 8001 --env-file .env
```

The service itself does not read `.env` in production; production must provide the token in the process environment.

If PowerShell blocks activation, allow it for the current PowerShell process only, then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Linux/macOS

From `py/`:

```sh
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
cp .env.example .env
```

Set `PHONEME_SERVICE_TOKEN` in the environment before starting Uvicorn. The service itself does not read `.env` in production.

```sh
export PHONEME_SERVICE_TOKEN='replace-with-a-long-random-secret'
uvicorn phoneme_service.main:app --host 127.0.0.1 --port 8001
```

### Troubleshooting (Windows PowerShell)

Check which Python the launcher and active environment select:

```powershell
py -0p
Get-Command python -All
python --version
.\.venv\Scripts\python.exe --version
```

The last command checks the project environment directly. It should report Python 3.13.x. If it reports another version, preserve the old environment and recreate `.venv`:

```powershell
deactivate
$backup = ".venv-backup-$(Get-Date -Format yyyyMMddHHmmss)"
Rename-Item .venv $backup
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
```

If installation reports `No module named 'requests'`, confirm the environment is active and reinstall the project dependencies:

```powershell
python --version
python -m pip install -e ".[dev]"
```

Check that FFmpeg is on `PATH` and the configured eSpeak NG DLL exists:

```powershell
Get-Command ffmpeg -ErrorAction SilentlyContinue
ffmpeg -version
Test-Path 'C:\Program Files\eSpeak NG\libespeak-ng.dll'
```

For `service_unavailable`, confirm Laravel and Python use the same non-placeholder token, then restart both services. Check `/v1/health/ready` returns HTTP 200. If TorchAudio cannot find a WAV backend or faster-whisper reports `metadata_errors`, reinstall `.[dev]` to apply the pinned SoundFile and PyAV dependencies, then restart Uvicorn.

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
