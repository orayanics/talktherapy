# Functional module specifications

## slp-content

Objective: clinicians customize assessment material without code changes; administrators maintain the shared library without gaining clinical authority.

| Operation | Clinician | Admin | Superadmin |
| --- | --- | --- | --- |
| Create/read/update/delete own draft exercises and assets | Yes | Yes | Yes |
| Edit another clinician's private content | No | No by default | Audited administrative intervention; no clinical approval implied |
| Copy published shared content to own draft | Yes | Yes | Yes |
| Manage shared catalog, archive/unpublish | Submit changes | Yes | Yes |
| Approve clinical content/protocol | Explicitly designated qualified reviewer | Only with independently verified reviewer permission | Same |
| Publish clinically reviewed shared version | Own approved version through publication permission | Yes | Yes |
| Assign exercises/review patient results | Linked assigned patients | No role-based access | No role-based access |
| Change deployment bounds/model enablement | No | No | Yes, subject to release gates |

Support text, original/licensed images and audio stimuli, task instructions, language/dialect, age suitability, target duration, quality profile, scoring-output allowlist, target inventory and optional clinician notes. Do not let editable `slp_editable_fields` grant arbitrary server privileges: use a server-defined allowlist. Private clinician content may be self-reviewed by a qualified clinician, with that provenance visible; shared catalog publication requires a second qualified reviewer. Until such review exists, seed fixtures stay draft and unavailable for live assignments.

English and Filipino/Tagalog are separate versioned entries; translation alone does not qualify an item for publication. Store a relation between language variants but never imply equivalent phoneme inventory or norms. Use `fil` for Filipino content metadata where appropriate and explicit model capability mapping to `tl`; never silently treat all Philippine languages as Tagalog. Code-switching/unsupported dialect yields unsupported/uncertain analysis rather than an impairment label.

Acceptance: clinicians can create, preview, edit, copy and archive owned content; another clinician cannot mutate it; admin catalog changes require clinical review; existing assignments retain exact prompt/config after editing; publication rejects missing rights, language review or incompatible outputs. UI includes revision history, preview and clear archive/reference warnings.

## slp-capture

Objective: a patient completes a clinician-assigned task at home and submits usable audio with consent.

Patient flow: assignments → instructions and consent → microphone check → record/stop → replay/retry → explicit submit → completion/status. A caregiver may help physically; that does not grant account access or consent authority. A verified guardian relationship is required before delegated pediatric access. Do not add a new role casually to the existing four-role enum.

Assignment includes frequency, timezone, due dates and allowed attempts; frequency is clinician-selected, not a treatment prescription. Every retry is a separate attempt after submission. Before submission, discarded recordings remain local and object URLs/tracks are cleaned up. Avoid durable browser audio storage in v1. Unsupported MediaRecorder codec, denied microphone access, background interruption and offline upload failure have accessible recovery messages. Preserve the in-memory recording for retry while the page remains open, and warn before leaving with unsent audio.

State transitions: `created → uploaded → queued → processing → awaiting_review → approved`; quality/inference failures can lead to `needs_rerecord` or `failed`. Cancelled/expired/deleted are terminal for processing. Infrastructure failure can retry; invalid audio cannot. Lack of detector support routes usable audio to manual review, not automatic failure. Approval requires a reviewed result; a patient never advances that state.

Acceptance: unauthorized upload/replay/list access fails; missing/withdrawn consent blocks submission and work; duplicate submission cannot create duplicate jobs; corrupt/oversized audio is rejected safely; patients see encouragement/completion only, including when automatic analysis is disabled.

## slp-analysis

Objective: provide auditable candidate observations; a clinician remains responsible for interpretation.

### Phase 1: fluency and shared timing

Start with passage reading, clinician-selected rate variation, sentence repetition and pause-marked reading. Rate variation is optional and clinician assigned; never urge an uncomfortable user to continue. Reading tasks are not suitable for every age/literacy level; allow clinician-authored spontaneous-speech prompts with task labels and separate comparisons.

Choose `%SS` as a descriptive frequency measure, not SSI or a severity classification. Formula: `100 × reviewed stuttered syllables / reviewed total syllables`. Define a versioned counting manual: lexical syllable opportunities count once despite repeated attempts; a syllable with multiple stuttering behaviors counts once in the numerator. Store affected syllable IDs separately from acoustic event counts. Mark sound/syllable repetitions, prolongations and suspected blocks separately from interjections, revisions and phrase repetitions. Uncertain events stay unresolved until reviewed; numerator cannot exceed denominator. Sample denominator zero yields null, never zero percent.

The 300-syllable threshold is a provisional sample-sufficiency warning only. A short sample can be reviewed and reported with its exact denominator and warning; do not fabricate data to meet it. Split tasks remain separate unless the protocol explicitly permits pooling. Do not compare rate-variation tasks as treatment progress.

