# TalkTherapy codebase audit

What this repo does: TalkTherapy connects SLP clinicians and patients through scheduling, intake, SOAP records, educational content, and WebRTC calls with chat. A FastAPI service transcribes recordings and returns heuristic speech-unit scores. Assumed load: multiple simultaneous patients/clinicians, concurrent bookings, and multiple backend processes; no actual traffic or latency measurements were available.

Audited 2026-10-28, commit `8af02ff88d97344279c2a0bac4d8806d11901434`. Findings below are source-confirmed control-flow issues or explicitly qualified risks. Exploitation against a deployed instance was not attempted. File links point to the reviewed source; line numbers refer to that revision.

## Must fix

1. **A clinician can act on another clinician's appointment; any signed-in user can cancel a pending booking.** [Appointment service](../../server/src/modules/appointments/service.ts#L13), [routes](../../server/src/modules/appointments/index.ts#L64).
   - **What this is:** Accept/reject/complete use a clinician-role check; cancel uses authentication only.
   - **Problem:** None of those service functions checks the stored participant IDs against the actor. Accept overwrites `clinicianId`; completion can establish a care relationship for the wrong clinician. A known pending appointment ID also lets an unrelated user cancel it if the cutoff permits.
   - **Smallest fix:** Apply participant policies before each operation and recheck inside the locked transaction; never replace the assigned clinician during acceptance. Migration: `appointments`.
   - **Check:** Clinician B cannot accept/reject/complete clinician A's booking; patient B cannot cancel patient A's booking; state, slot, events and relationship remain unchanged.

