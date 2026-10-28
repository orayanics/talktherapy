# TalkTherapy backend migration

Status: implementation in phases. The Laravel platform foundation is complete in `server/`; identity and business modules are pending. Audited 2026-10-28 at commit `8af02ff88d97344279c2a0bac4d8806d11901434`.

Replace the Elysia/Bun backend with a Laravel 13 API, retain the React/TanStack client, and keep speech inference in a private Python service. Confirmed product decisions in Architecture override earlier proposal text; unfinished module boundaries remain reviewable specifications, not approved production changes.

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
- Local storage is SQLite. Predis is installed for Redis-backed production coordination; the user will configure PostgreSQL or MySQL later.
- Proposed hosting: one public origin for the SPA and API through a reverse proxy. Same-site subdomains are possible with explicit Sanctum configuration. Unrelated domains require revisiting the authentication design.
- Assume multiple simultaneous patients and clinicians, overlapping bookings, more than one web process, and one bounded inference worker initially. No production traffic measurements were provided.
- No legacy data will be imported. No deployed database, real patient data, model cache, external account actions, or production configuration was used.
- The root README documents setup but contains no substantive Laravel migration design at this revision. The historical changelog references paths and behavior absent from the current tree; source code takes precedence for this audit.

## Confirmed decisions and remaining gates

The full decision register and the user's confirmations are in [Architecture](ARCHITECTURE.md#decisions-to-confirm). There is no legacy import or password compatibility path; new accounts use Laravel hashing. Production database/domain details, clinical/privacy review, and scientific/licensing approval for speech scores remain release gates.

The platform runtime is implemented, but no business route, client cutover, Python service change, deployment, or claim of clinically validated speech scores is included yet.
