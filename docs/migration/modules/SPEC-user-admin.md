# Spec: user-admin

Status: proposed. Depends on: identity. Inherits [common conventions](../ARCHITECTURE.md). Addresses audit 11, 15, 18, 20. Decision D5.

## Objective and scope

Preserve user list/detail/counts, invitation-based clinician/admin creation, suspension and reactivation. Sources: `users`, `register`, `auth` modules; Better Auth permissions/admin plugin; `client/src/api/{users,register}.ts`, users/register screens. Administrator dashboard aggregate counts belong to reporting, not this list module.

## Specification

- Admin/superadmin can list operational account information with validated search, role/status arrays, stable allowed sorts and capped pagination. Detail/Resource never serializes password, session, token or provider secrets. Counts honor common search/role filters; status buckets are explicitly defined and consistent with the displayed list.
- Proposed hierarchy: superadmin provisions administrators and manages administrator state; admin/superadmin provisions clinicians and manages patient/clinician state. No public role input, no admin-to-superadmin escalation, no self-suspension, and no removal/suspension of the last active superadmin. Lock relevant privileged rows when enforcing the last-superadmin rule.
- Provisioning creates pending users and reuses identity's secure invitation/activation issuer; do not create and mail temporary plaintext passwords. Active/suspended email collisions do not reset an existing account.
- A fresh installation bootstraps its first superadmin through a one-time operator command with an interactive secret or secure invitation, checked for existing privileged accounts and audited. No production default password/account is seeded. Imported superadmins do not trigger this flow.
- Suspend atomically changes status, records reason/actor, revokes server sessions, writes audit/notification intent and invalidates realtime authorization. Reactivate requires an authorized actor and explicit valid source state; OTP/login cannot perform it. Preserve verification state rather than granting verification on reactivation.
- Deactivation preserves appointment/clinical/audit records. Hard delete, direct role editing, session impersonation and arbitrary admin password setting are not current client requirements and are not exposed. The source plugin contains some such capabilities; inventory and explicitly retire unused routes.

## Acceptance and verification

Four-role matrix covers list/counts/provision/suspend/reactivate. Denied operations make no writes. A logged-in suspended account loses protected HTTP and realtime access. Last-superadmin protection holds under concurrent requests. Counts and search match fixture rows without leaking clinical notes. Verify `php artisan test --filter=UserAdmin`, client user list/register screen tests and typecheck.

## Task plan

1. **U1 — List/detail/counts.** Dependency: I2/P4. Files: user-list request/controller, admin Resource, routes, feature test (five). Acceptance: filtering/count semantics and safe fields. Verify: `php artisan test --filter=UserAdminRead`.
2. **U2 — Provision privileged invitations.** Dependency: I3/I4/P3. Files: invitation request/controller, provision Action, User policy, feature test (five). Acceptance: hierarchy and existing-email rules; one pending account and durable intent. Add a separate <=five-file bootstrap-command/test slice for first superadmin with no production default credential. Verify: `php artisan test --filter=UserAdminInvite` and bootstrap refusal/idempotency test.
3. **U3 — Suspend/reactivate safely.** Dependency: U2. Files: status request/controller, status Action, session/realtime revocation integration, feature test (five). Acceptance: state, revocation, audit and last-superadmin race protections. Verify: `php artisan test --filter=UserAdminStatus` and existing-socket denial test at realtime checkpoint.
4. **U4 — Update admin consumers.** Dependency: U1-U3. Files: `client/src/api/users.ts`, `register.ts`, user types, affected hook, client test (five; batch additional callers separately). Acceptance: all affected screens use new fields/errors and admin creation is correctly gated. Verify: typecheck/build and browser admin workflow.

## Decisions

Confirm hierarchy and any currently used generated Better Auth administrative operations before implementation. No clinical access is implied by account administration.
