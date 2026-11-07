# Platform

Status: implemented and locally verified.

## Scope

- Laravel 13 API in `server/`.
- Sanctum session authentication and CSRF protection.
- Versioned `/api/v1` business routes.
- Request IDs, safe errors, Resources, audit, and outbox storage.
- SQLite development and test databases.

## Evidence

- `PlatformBoundaryTest`, `PlatformContractTest`, `PlatformOperationsTest`, and `PlatformTransactionTest` pass.
- Client, server, and Python verification commands are listed in [architecture](../ARCHITECTURE.md).

## Remaining gates

- Select and verify the production database and Redis.
- Rehearse readiness, backups, restore, and secret rotation.
