#!/bin/sh
set -eu

if [ ! -f .env ]; then
  cp .env.example .env
fi

if ! grep -Eq '^APP_KEY=.+$' .env; then
  php artisan key:generate --force --no-interaction
fi

php artisan package:discover --ansi
php artisan migrate --seed --force --no-interaction

php artisan serve --host=0.0.0.0 --port=8080 &
php artisan reverb:start --host=0.0.0.0 --port=8081 &
php artisan schedule:work &
php artisan queue:listen --tries=1 &

wait
