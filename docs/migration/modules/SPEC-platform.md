# Spec: platform

Status: implemented and locally verified on 2026-10-28. Depends on: none. Inherits [architecture, commands and boundaries](../ARCHITECTURE.md). Contract: [API](../API-CONTRACT.md). Addresses audit 13, 14, 17, 18.

## Objective and existing scope

Create the Laravel API foundation in `server/` after the user retired the prior runtime to `_server/`. Consumers are every future backend module and all `client/src/api` callers once migrated.

## Specification

- Create `server/` with Laravel 13, PHP 8.4, Sanctum, SQLite local storage and Predis for Redis-backed environments. Use the conventional directories, bootstrap and commands in the architecture. No custom module loader, repository abstraction or permission package for four roles.
- Define the `/api/v1` JSON error and Resource conventions, health/readiness endpoints, request IDs, bounded query validation and trusted-proxy/CORS configuration. Keep sessions/auth paths distinct from business base URLs.
- Create `audit_logs` and `outbox_messages` infrastructure before business modules. Audit snapshots contain action, actor ID/role, entity ID/type, request ID and minimal structured changes; exclude note/audio/credential bodies. Durable intent delivery has lease recovery and unique event/recipient keys.
- Centralize environment reads in config. Fail readiness/startup for missing production secrets/dependencies rather than using development fallbacks. Separate secrets from Vite-exposed public config.
- Server CI runs locked installs, PHP tests/Pint and advisory checks. Add client and Python gates with their migration phases. Use the selected production database for future constraints/lock tests; don't claim SQLite validates these races.
- Framework defaults remain intact, including request-forgery protection. Default JSON errors are safe and stable; 404/422/429/503 are verified through actual middleware.

## Acceptance and verification

An isolated API can migrate a fresh test database, return minimal health, enforce exact origins/trusted proxies, validate a bounded list request, and serialize a paginated fixture. A forced audit failure rolls back a synthetic write. Outbox intents survive failed dispatch. Commands: `php artisan test --filter=Platform`, `php artisan route:list --path=api`, `vendor/bin/pint --test`; full pipeline at checkpoint. Browser CSRF checks belong to identity, not a bypassed unit-test assertion.

## Task plan

1. **P1 — Bootstrap the pinned application.** Dependency: none. Files: generated `server/` shell and lockfile; mechanical scaffolding is the sole broad generated-file task, with no custom domain implementation. Acceptance: resolved framework is 13.x, PHP constraint selected, default tests pass on an isolated database. Verify: `composer show laravel/framework`, `php artisan test`, `php artisan about`.
2. **P2 — Configure API boundary.** Dependency: P1. Files: `bootstrap/app.php`, `routes/api.php`, `config/cors.php`, request-ID middleware, `tests/Feature/PlatformBoundaryTest.php`. Acceptance: prefix, JSON errors, origins/proxies and request IDs work. Verify: `php artisan test --filter=PlatformBoundary`; record route inventory. Keep config exports per the installed skeleton.
3. **P3 — Add durable write evidence.** Dependency: P2. Files: audit/outbox migration, `AuditLog` model, `OutboxMessage` model, transaction test (up to five files). Acceptance: schema and unique delivery key, sensitive-payload exclusion and rollback behavior proven. Verify: `php artisan test --filter=PlatformTransaction`.
4. **P4 — Define shared query/Resource conventions.** Dependency: P2. Files: shared list request, shared query rule if needed, example Resource/collection, contract test (max five). Acceptance: bounds/allowlists and exactly one envelope/pagination level. Verify: `php artisan test --filter=PlatformContract`. Do not introduce a generic response wrapper around Resources.
5. **P5 — Wire repeatable checks and operations.** Dependency: P3/P4. Files: workflow, `.env.example`, root scripts, health/readiness implementation, operations test (max five; split readiness controller if it grows). Acceptance: isolated service configs, locked checks and nonsecret readiness behavior. Verify: run the workflow commands locally/CI after services exist.

## Verification result and exclusions

P1-P5 are complete; see [phase evidence](../../../tasks/phase-1.md#evidence). Production database/hosting and public origin remain deployment inputs. This phase excludes business endpoints, browser authentication, outbox delivery, Redis coordination, production deployment, Kubernetes, Octane, Passport, event sourcing, and speculative infrastructure.
