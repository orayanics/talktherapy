# SLP practice and phoneme-analysis improvement plan

Research date: 2026-10-29. Baseline: `d36752f551bf6eabaddcaee389f1d879c4016c59` (`chore(slp): update client and backend`). Status: research and proposed implementation; no clinical validation or treatment effectiveness is claimed.

## 1. Recommended direction

Build a clinician-guided speech practice companion with a child-friendly activity flow and a separately validated speech measurement service. Introduce learning in stages: supervised personalization of practice first, then offline model improvements from consented, clinician-labeled recordings. A live child's attempt must never immediately update the shared model or become its own correctness label.

Confirmed proof-of-concept scope: ages 3–18 in the Philippines, supporting English and Filipino practice. The Filipino ASR implementation uses Tagalog (`tl`); it does not establish support for every Philippine language or mixed-language speech. Younger children practice with a helper; older users can select a simple focus style. No SLP reviewer or recordings with explicit model-training consent are currently available. The user has deferred that pivot. Keep neural training, stored training recordings and automatic corrective feedback disabled while building the practice proof of concept.

The user request expands the current specification, which excludes stored recording history and training. Treat consent, storage, clinician annotation, and offline training as explicit new capabilities with their own authorization and retention rules. Preserve the existing private Python/Laravel boundary.

## 2. Research findings and implications

### Clinical scope and treatment selection

ASHA describes speech sound disorders as involving perception, motor production, or phonological representation. Assessment considers single words, connected speech, linguistic background, and other clinical information. Language transfer and dialect differences must not automatically become disorder labels. Therefore, the application should support an SLP's selected targets and interpretation; a recording score alone cannot establish a diagnosis. [ASHA SSD guidance](https://www.asha.org/practice-portal/clinical-topics/articulation-and-phonology/)

For multilingual children, gather the language profile and evaluate relevant languages with appropriate expertise. An English model's uncertainty should remain uncertainty rather than become evidence of impairment. [ASHA multilingual service delivery](https://www.asha.org/practice-portal/professional-issues/multilingual-service-delivery/)

Practice content must distinguish articulation-focused work on a specific sound from phonological contrast work addressing a pattern. Proposed clinician-authored activity families are sound imitation, meaningful single words, contrast listening/production, phrases, and connected speech. Progression should depend on the clinician's treatment approach and the child's response, rather than a universal sound-age chart. Oral placement cues need clinician review; avoid prescribing unsupervised exercises solely from an acoustic classifier.

