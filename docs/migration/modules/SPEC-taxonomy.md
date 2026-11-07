# Taxonomy

Status: implemented and locally verified.

## Scope

- Diagnosis catalog supports registration, content, scheduling, and appointment filters.
- Public reads return identifier, label, value, and active state.
- Administrators manage diagnosis records through authenticated CRUD routes.

## Evidence

- `DiagnosisTest` covers reads, validation, authorization, and state changes.
- Client diagnosis filters and forms use the API module in `client/src/modules/diagnoses`.

## Remaining gates

- Verify diagnosis workflows in a deployed browser.
