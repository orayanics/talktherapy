# TalkTherapy documentation index

This index describes the current repository. Source code and tests take precedence over historical proposals.

## Repository map

| Area                   | Purpose                                                        | Entry point                                  |
| ---------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| `client/`              | React 19 and TanStack Start application                        | [Client guide](../client/README.md)          |
| `server/`              | Laravel 13 API, authentication, jobs, scheduler, and Reverb    | [Server guide](../server/README.md)          |
| `py/`                  | Private FastAPI speech service                                 | [Python guide](../py/README.md)              |
| `docs/migration/`      | Current API, architecture, module contracts, and release gates | [Migration index](migration/README.md)       |
| `docs/slp-assessment/` | Deferred clinician-assessment design                           | [Assessment index](slp-assessment/README.md) |
| `tasks/`               | Active release checklist                                       | [Task ledger](../tasks/todo.md)              |

## Runtime map

| Layer    | Responsibility                                                       | Local implementation                     |
| -------- | -------------------------------------------------------------------- | ---------------------------------------- |
| Browser  | Routes, feature UI, Query cache, Echo/Reverb client                  | React 19 and TanStack Start              |
| API      | Sessions, authorization, business rules, persistence, audit, exports | Laravel 13                               |
| Speech   | Bounded decoding, transcription, neutral practice feedback           | Private FastAPI service                  |
| Realtime | Channel authorization and media signalling                           | Reverb plus WebRTC                       |
| Data     | Development and test persistence                                     | SQLite; production database remains open |

## Current implementation

| Domain                           | Current state                                                                |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Platform and taxonomy            | Implemented; local tests cover contracts and readiness.                      |
| Identity and user administration | Implemented; browser cookie, CSRF, and deployment checks remain.             |
| Content and bookmarks            | Implemented; browser workflow and PostgreSQL concurrency evidence remain.    |
| Scheduling and appointments      | Implemented; browser workflow and PostgreSQL concurrency evidence remain.    |
| Clinical records                 | Implemented; browser workflow and PostgreSQL concurrency evidence remain.    |
| Notifications and preferences    | Implemented; browser delivery and reconnect evidence remain.                 |
| Realtime rooms                   | Implemented; multi-instance revocation, TURN, and two-browser checks remain. |
| Reporting and exports            | Implemented; queued-export and deployment evidence remain.                   |
| SLP practice                     | Implemented as a non-diagnostic proof of concept.                            |
| SLP assessment                   | Design only; no clinical claims or production scoring.                       |
| Production cutover               | Pending deployment, backup, rollback, and observation gates.                 |

## Documentation rules

| Rule      | Application                                                                    |
| --------- | ------------------------------------------------------------------------------ |
| Commands  | Keep setup commands executable and tied to package scripts.                    |
| Links     | Link current paths; remove retired runtime and benchmark references.           |
| Decisions | Record architecture decisions; track implementation status in the task ledger. |
| Evidence  | State browser, database, realtime, and clinical limits beside claims.          |
| Style     | Use tables for organization and comparisons; use lists for ordered actions.    |

## Reading order

1. [Root setup](../README.md)
2. [Current architecture](migration/ARCHITECTURE.md)
3. [API contract](migration/API-CONTRACT.md)
4. [Migration index](migration/README.md)
5. [Task ledger](../tasks/todo.md)
6. [Client structure](../client/STRUCTURE.md)
