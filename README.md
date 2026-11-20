# TalkTherapy

TalkTherapy is a telehealth platform for Speech-Language Pathology clinicians and patients. It includes scheduling and booking, clinical SOAP records, content and diagnoses management, notifications and email, reporting, and one-to-one Reverb/WebRTC sessions. A separate Python service contains the experimental phoneme-analysis pipeline.

## Repository layout

```text
client/   React 19 and TanStack Start frontend
server/   Laravel 13 API, queue, scheduler and Reverb server
py/       Private FastAPI phoneme-analysis microservice
docs/     Architecture, migration and module specifications
tasks/    Implementation plans and release gates
```

## Prerequisites

- PHP 8.4+ with SQLite, mbstring and OpenSSL extensions
- Composer 2
- Node.js 24 and npm
- Python 3.11-3.13 for phoneme analysis
- FFmpeg for practice analysis; espeak-ng only for retained phonemization research modules
- Mailpit for local email testing (SMTP `1025`, web UI `8025`)
- Redis is optional locally; the default Laravel setup uses database-backed cache, sessions and queues

For local HTTPS and network-device camera/microphone access, complete the HTTP setup first, then follow [SETUP_SSL.md](SETUP_SSL.md).

## Run all development services

After completing each service's setup below (including [Python setup](py/README.md)), run from the repository root:

```sh
bash dev.sh
```

```sh
# If running without the py service
bash dev-nopy.sh
```

On Windows, use Git Bash. This runs the client, the backend's full `composer run dev` stack, and Python on `127.0.0.1:8001` using `py/.venv` and `py/.env`. Ctrl+C stops the services; if one exits, the others stop too. The runner uses `npx` to fetch/cache `concurrently`, so the first run needs network access.

## 1. Laravel API

From `server/`:

```sh
composer install
php -r "file_exists('.env') || copy('.env.example', '.env');"
php artisan key:generate
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate --seed
composer run dev
```

`composer run dev` starts the API on `http://localhost:8080`, Reverb on port `8081`, the scheduler, and a queue listener. Keep that terminal running. On Windows, the SQLite file can also be created with `New-Item database/database.sqlite -ItemType File`.

Important local values in `server/.env`:

```dotenv
APP_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:8080
SESSION_SECURE_COOKIE=false
REVERB_HOST=127.0.0.1
REVERB_PORT=8081
REVERB_SCHEME=http
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
```

Use the matching LAN IP instead of `localhost` when testing from another device, and list the frontend origin explicitly in CORS, Sanctum and Reverb settings. Do not mix a LAN frontend with a `localhost` API: on a phone, `localhost` means the phone.

Running `php artisan migrate --seed` creates local-only accounts with password `password`:

| Role       | Email                                                                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Superadmin | `sudo@example.com`                                                                                                                                                                     |
| Admin      | `admin@example.com`                                                                                                                                                                    |
| Clinician  | `clinician@example.com`                                                                                                                                                                |
| Patient    | `patient.aphasia@example.com` (also `patient.stuttering@example.com`, `patient.autism@example.com`, `patient.adhd@example.com`, `patient.gdd@example.com`, `patient.down@example.com`) |

Never use these credentials outside local development. Invited users do not use this default; they set their password through the emailed activation flow.

## 2. Mailpit

Start Mailpit before testing invitations or notification email. With Docker:

```sh
docker run --rm -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Open `http://localhost:8025`. Laravel sends SMTP to port `1025`; port `8025` is only the browser UI.

## 3. React client

From `client/`:

```sh
npm ci
node -e "const fs=require('fs'); if(!fs.existsSync('.env')) fs.copyFileSync('.env.example','.env')"
npm run dev
```

The client runs at `http://localhost:3000` and should contain:

```dotenv
HTTPS=false
VITE_STAGE=development
VITE_APP_API_URL=http://localhost:8080
VITE_APP_WSS_URL=ws://localhost:8081
VITE_REVERB_APP_KEY=local
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8081
VITE_REVERB_SCHEME=http
```

Restart Vite after changing environment variables. Vite enables HTTPS when both `certs/localhost-key.pem` and `certs/localhost.pem` exist; `HTTPS=false` does not override certificate detection. For LAN testing, replace every browser-facing `localhost` host with the development computer's LAN IP.

## 4. Phoneme-analysis service

This experimental service is connected through the authenticated, rate-limited Laravel `/api/v1/slp/assess` proxy. The active version-2 endpoint returns transcript agreement and neutral practice feedback, including an unscorable outcome when no usable transcript is available. It does not measure pronunciation correctness or provide a diagnosis.

Install FFmpeg (and espeak-ng only if running the research modules), then from `py/`:

```sh
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

Set a long random `PHONEME_SERVICE_TOKEN` in the process environment and start the private listener:

```sh
uvicorn phoneme_service.main:app --host 127.0.0.1 --port 8001
```

Provision Whisper model artifacts before startup using the development instructions in [py/README.md](py/README.md). Startup and worker recovery load local artifacts only and fail when weights are missing. Production requires verified artifacts and the remaining gates in [tasks/todo.md](tasks/todo.md#speech-service-gates).

## Development URLs

| Component           | URL                     |
| ------------------- | ----------------------- |
| Client              | `http://localhost:3000` |
| Laravel API         | `http://localhost:8080` |
| Reverb WebSocket    | `ws://localhost:8081`   |
| Mailpit UI          | `http://localhost:8025` |
| Python internal API | `http://127.0.0.1:8001` |

## Troubleshooting: localhost CSRF mismatch

If login works through the HTTPS nginx network IP but returns `CSRF token mismatch` on `http://localhost:3000`, check that the client API URL also uses localhost. A localhost page cannot read the network IP's `XSRF-TOKEN` cookie to send the CSRF header. Secure session cookies can also prevent direct HTTP development from working.

For direct localhost development, set these values in `client/.env`:

```dotenv
VITE_APP_API_URL=http://localhost:8080
```

Set these values in `server/.env`:

```dotenv
SESSION_SECURE_COOKIE=false
SESSION_DOMAIN=null
```

Ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000` and `SANCTUM_STATEFUL_DOMAINS` includes `localhost:3000`. Preserve any network IP entries you still use.

Clear Laravel's cached configuration from the repository root:

```sh
cd server
php artisan config:clear
```

Restart the client and backend, clear localhost cookies in the browser, and retry. Use `localhost` consistently rather than mixing it with `127.0.0.1` or the network IP. For the HTTPS nginx setup, keep `SESSION_SECURE_COOKIE=true` and use the same HTTPS origin for the page and API; see [SETUP_SSL.md](SETUP_SSL.md).

## Verification

Laravel API:

```sh
cd server
php artisan test --compact
php vendor/bin/pint --test
composer validate --strict
composer audit --locked --no-interaction
```

React client:

```sh
cd client
npm run lint
npx tsc --noEmit
npm test
npm run build
npm audit --audit-level=high
```

Python service:

```sh
cd py
python -m pytest -q
python -m ruff check src tests
python -m compileall -q src tests
```

CI runs the Laravel and client checks on pushes and pull requests. Python CI and a hash-locked clean-image inference test are still tracked release work.

## Documentation and release status

- [Documentation index](docs/INDEX.md)
- [Migration architecture](docs/migration/ARCHITECTURE.md)
- [Module specifications](docs/migration/README.md)
- [Current task ledger](tasks/todo.md)
- [Laravel-specific setup](server/README.md)
- [Local TLS/nginx setup](SETUP_SSL.md)

Do not expose Python publicly, commit `.env` files, reuse demo credentials, or describe speech feedback as clinically validated.
