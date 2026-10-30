# Backend development and frontend integration plan

Status: planned, not implemented. Specification: [platform](SPEC-platform.md), [modules](SPEC-modules.md). Keep existing migration tasks intact. Use the checklist here as this initiative's task tracker.

Implementation update (2026-10-30): the initial catalog slice and a conservative workflow baseline are now implemented. The baseline covers publication transitions, private assets, consent, assignments, attempts, recording uploads, queued manual-review analysis, review revisions, and report snapshots. Tasks that require a full recorder UX, waveform editor, retention scheduler, Python quality service, or clinical model validation remain open.

## Implementation conventions and verification

Use existing controller → FormRequest/Policy → Action → Resource patterns; keep controllers thin and patient/clinician Resource projections distinct. Follow existing TypeScript `#/*` imports and named API functions, e.g. `fetchAssignments` and `mutateSubmitRecording`; derive query keys from resource/ID/filter, invalidate after successful changes, and stop polling on terminal states/unmount. No new generalized plugin engine, permission framework or CMS dependency.

Run from `server/`: `php artisan test --filter=Slp` for new focused tests, `php artisan test --filter=Phoneme` for legacy compatibility, `composer lint`. Run from `client/`: `bun run test src/modules/slp`, `bun run build`, `bun run lint`. Run from `py/`: `python -m pytest -q`. These are future implementation checks; this documentation change does not claim they passed. Use HTTP fakes, queue/storage fakes, synthetic or licensed audio, and deterministic annotation fixtures. Real decoder/process timeout checks need isolated integration tests; simulated HTTP tests cannot establish inference validity.

Always enforce server authorization/validation and audit sensitive transitions. Never reuse patient recordings as training data, invent clinical norms, or publish unreviewed clinical content. Production deployment and approved clinical protocols require their actual owners' sign-off; developing the documented code does not grant it.

## Ordered tasks

Each row is a bounded implementation unit, typically 3–5 files. Split additional factories/types/UI files into adjacent substeps if that limit is exceeded; do not complete an entire horizontal layer before its user flow. Backend contracts land before their consuming frontend steps.