2. **Appointment detail exposes intake and participant information to unrelated accounts.** [Detail route](../../server/src/modules/appointments/index.ts#L102), [query](../../server/src/modules/appointments/service.ts#L359).
   - **What this is:** `GET /appointments/:id` returns encounter, patient, clinician, slot and event data.
   - **Problem:** The route checks only `auth: true`, and the query accepts only the appointment ID. Another signed-in account with that ID can read the encounter.
   - **Smallest fix:** Scope lookup to the current participant and return 404 to outsiders. Migration: `appointments`.
   - **Check:** Every role/relationship combination is tested; administrative account privileges alone do not reveal intake.

3. **Unrelated clinicians can read and create SOAP records.** [SOAP routes](../../server/src/modules/soaps/index.ts#L15), [create service](../../server/src/modules/soaps/service.ts#L42).
   - **What this is:** Patients are restricted to their own reads; other roles are not relationship-scoped. Creation requires clinician role only.
   - **Problem:** A clinician can request another clinician's patient notes or create a note for any known patient ID. Updates do check author ID, so the defect is specifically read/create authorization.
   - **Smallest fix:** Enforce an established care relationship for clinician reads/creation and keep author-only updates. Migration: `clinical-records`.
   - **Check:** Unrelated clinician, unrelated patient and administrator requests fail without returning clinical fields or writing a note.

4. **Patients can create, edit, or delete CMS content through the API.** [Content routes](../../server/src/modules/content/index.ts#L49), [update/delete services](../../server/src/modules/content/service.ts#L156).
   - **What this is:** UI actions are limited to administrators, and the permission declarations describe read-only patients/clinicians.
   - **Problem:** Mutation routes require only authentication; update/delete services have no author or role guard. Calling the API directly bypasses the UI restriction.
   - **Smallest fix:** A Content policy restricts writes to authorized administrators; validate allowed fields independently. Migration: `content`.
   - **Check:** A patient/clinician receives 403 for all three writes, including another author's article.

5. **Notification WebSockets accept expired raw sessions and ignore account state.** [Socket authentication](../../server/src/modules/notifications/index.ts#L29).
   - **What this is:** The endpoint accepts either a custom signed token or a database session token.
   - **Problem:** Raw-session lookup verifies existence without comparing `expiresAt`. Neither branch checks active status, and authorization is not refreshed for an already connected socket. An expired session row that has not been deleted can still open a notification connection.
   - **Smallest fix:** Replace this path with authenticated private channels and explicit revocation/lifetime handling. Migration: `notifications`, `realtime`, `identity`.
   - **Check:** Expired/revoked sessions and suspended users cannot subscribe; an existing connection loses business access after suspension.

6. **Schedule expansion can allocate an unbounded recurrence before applying its limits.** [Generator](../../server/src/modules/schedule/service.ts#L30).
   - **What this is:** The generator promises a one-year/365-occurrence limit.
   - **Problem:** `parsed.all()` builds the recurrence result before the loop's `break` executes. An unrestricted high-frequency rule can exhaust resources. Invalid rules are silently replaced with a single slot; the server also lacks a positive-duration check.
   - **Smallest fix:** Validate a finite supported RRULE subset, enumerate within bounds, reject invalid rules and overlaps, and never silently replace user input. Migration: `scheduling`.
   - **Check:** Unbounded/high-frequency rules fail quickly without writes; end-before/start-equal intervals are rejected; preview matches generated slots.

7. **Booking does not enforce patient role, visibility, time, or clinician availability.** [Booking](../../server/src/modules/slots/service.ts#L23), [route](../../server/src/modules/slots/index.ts#L30).
   - **What this is:** The service checks only whether the slot exists and has status FREE before writing the appointment/intake/event transaction.
   - **Problem:** A clinician/admin can book as a patient; a known hidden FREE slot or past FREE slot can be booked. There is no explicit single-active-booking constraint for a future PostgreSQL port. The current SQLite transaction should not be described as a proven double-booking exploit; its locking behavior differs.
   - **Smallest fix:** Patient policy, active clinician/time/visibility checks, locked slot transaction, and database uniqueness for active appointments. Migration: `appointments`.
   - **Check:** Hidden/past/suspended-clinician slots are refused; simultaneous booking on the target database yields one appointment and one 409.

8. **Python accepts unbounded inference work and blocks the async request loop.** [Assessment route](../../py/api/routes.py#L29), [proxy](../../server/src/modules/slp/index.ts#L9).
   - **What this is:** A recording is read into memory, decoded, transcribed and aligned in the request.
   - **Problem:** There is no application byte/duration cap, inference admission limit, FFmpeg timeout, or upstream fetch deadline. Only conversion is moved to a thread; synchronous transcription/alignment still block the event loop. Network exposure determines who can reach the unauthenticated Python route; CORS does not authenticate it.
   - **Smallest fix:** Private authenticated service boundary, streamed bounded uploads, decoder/inference deadlines, isolated bounded worker, and Laravel timeout/error translation. Migration: `phoneme-analysis`.
   - **Check:** Oversized/corrupt/long/silent input and competing requests terminate predictably; readiness remains responsive.

9. **Speech scoring uses the wrong duration quantity and has an unvalidated token/model contract.** [Alignment](../../py/core/alignment.py#L83), [phonemization](../../py/core/phonemization.py#L57), [scoring](../../py/core/scoring.py#L85).
   - **What this is:** IPA is collapsed into characters, aligned with MMS_FA, and passed through a sigmoid to produce percentages.
   - **Problem:** `duration_frames = len(spans)` counts span records, not their `end - start` lengths. Because the tokenizer receives each character as a separate item, a long character alignment can still be counted as one span and penalized as one frame. IPA-to-letter substitutions also merge distinct sounds. Model score range and appropriateness of phonemized input have no validation evidence here.
   - **Smallest fix:** Establish the actual pinned model input/score semantics, use real frame durations, and validate results against clinician-reviewed fixtures before releasing accuracy claims. A Laravel rewrite cannot fix this by proxying unchanged scores. Migration: `phoneme-analysis`.
   - **Check:** Synthetic span-duration tests plus representative audio calibration; do not equate alignment confidence with diagnostic accuracy. [Bundle contract](https://docs.pytorch.org/audio/2.8.0/generated/torchaudio.pipelines.Wav2Vec2FABundle.html), [span contract](https://docs.pytorch.org/audio/stable/generated/torchaudio.functional.merge_tokens.html).

10. **The Python setup is not reproducible and relies on a deprecated alignment surface.** [Setup](../../README.md#setting-up-the-python-environment-for-phoneme-analysis), [imports](../../py/api/routes.py#L12).
    - **What this is:** README installs current Torch/TorchAudio and inference packages without a manifest or lock.
    - **Problem:** A fresh latest install is not a supported reproducible environment for these alignment imports. Official documentation warns that this API was deprecated in 2.8 for removal in 2.9. Model availability and license also require a release decision; MMS_FA's published license is noncommercial.
    - **Smallest fix:** Prove and pin a compatible environment/artifact as a temporary baseline, then decide a supported alignment replacement; record model licensing approval separately. Migration: `phoneme-analysis`.
    - **Check:** Clean image starts offline with pre-provisioned models and passes inference fixtures. [Deprecation notice](https://docs.pytorch.org/audio/stable/tutorials/forced_alignment_for_multilingual_data_tutorial.html), [model license](https://docs.pytorch.org/audio/2.8.0/generated/torchaudio.pipelines.MMS_FA.html).

11. **OTP and activation do not enforce a safe account lifecycle.** [OTP generation](../../server/src/lib/auth.ts#L26), [activation](../../server/src/modules/activate/service.ts#L50).
    - **What this is:** Custom six-digit OTPs are stored as plaintext; verify does not consume them; activation sets status active without checking prior state.
    - **Problem:** Codes use `Math.random()` and have no per-challenge attempt counter. Resend issues codes for existing accounts without excluding active/suspended accounts. Activation can reset an existing privileged account's password and mark a suspended account active while leaving separate ban fields inconsistent. This is not proof that Better Auth's ban enforcement is bypassed in every path.
    - **Smallest fix:** Cryptographic generation, keyed digest, purpose/attempt/expiry checks, atomic single-use consumption, pending-only activation, and a separate password broker for recovery. Migration: `identity`.
    - **Check:** Resend/activation cannot reset active credentials or alter suspension; concurrent activation consumes one code; replay and brute force fail.

12. **Sensitive transcripts and internal failures cross logging/error boundaries.** [Python logging/errors](../../py/api/routes.py#L55), [upstream error passthrough](../../server/src/modules/slp/index.ts#L49).
    - **What this is:** Full transcript is logged and Python exception text is returned in HTTP failures; the API forwards upstream error text.
    - **Problem:** Speech may contain clinical/personal information, while exceptions can reveal internal filesystem/runtime details. The API also lacks response-schema validation.
    - **Smallest fix:** Redacted structured telemetry and stable public error codes; validate successful response fields and numerical ranges. Migration: `phoneme-analysis`, `platform`.
    - **Check:** Simulated decoder/model exceptions reveal no transcript, local path, stack, token or raw upstream payload to clients/logs.

## Should fix

13. **Security defaults depend on local configuration and process memory.** [CORS/limit keys](../../server/src/index.ts#L34), [token secret](../../server/src/lib/joinToken.ts#L3), [rooms](../../server/src/modules/session/service.ts#L9), [notification hub](../../server/src/modules/notifications/ws.ts#L3).
    - **What this is:** API CORS reflects origins with credentials; limiter identity trusts forwarding headers; custom join tokens use a fallback secret. Socket maps exist only in one process.
    - **Problem:** A missing secret makes tokens predictable, spoofed proxy headers can defeat limit identity unless an upstream sanitizes them, and two processes cannot exchange room/notification events through these maps. Actual production proxy behavior was unavailable.
    - **Smallest fix:** Fail startup for absent secrets, configure trusted proxies and exact origins, use shared Redis limits and Reverb transport. Migration: `platform`, `realtime`.
    - **Check:** Invalid origin/config is refused; untrusted forwarding headers do not change limit keys; two-instance clients receive events.

14. **Notification delivery and audit writes can disagree with committed business changes.** [Best-effort delivery](../../server/src/modules/notifications/service.ts#L29), [booking audit](../../server/src/modules/slots/index.ts#L79), [audit helper](../../server/src/lib/audit.ts#L13).
    - **What this is:** Domain writes commit before later audit and notification work.
    - **Problem:** Notification failures are swallowed. A failed audit can return an error after a booking already committed, encouraging a retry while leaving missing evidence.
    - **Smallest fix:** Transactional audit and durable outbox intent with idempotent delivery. Migration: all write modules, `notifications`.
    - **Check:** An injected audit failure rolls back the business mutation; a delivery crash is retried without duplicate inbox items.

15. **Deleting users cascades into clinical history and audit evidence.** [Prisma relations](../../server/prisma/schema.prisma#L195).
    - **What this is:** Appointment, schedule, care relationship, content and audit relations include user-delete cascades; SOAP relations restrict deletion.
    - **Problem:** A user deletion where no SOAP restriction blocks it can erase appointments/events/intake and the user's audit rows. A future Laravel `cascadeOnDelete()` port would retain this loss mode.
    - **Smallest fix:** Deactivation by default, restrictive clinical foreign keys, retained nullable audit actor references, and explicit erasure policy. Migration: `user-admin`, `migration-cutover`.
    - **Check:** Deactivation preserves counts/relationships; hard deletion cannot cascade clinical records or audit evidence.

16. **Export grows with the full dataset and CSV text can become spreadsheet formulas.** [Export loop](../../server/src/modules/logs/service.ts#L55).
    - **What this is:** Rows are fetched in batches but appended into one in-memory `chunks` array and finally another buffer.
    - **Problem:** A large export still consumes memory proportional to total output. Quoting a value beginning with a formula marker does not neutralize it for spreadsheet software. Offset traversal can also drift under concurrent inserts.
    - **Smallest fix:** Stable snapshot boundary and keyset/chunk streaming, bounded export parameters, formula-safe CSV cells, audited access. Migration: `reporting`.
    - **Check:** Large synthetic export stays bounded; `=`, `+`, `-`, `@` and control-character prefixes are escaped; JSONL remains valid.

17. **Client and server contracts disagree at migration-sensitive boundaries.** [Axios wrapper](../../client/src/api/client.ts#L30), [types](../../client/src/api/schedule.ts#L102), [roster pagination](../../server/src/modules/clinicianPatient/service.ts#L33).
    - **What this is:** API uses nested success envelopes, counts/token endpoints use different envelopes, and field naming mixes styles.
    - **Problem:** Client `Encounter[]` conflicts with a single nullable encounter; Python can return `unknown` but client unions omit it; roster meta differs from standard pagination. A simple URL swap would also leave Better Auth calls and CSRF-less raw fetches in place. Unused `/schedules` API functions are declarations only in this revision, not confirmed live route failures.
    - **Smallest fix:** One versioned contract, endpoint/consumer inventory, explicit client migration, and golden response fixtures. Migration: `platform`, every module.
    - **Check:** Type checks plus browser login/profile/booking/notification/analysis flows pass against Laravel, including empty and failure responses.

18. **Critical workflows have no meaningful automated regression suite.** [Only server test](../../server/test/sample.test.ts#L1), [test script](../../server/package.json#L5).
    - **What this is:** The single server test exercises a new toy Elysia instance. No client test files or Python tests were found in the tracked source inventory.
    - **Problem:** Appointment authorization, OTP consumption, recurrence, clinical access and scoring can regress without this test failing. `server`'s package test script intentionally exits with an error.
    - **Smallest fix:** Build focused policy/transaction/contract and inference-fixture suites as each migration slice lands. Migration: all modules.
    - **Check:** Forbidden-access, race, expiry, import and malformed-audio scenarios are mandatory release gates, not optional coverage work.

19. **Diagnosis-filtered slot searches target a nonexistent relation.** [Patient slot query](../../server/src/modules/appointments/service.ts#L568), [Slot model](../../server/prisma/schema.prisma#L277).
    - **What this is:** Patient booking filters build a Prisma condition through `where.clinician`.
    - **Problem:** Slot's clinician relation is named `user`; `clinician` is not a valid Slot filter relation. A nonempty diagnosis filter reaches an invalid Prisma query rather than selecting the requested specialty. `any` hides the mismatch from TypeScript.
    - **Smallest fix:** Use the actual relationship and validate diagnosis value filters in the shared slot query. Migration: `scheduling`.
    - **Check:** A fixture with different diagnosis IDs/values returns only matching clinicians' available slots without a query error.

20. **The seed creates an active privileged account with a fixed password.** [Superadmin seed](../../server/prisma/seed.ts#L3).
    - **What this is:** The documented seed command creates a verified active superadmin using a hardcoded email/password if the account is absent.
    - **Problem:** Running this seed in a deployed environment introduces a credential known to anyone who can read the source. This audit did not verify whether the account exists in production.
    - **Smallest fix:** Keep demo credentials restricted to explicit local/test fixtures; provision production superadmin through a one-time secure operator flow. Migration: `user-admin`, `migration-cutover`.
    - **Check:** Production-mode seeding cannot create a predictable login and the bootstrap workflow does not print/store a plaintext credential in logs.

## Additional review notes

- Current content rendering enables `rehypeRaw` without explicit sanitization in the detail component, although editor previews sanitize. Confirm the installed renderer's effective sanitization behavior with an adversarial browser fixture; enforce an explicit safe render pipeline during content migration. No executable stored-XSS exploit was proven in this environment.
- Current raw realtime transport supports offers, answers, ICE, readiness/resync, media toggles and ephemeral chat. Reverb does not implement this custom wire protocol. It requires coordinated client signalling changes; STUN-only configuration also needs a tested TURN fallback for restrictive networks.
- `server/src/modules/assessment/service.ts` has no callers found across `server`/`client`; the active proxy is `slp/index.ts`. Replace the active integration once, then retire the duplicate deliberately. No speculative abstraction is needed.
- The historical changelog is not a current contract: it describes rescheduling/unblocking paths and a `web/` tree absent here. Do not implement those features merely to match stale prose.

## What was inspected and verified

Read the root README/config, package manifests and lockfile locations, Prisma schema/migration structure, seed behavior, server entrypoint, every module route file, auth macros, high-risk services, notification/session transport, Python source/config/DTOs, client API files, authentication/profile integration, recurrence builder and representative content/assessment/realtime consumers. Reviewed official Laravel 13 and TorchAudio contracts. Traced registration/activation/login, booking/transitions, SOAP access, CMS writes, notifications, signalling and speech assessment end to end in source.

Executed `bun test server/test`: **0 pass, 1 fail, 1 error** because local package `elysia` is missing. This is an environment/dependency failure, not a demonstrated application-test failure. Did not install dependencies just to produce a passing toy test. Working tree initially contained untracked `AGENTS.md`; it is preserved.

Not checked: deployed behavior, all presentational client components, full generated Prisma code, real database contents/counts, production headers/secrets, network topology, fresh dependency advisories, all historical commits, real-device WebRTC, model execution, hardware throughput or clinical calibration. No claim of exhaustive penetration testing, advisory clearance, regulatory compliance, or clinical correctness is made. Runtime source remains unchanged; the confirmed authorization gaps remain until fixed.
