# Active release checklist

Use this ledger for unfinished work. Completed implementation remains documented in the module specifications and tests.

## Verification still required

| Area             | Evidence                                                             |
| ---------------- | -------------------------------------------------------------------- |
| Authentication   | Cookie, CSRF, redirects, refresh, and logout.                        |
| Content          | Lists, filters, details, bookmarks, editor, and safe rendering.      |
| Scheduling       | Recurrence preview, creation, slot selection, and validation.        |
| Appointments     | Booking, transitions, completion, and room entry.                    |
| Clinical records | Roster, reads, writes, and stale-edit recovery.                      |
| Notifications    | Delivery, preferences, reconnect, and account switching.             |
| Realtime         | Two users, revocation, media cleanup, and separate networks.         |
| Reporting        | Filters, exports, authorization, and download cleanup.               |
| PostgreSQL       | Schedules, bookings, transitions, bookmarks, and care relationships. |
| Redis            | Sessions, queues, rate limits, leases, and worker recovery.          |

## Speech-service gates

| State | Gate                                                                              |
| ----- | --------------------------------------------------------------------------------- |
| Done  | Laravel proxy, authentication, limits, upload bounds, and response validation.    |
| Done  | Private Python package, readiness checks, bounded decoding, and worker isolation. |
| Open  | Hash-lock dependencies and model artifacts.                                       |
| Open  | Add clean-image startup and inference smoke tests.                                |
| Open  | Replace deprecated MMS_FA alignment before production.                            |
| Open  | Confirm model licenses and artifact provenance.                                   |
| Open  | Measure memory, latency, concurrency, and recovery budgets.                       |
| Open  | Obtain clinical and privacy review before retaining speech or claiming scores.    |

## Product follow-up

| Area          | Open work                                                         |
| ------------- | ----------------------------------------------------------------- |
| Notifications | Scheduled reminders, schedule changes, and email-security alerts. |
| Exports       | Queued export evidence and retention cleanup.                     |
| Authoring     | Notification audit and browser evidence.                          |
| Diagnoses     | CRUD denial matrix and browser evidence.                          |
| Suspension    | Modal workflow browser evidence.                                  |

## Production cutover

| Gate              | Requirement                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| Infrastructure    | Choose database, Redis, proxy, domain, and TURN provider.                      |
| Configuration     | Configure secrets, trusted proxies, CORS, Sanctum, Reverb, and secure cookies. |
| Recovery          | Rehearse encrypted backups, restore, rollback, and secret rotation.            |
| Monitoring        | Cover API, queues, Reverb, Python, storage, and dependency failures.           |
| Release candidate | Run browser and PostgreSQL verification.                                       |
| Retirement        | Observe deployment before removing legacy runtime references.                  |

## References

- [Documentation index](../docs/INDEX.md)
- [Architecture](../docs/migration/ARCHITECTURE.md)
- [API contract](../docs/migration/API-CONTRACT.md)
- [Migration module specifications](../docs/migration/README.md)
- [Deferred assessment design](../docs/slp-assessment/README.md)
