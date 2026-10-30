# Shared technical specification

## Architecture and integration

Reuse Laravel 13/PHP 8.4, Sanctum, existing database, queues, audit infrastructure, policies, FormRequests, Resources, and Actions. React 19 uses existing TanStack Router/Query, Axios `api`, React Hook Form, Zod, and shared modal/form/state/table components. Keep Python under `py/` private; Laravel owns authorization, persistence and job state. Do not add another public service or database.

Add `Slp*` models/actions/policies/resources and feature tests under existing `server/app` and `server/tests` conventions. Add APIs/types/hooks/components under `client/src/modules/slp`, with role routes in the existing route tree. Preserve `assessPronunciation`, `useSlpAssessment`, `/api/v1/slp/assess`, and their callers/tests until a separate explicit retirement. Replace static `practiceContent.ts` only in the new assigned-assessment flow. General educational `Content` remains separate: its current policy permits administrator writes only, and broadening it would accidentally change unrelated permissions.

Scope of later implementation includes migrations/factories, policies and query scopes, route middleware, request/resource DTOs, queue workers and scheduler, private storage configuration, Python contracts, client API/query keys and route guards/sidebar entries, tests/fixtures, and operational documentation. Reuse `ClinicianPatient` for relationship checks, but its existence alone must not authorize every historical or newly assigned record. Require assignment membership and active clinician access as well. Reuse consent evidence patterns; the current acceptance-only `ConsentEvidence` cannot alone represent withdrawal or guardian authority.

## Persistence

Use UUID foreign keys and database transactions. JSON is appropriate for versioned typed configuration/results; ownership, status, references, timestamps and searchable fields are relational and indexed.

| Entity | Required fields/invariants |
| --- | --- |
| slp_exercises | id, owner_id, scope (`private`, `shared`), module, archived_at |
| slp_exercise_versions | exercise_id, unique revision, language tag, dialect, age bounds, task type, prompt, asset IDs, instructions, targets, outputs, protocol_version_id, draft/reviewed/published state, author/reviewer/timestamps; published content immutable |
| slp_assets | private object key, MIME, checksum, size, owner, license/attribution, review status; never arbitrary remote executable content |
| slp_protocol_versions | module/language/task applicability, schema_version, typed settings, clinical reviewer, effective dates; immutable after publication |
| slp_assignments | patient_id, clinician_id, exercise_version_id, protocol snapshot, schedule/timezone, bounded override snapshot, active/cancelled/completed state |
| slp_consents | subject, actor, purpose, policy version, guardian evidence reference if applicable, accepted_at, withdrawn_at; append evidence, no fabricated guardian roles |
| slp_attempts | assignment_id, occurrence key, actor, state, consent reference, configuration snapshot, submission idempotency key, recording_id, timestamps |
| slp_recordings | private object key/checksum, encoded bytes, detected codec, duration, retention deadline, deletion state |
| slp_analysis_runs | attempt_id, immutable run ID, schema/model/config versions, queued/running/succeeded/failed state, safe failure code, quality, candidate events, metrics |
| slp_reviews | attempt/run IDs, revision, corrected events/segments/transcript/syllable annotations, metrics, reviewer, review state, approved_at; approved revision immutable |
| slp_reports | approved review revision, deterministic report snapshot, created_by/time, supersedes_id |

Draft edits use a revision number; stale updates return 409. Published version edits create a new draft. Referenced records use archive semantics; hard deletion is only for unreferenced drafts/assets. Historical snapshots remain reproducible while patient data follows retention/deletion policy. No cascading deletion of clinical records when an exercise is archived.

## Configuration decisions

Keep configuration in typed, versioned database records with application-level validation, not arbitrary scripts/formulas. Resolution: deployment safety bounds → published protocol → exercise version → permitted assignment overrides. Snapshot the resolved configuration when an attempt starts; retries use that snapshot. Deployment ceilings cannot be weakened by catalog editors.

| Setting | Proposed initial value | Authority |
| --- | --- | --- |
| Automated fluency detector / later domains | Disabled | Superadmin enables only a validated release |
| Minimum reviewed syllable sample | 300, provisional warning threshold, not a clinical norm | Clinically reviewed protocol |
| Pause duration threshold | 250 ms, provisional analysis convention | Clinically reviewed protocol |
| Recording limit | 180 seconds / 20 MiB encoded; enforce both plus decoded bounds | Deployment; review feasibility before enabling |
| Capture target | 60–120 seconds, task dependent | Exercise/clinician within caps |
| Queue retry | At most 2 transient retries, bounded backoff; no retries for invalid audio | Deployment |
| Worker deadline | 120 seconds, provisional hardware acceptance target | Deployment |
| Raw audio retention | 30 days proposed pilot default | Superadmin under approved deployment policy |
| Analysis confidence gate | Unset; detector disabled until calibrated | Model release/protocol |

