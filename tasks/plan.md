# Plan: Laravel 13 backend migration

Status: proposed; documentation only. Specs and task plans were explicitly requested together. Implementation and production operations have not started. Source audit date: 2026-10-28.

## Objective

Replace `server/`'s Bun/Elysia/Prisma API with a conventional Laravel 13 API, retain `client/`, and isolate `py/` behind a protected service contract. Preserve real records and legitimate workflows while correcting the access-control, resource-boundary and scoring issues identified in the [audit](../docs/migration/AUDIT.md).

## Authoritative documents

- [Capability map and module index](../docs/migration/README.md).
- [Architecture/conventions/decision register](../docs/migration/ARCHITECTURE.md).
- [Endpoint and client contract](../docs/migration/API-CONTRACT.md).
- [Data mapping/cutover/rollback](../docs/migration/DATA-MIGRATION.md).
- [Official source references](../docs/migration/SOURCES.md).
- [Task checklist](todo.md), with task details/acceptance/verification in each linked module spec. The checklist is the task-state record; avoid duplicating state inside specs.

## Delivery strategy

Build in `api/` while the existing runtime remains available. Deliver tested vertical behavior slices with their schema, policy, endpoint and relevant client changes. Develop against isolated PostgreSQL and synthetic fixtures. Never let both backends write the production dataset. No production data access or deployment is implied by this documentation.

Each task in a module spec names dependencies, likely files, acceptance and verification. Split any named batching task into concrete <=five-file implementation checklists before executing it; it is a feature work package, not permission for a giant diff. The mechanically generated Laravel shell is the single explicit broad scaffold exception. Schema/model/endpoint/client changes land in dependency order, and each tested behavior remains behind the staging/new-API boundary until cutover.

## Ordered phases

| Phase | Work packages | Exit evidence |
|---|---|---|
| 0: feasibility and decisions | D1-D4/D8-D11, P1, I1, F1, M1 planning | DB/domain topology, credential path, timezone/retention questions recorded; Python runtime/license blockers known early |
| 1: shared foundation | P2-P5, T1-T2, I2-I4/I8 | Fresh migrations, protected API conventions, patient registration/activation/login, CSRF-aware session client |
| 2: account lifecycle | I5-I7/I9, U1-U4, N1-N2 | Profile/recovery/provision/suspend and durable intent delivery verified |
| 3: content and availability | C1-C4, S1-S4 | Member catalog/bookmarks and bounded clinician schedules work with their client consumers |
| 4: appointment lifecycle | A1-A7 | One-winner booking, participant authorization, exact transitions/intake/history and care pair |
| 5: clinical/realtime/inference | R1-R5, N3-N4, W1-W5, F2-F8 | Clinical denial matrix, two-browser/TURN call, recoverable notifications, private bounded inference and independent scoring/license gate |
| 6: reporting and import rehearsal | G1-G4, M2-M6 | Safe counts/export, deterministic import/resume and zero unexplained reconciliation differences |
| 7: release and retirement | M7-M9 | Staging gates, final freeze/import, operator-approved write enablement, observed/retained rollback artifacts |

High-risk prototypes start early: finite RRULE semantics (S1), hash compatibility (I1), Python stack/model validation (F1/F5), snapshot profile (M1). Clinical/scoring release gates remain mandatory even if Laravel CRUD is finished.

## Dependency direction and concurrent work

Platform precedes all modules. Taxonomy precedes registration/diagnosis-filtered behavior. Identity precedes actor-scoped modules. Scheduling precedes booking; completion creates the care relationship consumed by clinical records. Realtime consumes appointment eligibility. Reporting reads finished domain models. Final import follows finalized schemas.

Notifications consumes committed infrastructure intents; appointments/records/content do not depend on a mail/socket consumer to complete writes. This avoids a domain/notification cycle. Same for audit reads: domains write audit infrastructure, reporting reads it later.

