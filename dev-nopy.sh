#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

exec npx --yes --package concurrently concurrently --kill-others \
  --names client,backend,python \
  'npm --prefix client run dev' \
  'composer --working-dir=server run dev'
