# API contract

The Laravel API and React client ship together. Source routes, Resources, tests, and this contract must agree.

## Conventions

| Concern                   | Contract                                              |
| ------------------------- | ----------------------------------------------------- |
| Business routes           | Use `/api/v1`.                                        |
| Session and CSRF routes   | Use the API origin.                                   |
| Successful lists          | Return `{data, links, meta}`.                         |
| Successful details        | Return `{data}`.                                      |
| Empty lists               | Return `data: []`.                                    |
| Validation errors         | Return `message`, `code`, `errors`, and `request_id`. |
| Unauthenticated           | Return 401.                                           |
| Forbidden                 | Return 403 for nonclinical actions.                   |
| Missing clinical resource | Return 404.                                           |
| State conflict            | Return 409.                                           |
| Invalid input             | Return 422.                                           |
| Rate limit                | Return 429.                                           |
| Speech upstream failure   | Return 502, 503, or 504.                              |
| Public fields             | Use snake_case.                                       |
| Timestamps                | Use UTC ISO-8601 values.                              |

## Authentication

| Method | Path                            | Access                          |
| ------ | ------------------------------- | ------------------------------- |
| POST   | `/login`                        | Public; throttled session login |
| POST   | `/logout`                       | Authenticated session           |
| GET    | `/api/v1/me`                    | Active verified session         |
| POST   | `/sanctum/csrf-cookie`          | Browser CSRF bootstrap          |
| POST   | `/api/v1/registrations/patient` | Public registration             |
| POST   | `/api/v1/activation/otp/verify` | Public challenge verification   |
| POST   | `/api/v1/activation/otp/resend` | Public challenge resend         |
| POST   | `/api/v1/activation`            | Pending-account activation      |
| POST   | `/api/v1/forgot-password`       | Public recovery request         |
| POST   | `/api/v1/reset-password`        | Public recovery completion      |

Protected routes require Sanctum authentication, active status, and verified email. Policies enforce role and relationship.

## Current resources

| Resource      | Endpoints                                                           |
| ------------- | ------------------------------------------------------------------- |
| Diagnoses     | `GET /diagnoses`; admin CRUD under `/diagnoses`                     |
| Users         | Admin list, detail, counts, provisioning, suspension, reactivation  |
| Profile       | `PATCH /me`, password change, email-change request and confirmation |
| Content       | List, detail, admin writes, bookmark PUT/DELETE, bookmark list      |
| Scheduling    | Schedule CRUD and slot reads                                        |
| Appointments  | List, detail, booking, accept, reject, cancel, complete, session    |
| SOAP          | Clinician roster and patient SOAP list/detail/create/update         |
| Notifications | Inbox, read marker, admin send, preferences, channel descriptor     |
| Reporting     | Dashboard statistics, audit logs, CSV/JSONL/XLSX exports            |
| SLP practice  | Exercise catalog, assignments, attempts, recordings, reviews        |
| Speech proxy  | `POST /api/v1/slp/assess` with multipart audio and reference text   |

See `server/routes/api.php` for the authoritative route list. Use `php artisan route:list --path=api` to inspect a local installation.

## Query rules

| Query       | Rule                                                                  |
| ----------- | --------------------------------------------------------------------- |
| Pagination  | Integer `page >= 1` with bounded resource defaults.                   |
| Search      | Trimmed and bounded by each request class.                            |
| Sorting     | Allowlisted keys with stable ID tie-breaks.                           |
| Dates       | UTC timestamps or documented clinic-timezone boundaries.              |
| Arrays      | Bracket encoding, such as `diagnosis[]=value`.                        |
| Projections | Exclude unrelated bookmarks, notes, recordings, and private metadata. |

## Speech response

The active endpoint reports transcript agreement and neutral practice status. It does not report pronunciation correctness or diagnosis.

Required metadata includes schema version, language, model identity, calibration identity, status, and `learningEligible: false`.

Unscorable, task-mismatch, or review-required results keep evidence uncertainty visible. Empty result arrays are valid.

## Completion gate

Every endpoint needs authorization, validation, success, empty or not-found, failure, and contract tests before release.