Report speech rate as reviewed syllables per minute of the selected utterance span, including internal pauses; articulation rate uses reviewed fluent syllables divided by the fluent articulation span, excluding annotated pauses/disfluencies under the versioned convention. Show both denominator durations and conventions. Compute speech-span boundaries with clinician correction; raw recording duration and voiced duration are not interchangeable. Acoustic pause durations can precede transcript review, but syllable/word rates require verified counts. VAD silence is a pause candidate, never proof of a block.

Use existing Python infrastructure for decoding and candidate timing, with a manual event editor first. A pretrained speech encoder plus event head is a later candidate, not a selected clinically valid model. Compare frozen encoder approaches before fine-tuning; license and intended population suitability are release gates. ASR is optional supporting material and must not erase repetitions or determine stuttering truth. Audio alone may not distinguish silent blocks from ordinary pauses; flag for clinician context and abstain where unsupported.

Release evaluation: independently annotated, consented/licensed data with participant-separated train/validation/test sets; report per-event precision/recall/F1, false alarms, duration overlap and blocks separately, sample counts, confidence intervals, inter-rater agreement and subgroup results by age/language/task/device. A qualified clinical lead must set acceptable thresholds before evaluating the held-out release set. Without that decision or adequate data, automated detection stays disabled; manual review remains usable. No online learning.

### Later phases (disabled in v1)

| Domain | Content and intended output | Additional gate |
| --- | --- | --- |
| Articulation, phase 2 | Picture naming and carriers; target-phone accuracy/error categories by language and word position | Approved phone inventory/pronunciation variants, age suitability, phone-level validated model; alignment confidence is not pronunciation accuracy |
| Aphasia, phase 2 | Description, retell, semantic fluency, repetition, completion; counts, lexical/syntactic measures, CIUs | Corrected transcript, language-specific scoring manual and trained CIU reviewers; ASR metrics hidden until correction |
| Voice, phase 3 | Add clinician-reviewed sustained vowel and connected-speech tasks; F0 and suitable acoustic measures | Calibrated capture protocol; ordinary browser amplitude is not dB SPL; jitter/shimmer only on suitable signal/tasks |
| Motor speech, phase 3 | AMR/SMR, multisyllabic words, rate/rhythm/stress and intelligibility sentences | Reviewed language/task protocol; intelligibility is listener-based unless a separate estimator is validated; no unsupported age norms |

Later domains reuse the contracts but need their own detailed protocol and release evidence before implementation. AAC, grammar/vocabulary coaching, diagnosis, severity labels and automatic therapy decisions remain excluded.

Acceptance: hand-annotated fixtures reproduce numerator/denominator and duration calculations; silence/zero denominator/overlaps/unknown language return explicit missing or uncertain results; all candidate outputs carry provenance; an unavailable detector cannot produce an apparent zero-stuttering score.

## slp-review

Clinician workspace: assigned review queue, waveform/audio playback, keyboard-accessible time selection, editable segment/event table, syllable/transcript correction, quality flags, missing-data reasons, model/version provenance and approval checklist. An accessible table is required even if a waveform widget is added. Preserve raw candidates; edits form a review revision. Resolve uncertainty or explicitly exclude it with a reason before approval. Approval recomputes metrics server-side atomically and records reviewer/time/protocol; stale concurrent approvals fail with 409.

Reports use deterministic templates first: task/language/date, sample size, recording quality, reviewed observations, exact metric conventions and limitations, clinician narrative and approval identity. Reports consume approved revision snapshots only. An amendment creates a new review/report revision and visibly supersedes the old one. Never write SOAP or diagnosis automatically. LLM drafting is deferred; if added later, accept only reviewed structured data and require clinician approval of generated prose before release.

Patients receive completion/encouragement; v1 reports remain clinician-facing. A separate future explicit clinician-release workflow can expose selected reports. Admins do not receive raw patient audio or observations merely because they manage content.

Longitudinal view groups by language, task, protocol/counting version, comparable stimulus and recording conditions. Mark changes and prevent default aggregate trend lines across incompatible groups. Show missing and insufficient samples; never treat failed attempts as zero scores or claim improvement from engagement alone.

Acceptance: no report from an unapproved/stale revision; patient responses contain no metric/transcript fields; corrections change derived counts reproducibly while preserving candidates; access revocation prevents subsequent playback; changed protocols visibly break comparability.

## Clinical grounding and limits

These are product and engineering decisions, not a validated assessment instrument. ASHA recommends comprehensive fluency assessment across situations and considers covert as well as overt behaviors; a recording frequency metric cannot represent the whole assessment. [ASHA fluency guidance](https://www.asha.org/practice-portal/clinical-topics/fluency-disorders/).

Voice assessment includes task-dependent acoustic and perceptual information; this proposal deliberately gates instrumental measurements behind a capture protocol. [ASHA voice guidance](https://www.asha.org/practice-portal/clinical-topics/voice-disorders/). Sources checked 2026-10-30. Neither source validates this application's thresholds or models. English/Filipino protocol approval, guardian workflow, deployment retention policy and model evaluation data remain release prerequisites, not assumptions that implementation can satisfy.
