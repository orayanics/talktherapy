# Spec: appointments

Status: proposed. Depends on: scheduling, taxonomy (identity transitively). Inherits [API](../API-CONTRACT.md) and [data](../DATA-MIGRATION.md) contracts. Addresses audit 1, 2, 7, 14, 15, 18. Decisions D7 and D12.

## Objective and source behavior

Preserve booking/intake, own appointment list/detail, accept/reject/cancel/complete and session eligibility. Sources: `slots` booking service/routes, `appointments` module, Prisma Appointment/AppointmentEvent/Encounter/ClinicianPatient, client schedule API/book/appointment modules and dashboards. Source uses transactions for booking/transitions, but omits participant checks. Keep transactions and add correct policies/locking/constraints.

## State contract

| Action | Actor | Source -> target | Slot outcome | Extra rule |
|---|---|---|---|---|
| Book | Active verified patient | FREE slot -> PENDING appointment | PENDING | Future, visible slot; active verified clinician; validated encounter |
| Accept | Assigned clinician | PENDING -> ACCEPTED | ACCEPTED | Keep assigned clinician; set confirmation time and unique room ID |
| Reject | Assigned clinician | PENDING -> REJECT | FREE if not hidden; REJECT/hidden if requested | At least 24 actual hours before slot start; reason required |
| Cancel | Owning patient | PENDING -> CANCELLED | CANCELLED, remains blocked | At least 24 actual hours before start |
| Complete | Assigned clinician | ACCEPTED -> COMPLETED | COMPLETED | Set completion time; upsert care pair with first completion preserved |

This preserves current state/cutoff semantics while correcting unauthorized actors. Patient cancellation is the proposed intended actor (source route incorrectly allows any authenticated user). Exactly 24 hours is allowed; use instant comparison, not truncated integer hour arithmetic. Accepted cancellation, late cancellation, reopening slots, rescheduling and extra completion/join timing rules need product decisions and separate tests.

## Specification

- Models/tables: Appointment, AppointmentEvent, Encounter and ClinicianPatient with fields/constraints in data mapping. `encounter` is one nullable object; slot has historical many appointments, with a partial unique active claim. New appointments require valid slot/patient/clinician/status; historical nullable references remain read-only where necessary.
- Every action authorizes role and stored participant identity. Scope list/detail by current user; return 404 for unrelated clinical resources. Administrator privilege grants no participant override. Reject submitted actor IDs, clinician IDs, timestamps and statuses.
- Booking validates intake fields with explicit length caps: diagnosis/chief complaint <=2000, referral source <=255, optional referral URL <=2048 and allowed http/https scheme. Never fetch the referral URL. A patient ID in the body is neither used nor trusted.
- Transaction lock order is slot then appointment, identical for booking/accept/reject/cancel/complete. Revalidate current status and ownership after acquiring locks. Use conditional state updates plus database constraints; a loser returns 409 without partial writes. Locking alone is not an import repair mechanism.
- Atomic writes: booking creates appointment, intake, event, audit and outbox intents; transitions update appointment/slot, add an event/audit/intent, and completion upserts care pair. Store actual actor type and ID, previous/new state and reason in new events. Preserve first_completed_at on repeat completions for the same pair.
- Return stable Resources with participant projections, slot times, lifecycle timestamps, events and intake only to authorized participants. List supports both date bounds in clinic timezone, bounded pagination and stable sort; avoid unbounded events in list projections if not used by the client.
- Session entry descriptor is participant-only while ACCEPTED; room lookup by arbitrary room ID is replaced by explicit appointment ID. Realtime consumes this eligibility contract and rechecks on every signal.

## Acceptance and verification

Test four-role/unrelated participant denial for every route; booking hidden/past/suspended-clinician failure; intake validation rollback; exact 24-hour/one-second-inside boundaries; illegal/repeated transitions; event actor/state accuracy; no clinician reassignment; one active claim with full rejected/cancelled history; two simultaneous bookings and competing transitions on PostgreSQL; notification/audit failure behavior; first-care completion preservation. Verify `php artisan test --filter=Appointment` and full browser book/accept/reject/cancel/complete flow.

## Task plan

1. **A1 — Establish history schema and policy.** Dependency: S2/I2/P3. Files: appointments/events/encounter migration batch, Appointment model, Appointment policy, invariant test (<=five; split model additions). Acceptance: history cardinality and active uniqueness hold; unrelated reads denied. Verify: `php artisan test --filter=AppointmentInvariant` on PostgreSQL.
2. **A2 — Book atomically.** Dependency: A1/S3. Files: booking request/controller, book Action, event/intent integration, feature test (five). Acceptance: all guards and one concurrent winner; no partial intake. Verify: `php artisan test --filter=AppointmentBooking` with independent database connections/processes.
3. **A3 — Read own bookings.** Dependency: A1/P4. Files: list request/controller, detail Resource, routes, feature test (five). Acceptance: participant-scoped list/detail and single encounter cardinality. Verify: `php artisan test --filter=AppointmentRead`.
4. **A4 — Accept/reject pending bookings.** Dependency: A2. Files: decision request/controller, transition Action, policy update, feature test (five). Acceptance: assigned actor, exact cutoff, room/state/slot/event atomicity. Verify: `php artisan test --filter=AppointmentDecision` including competing actions.
5. **A5 — Cancel pending booking.** Dependency: A4. Files: cancellation request, transition Action change, route/controller change, feature test (four). Acceptance: owning patient and cutoff; blocked slot policy retained. Verify: `php artisan test --filter=AppointmentCancel`.
6. **A6 — Complete and establish care.** Dependency: A4. Files: care-pair migration/model, completion Action change, controller route, feature test (five). Acceptance: assigned clinician only; pair uniqueness/first time and all transaction evidence. Verify: `php artisan test --filter=AppointmentComplete`.
7. **A7 — Connect appointment consumers.** Dependency: A2-A6. Files: schedule API/types, book schema/hook, appointment display/actions in batches <=five with client tests. Acceptance: 409 refresh, validation, new fields and all action outcomes usable. Verify: typecheck/build, focused UI tests and two-account browser flow.

## Exclusions

No automatic diagnosis, payment, attachment storage, new cancellation policy, arbitrary clinician reassignment or backfilled invented event transitions. Confirm state policy before implementation; importing inconsistent states requires reconciliation rather than permissive runtime rules.
