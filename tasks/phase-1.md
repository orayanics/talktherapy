# Phase 1: Laravel platform foundation

Status: complete on 2026-10-28. Authorized by the implementation request; incorporates the decisions appended by the user to the architecture document.

## Scope

Implement P1-P5 in `server/`, which the user emptied after moving Bun to `_server/`. Install Laravel 13, Sanctum, Predis and development-only Laravel Boost; run Boost's installer for Codex and use its generated guidelines/tools. Build safe API boundaries, durable audit/outbox storage, bounded query conventions, health/readiness and repeatable server checks. Identity and business routes follow in later phases.

Local development uses SQLite and database-backed session/cache/queue drivers; Redis uses Predis when configured. No legacy data or Bun passwords are imported. Use native Laravel hashing and new UUID identities. The PHP dependency resolution target is 8.4; local verification runs on the installed PHP 8.5.8.

## Execution slices

- [x] P1a: Scaffold Laravel, install locked dependencies and Boost; generate Codex integration and verify default tests.
- [x] P2a: Fail-first API boundary tests, request ID middleware, safe exception responses, route/bootstrap wiring.
- [x] P2b: Exact-origin CORS, trusted-proxy configuration and boundary verification.
- [x] P3a: UUID user/session foundation and atomic audit storage, with rollback tests.
- [x] P3b: Encrypted durable outbox storage/unique intent key and rollback/recovery-state tests. Delivery belongs to N2.
- [x] P4a: Bounded list Form Request and explicit Resource behavior tested using test-only routes; no dummy production CRUD endpoint.
- [x] P5a: Minimal liveness, protected dependency readiness and operational tests.
- [x] P5b: Backend scripts, example environment, server CI and local-development instructions; full tests/Pint/audit.

## Decisions carried forward

No legacy data import or hash portability work is needed. Superadmin can create all user types; admin creates clinicians. Care access, pending-only cancellation, consent/retention and English-only inference scope are approved as recorded. Multi-language analysis remains future work. Rooms may be joined early or late, but expire five minutes after the slot's end; a later realtime phase must enforce this on every signal and subscription, and clean up expired rooms.

Local API: `http://localhost:8080`; client origin: `http://localhost:3000` when its authentication integration is migrated. Existing client HTTPS/Bun callers are not switched by this foundation phase. Exact additional local HTTPS origins may be configured explicitly, not reflected dynamically. Production database and domain setup remain with the user.

## Evidence

Completed evidence:

- Laravel Framework `13.39.0`, PHP platform target `8.4.0`, Sanctum `4.3.3`, Predis `3.7.0`, and development-only Boost `2.10.3` are locked in Composer.
- `php artisan boost:install --guidelines --skills --mcp` generated the Codex MCP setup and Laravel guidance; Boost application, schema, and documentation tools were exercised against the new application.
- `php artisan test --compact`: 35 tests passed, 129 assertions. This covers API/error boundaries, CORS/proxies, transaction rollback, encrypted outbox state, query/resource contracts, and liveness/readiness failures.
- `php vendor/bin/pint --dirty --format agent`: passed. `composer validate --strict`, the fresh SQLite migration, route inventory, real HTTP smoke requests, and dependency advisory checks also passed during the slice.
- `.github/workflows/server.yml` runs Composer validation, Pint, the PHP suite, and `composer audit` on PHP 8.4 and 8.5.

Not established by this phase: PostgreSQL/MySQL constraints or locking, Redis/multi-process coordination, browser authentication/CSRF, business endpoints, Python inference, or production deployment. Those remain later phase gates.
