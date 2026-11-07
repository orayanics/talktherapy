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

- [ ] Isolated suite and fixture smoke tests pass.
- [ ] All requested scales execute or failures/time/resource limits are reported explicitly.
- [ ] Baseline, justified fix and after profiles are captured with raw reproducible artifacts.
- [ ] Statistical analysis and visualization generated from those artifacts.
- [ ] Correctness/security regressions and formatter pass.
- [ ] Remaining risks and documentation/code differences recorded in final report.
