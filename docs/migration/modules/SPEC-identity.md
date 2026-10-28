# Spec: identity

Status: implemented and locally verified on 2026-10-28; deployed-browser cookie/CSRF verification remains a release gate. Depends on: platform, taxonomy. Inherits [common conventions](../ARCHITECTURE.md). Addresses audit 5, 11, 13, 17, 18. Decisions D2, D4, D8.

Confirmed amendment (2026-10-28): email verification is mandatory for every role. Patient, clinician, admin, and superadmin accounts all begin unverified and may not access protected application routes until their address is verified. No seeder or privileged provisioning path may bypass this rule.

## Objective and current scope

Replace Better Auth with Laravel session authentication while preserving registration, invitation activation, login/logout, current-user query, profile/name change, verified email change, password change and recovery. Sources: `server/src/lib/auth.ts`, auth macro/plugin, `register` and `activate` modules, `client/src/utils/auth-client.ts`, login/profile hooks, private/public/session route guards, sidebar and SessionContext. Credential/session/verification schema differs from Laravel; see [data mapping](../DATA-MIGRATION.md).

## Specification

- `users` owns UUID, name, normalized email, verification timestamp, timestamps and private password hash. One-to-one `user_profiles` owns role, status, diagnosis and image as explicitly required. Add Laravel sessions and password-reset token tables without reusing Better Auth session rows.
- `POST /login` validates credentials, active/verified state and rate limits; regenerate session ID. `GET /api/v1/me` returns the safe user Resource. `POST /logout` invalidates session and CSRF state. Pending users use activation only; suspended users cannot use business routes even with an old session. Revalidate status on each protected request.
- Public patient registration accepts name, normalized email, password/confirmation, valid diagnosis ID and affirmative consent. Record consent purpose/version/time in a separate evidence record. Return minimal pending-account data. Privileged provisioning belongs to user-admin; both flows call one activation-challenge issuer.
- `activation_challenges`: string ID/user ID, normalized email, purpose, keyed code digest, expiry, attempts/max attempts, consumed timestamp and creation timestamp. Generate six-digit codes with cryptographic randomness; do not store/log plaintext. Proposed TTL 10 minutes, five failed attempts/challenge, resend no more than once/minute/account with additional trusted-IP limit. Confirm operational values before release.
- Resend gives generic 202, invalidates older pending activation challenges and queues mail through durable intent. Store any delivery-only code in an encrypted expiring envelope, purge it after delivery/expiry, and prevent plaintext job/failed-job serialization; the verification table holds only a digest. It must not turn active/suspended accounts into activation candidates. `/activation/otp/verify` checks a code but grants no privileges; `/activation` rechecks and consumes it atomically under lock. No reusable verification flag from the browser is trusted.
- Activation only changes pending users. Patients already supplied their password/name; clinicians/admins supply name, confirmed password and clinician diagnosis where needed. A suspended/active account uses its separate recovery/reactivation flow. OTP verification, status update, credential change, consent if applicable and audit are one transaction.
- Profile name PATCH is independent from password/email change. Password change requires current password, revokes other sessions and rotates the current session. Email change requires current password, a token bound to user/new email/purpose and confirmation of the new address; old address remains authoritative until confirmation. Audit both without tokens. Password reset uses Laravel's broker, generic request responses, expiry, throttling and session revocation.
- Use normal session guard with Sanctum SPA middleware. Login/logout use web middleware; business APIs use `auth:sanctum` plus account-state middleware. Do not return session bearer tokens or introduce JWT.
- Credential import is gated by synthetic Bun/PHP hash verification and redacted cohort profiling; unsupported cases require reset. Never turn off all hash checks without an explicit migration-specific justification.

## Client reach and acceptance

Replace Better Auth calls in utility, login/profile hooks, three route guards and sidebar; update SessionContext/types, loaders, error display and shared HTTP CSRF setup. Clear user-bound Query caches and notification state on logout/login identity change. Resolve TanStack SSR cookie forwarding or explicitly use browser-only session fetches; test page refresh without sharing state across requests.

Tests: fixation protection, unauthenticated/expired session, pending/suspended denial, OTP expiry/attempts/replay/race/purpose mismatch, generic resend/recovery responses, consent persistence, email uniqueness, password/email change reauthentication and per-cohort import. Browser tests must exercise CSRF middleware (ordinary HTTP tests disable it), same-origin/subdomain cookies, 419 refresh once, direct navigation and logout. Verify `php artisan test --filter=Identity`, client typecheck/test/build, plus browser checks.

## Task plan

1. **I1 — Retired by decision.** There is no legacy user/password import; all new credentials use Laravel hashing. Do not add Bun hash compatibility code.
2. **I2 — Establish session login/me/logout.** Dependency: P2/P4, T1. Files: user schema/model changes, auth controller, web/API routes, `IdentitySessionTest` (max five; split schema from endpoints if needed). Acceptance: regeneration, safe user projection and state checks work. Verify: `php artisan test --filter=IdentitySession`.
3. **I3 — Add patient registration and challenge issue.** Dependency: I2/P3. Files: registration request/controller, registration Action, challenge/consent migration, feature test (five). Acceptance: pending patient, consent evidence and single mail intent committed together; no arbitrary role input. Verify: `php artisan test --filter=IdentityRegistration`.
4. **I4 — Verify and consume activation challenges.** Dependency: I3. Files: activation request/controller, activation Action, challenge model, activation test (five). Acceptance: pending-only atomic activation and attempt/replay rules. Verify: `php artisan test --filter=IdentityActivation` including concurrent consume.
5. **I5 — Migrate name/profile update.** Dependency: I2/P3. Files: profile request/controller, user Resource, routes, profile test (five). Acceptance: only allowed own fields change; role/status/diagnosis injection refused. Verify: `php artisan test --filter=IdentityProfile`.
6. **I6 — Implement recovery/password change.** Dependency: I2/P3. Files: recovery controller, change-password request/Action, routes, feature test (five). Acceptance: broker expiry/single-use behavior, current-password requirement and revocation. Verify: `php artisan test --filter=IdentityPassword`.
7. **I7 — Implement verified email change.** Dependency: I2/P3. Files: email-change request/controller, Action/challenge storage extension, feature test (max five). Acceptance: old email retained until valid purpose-bound confirmation; duplicate/expired tokens fail. Verify: `php artisan test --filter=IdentityEmail`.
8. **I8 — Connect client session lifecycle.** Dependency: I2. Files: auth utility replacement, HTTP client, session types/context, client auth test (up to five). Acceptance: same-origin CSRF handshake, safe session query, logout cache reset. Verify: focused client test and typecheck.
9. **I9 — Connect client auth screens/guards.** Dependency: I3-I8. Files: login hook, profile hook, one guard group at a time, sidebar plus browser fixture. Split into batches of at most five concrete files. Acceptance: all Better Auth active callers removed; loading, refresh and error behavior retained. Verify: browser registration/activation/login/profile/logout and global caller search.

## Exclusions and decisions

No OAuth, impersonation, mobile tokens, new SSO or MFA in this migration. Enumerate the generated Better Auth API before retirement; unused plugin capabilities are explicitly retired rather than silently copied. Confirm forced-reset communications and consent policy before production. Administrator reactivation is never an activation endpoint side effect.
