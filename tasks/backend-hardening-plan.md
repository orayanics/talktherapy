# Backend hardening and relational scale execution matrix

This extends the existing remediation plan. Current local target is SQLite; results must not be presented as PostgreSQL concurrency or production capacity evidence.

## Execution matrix

| ID | Work | Owner | Dependencies | Acceptance/evidence |
| --- | --- | --- | --- | --- |
| B1 | Map actor authorization, patient relationships, sensitive writes, upload/queue boundaries and existing denial tests | Root + Laravel | None | Concrete code paths and regression coverage; no permissions weakened for speed |
| B2 | Inventory schema foreign keys, indexes and production read paths | Laravel | None | Benchmark cases call actual application queries/controllers and explain actual SQL |
| B3 | Build deterministic relational fixture generator and isolated database runner | Laravel | B2 | 10x/100x/1000x scale manifests, valid foreign keys, repeatable seed; no access to deployment DB |
| B4 | Capture baseline with bounded warmups, repeated samples and independent blocks | Laravel | B3 | Raw timing/query count/error/plan artifacts; hardware/runtime recorded |
| B5 | Select measured bottleneck; apply smallest supported index/query fix | Laravel + root review | B4 | Before evidence exists first; results and access scope unchanged; regression test |
| B6 | Repeat equivalent workload and analyze uncertainty | Fullstack | B4/B5 | Paired comparison where valid, confidence intervals, effect sizes and multiple-comparison adjustment; report inconclusive cases honestly |
| B7 | Generate shareable visual report | Fullstack | B6 | Latency versus scale, before/after effect and uncertainty; real artifact links |
| B8 | Run backend tests/format and review final evidence | Root + Laravel | B5/B7 | Focused and appropriate broader checks; limitations and residual risks documented |

## Hardening priorities

1. Preserve clinical relationship authorization, per-challenge OTP enforcement, consent checks, private audio access, transactional state transitions, and encrypted outbox boundaries. Existing remediation regressions are the starting contract.
2. Bound pagination, export batches, queue recovery and inference admission. Scale tests must expose errors and query growth instead of silently dropping failed samples.
3. Measure production list/detail/reporting paths, actor-scoped joins, high-cardinality relationships and operational queue reads. Identify scans, sorts, N+1 growth and excessive hydration from captured SQL/plans.
4. Only keep performance changes supported by equivalent-result tests and measurements. Do not add caches around authorization or replace production queries with benchmark-only shortcuts.

## Experimental protocol

- Synthetic data only; migrations and application relationships define the fixture schema. Record exact per-table counts and which relationships are modeled. Explicitly list exclusions.
- Scale 10x, 100x and 1000x from a documented base cohort. Include both growing population and growing per-owner history so a fixed actor's queries face larger result/search ranges.
- Isolate database creation and configuration from local/deployment connections. Runner refuses production operation and never resets an existing application database.
- Record warm-cache status. Exclude fixture generation/migration/warmup from timed samples. Preserve failures and checksums/result cardinality alongside samples.
- Use at least 30 measured observations per comparison and repeated independently seeded/rebuilt blocks where practical. Alternate treatment order when comparison design supports it; observations from one warm process are not independent production traffic.
- Compare identical data and query semantics; disclose index maintenance overhead and uncontrolled machine load. Confidence intervals quantify this experiment, not universal production speed.
- Report median/p95, raw SQL count/time, wall-clock latency, errors and EXPLAIN plans. Statistical significance is an outcome to test, never a promise. Include effect sizes and confidence intervals; adjust for multiple tested comparisons or label exploratory results.
- This initial suite profiles database/application read paths. It cannot prove concurrent HTTP throughput, deadlock freedom, Redis coordination, network latency or operational recovery under real failures.

## Completion checklist

- [x] Isolated suite and fixture smoke tests pass.
- [x] All requested scales execute or failures/time/resource limits are reported explicitly.
- [x] Baseline, justified fix and after profiles are captured with raw reproducible artifacts.
- [x] Statistical analysis and visualization generated from those artifacts.
- [x] Correctness/security regressions and formatter pass.
- [x] Remaining risks and documentation/code differences recorded in final report.

## Authorization and failure-boundary inventory (B1)

