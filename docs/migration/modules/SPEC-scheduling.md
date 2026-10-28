# Spec: scheduling

Status: proposed. Depends on: identity. Inherits [common conventions](../ARCHITECTURE.md). Addresses audit 6, 7, 17, 18, 19. Decision D9.

## Objective and source scope

Preserve clinician-created one-off/recurring availability and slot listings/details. Sources: `server/src/modules/schedule/service.ts`, slot reads, appointment service slot-list functions, Prisma AvailabilityRule/Slot, client schedule API/form/schema and `expandOccurrences.ts`/RRULE builder. Current server creates schedules; it does not implement general schedule update/delete/rescheduling. Client declarations for `/schedules` reads have no active callers found.

## Specification

- `schedules`: clinician ID, start/end UTC instants, recurrence rule, timezone, timestamps. `slots`: schedule/clinician IDs, start/end, status, hidden flag and timestamps. Positive duration constraints and indices from data contract apply. Legacy unknown timezone requires review, not guessing.
- `POST /api/v1/schedules`: active verified clinician only; derive clinician ID from session. Validate timezone, start/end, supported rule, duration, bounded count/horizon and interval overlap before writes. New schedules must start in the future; historical imports bypass business creation rules only through the importer.
- Supported new recurrence subset: none or DAILY/WEEKLY/MONTHLY; positive INTERVAL, optional BYDAY for weekly, and finite COUNT <=365 or UNTIL within one year of start. Reject unknown/unsupported clauses, duplicate conflicting clauses, high-frequency/unbounded rules, invalid dates and zero occurrences. Do not call unbounded `all()` or silently create a one-off fallback.
- Use a documented PHP recurrence library only after a compatibility/maintenance check; Laravel/Carbon does not implement RFC RRULE parsing. Select one package during the bounded prototype rather than writing a parser. Match the supported client subset and prove month-end/daylight-saving behavior with fixtures.
- Materialize all accepted occurrences transactionally within the cap. Preserve requested local wall time across DST using the chosen timezone; define ambiguous/nonexistent local times as validation errors in the first release. Server's computed occurrences are authoritative; client preview must match fixture behavior or consume a preview calculation later only if needed.
- Lock clinician row before checking overlapping slots, then write schedule/slots; this serializes concurrent availability creation for one clinician. Reject partial overlaps and duplicates with 409. No partial schedule survives a failed occurrence.
- `GET /slots`: clinicians see own slots including hidden/history; patients see future FREE/nonhidden slots whose clinician is active/verified. Apply both date bounds, clinician filter and diagnosis values through the actual clinician relation (Prisma currently names it `user`, not `clinician`). Detail uses the same role-specific projection.
- Slot status values remain FREE/PENDING/ACCEPTED/REJECT/CANCELLED/COMPLETED; hidden flag is separate. Only appointments owns booking-driven status changes. Do not add unblocking based on stale changelog prose.

## Acceptance and verification

Fixtures: one-off; weekly selected weekdays/interval/count; month-end; UNTIL boundary; DST gap/fold; unsupported/unbounded rules; zero/negative duration; two overlapping concurrent schedules; lower/upper date bounds; hidden/past/inactive clinician projections; diagnosis filter using values. Verify `php artisan test --filter=Scheduling` on PostgreSQL and client recurrence fixtures/typecheck. A bounded timeout test must prove invalid/unbounded input terminates.

## Task plan

1. **S1 — Prove bounded recurrence semantics.** Dependency: P1, D9. Files: selected dependency/lock, recurrence Action/prototype, fixture data, unit test (max five). Acceptance: finite enumeration and matching local-time/month-end rules; document selected package and supported grammar. Verify: `php artisan test --filter=Recurrence` with explicit time/memory cap.
2. **S2 — Create validated schedules.** Dependency: I2/S1/P3. Files: migration/model batch, schedule request/controller, create Action, feature test (split to <=five files). Acceptance: ownership, overlap serialization, rollback and audit; generated slots are bounded. Verify: `php artisan test --filter=SchedulingWrite` including concurrent create.
3. **S3 — List/view slots by actor.** Dependency: S2/T1. Files: slot request/controller, Resource, policy, feature test (five). Acceptance: visibility/time/state/specialty filters and date ranges; no clinical payload. Verify: `php artisan test --filter=SchedulingRead`.
4. **S4 — Align client schedule/slot consumers.** Dependency: S2/S3. Files: schedule API, schema, recurrence preview, fixture test, one list/form reader per subsequent batch. Acceptance: server and preview dates match; API fields/pagination updated; unused declarations removed after caller search. Verify: focused recurrence test, typecheck and browser create/list/detail.

## Exclusions and decisions

No infinite recurring job, bulk edit/delete, reschedule, automatic unblock or availability exception calendar. Confirm timezone and finite supported grammar before replacing generation. Imported slots are not regenerated from source rules.
