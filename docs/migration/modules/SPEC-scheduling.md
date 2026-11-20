# Scheduling

Status: implemented; browser workflow and PostgreSQL overlap evidence remain.

## Scope

- Clinicians create bounded one-off and recurring availability.
- Recurrence supports daily, weekly, and monthly UTC rules.
- Slots expose role-specific availability and safe projections.
- Overlap checks run before schedule writes.
- Date, clinician, diagnosis, pagination, and sorting filters are bounded.

## Evidence

- `SchedulingReadTest`, `SchedulingWriteTest`, and `RecurrenceTest` pass.
- Client scheduling logic lives under `client/src/modules/schedules`.

## Remaining gates

- Verify recurrence preview and creation in a browser.
- Verify overlapping schedule writes on PostgreSQL.