Speech motor chaining describes manipulating stimulus complexity, variability, and feedback as performance changes. This supports configurable practice and feedback schedules, but does not justify one universal dosage or difficulty threshold for every child. [Preston et al., 2019](https://pubmed.ncbi.nlm.nih.gov/31051085/)

Separate acquisition during a session from retention later and generalization to unpracticed items. A pilot CAS trial used untreated words/sentences and a later follow-up; its small, diagnosis-specific sample should not be generalized to all children. Proposed evaluation should likewise include delayed and untrained probes. [McCabe et al., 2023](https://pubmed.ncbi.nlm.nih.gov/36848673/)

### Child interaction and effectiveness

A randomized study of computer-assisted input-based intervention found no greater improvement than typical classroom practice. A polished game and increased engagement therefore cannot substitute for evidence of speech improvement. [Sound Start trial, 2017](https://pubmed.ncbi.nlm.nih.gov/28672376/)

SayBananas! investigated individualized speech practice through a mobile game in 45 rural Australian children. It is relevant to delivery and usability, but its study population and design do not establish that our proposed game or automated scoring will be effective. [SayBananas!, 2023](https://pubmed.ncbi.nlm.nih.gov/37227246/)

Product hypothesis: picture-supported tasks, a predictable turn structure, replay, and optional brief rewards will make practice easier to use. Validate this through child/caregiver usability sessions and a separate clinical outcome study. Do not describe engagement metrics as therapeutic benefit.

Accessibility baseline: keyboard and switch-friendly activation, visible focus, accessible labels, text plus symbols, and alternatives to dragging. WCAG 2.2's AA minimum target criterion is 24 CSS pixels with exceptions; use a larger proposed 48-pixel target for main child controls. Respect reduced motion and allow animations/sounds to be disabled. [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Automated assessment and neural learning

Research has evaluated automatic pronunciation analysis for children with SSD against expert judgments and a goodness-of-pronunciation baseline. This supports investigating acoustic models with expert labels; it does not validate our current alignment-derived percentages. [Automatic Analysis of Pronunciations for Children With SSD, 2018](https://pubmed.ncbi.nlm.nih.gov/29628620/)

wav2vec 2.0 demonstrates learning speech representations from unlabeled audio followed by supervised fine-tuning. Such an encoder is a candidate feature extractor. Its general speech recognition results do not establish pediatric clinical validity, and any specific checkpoint needs a separate license and population review. [Baevski et al., 2020](https://arxiv.org/abs/2006.11477)

Federated learning offers distributed model training through aggregation, but does not by itself establish child privacy, remove consent requirements, or solve incorrect labels. Defer it until centralized, consented training and validation work reliably. [McMahan et al., 2017](https://proceedings.mlr.press/v54/mcmahan17a.html)

### Data rights and privacy

TalkBank access does not imply permission to train a commercial product. Its usage rules impose restrictions; assess the specific corpus, media, consent, training rights, redistribution rights, and intended deployment before use. Public availability is not a license clearance. [TalkBank usage rules](https://talkbank.org/0share/rules.html)

For US deployments, the FTC treats children's voice recordings as personal information under applicable COPPA rules. The narrow voice-command exception should not be assumed to cover retained speech training datasets. Establish jurisdiction-specific review before collection; US guidance does not resolve obligations elsewhere. [FTC COPPA guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)

Evidence limitation: research above includes official guidance, primary research abstracts and technical documentation. It is a targeted evidence review, not a systematic review or clinical endorsement. Obtain full study protocols and licensed SLP review before choosing a treatment protocol or claiming efficacy. All numeric product targets below are proposed engineering gates, not published clinical norms.

## 3. Baseline code assessment

The commit connects React recording to Laravel `/api/v1/slp/assess`, which forwards to Python `/v1/assess`. It adds authentication/rate limiting, bounded uploads, timeouts, response validation, and child-neutral practice wording. Recent fixes establish multipart transport and Windows dependency compatibility. These are useful foundations.

| Finding                                               | Evidence in baseline                                                                                                                              | Required action                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Phoneme identity is lost                              | `core/phonemization.py` maps multiple IPA vowels to the same letter, splits digraphs into characters, and filters by the aligner's text inventory | Preserve original phones and pronunciation variants; use a phone-capable acoustic model for phone judgments        |
| Text alignment is treated as pronunciation assessment | `core/alignment.py` sends transformed IPA letters to MMS_FA                                                                                       | Use supported normalized text for word timing only; establish a separate phone assessment path                     |
| Score scale mismatch                                  | Installed TorchAudio 2.8 aligner exponentiates alignment scores to probabilities; `core/scoring.py` applies a sigmoid centered at -3.4            | Add explicit score semantics and remove uncalibrated accuracy claims                                               |
| Narrow score dynamic range                            | With defaults, inputs 0..1 map to approximately 94.7..97.7 before duration/CER penalties                                                          | Show this in a reproducible score audit; low results can be dominated by global penalties                          |
| ASR errors penalize every unit                        | `score_phoneme` multiplies scores by `1 - CER`, clipped to range                                                                                  | Keep transcript agreement separate from acoustic target evidence                                                   |
| Wrong text can be forced onto audio                   | `_select_alignment_text` falls back to reference text on larger disagreement                                                                      | Return task mismatch/uncertain status; avoid deriving confident correctness from forced fit                        |
| Invalid words disappear                               | Broad exception handling skips words and logs their text                                                                                          | Report safe failure codes; preserve expected-token coverage and remove word logging                                |
| Output lacks provenance                               | DTO has no model, calibration, or schema version                                                                                                  | Version the contract and all model artifacts                                                                       |
| Runtime success is fragile                            | Compatibility fixes needed for PyAV, SoundFile, FFmpeg, eSpeak and Starlette status names                                                         | Lock tested runtime, validate native dependencies at startup, add a clean-install decode/phonemize/inference check |
| Child interface is assessment-form oriented           | Default tongue twister, text field, recording controls and result tables                                                                          | Introduce one-target activities with pictures, audio examples, replay, and adult review                            |

MMS_FA's model weights are documented under CC-BY-NC 4.0; intended deployment requires explicit rights assessment. TorchAudio's forced-alignment stack is also undergoing retirement. Record a replacement decision before production deployment. [MMS_FA documentation](https://docs.pytorch.org/audio/2.7.0/generated/torchaudio.pipelines.MMS_FA.html) and [forced alignment documentation](https://docs.pytorch.org/audio/stable/tutorials/forced_alignment_tutorial.html).

## 4. Proposed measurement design

### Pipeline

1. Authenticate, enforce encoded-byte cap, inspect container/codec, decode in an isolated process, and enforce decoded duration/channel/sample-rate/memory bounds.
2. Assess capture quality: silence, clipping, insufficient speech, background interference and multiple-speaker uncertainty. Reject or abstain with an actionable recording message.
3. Load an immutable prompt version containing language/dialect, word, target phone, position, approved pronunciations, and clinician-approved cue assets.
4. Run ASR for task agreement and optional transcript display. It supplies context, never a ground-truth phone label.
5. Obtain timing through a supported text aligner; explicitly distinguish grapheme/word timestamps from phone timestamps.
6. Compare a phone recognizer or target-conditioned acoustic model with expected pronunciation alternatives. Model omissions, substitutions, insertions and distortions separately where training evidence supports them.
7. Calibrate predictions on held-out children. Emit supported predictions or `uncertain`; avoid fabricated scores for absent/unreliable segments.
8. Map reliable results to a bounded library of clinician-reviewed cues. Unsupported error types receive neutral replay/retry/review guidance.

Begin with a narrow target inventory selected with the clinical partner. Do not promise reliable distortion detection from a generic ASR phone inventory. Compare frozen encoder + simple classifier, GOP-style baseline, and fine-tuned phone recognition before selecting complexity. Fine-tune a neural encoder only if speaker-independent evidence shows meaningful improvement over the simpler model.

### Versioned result contract

Introduce an explicitly versioned internal assessment DTO and a coordinated Laravel/client migration. Suggested fields:

- `schema_version`, `assessment_id`, `request_id`, `prompt_version`, `model_version`, `calibration_version`.
- `status`: `completed`, `unscorable`, `task_mismatch`, or `review_required`.
- `quality`: machine-readable flags, decoded duration, scorable coverage; no diagnostic conclusion.
- `targets[]`: expected IPA, accepted alternatives, time span, observed candidate or null, supported error class or null, calibrated confidence or null, and cue identifier.
- `summary`: attempted targets, scorable targets, and supported matches. Any denominator excludes abstentions and remains visible to adults.
- `learning_eligible`: derived from consent and workflow state; never supplied as trusted client authorization.

Keep empty result arrays valid; distinguish missing fields, null values, and unknown predictions. Enforce finite numbers, maximum collection sizes, valid timestamps and known enums on both sides. Never translate low ASR agreement into a global pronunciation percentage. Maintain compatibility through an explicit adapter while the old UI migrates; remove it after all callers switch.

### Runtime improvements

Keep Laravel as the public boundary. Python gets no browser cookies or direct database credentials. Use a bounded worker process with a hard end-to-end deadline and kill/restart recovery; coroutine/thread cancellation alone is insufficient. Initially preserve the proposed 10 MiB / 60-second limits and 40-second Python budget from the existing spec, then measure supported hardware before promising latency. Readiness must verify native decoders, eSpeak when needed, model artifacts and a tiny functional probe. Freeze model revisions/checksums and prohibit request-time downloads.

Log safe codes, request IDs, latency, model versions and aggregate counts. Remove spoken words, transcripts, references, credentials and recording paths from normal logs. Add distinct internal reasons for dependency unavailable, decoder failure, task mismatch, inference failure and invalid DTO while keeping public messages safe.

## 5. Self-learning with review and rollback

### Three separate learning mechanisms

| Mechanism                  | Initial implementation                                                                                                           | Control                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Practice personalization   | Transparent rules choose among clinician-approved prompts using recent reviewed performance, fatigue/retry signals and cue level | Clinician sets targets and can override every suggestion                  |
| Acoustic model improvement | Batch supervised training from consented, adjudicated labels                                                                     | Frozen datasets, independent evaluation and approved release              |
| Representation learning    | Optional self-supervised adaptation using eligible child speech                                                                  | Separate experiment; compare to frozen encoder and audit subgroup effects |

No automatic treatment-plan changes, global weight updates during inference, or reinforcement learning that optimizes session duration. Repeated attempts and time-on-task do not establish sound correctness.

### Data and annotation workflow

Introduce opt-in training consent separately from receiving practice. Support withdrawal, recording deletion, child assent where appropriate, and caregiver access boundaries. Retain audio only for a documented purpose and interval. Store encrypted audio in private object storage with short-lived access URLs; store metadata/consent/annotation state through Laravel. Voice is identifying even after names are removed.

Proposed entities: `practice_assignments`, `prompt_versions`, `assessment_attempts`, `recording_assets`, `consent_records`, `annotations`, `dataset_manifests`, `model_releases`. Link child access to verified caregiver/clinician relationships; existing adult self-assessment access is insufficient authorization for child records.

Each labeled item records prompt/phone context, original recording quality, language/dialect profile, age band, elicitation/cue conditions, model version, observed production, error category and annotator confidence. Use two independent SLP ratings for the evaluation set and a sampled training subset, with adjudication and an uncertainty option. Measure inter-rater agreement before treating labels as ground truth. Do not use parent reward clicks or model predictions as equivalent to SLP judgments.

### Offline improvement loop

1. Select eligible recordings only after consent and retention checks.
2. Sample uncertain and diverse examples for annotation, plus a random sample to measure selection bias. Cap repeated contributions from one child.
3. Freeze a dataset manifest and split by child; keep family/site groupings together where feasible. Never split individual attempts randomly across train/test. Include an unseen-prompt test and a later external-site cohort.
4. Train baseline and candidate models on training data only. Choose hyperparameters on validation data; calibrate on a separate partition or a documented nested procedure.
5. Evaluate the untouched test set; document error analysis and subgroup uncertainty.
6. Run candidate predictions in shadow mode, invisible to children's feedback. Review disagreement cases without silently using the test set for tuning.
7. Release a signed/versioned artifact after clinical and engineering review. Maintain prior artifacts for rollback and version every historical result.
8. Monitor input distribution, abstentions and reviewed error rates. Trigger investigation before retraining. A drift alert does not authorize automatic deployment.

Deletion must propagate to recordings, annotation exports, dataset manifests, and future training eligibility. Track whether a released model used withdrawn data; define retraining/remediation policy rather than claiming deletion of a file removes its influence from model weights. Federated learning and differential privacy remain separate research options with explicit utility/privacy evaluation.

## 6. Interactive frontend for children

Proposed theme: a small exploration journey where each completed practice turn helps a character collect story pieces. This is an interaction hypothesis to test with children, not an evidence-backed therapy protocol.

Flow: choose an assigned activity → see a familiar picture → tap **Listen** → tap **My turn** → record → replay if desired → receive one brief cue → choose **Again**, **Next**, or **Break**. Use clinician-approved recorded exemplars matched to the selected linguistic profile. Do not assume generic TTS produces every target sound accurately enough for instruction.

Start with a clinician-selected single word rather than the default tongue twister. Optional phrase/story levels reuse approved vocabulary. Add contrast-listening activities only when assigned for the relevant treatment goal. Clearly separate listening activities from production scoring.

Use explicit states: `idle`, `listening`, `requesting_permission`, `recording`, `reviewing`, `uploading`, `analyzing`, `feedback`, `retry`, `paused`, `finished`. Only one recording/request can be active. Stop microphone tracks and release object URLs on navigation, cancellation and component unmount. Do not record while an exemplar plays. Preserve the attempt locally for an explicit retry after a network error; prevent duplicate server attempts with a scoped idempotency identifier if persistence is introduced.

Child feedback examples: “Thanks for trying!”, “Let's listen once more”, and “That was hard for me to hear. Let's try somewhere quieter.” A low-confidence model output must not say the child pronounced a sound incorrectly. Clinician-approved placement cues can be shown only for supported targets and validated decisions.

Reward participation and chosen practice goals. Avoid public rankings, lost streaks, punitive sounds, forced repetitions and rewards tied to an unvalidated accuracy percentage. Include caregiver-controlled session length, optional sound/reduced-motion settings, accessible replay controls and an always-available break. A proposed five-turn activity is a usability starting point; the clinician determines dosage.

The adult view shows target, cue level, recording replay when consent permits, scorable coverage, uncertainty, review state and progress on comparable prompts. Keep a separate clinician review workspace for annotations and assignment changes. Progress charts must distinguish model-version changes from within-child changes and distinguish practiced-item improvement from generalization.

## 7. Validation and release gates

| Area               | Evidence required before release                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Clinical labels    | Written annotation protocol, agreement estimates, adjudication process and coverage of intended targets/populations                 |
| Measurement        | Per-class precision/recall, confusion matrices, calibration/Brier score, abstention coverage and error rate on retained predictions |
| Generalization     | Child-independent and external-site results; device/noise/age/language/dialect strata with confidence intervals                     |
| Safety of feedback | SLP audit of false corrective feedback, false reassurance, and unscorable recordings; explicit per-target thresholds                |
| Learning           | Candidate improves predeclared primary metric without unacceptable subgroup regressions; fixed baseline and rollback available      |
| Therapy outcomes   | Blinded human-rated untrained probes and delayed retention; participation/intelligibility outcomes appropriate to the protocol      |
| Usability          | Child/caregiver completion and confusion observations, optional breaks, keyboard/screen-reader and real-device recording checks     |
| Operations         | Clean Windows/Linux install, authenticated upload, malformed media, deadline/worker death recovery, concurrency and deletion checks |

Set numerical clinical acceptance thresholds with the SLP partner before the evaluation set is unblinded. A provisional engineering goal is at least 95% precision for corrective feedback on retained predictions; validate whether this is achievable at useful coverage, report confidence intervals, and withhold automatic correction if it is not. This is a proposed risk threshold, not a clinical standard. Determine sample size using target prevalence, desired interval width and clustering by child; thousands of attempts from a few speakers are not an adequate generalization sample.

Proposed interaction target: feedback within 3 seconds at p95 for short single-word clips on named deployment hardware. Benchmark it; preserve explicit progress/cancel states and hard deadlines if hardware cannot meet it. Do not increase worker concurrency without measured memory and latency budgets.

## 8. Implementation sequence and ownership

| Phase                     | Work and likely locations                                                                                                                 | Dependencies                            | Acceptance / owner                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| P0: scope and evidence    | Confirm cohort, linguistic scope, clinical protocol, consent jurisdiction and rights; reconcile this plan with `SPEC-phoneme-analysis.md` | Clinical partner and deployment context | Written scope and evidence register; product + SLP + privacy lead                         |
| P1: stabilize service     | `py/pyproject.toml`, lock/image/model manifest, startup dependency checks, worker supervision, safe errors/logging                        | P0 runtime decision                     | Reproducible startup and bounded failure recovery; backend/ML engineer                    |
| P2: correct semantics     | `core/phonemization.py`, `alignment.py`, `scoring.py`, DTO and scientific fixtures                                                        | P0 target inventory; P1                 | Phone/text distinction, explicit score scale, abstention and versioned contract; ML + SLP |
| P3: establish baseline    | Rights-cleared pilot corpus, annotation protocol, simple acoustic baseline and frozen evaluation                                          | P0 consent/rights; P2                   | Speaker-independent report and error audit; SLP + ML                                      |
| P4: deliver child flow    | `SlpAssessmentPage.tsx`, recorder hook, activity/prompt components, replay/feedback and adult summary                                     | P2 contract; reviewed prompt assets     | Real-browser child/caregiver usability and accessibility evidence; frontend + SLP         |
| P5: consented persistence | Laravel migrations/policies, asset lifecycle, annotation API, review UI                                                                   | P0 privacy decisions; P3 label protocol | Relationship-scoped access, withdrawal/deletion and audit evidence; backend               |
| P6: offline learning      | Dataset manifest, training/evaluation pipeline, calibration and model registry                                                            | P3 + P5 sufficient diverse labeled data | Candidate passes frozen evaluation and shadow review; ML + clinical reviewer              |
| P7: clinical pilot        | Controlled study with predefined outcomes, retention/generalization and subgroup monitoring                                               | P4 + P6 and approved protocol           | Evidence supports intended use; clinical/research lead                                    |
| P8: staged release        | Operational runbooks, supported artifacts, monitoring, rollback and user-facing limitations                                               | All gates                               | Signed release decision with explicit scope; engineering + clinical lead                  |

Implement each phase in reviewable slices of at most five changed files where practical. For P2, separate token inventory, score semantics, task-agreement handling and DTO migration. For P4, separate the recorder lifecycle, activity state machine, prompt content, feedback view and caregiver controls. P4 can be prototyped with clearly labeled fixture feedback while P3 runs; real automatic corrective feedback remains gated by validation.

Reconcile existing F1–F8 checklist items rather than checking them off because this plan exists. F6's transport integration is implemented; F1/F3/F4/F5/F8 remain substantive release work. Storage and self-learning add new tasks beyond those original gates. Do not silently add assessment results to SOAP notes.

## 9. Decisions still needed

- Intended age range, languages/dialects and therapy setting; named clinician responsible for content and evaluation.
- Deployment jurisdiction, guardian/child relationship model, recording retention and separate training consent policy.
- Commercial versus research deployment and licenses for model weights, datasets, exemplar audio and illustrations.
- CPU/GPU hardware, latency budget, clinical pilot staffing and sustainable annotation capacity.
- First supported sound contexts, excluded conditions, and minimum evidence before automatic corrective feedback.

Recommended first milestone: a reliable, consent-aware, clinician-assigned practice activity with clear uncertainty and replay, backed by a reproducible service and a written evaluation protocol. Add neural adaptation only after representative labels and held-out evaluation are available.

## Implementation record

- Started P2 coverage handling: phonemization now rejects an incomplete expected-word sequence instead of silently dropping failed words. Reference words are removed from these errors and logs. Unexpected programming errors propagate for diagnosis. Regression coverage verifies complete mappings, explicit failure, privacy, and unexpected errors; all nine existing/new Python tests pass.
- P1 runtime increment implemented: warmed spawn-based ASR worker, hard inference wait deadline with process termination/recovery, shutdown cleanup, single admitted request per app process, forced WAV/WebM decode and bounded canonical PCM validation. Local-only model loading prevents downloads during inference/recovery. Startup checks FFmpeg. Native FFmpeg + cached Whisper smoke passed with synthetic audio. Full resource limits, immutable artifact manifests and deployment image remain open.
- P2 conservative contract implemented: version 2 reports transcript agreement only, explicit review/mismatch/unscorable status, language, unverified model identity and no training eligibility. Active requests bypass MMS_FA/heuristic scores. Laravel validates version-2 uncertainty invariants and rejects corrective-score payloads. Empty legacy arrays/unknown status are a migration envelope; placeholder zeros must not be displayed as measured scores. Calibrated phone recognition remains open.
- P4 proof-of-concept activity implemented: garden picture prompts, English/Filipino words, optional custom phrases, focus mode, record/replay, cancellation, breaks and participation progress. Caregiver/helper details explain scope and uncertainty. Permission cancellation, late responses and media cleanup have regression tests. No clinician-reviewed exemplar audio or corrective cues are bundled; a helper models the word.
- P6 dataset groundwork implemented: strict curator-export schema and eligibility checks for consent/withdrawal, duplicate recordings, speaker/group split leakage, separate calibration/test partitions, and independently reviewed/adjudicated evaluation labels. This is validation infrastructure, not neural training or proof of actual consent.
- Verification: 39 Python tests; 11 Laravel proxy feature tests; 11 SLP client tests; client typecheck/lint and production build; headless browser checks at 1440/768/390 pixels for language selection, synthetic-microphone recording, replay and break cleanup, with zero runtime errors/overflow. Native worker/decoder smoke uses synthetic audio and establishes execution only, not clinical validity. Browser screenshots are in `artifacts/slp/`. Unicode agreement handling preserves Filipino accented letters and canonical equivalents.
- Deferred by confirmed proof-of-concept scope: P3 labeled clinical baseline, P5 consented persistence, neural training/promotion in P6 and clinical efficacy pilot P7. P8 production approval remains open. No model was trained on user recordings and no database migration was introduced.

## 10. Decisions

- Intended age range is 2-18 (for children), language support Filipino and English for current implementation, any clinician is responsible for content and evaluation.
- Follow standards (for now this is local development), as long as patient has account, retention is within 5 years, add placeholder training consent for now
- For commercial vs research deployment (suggest a recommendation for this one)
- suggest a recommendation for this one (cpu,gpu and so on)
- Suggest a recommendation for supported sound contexts and so on
