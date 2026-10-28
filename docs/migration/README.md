# TalkTherapy backend migration

Status: proposed specification and task plan; implementation has not started. Audited 2026-10-28 at commit `8af02ff88d97344279c2a0bac4d8806d11901434`.

Replace the Elysia/Bun backend with a Laravel 13 API, retain the React/TanStack client, and keep speech inference in a private Python service. This package includes both specs and planning because both were explicitly requested. Module boundaries and decisions remain reviewable proposals, not approved production changes.

## Read in this order

1. [Audit](AUDIT.md): ranked findings, evidence, and verification limits.
2. [Architecture](ARCHITECTURE.md): Laravel conventions, capability map, security rules, and open decisions.
3. [API migration contract](API-CONTRACT.md): existing routes, proposed routes, and client changes.
4. [Data migration contract](DATA-MIGRATION.md): source-to-target mappings, reconciliation, and rollback.
5. [Implementation plan](../../tasks/plan.md) and [task checklist](../../tasks/todo.md).
6. Module specs below, each containing its own ordered task plan.
7. [Official sources](SOURCES.md): versioned documentation checked for this proposal.

## Capability map

Dependencies mean application contracts or implementation prerequisites. Infrastructure can support later modules without depending on their business code. A domain mutation writes audit/notification intents in its transaction; delivery consumes those records later, so domain code does not call the delivery module.

| ID | Responsibility | Depends on | Spec and task plan |
|---|---|---|---|
| platform | Laravel shell, API conventions, operational baseline, audit/notification intent storage | None | [platform](modules/SPEC-platform.md) |
| taxonomy | Diagnosis reference data | platform | [taxonomy](modules/SPEC-taxonomy.md) |
| identity | Login, activation, OTP, profile, recovery, SPA integration | platform, taxonomy | [identity](modules/SPEC-identity.md) |
| user-admin | Account provisioning, suspension, role safeguards | identity | [user-admin](modules/SPEC-user-admin.md) |
| content | Articles, tags, bookmarks | identity, taxonomy | [content](modules/SPEC-content.md) |
| scheduling | Availability rules and bookable slots | identity | [scheduling](modules/SPEC-scheduling.md) |
| appointments | Booking, intake, transitions, care relationship | scheduling, taxonomy | [appointments](modules/SPEC-appointments.md) |
| clinical-records | Care roster and SOAP records | appointments | [clinical-records](modules/SPEC-clinical-records.md) |
| notifications | Durable inbox, delivery, private realtime notifications | identity, platform | [notifications](modules/SPEC-notifications.md) |
| realtime | Authorized WebRTC signalling and ephemeral chat | appointments, platform | [realtime](modules/SPEC-realtime.md) |
| phoneme-analysis | Laravel upload boundary and private Python inference | identity, platform | [phoneme-analysis](modules/SPEC-phoneme-analysis.md) |
| reporting | Audit queries/exports and administrator aggregates | user-admin, appointments, clinical-records, content | [reporting](modules/SPEC-reporting.md) |
| migration-cutover | Import, reconciliation, release, rollback | All preceding modules | [migration-cutover](modules/SPEC-migration-cutover.md) |

Build order: platform -> taxonomy -> identity -> user-admin/content/scheduling/notifications/phoneme-analysis -> appointments -> clinical-records/realtime -> reporting -> migration-cutover. Data profiling and Python feasibility work start early; final import waits for all schemas. Independent slices may run concurrently after their shared contracts are fixed.

## Scope and assumptions

- Keep current user-facing capabilities. Correct authorization defects rather than preserving them as compatibility behavior.
- Proposed production storage: PostgreSQL plus Redis. SQLite remains the legacy source. Database choice is a decision to confirm, not an observed deployment fact.
- Proposed hosting: one public origin for the SPA and API through a reverse proxy. Same-site subdomains are possible with explicit Sanctum configuration. Unrelated domains require revisiting the authentication design.
- Assume multiple simultaneous patients and clinicians, overlapping bookings, more than one web process, and one bounded inference worker initially. No production traffic measurements were provided.
- No deployed database, real patient data, model cache, operational credentials, dependency installation, external account actions, or production configuration was used.
- The root README documents setup but contains no substantive Laravel migration design at this revision. The historical changelog references paths and behavior absent from the current tree; source code takes precedence for this audit.

## Decisions before implementation

The full decision register is in [Architecture](ARCHITECTURE.md#decisions-to-confirm). Highest-impact items: production database/domain topology, real-data migration need and outage window, credential compatibility versus reset, clinical access/retention policy, appointment cancellation policy, and the scientific/licensing basis for speech scores.

No runtime code was changed. These documents do not authorize deleting data, publishing services, or treating speech scores as clinically validated.
