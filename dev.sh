#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [[ -f py/.venv/Scripts/python.exe ]]; then
  python='.venv/Scripts/python.exe'
elif [[ -x py/.venv/bin/python ]]; then
  python='.venv/bin/python'
else
  echo 'Missing py/.venv. Complete the setup in py/README.md first.' >&2
  exit 1
fi

exec npx --yes --package concurrently concurrently --kill-others \
  --names client,backend,python \
  'npm --prefix client run dev' \
  'composer --working-dir=server run dev' \
  "cd py && $python -m uvicorn phoneme_service.main:app --host 127.0.0.1 --port 8001 --env-file .env"