The existing backend suite passed before implementation: 217 tests, 1,066 assertions. These are regression boundaries for this work, not evidence of PostgreSQL concurrency or production recovery.

| Boundary | Production path | Existing regression evidence |
| --- | --- | --- |
| Active, verified actor and bounded reads | `server/routes/api.php` middleware; `NotificationReadRequest`, `AuditLogReadRequest` enforce pagination limits | `AuthorizationPolicyTest`, `NotificationInboxTest`, `ReportingTest` |
| Clinical relationship and note ownership | `SoapPolicy`, `CreateSoap`, `UpdateSoap`; assigned patient/clinician checks in `SlpWorkflowController` | `ClinicalRecordReadTest`, `ClinicalRecordCreateTest`, `ClinicalRecordUpdateTest`, `SlpWorkflowTest` |
| OTP challenge attempts and expiry | `ActivationController::validChallenge` inside transactions; failed attempts commit before validation response | `IdentityActivationTest`, including exhaustion and unknown-email isolation |
| Atomic booking, transitions and clinical evidence | `BookAppointment`, `TransitionAppointment`, `CreateSoap`, `UpdateSoap` lock/check actors and write audit/outbox intents transactionally | `AppointmentInvariantTest`, `AppointmentBookingTest`, `AppointmentTransitionTest`, `PlatformTransactionTest` |
| Private recordings and consent | `SlpWorkflowController::uploadRecording` rechecks locked consent/assignment; `RunSlpAnalysis` checks consent and availability again | `SlpWorkflowTest`, `SlpAnalysisRecoveryTest`, including persistence rollback, withdrawal and changed audience |
| Encrypted delivery payloads and bounded recovery | `OutboxMessage` encrypts/hides payload; `DeliverNotifications` leases claims, limits retries, expires messages and bounds a scan to 100 successful deliveries | `PlatformTransactionTest`, `NotificationDeliveryTest`, `PlatformOperationsTest`; multi-worker recovery remains unproven |
| Private bounded inference edge | `PhonemeAssessmentRequest` caps upload at 10 MiB and reference at 800 characters; route throttle; `PhonemeClient` streams privately with connection/request timeouts and DTO validation | `PhonemeAssessmentTest`, including unauthenticated denial, invalid media, upstream DTO rejection and timeout mapping |

Benchmark requests must use these production read paths and preserve actor scope. This task does not grant administrators clinical access, weaken consent, run delivery workers, contact inference services, or treat SQLite locking as distributed coordination evidence.

## Baseline and experimental decision log

- The first scale run exposed a fixture insertion-order failure beyond the 100-episode batch boundary. New patients must be inserted before bookmarks and other dependent rows even when the first episode in a batch belongs to the fixed patient. A boundary-crossing regression test now covers this case.
- [Baseline raw measurements and SQL plans](../docs/performance/baseline.json) were captured at 10x/100x/1000x before adding any production optimization. This pilot uses one rebuilt block and three before-only observations per case; it identifies plans, not statistical significance.
- The production notification inbox list uses the existing `(user_id, read_at, created_at, id)` index but also builds a temporary B-tree for `ORDER BY created_at DESC, id DESC` at every tested scale. The fixed patient's inbox contains 50, 500 and 5,000 rows. The candidate is a separate `(user_id, created_at, id)` index; the unread-filter index remains necessary for filtered reads.
- The candidate is tested only on disposable databases until equivalent-result measurements support keeping a production migration. No configured application database is migrated by this experiment.
- [Full paired raw measurements](../docs/performance/raw.json), [analysis](../docs/performance/report.md), [before/after and uncertainty chart](../docs/performance/comparison.svg) and [latency-versus-scale chart](../docs/performance/scale.svg) record eight cases at three scales, with 30 paired observations in 10 rebuilt database blocks per comparison. All 24 comparisons completed without failures; before/after counts and SHA-256 result checksums match.
- Keep the notification inbox index: median controller/resource time changes from 4.4575 to 4.1976 ms at 10x, 2.4810 to 2.0782 ms at 100x, and 6.3812 to 2.5956 ms at 1000x (2.459x speedup at 1000x). The block-based paired change at 1000x is -4.0991 ms, with exploratory 95% CI [-4.4519, -3.7985] ms; Holm-adjusted p is 0.046875 at all three scales. Query count remains two and the temporary sort disappears. Other cases have no adjusted significant change.
- Cross-scale absolute timings are nonmonotonic and share one process/machine: sequential execution, load and cache drift confound the scale curve. Treat paired within-scale effects as stronger evidence than absolute cross-scale comparisons. The report records index build time/storage; production insert/update maintenance costs and blocking during deployment remain unmeasured.

