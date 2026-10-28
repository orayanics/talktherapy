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
- [ ] S2 Create validated nonoverlapping schedules. Transactional creation, audit, checks and SQLite overlap tests pass; PostgreSQL concurrency evidence remains pending.
- [x] S3 List/view slots by actor and availability. Role projection, diagnosis/date filters, active/verified clinician visibility and safe Resource tests pass.
- [ ] S4 Align client preview and consumers. Client recurrence fixtures, lint, typecheck and build pass; real-browser scheduling workflow evidence remains pending.

### Checkpoint: content and availability

- [ ] Role denial, safe rendering, bounded recurrence, overlap races, preview fixtures and client checks pass.

## Appointments

[Spec and task details](../docs/migration/modules/SPEC-appointments.md#task-plan)

- [ ] A1 Establish history schema/constraints/policies.
- [ ] A2 Book atomically with valid intake.
- [ ] A3 Read own bookings safely.
- [ ] A4 Accept/reject assigned pending bookings.
- [ ] A5 Cancel owning patient's pending booking.
- [ ] A6 Complete and establish care relationship.
- [ ] A7 Connect appointment consumers.

## Clinical records

[Spec and task details](../docs/migration/modules/SPEC-clinical-records.md#task-plan)

- [ ] R1 Scope completed-care roster.
- [ ] R2 Implement authorized SOAP reads.
- [ ] R3 Create related-patient SOAP transactionally.
- [ ] R4 Update with null semantics/conflict protection.
- [ ] R5 Connect clinical consumers.

### Checkpoint: clinical workflows

- [ ] PostgreSQL races, clinical denial matrix, state cutoffs, history, audit rollback and client workflows pass.

## Notifications

[Spec and task details](../docs/migration/modules/SPEC-notifications.md#task-plan)

- [ ] N1 Implement durable owner-scoped inbox API.
- [ ] N2 Implement recoverable outbox delivery.
- [ ] N3 Authorize private realtime notifications.
- [ ] N4 Connect client inbox/reconnect/account reset.

## Realtime sessions

[Spec and task details](../docs/migration/modules/SPEC-realtime.md#task-plan)

- [ ] W1 Define/authorize session descriptor.
- [ ] W2 Relay validated signals.
- [ ] W3 Coordinate presence and revocation.
- [ ] W4 Migrate browser transport.
- [ ] W5 Verify TURN/network/media cleanup.

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

- [ ] G1 Aggregate administrator dashboard counts.
- [ ] G2 Read safe filtered audit history.
- [ ] G3 Stream safe bounded CSV/JSONL exports.
- [ ] G4 Connect reporting consumers.

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
