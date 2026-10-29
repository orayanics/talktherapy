# Spec: reporting

Status: proposed. Depends on: user-admin, appointments, clinical-records, content. Inherits [common conventions](../ARCHITECTURE.md). Addresses audit 14, 15, 16, 18.

## Objective and source scope

Preserve administrator dashboard aggregates, audit list and CSV/JSONL export. Sources: `server/src/modules/admin/index.ts`, logs module, audit helper, Prisma AuditLog, client dashboard/log API and log list/detail/export. Domain audit writes are owned by their mutation transactions; this module reads and exports them.

## Specification

- Admin/superadmin only. Dashboard returns `data` with total users, counts by each role, appointment status and slot status. Use grouped aggregate queries with deterministic zero buckets, not one query per enumerated bucket. Counts do not include clinical bodies or identify patients unnecessarily.
- Audit Resource exposes ID, safe actor snapshot, action, entity reference, structured minimal details, request ID and timestamps. No credential, note, transcript, audio or referral payload. Protect audit retention from actor deletion; no update/delete API.
- Validate allowed date/sort/search/export fields and integer batch size (proposed cap 1000). One filter definition drives list/export so date/time/role semantics cannot drift. Import preserves malformed source details via quarantine/report rather than crashing every read.
- Export uses response streaming and bounded keyset/chunk traversal. Fix an export snapshot boundary (database-consistent snapshot or explicit stable creation-time/ID bound under append-only assumptions), deterministic ties and identical filters. Document concurrent-insert exclusion. Avoid offset pagination and collecting the entire output before responding.
- CSV neutralizes formula prefixes including whitespace/control-character variants before normal CSV escaping; test in a spreadsheet-compatible fixture. JSONL emits one valid JSON object per line and correct content type/filename. Client can download JSONL directly; do not accumulate and parse an unbounded file in browser memory to convert to a JSON array.
- Audit export access with actor, filters/count where safe, start/completion/failure/request ID. Record successful completion only when streaming finishes. No HTTP 200 proves the client received every byte; interrupted streams are recorded as interrupted. Apply bounded execution/rate budgets, and make very large asynchronous exports a future measured decision rather than an unrequested job system.

## Acceptance and verification

All nonadmin roles denied. Grouped counts match fixture rows and zero buckets. List/export use identical timezone-inclusive filters. CSV dangerous cells are inert, JSONL parses linewise, equal timestamps are stable, concurrent inserts don't duplicate/skip the snapshot, and a large synthetic dataset remains bounded. Audit row survives actor deactivation; stream failure writes failure metadata without false completion. Verify `php artisan test --filter=Reporting`, export memory/snapshot integration test, and client dashboard/log download tests.

## Task plan

1. **G1 — Aggregate dashboard counts.** Dependency: U1/A6. Files: stats controller, Resource/query, route, feature test (four). Acceptance: admin-only grouped counts/zero buckets. Verify: `php artisan test --filter=ReportingStats` and query count assertion.
2. **G2 — Read audit history.** Dependency: P3/domain audit writes. Files: log request/controller, Resource, routes, feature test (five). Acceptance: safe fields, shared filters and stable pagination. Verify: `php artisan test --filter=ReportingAudit`.
3. **G3 — Stream safe exports.** Dependency: G2. Files: export request/controller, CSV formatter, stream service, integration test (five). Acceptance: bounded memory/snapshot traversal, formula protection, JSONL and completion/failure audit. Verify: `php artisan test --filter=ReportingExport` with large synthetic rows and interrupted stream.
4. **G4 — Connect reporting consumers.** Dependency: G1-G3. Files: dashboard API, logs API, log types/reader, download hook, client test (five per batch). Acceptance: new fields/one envelope and direct CSV/JSONL download without unbounded JSON conversion. Verify: typecheck/build and browser aggregate/filter/download workflow.

## Exclusions

No clinical analytics, new warehouse, BI tool, dashboards for unrequested metrics or automatic audit erasure. Audit retention/redaction must follow the approved policy, not arbitrary source cascades.
