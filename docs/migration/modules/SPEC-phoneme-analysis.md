# Phoneme analysis

Status: implemented as bounded, non-diagnostic practice feedback.

## Scope

- Laravel authenticates and rate-limits assessment requests.
- Uploads are size-limited and forwarded privately to Python.
- Python performs bounded decoding and transcription.
- Results expose transcript agreement and uncertainty states.
- Recordings and results are not retained by the practice endpoint.

## Evidence

### Assigned exercise clients

Deploy the assignment client and Laravel API together. New recording consent requests require explicit `accepted: true`, purpose `slp_recording`, and policy version `v1`. Patients can withdraw their recording consents from My assignments to prevent queued analysis from starting.

Assignment uploads accept WAV and WebM up to 10 MiB, including WebM identified as `video/webm`. Clients sending MPEG, MP4, or larger files must switch formats before rollout. Assignment creation rejects nonempty `schedule` metadata. Existing schedules remain readable and have no effect on availability or reminders.

- Laravel `PhonemeAssessmentTest` covers proxy boundaries and failures.
- Python tests cover decoding, readiness, worker isolation, and response models.

## Remaining gates

- Hash-lock dependencies, model artifacts, and system packages.
- Replace deprecated alignment components before production.
- Measure resource budgets and obtain licensing and clinical review.
