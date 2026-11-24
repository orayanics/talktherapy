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
| MySQL performance | Investigate the 1000× hot assignment list and mixed dashboard, availability, appointment, and booking latency on Laragon. |
| Startup and CI   | Verify core-only and full Compose startup on fresh and existing PostgreSQL volumes. Record warm startup, clean-build, and GitHub Actions step timings. Verify required check settings for the three workflows. |

## Speech-service gates

| State | Gate                                                                              |
| ----- | --------------------------------------------------------------------------------- |
| Done  | Laravel proxy, authentication, limits, upload bounds, and response validation.    |
| Done  | Private Python package, readiness checks, bounded decoding, and worker isolation. |
| Open  | Hash-lock dependencies and model artifacts.                                       |
| Open  | Add clean-image startup and inference smoke tests.                                |
| Open  | Replace deprecated MMS_FA alignment before production.                            |
| Open  | Confirm model licenses and artifact provenance.                                   |
| Open  | Measure peak memory and recovery under sustained speech load. Repeat the local concurrency measurements on the release host. |
| Open  | Obtain clinical and privacy review before retaining speech or claiming scores.    |

## Product follow-up

| Area          | Open work                                                         |
| ------------- | ----------------------------------------------------------------- |
| Notifications | Scheduled reminders, schedule changes, and email-security alerts. |
| Exports       | Queued export evidence and retention cleanup.                     |
| Authoring     | Notification audit and browser evidence.                          |
| Diagnoses     | CRUD denial matrix and browser evidence.                          |
| Suspension    | Modal workflow browser evidence.                                  |
| Homepage performance | Implemented the [homepage performance spec](../docs/talktherapy-homepage-performance-spec.md). The homepage production build now uses a 23 KB route stylesheet while app routes keep the full stylesheet. Three matched mobile runs improved `/` LCP from a 3.37 s median to 3.07 s and measured `/#get-to-know` at a 3.12 s median. CLS stayed at 0.022 and 0.002. The full client suite remains blocked by the installed Bun runtime missing Vitest APIs such as `vi.mocked` and `vi.hoisted`. |

## Production cutover

| Gate              | Requirement                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| Infrastructure    | Choose database, Redis, proxy, domain, and TURN provider.                      |
| Configuration     | Configure secrets, trusted proxies, CORS, Sanctum, Reverb, and secure cookies. |
| Recovery          | Rehearse encrypted backups, restore, rollback, and secret rotation.            |
| Monitoring        | Cover API, queues, Reverb, Python, storage, and dependency failures.           |
| Release candidate | Run browser and PostgreSQL verification.                                       |
| Public homepage   | Confirm the production origin, operator, approved privacy notice, support contact, and social image. Verify the live homepage, canonical, crawlability, social preview, and app route handling using the [homepage spec](../docs/talktherapy-landing-seo-spec.md). The local production-build mobile median was 3.37 s LCP and 0.022 CLS. The trace showed the shared stylesheet on the render-blocking path. Recheck LCP on the release host against the 2.5 s target. |
| Retirement        | Observe deployment before removing legacy runtime references.                  |

## References

- [Documentation index](../docs/INDEX.md)
- [Architecture](../docs/migration/ARCHITECTURE.md)
- [API contract](../docs/migration/API-CONTRACT.md)
- [Migration module specifications](../docs/migration/README.md)
