# Migration task checklist

Status: implementation in phases. The Laravel platform foundation was completed on 2026-10-28; business modules remain pending. Details, dependencies, likely files, acceptance and verification live in the linked module task plans. Work-package tasks that mention file batches must be subdivided into <=five-file execution slices before coding; preserve the parent ID as their prefix. Check a parent only after every child and its evidence are complete.

## Platform

[Spec and task details](../docs/migration/modules/SPEC-platform.md#task-plan)

- [x] P1 Bootstrap the pinned Laravel application.
- [x] P2 Configure the API boundary.
- [x] P3 Add durable audit/outbox storage.
- [x] P4 Define query/Resource conventions.
- [x] P5 Wire checks and operational readiness.

## Taxonomy

[Spec and task details](../docs/migration/modules/SPEC-taxonomy.md#task-plan)

- [x] T1 Migrate diagnosis catalog/read API.
- [x] T2 Verify reference seed and client mapping; legacy import is not applicable.

## Identity

[Spec and task details](../docs/migration/modules/SPEC-identity.md#task-plan)

- [x] I1 Retired by decision: no legacy users/passwords are imported; new credentials use Laravel hashing.
- [x] I2 Establish session login/me/logout.
- [x] I3 Add patient registration/consent/challenge issue.
- [x] I4 Implement atomic activation and attempt limits.
- [x] I5 Implement own profile update.
- [x] I6 Implement recovery/password change/revocation.
- [x] I7 Implement verified email change.
- [x] I8 Connect client session/CSRF lifecycle.
- [x] I9 Connect auth screens, guards and logout.

## User administration

[Spec and task details](../docs/migration/modules/SPEC-user-admin.md#task-plan)

- [x] U1 Implement safe user list/detail/counts.
- [x] U2 Provision privileged invitations with hierarchy, including first-superadmin bootstrap.
- [x] U3 Suspend/reactivate and revoke sessions safely. Confirmed working by user.
- [x] U4 Connect administration consumers. Confirmed working by user; client lint/typecheck/tests/build passed.

### Checkpoint: foundation and identity

- [ ] Schema, contracts, session/account states, privileged denials and browser CSRF checks pass; preserve evidence.

## Content

[Spec and task details](../docs/migration/modules/SPEC-content.md#task-plan)

- [x] C1 Migrate content schema/read contract.
- [x] C2 Authorize transactional content/tag writes.
- [ ] C3 Implement personal idempotent bookmarks. SQLite idempotence/ownership tests pass; PostgreSQL concurrency evidence remains pending.
- [ ] C4 Connect and safely render content. Client typecheck, lint, tests and build pass; real-browser content workflow evidence remains pending.

## Scheduling

[Spec and task details](../docs/migration/modules/SPEC-scheduling.md#task-plan)

- [x] S1 Prove bounded recurrence/timezone semantics. UTC is fixed, so DST gap/fold times are inapplicable. Accept only DAILY/WEEKLY/MONTHLY with optional weekly BYDAY and INTERVAL, COUNT <=365 or UTC UNTIL within one year. Recurrence fixtures pass in PHP and client.
- [ ] S2 Create validated nonoverlapping schedules. Implementation accepted by user; PostgreSQL concurrency evidence remains pending.
- [x] S3 List/view slots by actor and availability. Role projection, diagnosis/date filters, active/verified clinician visibility and safe Resource tests pass.
- [ ] S4 Align client preview and consumers. Client recurrence fixtures, lint, typecheck and build pass; real-browser scheduling workflow evidence remains pending.

### Checkpoint: content and availability

- [ ] Role denial, safe rendering, bounded recurrence, overlap races, preview fixtures and client checks pass.

## Appointments

[Spec and task details](../docs/migration/modules/SPEC-appointments.md#task-plan)

- [x] A1 Establish history schema/constraints/policies. Approved by user. SQLite invariant tests pass; PostgreSQL invariant evidence remains pending.
- [x] A2 Book atomically with valid intake. Approved by user. Atomic booking, validation and rollback tests pass on SQLite; PostgreSQL race evidence remains pending.
- [x] A3 Read own bookings safely. Participant-scoped list/detail, safe projection, pagination and date-filter tests pass.
- [x] A4 Accept/reject assigned pending bookings. Approved by user. Actor, transition, slot, event and cutoff tests pass on SQLite; PostgreSQL competing-action evidence remains pending.
- [x] A5 Cancel owning patient's pending booking. Owner, pending-only transition, exact cutoff and blocked-slot tests pass.
- [x] A6 Complete and establish care relationship. Approved by user. Care-pair uniqueness and first-completion preservation tests pass on SQLite; PostgreSQL race evidence remains pending.
- [ ] A7 Connect appointment consumers. Client API/types/actions and error refresh are integrated; tests, lint, typecheck and build pass; browser flow remains pending.

## Clinical records

[Spec and task details](../docs/migration/modules/SPEC-clinical-records.md#task-plan)

- [x] R1 Scope completed-care roster. Clinician-only care-pair list, trimmed search and bounded pagination; SQLite tests pass.
- [x] R2 Implement authorized SOAP reads. Patient-own/author reads only; clinical denial matrix covered on SQLite.
- [x] R3 Create related-patient SOAP transactionally. Validation, metadata-only audit/outbox, PHI preservation and rollback tests pass on SQLite.
- [x] R4 Update with null semantics/conflict protection. Optional null clearing, author-only access and version conflict tests pass on SQLite.
- [ ] R5 Connect clinical consumers. Client APIs, optional SOAP fields and stale-edit recovery are integrated; typecheck, lint, tests and build pass; real-browser workflow remains pending.

### Checkpoint: clinical workflows

- [ ] SQLite clinical denial matrix and audit/outbox rollback pass. PostgreSQL concurrency evidence and real-browser clinical workflows remain pending.

## Notifications

[Spec and task details](../docs/migration/modules/SPEC-notifications.md#task-plan)

- [x] N1 Implement durable owner-scoped inbox API; owner isolation, idempotent read, admin send, and audit tests pass on SQLite.
- [x] N2 Implement recoverable in-app and email outbox delivery with leased claims, idempotent inbox writes, retries, expiry and a minute scanner. Appointment, SOAP, identity, account-status and password-change email paths are covered by SQLite tests; queue outage/restart and multi-worker recovery evidence remains pending.
- [x] N3 Authorize private Reverb channels with the authenticated user, active/verified state and session epoch; callback denial tests pass. Local non-TLS Reverb configuration is verified; real Reverb auth/revocation checks remain pending.
- [x] N4 Replace raw notification sockets with Echo/Reverb, CSRF-aware channel auth, user-scoped REST queries, event deduplication and reconnect refetch. Client typecheck, lint and build pass; real-browser reconnect/account-switch checks remain pending.

  - [x] Invitation emails for admin-provisioned admin, clinician and patient accounts are delivered through identity outbox processing.
  - [x] Appointment and SOAP email notifications are delivered to the same recipients as their in-app notifications.
  - [x] Account suspension requires a reason and includes it in the audit record and suspension email.
  - [ ] Add scheduled appointment reminders for patients and clinicians with timezone-aware delivery keys.
  - [ ] Add schedule-change notifications for clinicians and security alerts for email changes to both old and new addresses.
  - [ ] Verify Mailpit SMTP delivery and Reverb reconnect/account-switch behavior in a real browser session.

## Realtime sessions

[Spec and task details](../docs/migration/modules/SPEC-realtime.md#task-plan)

- [ ] W1 Define/authorize session descriptor.
- [ ] W2 Relay validated signals.
- [ ] W3 Coordinate presence and revocation.
- [ ] W4 Migrate browser transport.
- [ ] W5 Verify TURN/network/media cleanup.

To run realtime locally, start php artisan reverb:start and php artisan schedule:work.

## Phoneme analysis

[Spec and task details](../docs/migration/modules/SPEC-phoneme-analysis.md#task-plan)

- [ ] F1 Prove reproducible runtime/model feasibility.
- [ ] F2 Establish inference DTO/edge-case tests.
- [ ] F3 Bound uploads/decoder/auth/temporary-file lifecycle.
- [ ] F4 Isolate inference and readiness.
- [ ] F5 Validate alignment/duration/scoring semantics.
- [ ] F6 Add secure bounded Laravel proxy.
- [ ] F7 Connect browser assessment.
- [ ] F8 Approve maintained/licensed/validated production model path.

### Checkpoint: realtime and inference

- [ ] Real multi-instance/socket revocation/TURN checks and bounded Python clean-image tests pass; model licensing and scientific sign-off recorded separately.

## Reporting

[Spec and task details](../docs/migration/modules/SPEC-reporting.md#task-plan)

- [x] G1 Aggregate administrator dashboard counts.
- [x] G2 Read safe filtered audit history.
- [x] G3 Stream safe bounded CSV/JSONL exports.
- [x] G4 Connect reporting consumers.

## Migration and cutover

[Spec and task details](../docs/migration/modules/SPEC-migration-cutover.md#task-plan)

- [x] M1 Retired by decision: no legacy source snapshot or data import.
- [x] M2 Retired by decision: no reference/identity import.
- [x] M3 Retired by decision: no CMS data import.
- [x] M4 Retired by decision: no scheduling/clinical history import.
- [x] M5 Retired by decision: no SOAP/inbox/audit import.
- [x] M6 Retired by decision: no import reconciliation; deployment backup/restore remains in M7.

### Checkpoint: import and reporting

- [ ] Safe reporting exports and deployment backup/restore are verified; import reconciliation and credential cohorts are not applicable.

- [ ] M7 Package and verify deployment.
- [ ] M8 Execute approved freeze/import/cutover and observe.
- [ ] M9 Retire legacy runtime after retention/rollback window.

### Checkpoint: release

- [ ] Final reconciliation/operator gate passed before writes; one writer enabled, health/alerts verified and post-write rollback constraints acknowledged.
- [ ] No active Better Auth/custom WS/Bun consumers remain; required retained evidence/backups and revoked legacy secrets accounted for.

## Product improvements: notifications, exports, admin UX and diagnoses

[Plan/task matrix](plan-matrix.md)

These are planned follow-up slices. Keep the shared UI state/error contract first so each later feature has consistent loading, success, failure and reset behavior.

- [ ] P0 Record research-backed contracts for mutations, notification channels/preferences, side-drawer accessibility, XLSX export limits and diagnoses ownership.
- [ ] P1 Standardize mutation feedback with Sonner promise toasts and reset/null transient UI state after success, retry, route changes and account switching.
- [x] P2 Replace the notification popover with an accessible responsive side drawer; preserve unread counts, realtime updates, pagination and mark-read behavior.
- [x] P3 Add Excel-compatible export alongside CSV/JSONL with bounded/queued large-export behavior, completion/failure audit records, authorization and download cleanup.
- [x] P4 Add admin/superadmin custom in-app notification authoring and delivery through the existing notification service, outbox and Reverb event path.
- [x] P5 Add per-user in-app and email notification preferences; enforce preferences at delivery time and expose authenticated user settings UI.
- [x] P6 Add diagnoses CRUD backend (migration/model/policy/requests/resources/routes/tests) for authorized admin/superadmin workflows.
- [x] P7 Add diagnoses CRUD frontend (list/search/create/edit/archive, validation, mutation feedback and empty/error/loading states) and connect appointment consumers.
- [x] P8 Replace the browser `prompt()` suspension flow with a validated accessible modal; require a reason, reset stale state, and show the same reason in confirmation/email/audit views.

### Checkpoint: product improvements foundation

- [ ] Shared mutation/toast/reset tests pass; notification drawer preserves keyboard/focus behavior; no transient error/alert leaks across routes or users.

### Checkpoint: product improvements complete

- [ ] XLSX and queued export evidence, notification preference delivery matrix, admin notification audit/realtime evidence, diagnoses CRUD denial matrix, and suspension-modal browser flow all pass.
