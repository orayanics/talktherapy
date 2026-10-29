# Spec: migration-cutover

Status: legacy import retired; deployment tasks M7-M9 remain proposed. Depends on: every business module. The historical [data migration contract](../DATA-MIGRATION.md) is retained only as audit context. Addresses audit 10, 13, 15, 17, 18. Decisions D1-D12 as relevant.

## Objective and scope

There are no legacy records to move. Package the completed Laravel/client/Python system, switch client traffic safely, and retire any remaining Bun/Better Auth deployment references after a proved rollback/observation window.

## Specification

- Import every table/pivot in the mapping with exact IDs, fields and history. Sessions/challenges are deliberately discarded and reissued; credentials follow the proven-cohort plan. Do not regenerate schedules/slots, fire observers/notifications, or seed a known administrator password.
- Versioned importer supports dry-run, run ID, explicit snapshot, chunk checkpoints and deterministic resume. Reject/quarantine ledger accounts for every nonimported row; a row is never silently skipped or overwritten. Restrict report access and exclude clinical payloads from console output.
- Reconciliation checks counts, canonical field checksums, FK integrity, partial-unique conflicts, date/ID conversion, representative relationship joins and current role/status. Every unexplained mismatch and critical rejected row blocks cutover.
- Application deployment includes PHP web process, Redis/session/queue, supervised outbox/realtime processes, scheduler, PostgreSQL backups and private warmed Python service. Public client/API/WSS route together; no leftover raw socket or browser Python dependency. Reverse proxy trusts only configured origins/headers.
- Verify the release artifact's dependency advisories/licenses at implementation time (`composer audit`, authoritative JS audit and Python/model review). Do not claim this static source audit establishes current vulnerability status.
- Use a single final write freeze, drain sockets/workers, final WAL-safe source snapshot/import/reconcile and explicit operator gate before enabling Laravel writes. Authentication is intentionally reset. New target writes define the no-simple-rollback point.
- Rollback before target writes restores frozen legacy routing/state. After target writes, freeze/reconcile or repair forward; returning to a stale database is forbidden. Practice restore with encrypted backups and capture timings for the actual outage plan.

## Acceptance and verification

Two isolated dry runs and one interrupted/resumed run yield the same IDs/checksums/reject report. Zero unexplained differences, no critical rejects, no phantom notifications and no clinical/audit cascades. Role/relationship smoke tests, credential cohort login/reset, final client build, real CSRF, two-instance realtime/TURN and bounded inference all pass before public writes. Record who reviewed the reconciliation and rollback exercise. No implementation is complete solely because migrations run.

## Task plan

1. **M1 — Profile a protected snapshot.** Dependency: P1, D3 approval for data access. Files: profiling command, redacted schema manifest, profile test, operator instructions (four). Acceptance: actual schema, counts, IDs/times/hash cohorts and rejects reported without leaking data. Verify: synthetic fixture first, then authorized read-only snapshot.
2. **M2 — Import reference/identity data.** Dependency: M1/T2/I1-I7. Files: import command/run ledger, diagnosis mapping, user/credential mapping, importer test (<=five per mapping slice). Acceptance: deterministic IDs, reviewed credentials, no active session/OTP import or mail side effects. Verify: dry-run/repeat/resume fixture tests.
3. **M3 — Import CMS data.** Dependency: M2/C1-C3. Files: content/tag mapping, pivot/bookmark mapping, fixture, import test (four). Acceptance: exact authors/tags/bookmarks/cardinality. Verify: mapping counts/checksums and duplicate fixture behavior.
4. **M4 — Import scheduling history.** Dependency: M2/S2/A1-A6. Files: schedules/slots mapping, appointment/event mapping, encounter/care mapping, fixture test (four). Acceptance: no slot regeneration, all lifecycle states/pairs/history reconciled. Verify: all constraints and critical reject paths.
5. **M5 — Import clinical/inbox/audit data.** Dependency: M4/R2/N1/G2. Files: SOAP mapping, inbox mapping, audit mapping, fixture/test (<=five). Acceptance: exact clinical fields/read state/actor history without delivery replay; malformed JSON quarantined. Verify: sensitive fixture field hashes and related-user denial tests.
6. **M6 — Reconcile and rehearse restore.** Dependency: M2-M5. Files: reconciliation command, report schema, test, restore runbook (four). Acceptance: all tables accounted for, critical rejects block, repeat/resume stable and both backups restore. Verify: rehearsal evidence with measured times and signed report.
7. **M7 — Package the deployment.** Dependency: P5/W5/F8/N3/G3. Files: service/proxy configuration, release workflow, environment example, release smoke test, runbook (five per deployment slice). Acceptance: private Python, supervised workers, correct TLS/origins/cookies, no dev seeds and advisory/license gate. Verify: staging full workflow and dependency audits.
8. **M8 — Cut over and observe.** Dependency: M7/all module checks, operator approval. Files: cutover/rollback execution record and smoke results (two; production operations require explicit release authorization). Acceptance: routing succeeds with one active API and a known rollback point. Verify: production smoke and monitoring against approved thresholds; rollback on failure.
9. **M9 — Retire legacy runtime.** Dependency: M8 plus approved observation/retention window. Files: root workspace/scripts, legacy deployment config, retirement manifest and docs in <=five-file batches; bulk legacy deletion is separately reviewed. Acceptance: no active consumers/writers reference Bun/Better Auth/custom WS; records/backups retained as required and old secrets revoked. Verify: global caller/route/config search, restore availability and final client/API checks.

## Exclusions and gates

No automatic live-database import, dual writes, destructive resets, unapproved production cutover, backup deletion or real-data test fixtures. Exact retention/outage/observation durations must be chosen with the deployment/data owner. These gates concern future operations, not permission to finish this requested documentation.