| Done | Task / dependencies | Likely files or areas | Acceptance and verification |
| --- | --- | --- | --- |
| [ ] | 1. Freeze protocol fixtures; none | docs/slp-assessment, synthetic annotation fixtures | Count repeated/multiple behaviors once per syllable; zero/short/uncertain examples approved for implementation; manual fixture review |
| [x] | 2. Catalog persistence; 1 | exercise/version migration, models, factory, database test | Immutable published versions, archive references, scoped ownership; focused database tests |
| [x] | 3. Catalog API; 2 | SlpExercisePolicy, request, controller/resource, route, feature test | All three staff roles can CRUD within defined scopes; patient writes and cross-owner edits denied; policy matrix tests |
| [ ] | 4. Catalog editor; 3 | slp API/types, editor, route, UI test | Draft create/edit/copy/archive and stale-edit feedback; Vitest and browser keyboard check |
| [ ] | 5. Stimulus assets; 3 | asset model/migration, upload action, request, test | MIME/content/size/license checks and reference-aware delete; malicious upload/storage tests |
| [ ] | 6. Protocol versions; 2 | protocol model/migration, validation action, tests | Typed ranges and override allowlist; snapshot precedence and forbidden-field tests |
| [ ] | 7. Review/publication API; 5–6 | transition action, reviewer policy, resource, tests | Admin status does not confer clinical approval; immutable publish with reviewer evidence; transition tests |
| [ ] | 8. Publication UI; 4,7 | editor review controls, protocol form, hooks, tests | Preview/version diff, review/publish/archive states; role and stale-revision UI tests |
| [ ] | 9. Assignments API; 7 | assignment model/migration, policy, action, tests | Linked clinician schedules valid published content with frozen overrides; unauthorized relationship tests |
| [ ] | 10. Assignments UI; 9 | assignment form, patient list, API hooks, routes, tests | Clinician assigns; patient sees only own tasks; timezone/schedule and role tests |
| [ ] | 11. Consent authority; 9 | consent evidence extension/model, policy, action, tests | Withdrawal and guardian evidence; no pediatric delegated access without verification; actor/purpose tests |
| [ ] | 12. Attempts/upload backend; 11 | attempt/recording migrations/models, upload action, tests | Durable bounded upload, idempotency, scoped playback and cleanup on failure; storage/auth tests; split route/resource wiring if needed |
| [ ] | 13. Home capture UI; 10,12 | recorder integration, submission hook, status component, tests | Consent → record → replay → submit → completion; denied mic/offline/duplicate submission tests plus real mobile browser check |
| [ ] | 14. Manual review persistence; 12 | review model/migration, correction action, policy, tests | Manual path works without model; raw/review separation and revision conflict; feature tests |
| [ ] | 15. Metric computation; 1,14 | pure metric calculator, counting DTO, unit fixtures/tests | Exact %SS/rates, valid span unions and null denominators; hand-calculated fixtures |
| [ ] | 16. Review UI; 14–15 | audio/event table, correction hook, queue route, tests | Clinician can annotate/correct/resolve uncertainty; keyboard and concurrent edit checks |
| [ ] | 17. Approval/report API; 15 | approval action, report snapshot/template, policy, tests | Atomic recompute, approved-only report, append-only amendment; stale/unauthorized approval tests |
| [ ] | 18. Report/history UI; 16–17 | report view, history API/view, tests | Correct provenance and incompatible comparison groups; no patient data leakage; browser check |
| [ ] | 19. Queue lifecycle; 12,14 | analysis run model, job, lease/recovery scheduler, tests | Idempotent claims, crash recovery, bounded retries and withdrawal cancellation; queue tests |
| [ ] | 20. Python quality/timing contract; 19 | DTO, isolated decoder/quality module, route, tests | Finite bounded outputs, quality before normalization, unsupported codec/timeouts; process integration tests |
| [ ] | 21. Laravel analysis bridge; 20 | client adapter, response validator, job integration, tests | Private authentication and validated DTO, safe failure/manual fallback; Http fakes and integration probe |
| [ ] | 22. Candidate review integration; 16,21 | candidate API/resource, review controls, tests | Clinician confirms timing; candidates cannot masquerade as approved metrics; UI/API contract tests |
| [ ] | 23. Retention and audit; 11–22 | cleanup job, access audit, withdrawal action, tests, operations doc | Original/derived/orphan cleanup, backup tombstones and access revocation; deletion-failure drills |
| [ ] | 24. Fluency research release; 20–23 | dataset manifest, evaluation script/tests, model release record | Licensed consented labels, speaker-separated evaluation and clinical thresholds; otherwise detector stays off |
| [ ] | 25. Detector integration; 24 passed | Python event adapter/config, contract fixtures, tests | Event precision/recall evidence, calibrated uncertainty, model rollback; held-out evaluation and runtime smoke |

## Checkpoints and release order

- After 4/8: catalog CRUD demonstration; archived or changed content cannot silently change assignments; clinical publication gated.
- After 13: end-to-end home capture with synthetic fixtures; consent, authorization and private storage verified before real recordings.
- After 18 and 23: manual clinician-reviewed pilot. Complete operational retention/access checks even though automation is not ready. Clinical partner and reviewed language content required for live use.
- After 22/23: timing assistance pilot with clinician corrections; preserve manual fallback.
- After 25: enable automated fluency candidates only for specifically evaluated language/age/task combinations. The manual release must not wait for speculative model training.
- Phase 2 and 3: write detailed domain protocols and fixtures first, then reuse catalog/capture/review infrastructure. Do not expose placeholders as functioning assessment modules.

Roll out behind separate capture, timing and detector flags. Start with additive migrations; never drop legacy endpoint/data as rollback. Disable failing automation and continue authorized manual review. Roll back a model by selecting a prior approved release; preserve every run's original provenance. Measure latency, memory, queue age and upload failures on actual deployment hardware before increasing worker count.

## Risks and unresolved release dependencies

No clinical reviewer or labeled corpus is established by repository code. Until available, build/test with synthetic fixtures and draft stimuli; do not label the tool clinically validated. Home microphones cannot establish calibrated loudness or reliably observe all blocks. Longer speech samples exceed the existing synchronous prototype assumptions, which is why the new flow uses queues and explicitly separate limits. Confirm storage budget, accepted devices/codecs, retention/guardian policy, and qualified English/Filipino review before pilot enrollment. These dependencies block relevant live releases, not specification or manual-workflow development.
