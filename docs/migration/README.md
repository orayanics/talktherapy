# Migration and architecture documentation

The active backend is Laravel 13 in `server/`. The React client remains in `client/`, and speech inference remains private in `py/`.

## Current status

| Area               | Status                           | Remaining evidence                           |
| ------------------ | -------------------------------- | -------------------------------------------- |
| Platform           | Implemented and locally verified | Production database, Redis, and operations   |
| Identity           | Implemented                      | Deployed browser cookie and CSRF checks      |
| Business modules   | Implemented with SQLite coverage | Browser workflows and PostgreSQL races       |
| Production cutover | Pending                          | Deployment, backup, rollback, and monitoring |
| Legacy import      | Retired                          | No source data or password conversion        |
| Speech assessment  | Non-diagnostic practice feedback | Clinical validation and artifact review      |

## Read in this order

1. [Documentation index](../INDEX.md)
2. [Architecture](ARCHITECTURE.md)
3. [API contract](API-CONTRACT.md)
4. [Module specifications](modules/)
5. [Official sources](SOURCES.md)
6. [Task ledger](../../tasks/todo.md)

## Capability map

| Domain              | Implementation                                           | Specification                                          |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| Platform            | Laravel shell, API conventions, audit, outbox, readiness | [Platform](modules/SPEC-platform.md)                   |
| Taxonomy            | Diagnosis catalog and administration                     | [Taxonomy](modules/SPEC-taxonomy.md)                   |
| Identity            | Sessions, activation, recovery, profile, email changes   | [Identity](modules/SPEC-identity.md)                   |
| User administration | User management, provisioning, status changes            | [User administration](modules/SPEC-user-admin.md)      |
| Content             | Articles, tags, bookmarks, safe rendering                | [Content](modules/SPEC-content.md)                     |
| Scheduling          | Recurrence, schedules, slots, availability               | [Scheduling](modules/SPEC-scheduling.md)               |
| Appointments        | Booking, transitions, intake, care relationships         | [Appointments](modules/SPEC-appointments.md)           |
| Clinical records    | Care roster and SOAP records                             | [Clinical records](modules/SPEC-clinical-records.md)   |
| Notifications       | Inbox, preferences, email, outbox delivery               | [Notifications](modules/SPEC-notifications.md)         |
| Realtime            | Authorized Reverb channels and WebRTC signalling         | [Realtime](modules/SPEC-realtime.md)                   |
| Speech service      | Laravel proxy and private Python inference               | [Phoneme analysis](modules/SPEC-phoneme-analysis.md)   |
| Reporting           | Dashboard aggregates, audit reads, bounded exports       | [Reporting](modules/SPEC-reporting.md)                 |
| Cutover             | Deployment and rollback gates                            | [Migration cutover](modules/SPEC-migration-cutover.md) |

## Boundaries

| Boundary        | Rule                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------- |
| Laravel         | Owns identity, authorization, business rules, persistence, audit, notifications, and exports. |
| Python          | Receives bounded audio through Laravel with a server-only token.                              |
| Browser         | Never calls Python directly.                                                                  |
| Administrators  | Do not automatically receive clinical-record or room access.                                  |
| SQLite tests    | Do not prove PostgreSQL locking or multi-worker Redis coordination.                           |
| Speech feedback | Is not a diagnosis, pronunciation score, or treatment recommendation.                         |
