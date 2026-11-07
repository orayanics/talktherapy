# TalkTherapy Laravel API

Laravel 13 / PHP 8.4+, Sanctum SPA sessions, SQLite locally, and Predis for optional Redis connections. Scheduling, appointments, clinical records, notifications, reporting, and an initial SLP workflow are implemented; production evidence and remaining SLP capabilities are tracked in `../tasks/todo.md`.

All roles require email verification. Authentication fields remain on `users`; role, status, diagnosis, and image are isolated in one-to-one `user_profiles`. `php artisan migrate --seed` creates nine demo accounts in local/testing environments; plain `php artisan migrate` creates none.

## Local setup

From `server/`:

```sh
composer install
php -r "file_exists('.env') || copy('.env.example', '.env');"
php artisan key:generate
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate
php artisan serve --host=localhost --port=8080
```

Keep `.env` and SQLite files untracked. `composer run setup` is a new-local-installation shortcut including key generation. Never run it against an existing deployment: changing the key can make encrypted outbox payloads unreadable. Plain migrations do not seed users; demo seeders are disabled outside local/testing. Use `app:bootstrap-superadmin` for deployed accounts.

Local session/cache/queue drivers use the database; Redis is optional. When configuring Redis later, choose the appropriate drivers and retain `REDIS_CLIENT=predis`. Set production HTTPS/cookie settings and `APP_DEBUG=false`. `TRUSTED_PROXIES` must list only actual proxy addresses. Seeded credentials are strictly for local development; invited users set their own password during activation.

## Health and contracts

- `/up` is minimal liveness, not dependency readiness.
- `/ready` requires `Authorization: Bearer <READINESS_TOKEN>`. Set a random operator secret in `.env`; query secrets are rejected. Missing configuration or failed DB/schema/cache/queue/encryption checks return 503 without internals. Keep this endpoint private at the proxy.
- Business routes use `/api/v1` as their modules land. SLP workflow endpoints currently include raw model projections; other modules use API Resources. Errors include `message`, `code`, `request_id` and validation `errors`; responses include generated `X-Request-ID`.
- Client origin defaults to `http://localhost:3000`. Extra origins require explicit configuration. The React client uses the Laravel API and Sanctum sessions. No API-wide CSRF exemption is configured.

Audit and outbox intents must be written inside domain transactions. Payloads are encrypted at rest and hidden from serialization. The scheduled `app:deliver-notifications` command delivers pending notification outbox messages. The scheduled `app:dispatch-slp-analysis` command recovers queued SLP runs after dispatch failures (five-minute retry window, at most 100 per minute); workers still require an active queue listener. The current manual-review job is transactional and idempotent; a future long-running inference job needs a lease and guarded finalization outside its execution transaction. Never put plaintext secrets or clinical text into logs/jobs. Key rotation requires an encrypted-data migration plan.

## Checks

```sh
php artisan test --compact
php vendor/bin/pint --format agent
composer validate --strict
composer audit --locked
php artisan route:list
```

Tests use isolated in-memory SQLite, not the local database. CI runs PHP 8.4/8.5 platform checks. PostgreSQL/MySQL locking, Redis coordination, browser auth and inference need their later-phase checks. `composer run dev` starts the API, Reverb, scheduler, and queue listener. The React client runs separately from `../client/`.

## Laravel Boost

Installed with `composer require laravel/boost --dev`, then:

```sh
php artisan boost:install --guidelines --skills --mcp --no-interaction
```

`boost.json` selects Codex. Guidelines: `AGENTS.md`; skills: `.agents/skills`; MCP: `.codex/config.toml`. Open `server/` as the agent workspace to discover its MCP configuration. The server runs through `php artisan boost:mcp`; application-info, database-schema and search-docs were exercised during this phase. Project rules in `.ai/guidelines/talktherapy.md` survive regeneration. Exclude development packages in production with `composer install --no-dev`.

See [phase evidence](../tasks/phase-1.md), [overall plan](../tasks/plan.md) and [module specs](../docs/migration/README.md).
