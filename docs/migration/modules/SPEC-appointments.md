# Appointments

Status: implemented; browser workflow and PostgreSQL concurrency evidence remain.

## Scope

- Patients book eligible slots with validated intake data.
- Assigned clinicians accept or reject pending appointments.
- Owning patients cancel within the configured cutoff.
- Assigned clinicians complete appointments and establish care relationships.
- Session descriptors require accepted status and participant identity.

## Evidence

- Booking, invariant, read, and transition feature tests pass.
- Client appointment and booking modules consume versioned API Resources.

## Remaining gates

- Verify booking through room entry in two browser accounts.
- Verify competing bookings and transitions on PostgreSQL.
