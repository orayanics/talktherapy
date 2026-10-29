# Phase 2: Taxonomy and identity

Status: implemented and locally verified on 2026-10-28. Implements T1-T2 and I2-I9 from the approved migration specifications.

## Required behavior

Every user role starts with an unverified email and is denied protected application access until the address is verified. Patient self-registration and later privileged provisioning use the same purpose-bound activation challenge service. Verification must be single-use, expiring, attempt-limited, and must not authenticate the browser by itself.

## Execution slices

- [x] T1: Add the diagnosis schema/model/resource and deterministic public lookup tests.
- [x] T2: Add an idempotent reference seeder and migrate the client diagnosis contract.
- [x] I2: Add role/status identity schema, universal verification state, session login/me/logout, and denial tests.
- [x] I3: Add patient registration, consent evidence, activation challenge issuance, and durable encrypted mail intent.
- [x] I4: Add generic resend, OTP verification, and atomic pending-account activation with expiry/attempt/replay tests.
- [x] I5: Add safe own-name profile updates.
- [x] I6: Add password recovery/change with current-password checks and session revocation.
- [x] I7: Add purpose-bound verified email change; retain the old address until confirmation.
- [x] I8: Replace the Better Auth client/session transport with Sanctum CSRF/session requests.
- [x] I9: Connect login, activation, profile, guards, and logout; remove active Better Auth callers/dependency.
- [x] Checkpoint: PHP tests/Pint, client tests/typecheck/build, route inventory, advisory scan, and security review pass.

## Boundaries

Privileged account provisioning and user administration remain U2-U3; this phase supplies their verification mechanism but no public role selector. Local mail uses the configured Laravel mailer. Outbox recovery delivery remains N2. No OAuth, JWT, MFA, legacy credential import, or production deployment is introduced.

## Evidence

- `php artisan test --compact`: 52 tests passed, 229 assertions.
- `php vendor/bin/pint --dirty --format agent`: passed.
- Client: 2 Vitest identity tests passed; `bunx tsc --noEmit` and `bun run build` passed.
- Local SQLite migrations and idempotent diagnosis seeding passed; route inventory contains the 17 expected platform/taxonomy/identity routes.
- Better Auth has no remaining active caller or dependency. Client authenticated fetching is explicitly browser-only; CSRF initialization and a single 419 refresh are implemented.

Not yet verified in a real browser: cookie behavior across the eventual deployed domain/proxy and CSRF middleware behavior (Laravel disables CSRF middleware in ordinary feature tests). This remains part of the pre-release browser gate.