These numbers are engineering proposals, not validated norms or legal retention requirements. Retention for reports, annotations and backups must be explicitly selected before live collection. Quality thresholds (clipping, minimum speech, noise) require tested per-device defaults before capture rollout; uncertain quality should prompt review rather than assert impairment. Do not claim to measure microphone distance from audio. Include an adjustable setup instruction instead. No administrator can turn off authorization, consent, server validation, audit, or clinician approval.

## Public API contract

Use `/api/v1/slp` with existing session/CSRF conventions, pagination and error envelopes. Patient resources omit candidates, transcripts and metrics on the server, not merely in the UI. Every route checks object ownership/assignment and role. List endpoints apply the same scope as detail endpoints.

| Routes | Contract |
| --- | --- |
| GET/POST `/exercises`; GET/PATCH/DELETE `/exercises/{id}` | Catalog CRUD; DELETE archives referenced records |
| POST `/exercises/{id}/versions`; PATCH `/exercise-versions/{id}` | Version creation and draft edits with expected revision |
| POST `/exercise-versions/{id}/review`, `/publish` | Separate clinical review and publication transitions |
| POST `/assets`; DELETE `/assets/{id}` | Validated bounded uploads; reference-aware removal |
| GET/POST `/protocols`; POST `/protocols/{id}/versions` | Typed configuration drafts, same review/publication lifecycle |
| GET/POST `/assignments`; PATCH `/assignments/{id}` | Clinician assigns/schedules/cancels for linked patient |
| POST `/assignments/{id}/attempts` | Idempotent creation, snapshot and valid consent required; 201 |
| POST `/attempts/{id}/recording` | Multipart bounded upload; checksum/idempotency; 202 after durable persistence and queue dispatch |
| GET `/attempts/{id}` | Processing status; role-specific resource |
| GET `/attempts/{id}/recording` | Authorized streaming or short-lived signed URL; audit access |
| POST `/attempts/{id}/analysis-runs` | Clinician-requested reanalysis, preserves previous runs |
| GET/PUT `/attempts/{id}/review`; POST `/attempts/{id}/approve` | Corrected annotations with expected revision; atomic validation/approval |
| POST `/attempts/{id}/reports`; GET `/reports/{id}` | Approved revision only; clinician-accessible deterministic report |
| GET `/patients/{id}/slp-history` | Authorized clinician history with comparable protocol/task groups |
| POST `/consents`; POST `/consents/{id}/withdraw` | Evidence, actor authority, withdrawal and cleanup orchestration |

Use 403 for forbidden operations, scoped 404 for inaccessible objects, 409 stale/invalid transitions, 413 limits, 422 field/quality validation, 429 rate limits and safe 503 availability failures. Clients receive retryable status explicitly. Server derives patient/module/protocol from assignment; never trusts client-provided authority or scoring outputs.

Python returns a versioned DTO: `run_id`, `schema_version`, `module`, `model_version` (nullable for manual), `config_version`, `status`, `quality[]`, `events[]`, `segments[]`, `metrics[]`. Events have stable IDs, start/end milliseconds, type, confidence or null, source, uncertainty reason. Metrics include value or null, unit, numerator/denominator where applicable, provenance and missing reason. Reject nonfinite values, unknown enum/schema versions, out-of-duration timestamps and unbounded arrays. An empty candidate list does not mean fluent speech.

## Security and operations

Private encrypted storage, TLS, authorized short-lived access, no public audio URLs. Inspect file contents and decode in an isolated bounded process; enforce decoded sample/channel/duration/memory limits independently of MIME and encoded size. Preserve original audio; preprocessing derivatives are separately identified and never normalize away quality evidence before inspection. Python receives only a scoped recording stream/reference and pseudonymous run ID, not browser credentials or unrestricted database access.

Dispatch after commit; use unique run keys and guarded job claims. Handle worker death with lease expiry, bounded retries and terminal failure. Late/stale workers cannot overwrite an approved review. Polling suffices initially; reuse realtime only if needed later. Audit content/config edits, assignment changes, audio access, corrections, approval and deletion; logs contain IDs and safe codes, not spoken text or signed URLs.

Withdrawal blocks further processing immediately, cancels pending work and triggers policy-based deletion. Cleanup includes originals, derivatives, orphan uploads and expired signed access; document backup expiry and restore-time tombstone replay. Do not promise deletion of existing model influence: model training is excluded. Configure alerts for queue backlog, repeated failures and deletion failures. Disable new capture independently of preserving access to existing reviewed records.
