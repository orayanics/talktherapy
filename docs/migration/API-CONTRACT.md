# API migration contract

Status: proposed versioned replacement, not an implemented compatibility adapter. The browser and Laravel API ship together. No legacy response alias is promised unless an external consumer is discovered. Before coding a module, capture synthetic request/response fixtures for its current consumers and maintain the replacement OpenAPI contract alongside its tests.

## Common representation

Business base URL: `/api/v1`. Authentication's session endpoints live at the API origin outside that prefix. `API_URL` must mean the origin in one shared config; the shared HTTP client adds `/api/v1` for business calls. CSRF, login/logout and broadcasting auth use origin-relative paths. Do not concatenate `/api/v1` twice or send login to a nonexistent versioned URL.

Successful detail/create/update: `{"data": {...}}`; list: `{"data": [...], "links": {...}, "meta": {...}}`. Use paginated Laravel Resources with `current_page`, `from`, `last_page`, `per_page`, `to`, `total`; resource pagination may include additional standard fields. Empty data is `[]`, never `items` or an extra nested `data`. All public fields are snake_case. Resource names and relation cardinality are explicit, not Prisma model dumps. No `success` wrapper. DELETE/logout/read-marker mutations that return 204 have no body. Creation returns 201; accepted synchronous updates return 200. Exceptions: auth failure and validation are error objects, not successful envelopes. [API Resources](https://laravel.com/framework/docs/13.x/eloquent-resources).

Errors: `{ "message": "Safe explanation", "code": "stable_code", "errors": {"field": ["message"]}, "request_id": "..." }`; `errors` is present for validation only. Normalize framework exceptions at the boundary without exposing exception messages. Use 401 unauthenticated, 403 forbidden nonclinical action, 404 absent/inaccessible clinical resource, 409 state/duplicate/overlap conflict, 413 byte cap, 422 invalid fields/audio, 429 admission/rate limit, 502 invalid upstream output, 503 unavailable/busy dependency, and 504 inference timeout. A 419 is a session/CSRF failure, not a reason to retry business work blindly.

Shared query rules: `page` integer >= 1; `per_page` integer 1..100/default 15; `sort` asc/desc; `sort_by` allowlisted per resource; `search` trimmed <= 255; date ranges valid and ordered. Arrays use bracket query encoding (`diagnosis_values[]=...`), not hidden comma/string coercions. Sorts include ID tie-breaks. Timestamps are UTC ISO-8601. Date-only filters use the agreed clinic timezone and exclusive next-day upper bound.

## Existing-to-target route inventory

`{id}` means an opaque legacy-compatible string key. This inventory includes routes with no active client caller; implementing a missing historical feature is not implied. Current Better Auth mounts under `/auth` with base path `/api`; the client uses `/auth/api`. Its generated administrative API must be inventoried from the resolved package/schema before retirement, not assumed to match custom routes.

| Existing route / capability | Proposed replacement | Access and contract note |
|---|---|---|
| `GET /` health greeting | `GET /up`, private readiness endpoint | Minimal public liveness; dependency readiness internal |
| `GET /openapi` and Better Auth schema | Versioned OpenAPI artifact | Generate/validate in CI; control exposure |
| Better Auth sign-in/session/sign-out | `POST /login`, `GET /api/v1/me`, `POST /logout` | Session lifecycle; logout 204 |
| Better Auth updateUser/changeEmail/changePassword | `PATCH /me`, `POST /me/email-change`, `POST /me/password` | `/api/v1` business prefix; password confirmation for sensitive changes |
| Better Auth recovery/verification links | `POST /forgot-password`, `POST /reset-password`, `POST /email-change/confirm` | Under `/api/v1`; hashed, expiring, single-use purposes; generic recovery response |
| `POST /register/patient` | `POST /registrations/patient` | Public, consent required and recorded; 201 minimal account data |
| `POST /register/clinician` | `POST /users/clinicians` | Admin/superadmin; pending invitation |
| `POST /register/admin` | `POST /users/admins` | Proposed superadmin only |
| `POST /otp/resend` | `POST /activation/otp/resend` | Public; generic 202 response to resist enumeration |
| `POST /otp/verify` | `POST /activation/otp/verify` | Checks challenge; no login/session/permission grant; limited attempts |
| `POST /activate` | `POST /activation` | Pending-only; final activation atomically consumes OTP |
| `POST /auth/ban`, `/auth/unban` | `POST /users/{id}/suspend`, `/users/{id}/reactivate` | Explicit role hierarchy, session revocation, audit |
| `GET /users`, `/users/counts`, `/users/{id}` | Same paths under `/api/v1` | Admin-scoped, sanitized Resources; counts returns `data.counts` |
| `GET /public/diagnoses` | `GET /diagnoses` | Public; ID, label, value only |
| `GET /content`, `GET /content/{id}` | Same under `/api/v1` | Proposed verified active members; public publication remains a decision |
| `POST /content`, `PATCH /content/{id}`, `DELETE /content/{id}` | Same under `/api/v1` | Admin/superadmin writes; delete 204 |
| `POST /content/{id}/bookmark`, `DELETE /content/{id}/bookmark` | `PUT /content/{id}/bookmark`, `DELETE /content/{id}/bookmark` | Current user only; idempotent 204 |
| `GET /content/bookmarks` | `GET /bookmarks` | Paginated content Resources for current user's bookmarks |
| `POST /schedule` | `POST /schedules` | Clinician only; own ID from session; 201 |
| Client declarations `GET /schedules`, `/schedules/{id}` | No new endpoint required for unused declarations | Search found no callers outside API declarations; remove during client cleanup |
| `GET /appointments/me/slots` | `GET /slots` | Clinician gets own slots; patient gets public bookable projection |
| `GET /appointments/slots` | `GET /slots` | Consolidated; require verified active account by default |
| `GET /slots/{id}` | Same under `/api/v1` | Own clinician or bookable patient projection; never expose intake |
| `POST /slots/{id}/book` | Same under `/api/v1` | Patient only; atomic booking; 201 |
| `GET /appointments/me` | `GET /appointments` | Only current participant's records |
| `GET /appointments/{id}` | Same under `/api/v1` | Participant-scoped with encounter/event projection |
| `POST /appointments/{id}/accept`, `/reject`, `/cancel`, `/complete` | Same under `/api/v1` | Authorize actor + locked state transition; 409 stale state |
| `POST /appointments/{id-or-room-id}/join-token` | `POST /appointments/{id}/session` | Participant/ACCEPTED check returns channel descriptor; no reusable bearer session token |
| `GET /clinician-patient` | `GET /patients` | Clinician's completed-care relationships only |
| `GET /soaps/patient/{patientId}` | `GET /patients/{patientId}/soaps` | Patient self or related clinician |
| `POST /soaps/{patientId}` | `POST /patients/{patientId}/soaps` | Related clinician, author session ID |
| `GET /soaps/{id}`, `PATCH /soaps/{id}` | Same under `/api/v1` | Read policy / author update policy |
| `GET /notifications` greeting | Retire | Not a user capability |
| `GET /notifications/list` | `GET /notifications` | Own inbox; `unread_only` boolean, bounded pagination |
| `POST /notifications/{id}/read` | `PATCH /notifications/{id}/read` | Owner-only, idempotent 204 |
| `POST /notifications/send` | `POST /notifications` | Retain admin-only manual send, validated type/recipient, audit; 201 |
| `POST /notifications/join-token`, `/notifications/ws` | `/broadcasting/auth` and private `users.{id}` | Cookie-authenticated Echo/Reverb; no legacy raw-token fallback |
| `GET /session/ws`, WS `/session/ws` | Presence/private channels plus `POST /appointments/{id}/signals` | Explicit signalling protocol replacement; see realtime spec |
| `GET /admin/stats` | Same under `/api/v1` | Admin/superadmin aggregated operational counts |
| `GET /logs`, `/logs/export` | Same under `/api/v1` | Admin/superadmin; export is streamed CSV/JSONL, not envelope |
| `POST /slp/assess` | Same under `/api/v1` | Verified active user; multipart `audio`, `reference_text` |
| Python `POST /assess` | Private `POST /v1/assess` | Service authentication; multipart `audio`, `referenceText` retained internally |

## Resource and filter details

- `UserResource`: `id`, `name`, `email`, `email_verified_at`, `role`, `status`, `diagnosis_id`, `image`, `created_at`, `updated_at`; ban details only on authorized administrator detail, never credential/session rows.
- `DiagnosisResource`: `id`, `label`, `value`; preserve distinction between diagnosis ID relations and value filters. Target filters use `diagnosis_values[]` explicitly. Registration sends `diagnosis_id`.
- `ContentResource`: ID, author projection, diagnosis projection, title, description, body (detail only), tags, `is_bookmarked`, timestamps. No other users' bookmark rows. List filters: `search`, `diagnosis_values[]`, `is_bookmarked`, pagination, sort.
- `SlotResource`: ID, `schedule_id`, clinician public projection, start/end UTC, status, visibility where authorized; patient projection excludes hidden/past/nonfree/inactive-clinician slots. Filters: date range, `clinician_id`, `diagnosis_values[]`, pagination/sort.
- `AppointmentResource`: IDs, status, timestamps, nullable single `slot`, participant projections, events, nullable single `encounter`, nullable room ID for participants only. `encounter` is an object or null, never an array. Historical orphan references stay null rather than being fabricated.
- Booking input: `{ "encounter": {"diagnosis": "...", "chief_complaint": "...", "referral_source": "...", "referral_url": null} }`. Reject actor/clinician/status injection. Referral is an optional URL string, never downloaded by the backend; document uploads are outside existing implementation scope.
- SOAP input: `activity_plan` required nonempty; optional nullable `session_type`, `subjective_notes`, `objective_notes`, `assessment`, `recommendation`, `comments`. PATCH omission preserves a field; explicit null clears nullable fields. `activity_plan` cannot become null. IDs and authors are server controlled.
- Notification Resource: ID, type/title/message, entity type/ID, read timestamp and created timestamp; own inbox only. Broadcast sends notification ID/type and prompts refetch, avoiding clinical payloads.
- Lists of users allow role/status arrays and allowlisted name/email/created_at sorts; counts apply search/role filters consistently and define status buckets separately. Audit filters use valid date range, action/actor search and stable timestamp/ID sorts. Export honors identical filters.

## Speech response contract

Outer Laravel response is `{data: AssessResponse}`. For the migration, preserve Python's existing nested camelCase response to avoid changing scoring semantics and clients simultaneously. This is the one explicitly documented serialization exception. The Python DTO is authoritative for fields; Laravel validates it before returning it and OpenAPI describes the exception.

`AssessResponse` has `meta: {alignmentSource: "reference"|"transcript", cer: finite number >= 0}`, `analysis: {transcript, lowScoring: [{phoneme, score: 0..100, word: string|null, wordIndex: integer|null}], structured: {reference, transcript, overall: {avgScore, percentAboveNeedsWork, status}, words, accurateUnits, needsWorkUnits}}`, and `feedback: {text}`. Scores/percentages must be finite 0..100; `status` includes `accurate`, `mixed`, `needs_work`, `unknown`. CER can exceed 1; do not cap it as a probability. Bound list/string sizes as well as types.

No full `phonemeScores` array exists in the current response. Do not invent it from a commented DTO line. Unsupported/silent input needs an explicit unscorable outcome or 422; never fabricate a diagnostic score. Additive `model_version`, `scoring_version`, and `request_id` metadata may be introduced under a tested contract update. Algorithm changes require versioned fixtures and clinical review.

## Client migration checklist

- Replace `utils/auth-client.ts` Better Auth hooks with session query/mutations; update login, profile, sidebar, public/private/session guards and `SessionContext`. Preserve existing loading/redirect behavior and clear query caches on logout/account change.
- Update every file in `src/api/` for paths, snake_case Resource fields and one envelope. Update types, schema fields, UI readers, decorators, filters and pagination together. Do not hide mismatch with `any` casts.
- Replace notification raw `fetch` writes with the CSRF-aware HTTP client; migrate both `notificationClient.ts` and `useNotifications`. Reconcile live IDs with REST and clear singleton state on logout so the next account cannot inherit a prior user's inbox.
- Migrate `useRoomSession.ts` and room components to authorized channels and signal POSTs; `API_URL`/`WSS_URL` become consistent environment configuration. Channel descriptors use appointment ID and room ID separately.
- Use real CSRF initialization/refresh, not the current unmodified retry. Remove manual multipart Content-Type so the browser sets boundaries. Show 422 field errors, safe inference error codes, 409 stale-booking refresh and 429 retry guidance.
- Make content rendering explicitly sanitize after raw parsing or disable raw HTML; tests cover dangerous links, attributes and embedded HTML in display as well as editor preview.
- Decide browser-only authenticated fetching versus SSR cookie forwarding explicitly; no process-global user cache. Test direct navigation and refresh with the deployed TanStack setup.

## Contract completion gate

Each route has a schema, role/relationship denial test, successful synthetic fixture, empty/not-found example, and documented intentional behavior changes. Client typecheck and real browser workflows pass. Delete obsolete Better Auth/custom WS callers only after global searches prove no remaining active consumer. New endpoints that replace existing capabilities ship with their callers; unused historical endpoints do not become new features.