### Coverage and exclusions

The measured cases are patient availability, patient notifications, patient/clinician appointment lists, patient SOAP history, clinician roster, patient SLP assignments and administrator audit history. They call production controllers, validated Form Requests where present, and Resources directly. The raw artifact records each case's actor, path, input, actual SQL/bindings and EXPLAIN plans; each rebuilt block records exact fixture counts, foreign-key validation, foreign keys and index lists for modeled tables.

One base unit contains 10 relational episodes, six distinct patients, 10 future FREE slots and 100 audit rows. At scale `s`, there are `5*s+1` distinct patients and `5*s` history rows for the fixed patient. The clinician and administrator also accumulate history. Fixture generation is deterministic and the benchmark clock is fixed, so availability does not disappear as calendar time advances.

This is selected list-path coverage, not a complete performance audit of every endpoint. Detail/download/export paths, content/bookmark/catalog reads and operational queue recovery are not timed. Fixture counts omit sessions, cache, jobs, password-reset tokens, personal access tokens and migration bookkeeping. All audio/file paths are synthetic placeholders; no audio or inference service is accessed. HTTP middleware, network latency, browser behavior, live sessions, concurrency, Redis and PostgreSQL remain outside the experiment. Existing denial/rollback tests cover correctness separately; they do not prove distributed recovery or real-device behavior.

### Reproduction

From `server/`, run `php artisan app:benchmark-relational --scales=10,100,1000 --blocks=10 --pairs=3 --warmups=2 --output=/tmp/talktherapy-new-run.json --no-interaction`. The output must be a new file; existing files are refused. Use `--baseline` for a separate before-only pilot, not paired analysis. Every block migrates a new temporary SQLite file and deletes it afterward; no existing application database is reset.

From the repository root, run `python3 -B tools/analyze_benchmarks.py /tmp/talktherapy-new-run.json --output=/tmp/talktherapy-new-report`. Read `report.md`, the two SVGs and `summary.json` together with the raw JSON. A failed case remains in the report and produces a nonzero exit code. Small runs are explicitly exploratory; their existence is not evidence of a performance improvement.

## Final verification and execution status

- B1: the authorization/failure boundary inventory above is complete for this change; existing denial, OTP, clinical, consent, upload and rollback regressions remain green.
- B2–B4: selected production read paths and modeled schemas are inventoried in the artifacts; deterministic isolated fixtures and the runner execute at all three requested scales with raw samples/plans and explicit exclusions.
- B5: baseline plans and paired measurements support the reversible notification inbox ordering index migration. The original unread index is retained. Regression tests verify owner isolation, tied-time ordering, pagination, read filters, removal of the temporary sort, and rollback preserving rows and the unread index.
- B6–B7: the standard-library analyzer validates pairs and result checksums, reports failures and insufficient runs, estimates block-based uncertainty, adjusts across all 24 comparisons, and produces the linked report and two charts. Failed comparisons remain in the adjustment family instead of reducing its size.
- B8: `php artisan test --compact --no-ansi` passes **225 tests / 1,184 assertions**; the analyzer's **9 tests** pass; Laravel Pint and `git diff --check` pass. Both SVGs parse and render. An in-memory mutation removing the analyzer's checksum comparison makes its result-mismatch test fail, confirming that guard is covered.
- No configured application database was migrated. The production migration is supplied as source for the application's normal deployment process. SQLite experiments do not validate deployment blocking, index write-maintenance cost, PostgreSQL locking/plans, concurrency, distributed queue recovery or clinical inference.

All B1–B8 deliverables are complete within the selected read-path scope and exclusions above. Broader migration/browser/realtime/inference tasks in `tasks/todo.md` are separate work and remain pending where their own evidence is absent.
