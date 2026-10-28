# Data migration and cutover contract

Status: proposed. No legacy database was opened or changed. Actual row counts, identifier lengths, hash algorithms, enum outliers, null references, deployed schema drift and timestamp encodings must be measured on an approved snapshot. Schema mappings below come from Prisma source and migration SQL, not assumptions about production rows.

## Mapping

All existing primary IDs remain strings and retain their exact values/case. Use matching `varchar(191)` keys and foreign keys, subject to source-length profiling; do not truncate. New IDs may be UUID strings. Store timestamps in UTC with sufficient precision; detect whether source values are strings or numeric epochs and verify known examples before conversion. Keep nulls, empty strings and missing values distinct during profiling.

| Source Prisma model / physical table | Target | Required transformation and checks |
|---|---|---|
| `Diagnosis` / `Diagnosis` | `diagnoses` | Preserve ID, label, value; case/unique collision report before import. |
| `User` / `user` | `users` | camelCase timestamps -> snake_case; emailVerified -> email_verified_at only with documented provenance; exact historical verification time is unknown. Normalize email with collision report. Map diagnosis relation. |
| `Account` / `account` | `users.password` plus restricted import evidence | Select exactly one credential-provider password per user; quarantine missing/duplicate/provider-only cases. Never treat OAuth access tokens as passwords. No live OAuth integration is established by current client. |
| `Session` / `session` | Do not import | Revoke all Better Auth sessions and cookies at cutover; Laravel session table has a different schema. Require login. |
| `Verification` / `verification` | Do not import | Discard outstanding OTP/reset/link challenges intentionally; reissue under the new purpose-specific flows. Preserve evidence/counts only where required, never active secrets. |
| `Content` / `Content` | `contents` | Preserve author/diagnosis IDs, markdown, timestamps. Do not mutate source HTML during import; sanitize display and quarantine unsafe content as needed. |
| `Tag` / `Tag` | `tags` | authorId -> author_id; preserve author/slug uniqueness. Do not globalize tags. |
| implicit `_ContentToTag` | `content_tag` | Verify actual A/B mapping from SQL: A references Content, B references Tag. Preserve pairs; deduplicate exact duplicates only in a reported transform. |
| `Bookmark` / `Bookmark` | `bookmarks` | userId/contentId -> user_id/content_id; unique pair; preserve IDs/timestamps. |
| `AuditLog` / `AuditLog` | `audit_logs` | Parse details JSON with malformed-row quarantine; preserve action, actor snapshot, source ID/time. Actor nullable with SET NULL, never cascade audit history. |
| `AvailabilityRule` / `schedules` | `schedules` | clinicianId/startAt/endAt/recurrenceRule -> snake_case. Preserve existing materialized slots; never regenerate them during import. Add timezone only when evidence permits. |
| `Slot` / `slot` | `slots` | availabilityRuleId -> schedule_id; preserve clinician, start/end, status/is_hidden. Quarantine negative/zero duration and overlaps before constraints. |
| `Appointment` / `appointment` | `appointments` | Preserve slot/patient/clinician IDs, status, all lifecycle times, room ID; allow historical nullable references. Quarantine unknown/null status rather than guessing PENDING. |
| `AppointmentEvent` / `events` | `appointment_events` | Normalize actor type casing to patient/clinician using an explicit map; preserve reasons, unknown history in review report. Add before/after states only for new events; do not invent them historically. |
| `Encounter` / `Encounter` | `encounters` | Preserve one-per-appointment uniqueness and intake fields. Referral URL remains data, not a fetch instruction. |
| `ClinicianPatient` / `clinician_patient` | `clinician_patients` | Preserve ID/pair/first_completed_at. Cross-check completed appointments; do not automatically grant care access from corrupt history. |
| `Soap` / `soaps` | `soaps` | Preserve all note fields, clinician/patient IDs and timestamps. No appointment ID exists; don't fabricate one or require it on imported rows. |
| `Notification` / `notification` | `notifications` | Custom inbox schema, not Laravel's stock polymorphic table; preserve IDs, recipient, type/title/message/entity/read timestamps. |
| No source equivalent | `activation_challenges`, consent evidence, `outbox_messages`, framework sessions/jobs/failed_jobs/password_reset_tokens | Fresh infrastructure tables; no historical consent/version/timestamp invention, no replay of imported notifications. Challenge digest and encrypted expiring mail envelope are separate; plaintext codes never enter queue/failed-job payloads. |
| No source equivalent | Audio/chat/assessment results | No historical store exists in the schema. Do not create empty history features or claim recordings were migrated. |

Preserve `banned`, `banReason`, `banExpires` in the reconciliation report; proposed effective status maps banned/suspended to suspended, pending to pending, otherwise active only if valid. Conflicts require review. Temporary bans need an explicit reactivation policy; do not accidentally reactivate on login/OTP. Historical `emailVerified=true` can be represented by an import timestamp with a provenance flag/report, not a claimed historical date.

New-only fields include user `access_epoch` (initially 1), room/session access generation (initially 1), and SOAP edit version (initially 1). These are concurrency/revocation state, not reconstructed history. Consent evidence contains user ID, purpose, policy version, affirmative decision and observed acceptance time; no historical value is invented. A Laravel session's `user_id` column must use the chosen string type instead of the skeleton's default integer type. Future polymorphic framework tables must also use string-compatible morph keys if adopted; the proposed custom inbox avoids a stock morph mismatch.

## Target constraints and indexes

