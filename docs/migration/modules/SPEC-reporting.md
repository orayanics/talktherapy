# Reporting

Status: implemented; queued-export and deployment evidence remain.

## Scope

- Administrators view aggregate dashboard statistics.
- Audit lists are filtered, paginated, and actor-scoped.
- CSV, JSONL, and spreadsheet exports use bounded filters.
- Export authorization matches audit-list authorization.
- Clinical payloads and credentials remain excluded.

## Evidence

- `ReportingTest` covers aggregates, filters, authorization, and exports.
- Client reporting and logs live under `client/src/modules/dashboard` and `client/src/modules/logs`.

## Remaining gates

- Verify large queued exports and download cleanup.
- Verify exports in a deployed browser.