After shared contracts are fixed, content, user-admin, notification delivery, scheduling and Python work may proceed independently. Serialize shared schema/contract changes and coordinate client base-URL/session changes. This is a dependency plan, not an instruction to spawn agents.

## Verification checkpoints

1. **After foundation:** Composer lock/version confirmed, PostgreSQL fresh migrations/tests/Pint pass, route inventory matches agreed prefix, anonymous/forbidden/errors have correct JSON, and real-browser CSRF/login/logout works. No sensitive tokens in response/logs.
2. **After account/content/scheduling:** Suspension revokes access; invitations cannot escalate privileges or reset active users. CMS writes denied to patients. Finite recurrence/timezone/overlap fixtures match client preview. Run full PHP suite plus client tests/typecheck/build.
3. **After appointments/records:** Concurrent booking/transition tests on PostgreSQL pass; outsiders cannot read intake/SOAP or mutate another appointment. Exact cutoff, null PATCH, stale edit and first-care completion tests pass. Audit and intent rollback/lease recovery proven.
4. **After realtime/inference:** Two-process Reverb/private channels/revocation, actual browser negotiation/reconnect/TURN, Python clean-image tests, timeout/cleanup/concurrency, HTTP response contract and redacted telemetry pass. Scientific model/input/calibration and license approvals recorded separately.
5. **After reporting/import:** Export memory/snapshot/formula tests pass; all source tables accounted for by deterministic import; every critical reject resolved; protected backups restored in rehearsal; credential cohorts exercise login/reset.
6. **Before production writes:** Operator reviews final reconciliation, role-specific smoke flows and rollback point. Background workers/health/alerts are operating, private Python/network/origins are verified and current dependency/model checks complete. Only then enable one Laravel writer.

At each checkpoint run the full relevant suite once. Repeat only for new changes, failures or unresolved concerns. Never lower a check to make the migration green.

## Risks and mitigations

| Risk | Mitigation / stop condition |
|---|---|
| Existing authorization flaws become accidental compatibility requirements | Denial matrix is part of every module's acceptance; unsafe source behavior is intentionally changed |
| Real-data schema differs from Prisma source | Read-only schema/profile and reject ledger before schema/import commitments |
| Lost IDs, note history or timestamps | Exact string IDs, canonical field reconciliation, no slot regeneration/cascading clinical deletion |
| Unknown credential compatibility | Synthetic compatibility proof plus reset cohort; invalidate sessions at cutover |
| Recurrence hangs or timezone drift | Finite supported rules, bounded enumeration, DST/month-end fixtures and concurrency locks |
| API succeeds but browser auth/realtime fails | Coordinated client migration, real CSRF and two-browser/multi-process tests |
| Framework tests bypass CSRF | Actual middleware/browser checks; no API-wide CSRF exclusions |
| Reverb channel authorization treated as ongoing revocation | Access generations/leases and validation on every signal/publication |
| Python dependency removal, model license or misleading scores | Early clean-image feasibility and separate supported-model/clinical gates |
| Inference timeout leaves runaway compute/files | Isolated cancellable process, admission limit and parent-owned temporary-directory cleanup |
| Commit succeeds but notifications/audit vanish | Transactional audit+outbox, scanner recovery and idempotent inbox delivery |
| Rollback discards post-cutover notes/bookings | Explicit no-simple-rollback point, freeze/reconcile or repair forward |

## Unresolved inputs and release ownership

See D1-D12 in Architecture. Assign an engineering owner for each implementation module, a data/operator owner for import/release, and an appropriate clinical/privacy reviewer for access/retention/scoring. Exact outage duration, retention, recovery objective and performance limits need real environment evidence and stakeholder decisions. No unsupported time/cost estimate is given.

The current audit is static; dependencies were not installed and production/model workloads were not exercised. The existing toy server test failed to load `elysia`. This plan's future verification commands must not be reported as already passing.
