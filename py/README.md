# Phoneme analysis service

Private FastAPI practice service for TalkTherapy. The version-2 endpoint transcribes English or Filipino/Tagalog recordings and returns neutral practice feedback with an explicit review status. It does not return sound-correctness judgments. The previous text-alignment/heuristic scoring modules remain for research regression coverage and are not used by the active endpoint.

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

Install Python 3.11-3.13 and FFmpeg first. eSpeak NG is needed only for the retained phonemization research modules. PyAV is pinned to 18.1.0 because the pinned faster-whisper release passes an argument removed in PyAV 19. SoundFile provides TorchAudio's WAV backend for research on Windows.

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

Startup checks FFmpeg and warms Whisper in a separate process. MMS_FA and eSpeak are no longer loaded by the active endpoint. Whisper uses local artifacts only, including after worker recovery; missing artifacts fail startup. Provision weights before starting the service. Do not expose port 8001 to browsers or the public network.

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

See [the phoneme-analysis specification](../docs/migration/modules/SPEC-phoneme-analysis.md) and [PLAN_SLP.md](../PLAN_SLP.md). The proxy, bounded process inference and decoded-duration validation are implemented. Reproducible model/image locks, measured resource budgets and clinical validation remain release work.

## Version-2 proof of concept

The agreed scope is ages 3–18 in the Philippines, with English (`en`) and Filipino using Tagalog ASR (`tl`). This does not establish accuracy for children, code-switching or other Philippine languages. No SLP reviewer or consented training corpus is currently available. Training and automatic corrective feedback remain disabled.

From `py/`, activate the environment and provision the development Whisper artifact once (network access required):

```powershell
.\.venv\Scripts\Activate.ps1
python -c "from faster_whisper.utils import download_model; print(download_model('base'))"
python -m uvicorn phoneme_service.main:app --host 127.0.0.1 --port 8001 --env-file .env
```

Restart Uvicorn and Laravel after updating this code. The existing shared service token remains required. The development download uses the repository's current revision; production still requires a rights-reviewed, checksummed artifact manifest. Optional `PHONEME_ASR_MODEL` selects an existing local model directory or cached model name, and `PHONEME_ASR_REVISION` selects a provisioned revision. Response model identity is marked unverified until artifact provenance is established.

Multipart requests now accept optional `language=en|tl` alongside `audio` and `referenceText`; Laravel accepts `reference_text` and forwards the selected language. Results include `meta.schemaVersion=2.0`, `status`, `measurement=transcript_agreement_only`, model/calibration identity, language and `learningEligible=false`. `review_required` means listen together; `task_mismatch` means the ASR transcript disagreed, which may itself be an ASR error; `unscorable` means no usable transcript. None is a diagnosis. Legacy result arrays are empty and overall status is `unknown`; numeric zeros in that compatibility envelope are placeholders, not measurements.

Uploads are limited to 10 MiB. Decode accepts forced WAV/WebM demuxers, emits mono 16 kHz PCM, and rejects clips shorter than 0.1 seconds, longer than 60 seconds, truncated PCM and near-zero audio energy. The energy check is an engineering capture check, not validated voice-activity detection. Decode/inference share a 40-second work budget after upload; a model deadline kills its process. The next request attempts recovery. Only one job is admitted per Uvicorn process; deploy one process per provisioned worker budget. FFmpeg has its own 20-second timeout. OS memory limits and multi-process deployment budgets remain to be verified.

The child activity offers Forest/Ocean/Space picture adventures, a simple focus style, 15 selected English/Filipino picture prompts adapted from the user-provided FIL-PAT reference, optional answer reveal, custom words, recording/replay, cancellation and breaks. The adapted vocabulary is practice content, not a standardized test or SLP-reviewed treatment program. No exemplar recordings are bundled yet; the helper models the word. Recordings are temporary and are not retained as training examples.

Offline dataset preparation starts with `core.learning.TrainingExample` and `validate_dataset`. These reject missing eligibility, withdrawals, duplicate recordings, child/group leakage, missing partitions and evaluation labels without two distinct annotators plus adjudication. These checks validate a curator export; they do not verify real consent or clinical judgments. Neural training, model promotion and consented recording storage remain deferred until approved data exists.
