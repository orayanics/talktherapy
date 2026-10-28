# Spec: clinical-records

Status: proposed. Depends on: appointments. Inherits [common conventions](../ARCHITECTURE.md). Addresses audit 3, 14, 15, 17, 18. Decisions D6 and D8.

## Objective and source scope

Preserve completed-care patient roster and SOAP create/read/update. Sources: `clinicianPatient` and `soaps` modules, Prisma care/Soap models, `client/src/api/records.ts`, patient and records routes/forms. SOAP contains no appointment foreign key or delete route. Keep historical records independent of an invented appointment association.

## Specification

- Roster `GET /api/v1/patients` is clinician-only and scoped to their existing ClinicianPatient pair. Patient projection contains only required display fields. Search/sort/pagination use common conventions, replacing the current incompatible `page/count` metadata.
- Proposed access: patient reads own notes; an active verified clinician reads/creates notes only for their established completed-care relationship; author alone updates their note. Clinicians on another care pair do not automatically share access. Admin/superadmin have no blanket clinical privilege. Confirm patient visibility/team-sharing policy before implementation.
- SOAP fields: activity_plan required nonempty, optional nullable session_type, subjective_notes, objective_notes, assessment, recommendation, comments; IDs, author and timestamps server controlled. Proposed caps: session_type <=100, each note field <=20000 characters. Store plain text unless the existing UI contract explicitly requires markdown; no executable HTML rendering.
- PATCH distinguishes omitted from explicit null; null clears only nullable fields. Reject null activity_plan. Require a current version/updated timestamp on edit or use a version integer; stale concurrent edits return 409 to prevent silent overwrite. Import sets version 1 without claiming historical revision history.
- Create/update/audit/outbox intent commit together. Notifications link to an authorized resource and contain no note text. Log clinical access metadata where required without note payloads. No note deletion/hard cascading user deletion.
- Care-pair creation remains owned by appointment completion, not a freely writable roster endpoint. Reject source inconsistency where a note/pair references a nonpatient/nonclinician account; report it during import.

## Acceptance and verification

Matrix: self patient, other patient, author clinician, related nonauthor clinician, unrelated clinician, administrator, unauthenticated and suspended user. Test list/detail/create/update independently. Verify explicit null clearing, required activity plan, stale edit conflict, relationship uniqueness, transactional failure and no note fields in telemetry/notifications. Commands: `php artisan test --filter=ClinicalRecord`, client records tests/typecheck and browser patient/clinician workflows.

## Task plan

1. **R1 — Scope completed-care roster.** Dependency: A6/P4. Files: roster request/controller, patient Resource, routes, feature test (five). Acceptance: only caller's pairs with correct metadata and filters. Verify: `php artisan test --filter=ClinicalRoster`.
2. **R2 — Implement authorized SOAP reads.** Dependency: R1. Files: SOAP schema/model, policy, Resource/controller, feature test (max five; split controller separately if needed). Acceptance: clinical denial matrix and no accidental admin access. Verify: `php artisan test --filter=ClinicalRecordRead`.
3. **R3 — Create related-patient SOAP.** Dependency: R2/P3. Files: SOAP request, create Action, controller/routes, feature test (five). Acceptance: patient relation/author validated and audit/intent atomic. Verify: `php artisan test --filter=ClinicalRecordCreate`.
4. **R4 — Update with conflict protection.** Dependency: R3. Files: update request, update Action, version migration/model update, feature test (five). Acceptance: author-only, null semantics and stale 409. Verify: `php artisan test --filter=ClinicalRecordUpdate`.
5. **R5 — Connect clinical consumers.** Dependency: R1-R4. Files: records API, SOAP schema/hook, list/detail/update readers and client tests in <=five-file batches. Acceptance: correct pagination/fields, denied access and stale edit recovery shown. Verify: typecheck/build and two-clinician/one-patient browser checks.

## Exclusions

No EHR integration, note signing/revision history, new shared-care policy, administrator note override or automatic conversion of inference output into a clinical assessment. Retention and any future amendment/erasure flow need an explicit policy.
