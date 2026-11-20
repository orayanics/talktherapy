# Assessment platform specification

Status: deferred design. This specification requires explicit clinical, privacy, and consent approval.

## Contracts

- Laravel owns consent, access, recording metadata, review, and report revisions.
- Private storage keeps recordings encrypted and access-controlled.
- Reviewers approve immutable revisions before reports become available.
- Reports preserve protocol, denominator, missing data, uncertainty, and provenance.
- Patients receive only clinician-released results.
- Revisions never write diagnoses or SOAP records automatically.

## Release requirements

- Guardian consent and withdrawal flows are implemented and audited.
- Audio access is short-lived, scoped, logged, and revocable.
- Evaluation splits keep each child in one partition.
- Metrics are validated against clinician-reviewed fixtures.
- Model versions, licenses, and calibration data are recorded.
