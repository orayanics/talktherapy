# TalkTherapy

## Laravel backend migration

The [migration review and specifications](docs/migration/README.md) cover the current `client`, `server`, and `py` code, the Laravel 13 API design, each module's migration tasks, API/data contracts, and cutover/rollback requirements. Start with the [audit](docs/migration/AUDIT.md) and [implementation plan](tasks/plan.md). The Laravel platform foundation is implemented in `server/`; see [phase 1 progress](tasks/phase-1.md). Business modules and client integration remain in progress. The archived Bun reference is in `_server/`.

## Overview

**TalkTherapy** is a telehealth platform designed for Speech-Language Pathology (SLP) clinicians and patients.

Originally developed for **UST-CRS** to meet academic requirements, the platform addresses two primary needs:

- Assisting clinicians with diagnosis and assessment workflows
- Providing patients with a streamlined way to book appointments based on availability and convenience

## Core Features

- Clinician scheduling system
- Appointment booking system
- Admin user management
- Content management system (CMS)
- One-on-one video conferencing with integrated chat

## Technology Stack

- Backend: Laravel 13, PHP 8.4+, Sanctum and Predis; SQLite locally.
- Frontend: React / TanStack Start, Query and Router, Axios, Tailwind, Zod and React Hook Form. Better Auth remains temporarily until client identity migration.
- Inference: private Python / FastAPI speech analysis service; hardening and scoring validation are scheduled separately.

## Local development

Set up the API using [server/README.md](server/README.md), then run from the repository root:

```sh
bun install
bun run dev:server
```

Run `bun run dev:client` in another terminal when its configured local TLS certificates are available. The current client still calls legacy endpoints; a running Laravel foundation does not yet make the complete app usable. Client session/API migration is a later phase. Do not run the archived Prisma/Better Auth reset or seed commands against Laravel.

Backend checks: `bun run test:server` and `bun run lint:server`. Client build: `bun run build`.

The Python instructions below describe the existing service. Its unpinned stack needs the compatibility and validation work in the phoneme-analysis spec before production use. Use port 8001 for Python when running beside the Laravel development API.

## Setting Up the Python Environment for Phoneme Analysis

```bash
sudo apt update
sudo apt install espeak-ng espeak-ng-data libespeak-ng-dev ffmpeg python3-pip python3-venv
```

Create a virtual environment and install the required Python packages:

```bash
python3 -m venv slp-env
source slp-env/bin/activate
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install faster-whisper phonemizer fastapi uvicorn httpx python-multipart torchcodec
```

Verify the core packages:

```bash
python3 -c "import torchaudio; print(torchaudio.__version__)"
python3 -c "from phonemizer import phonemize; print(phonemize('hello world', backend='espeak', language='en-us'))"
python3 -c "from faster_whisper import WhisperModel; print('ok')"
```

To run the FastAPI server for phoneme analysis:

```bash
cd py
uvicorn service:app --host 127.0.0.1 --port 8001 --reload
```
