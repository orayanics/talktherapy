# Clinical records

Status: implemented; browser workflow and PostgreSQL concurrency evidence remain.

## Scope

- Clinicians see only established completed-care relationships.
- Patients see their own SOAP records.
- Authors create and update SOAP records.
- Optional fields support explicit null clearing.
- Stale updates fail instead of overwriting newer records.

## Evidence

- Roster, read, create, and update feature tests pass.
- Client patients and SOAP modules handle stale-edit errors.

## Remaining gates

- Verify patient and clinician workflows in a browser.
- Verify concurrent updates on PostgreSQL.