- Role and account status constrained to the agreed enum values; email unique under the chosen normalization. Positive schedule/slot duration (`end_at > start_at`). Cross-row overlap checks serialize through clinician locking; a PostgreSQL exclusion constraint may be added if approved and supported by hosting.
- Foreign keys use exactly the same string type/length. Clinical user/appointment references RESTRICT hard deletion; selected historical optional references remain nullable. Audit actor SET NULL with redacted snapshot retention. Do not copy destructive cascades blindly.
- Slot has many historical appointments. Add a PostgreSQL partial unique index on `appointments(slot_id)` where status is PENDING or ACCEPTED. Do not make `slot_id` globally unique. Completion/cancellation/rejection free that active uniqueness claim while slot status still controls reuse.
- Unique `(clinician_id, patient_id)`, `(user_id, content_id)`, `(author_id, slug)`, encounter appointment ID and pivot pairs. New room IDs unique when non-null after source collision review.
- Index participant/time list queries, slots `(clinician_id,start_at)`, slots `(status,is_hidden,start_at)`, appointments `(patient_id,booked_at)` and `(clinician_id,booked_at)`, SOAP `(patient_id,created_at)`, notifications `(user_id,created_at)` and unread lookup, audit `(created_at,id)`, outbox pending/available lookup. Add indexes only for actual query paths and verify plans.

On isolated disposable databases, test each new schema migration's `up` and `down`. Rollback code is not permission to drop a populated clinical database. Later destructive rename/drop work is a separate release after all consumers migrate; use additive expand/backfill/contract if evolving a schema while it is serving traffic.

## Credential feasibility gate

The source hashes with `Bun.password.hash()` and stores passwords on Account rather than User. Probe nonproduction synthetic Bun-generated hashes in PHP's password verification and the selected Laravel hash driver. Inspect source snapshot hash prefixes/counts through a redacted report; never print real hashes. Verify algorithm/cost compatibility and rehash-on-login behavior. Laravel's hash algorithm verification must be handled deliberately; globally disabling checks is not the default migration plan. [Laravel hashing](https://laravel.com/framework/docs/13.x/hashing).

If compatibility is proven, copy supported hashes byte-for-byte and rehash only after successful authentication. Unsupported/missing credentials follow a forced-reset path. If compatibility cannot be proven, use forced reset for the cohort and test mail/recovery before cutover. Do not hash an existing hash or trim passwords. All users reauthenticate; session portability is explicitly excluded.

## Import procedure

1. **Profile:** Obtain a consistent, encrypted read-only snapshot, including a SQLite online-backup/WAL-safe procedure if applicable. Record source commit/schema checksum, snapshot checksum, table counts, FK integrity, min/max timestamps and ID lengths. Inventory implicit tables and actual schema. Do not copy a live SQLite main file while ignoring WAL.
2. **Validate:** Detect normalized-email collisions, orphans, role/status conflicts, invalid JSON/timestamps, duplicate active slot claims, overlapping/invalid slots, missing care relationships and credential cohorts. Produce a restricted reject ledger using source IDs and reason codes without clinical payloads.
3. **Transform:** Implement a versioned mapping per table, with deterministic timestamps/IDs. Dry run produces counts and checksums without target writes. Import into an isolated empty target or an explicitly resumed import run; no blind overwrite of an active database.
4. **Load:** Reference diagnoses -> users/credentials -> content/tags/pivot/bookmarks -> schedules/slots -> appointments/events/encounters -> care relationships/SOAP -> notifications/audit. Import infrastructure separately. Suppress model observers, mail, broadcast and outbox emission during historical load.
5. **Reconcile:** For every source table, account for imported + quarantined + deliberately discarded rows, with reasons. Compare canonical field hashes, FK checks, business aggregates and sampled relationship joins. Sensitive checksum material stays protected. Require zero unexplained differences and zero unresolved critical rejects.
6. **Rehearse:** Run twice into separate clean targets and resume an interrupted run. IDs, counts, field checksums and reject ledgers must match. Verify restore of both legacy and target backups. Test sign-in/reset for each credential cohort and role, patient-specific reads, completed-care roster and booking history.

The future import command must implement `--dry-run`, an explicit approved snapshot path and run ID, bounded chunks, progress/checkpoint ledger and nonzero failure exit. Names/flags become executable requirements only after the command exists; no `migrate:fresh`, `prisma migrate reset`, implicit delete, or production seed in import.

## Cutover and rollback

Use one authoritative writer. Develop and rehearse on isolated datasets; do not dual-write through Bun and Laravel. For the final move, disable all Bun writes including OTP/auth/admin endpoints and WebSocket mutations, drain workers, close active sessions/calls, take the final consistent snapshot, run import/reconciliation, then route the new client/API/WSS together. Remove public Python access. Invalidate old sessions, OTPs and custom room tokens. Announce authentication and call disruption within the approved window.

Before opening writes: smoke-test target health, login/recovery/CSRF, booking, clinical access denials, notification delivery, two-browser call and inference failure handling. Verify counts/checksums and capture operator approval. Retain the exact legacy app/database/config snapshot, target backup, mapping version and release artifacts securely.

**Rollback before target writes:** restore routing to the frozen legacy release/snapshot and require sign-in. **Rollback after target writes:** freeze target writes and reconcile/export all new target mutations through an approved reverse mapping or remain in maintenance while repairing forward. Never switch back to a stale SQLite snapshot and discard new appointments/notes. Define the no-simple-rollback point before enabling writes. A code deployment rollback is not a database rollback.

Retire Bun dependencies, Better Auth tables, routes and deployment only after a signed reconciliation report, observed production window, successful restore rehearsal and approved retention window. No calendar duration is invented here. Revoke retired credentials and remove unused infrastructure separately; preserve required audit evidence.
