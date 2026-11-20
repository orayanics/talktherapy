# Assessment module specification

Status: deferred design. Build modules only after the platform contract is approved.

## Planned modules

- Content: clinician-authored prompts, language, task, and protocol versions.
- Capture: consented recording, quality checks, cancellation, and temporary storage.
- Analysis: transcript, timing, and bounded task-specific measurements.
- Review: clinician corrections, uncertainty reasons, approval, and amendments.
- Reporting: deterministic summaries from approved revision snapshots.

## Measurement rules

- Never convert engagement into clinical improvement.
- Never treat missing data as zero.
- Never compare incompatible protocols without an explicit warning.
- Keep ASR uncertainty separate from pronunciation or fluency claims.
- Require clinical review before exposing assessment metrics.

## Exclusions

- No diagnosis automation.
- No automatic treatment decisions.
- No unsupervised corrective feedback.
- No retained recordings without approved consent and retention policy.
