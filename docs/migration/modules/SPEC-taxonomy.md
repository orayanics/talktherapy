# Spec: taxonomy

Status: proposed. Depends on: platform. Inherits [common conventions](../ARCHITECTURE.md). Contract: `GET /api/v1/diagnoses` in [API contract](../API-CONTRACT.md).

## Objective and source behavior

Preserve the diagnosis catalog used for patient selection, clinician specialty and content filters. Sources: Prisma `Diagnosis`, `server/src/modules/public/{index,service}.ts`, diagnosis seed data, `client/src/api/public.ts`, registration/activation/content/book filter callers. A diagnosis relation uses its ID; current filters sometimes use its `value`. These meanings must not be interchanged.

## Specification

- `diagnoses`: preserved string ID, unique label/value, source creation timestamp. Public response: ID, label, value only; deterministic label/ID order. No mutation UI/API is currently implemented, so none is added.
- Import the real catalog before users and content. Seed synthetic/reference values idempotently only for a new installation; do not replace real data with the development seed.
- Validate diagnosis foreign keys on writes and use explicit `diagnosis_values[]` filters. Keep one clinician specialty relation initially; multiple specialties need a separate product/schema decision.
- Database uniqueness and server `exists` checks protect relations; a deleted reference may become null where the data contract permits, but an invalid incoming ID returns 422.

## Acceptance and verification

Catalog IDs/values survive import, public responses contain no personal information, invalid diagnosis IDs cannot create/activate a user, and content/slot filters work with values distinct from IDs. Verify from `api/`: `php artisan test --filter=Diagnosis`; client catalog consumers use the same TypeScript Resource shape.

## Task plan

1. **T1 — Migrate catalog and lookup.** Dependency: P4. Files: migration, `Diagnosis` model, controller, route registration, `DiagnosisTest` (five). Acceptance: stable read contract and unique keys. Verify: `php artisan test --filter=Diagnosis`.
2. **T2 — Seed/import reference mapping.** Dependency: T1. Files: reference seeder, import mapping, mapping fixture/test, `client/src/api/public.ts` (max five). Acceptance: a nonmatching ID/value fixture filters correctly; repeated seeding does not duplicate. Verify: focused mapping test and client typecheck.

## Exclusions

No taxonomy editor, new diagnosis claims, multiple-specialty pivot, or inference-to-diagnosis automation. Imported diagnosis choices are historical data, not clinically verified diagnoses.
