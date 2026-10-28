# Spec: content

Status: proposed. Depends on: identity, taxonomy. Inherits [common conventions](../ARCHITECTURE.md) and [API contract](../API-CONTRACT.md). Addresses audit 4, 14, 17, 18.

## Objective and current scope

Preserve educational content list/detail/create/update/delete, diagnosis filters, author-scoped tags and personal bookmarks. Sources: `server/src/modules/content`, Prisma Content/Tag/Bookmark and `_ContentToTag`; client content API/forms/lists/detail renderer. Public reads are currently possible; propose verified-member reads because the existing UI places content behind authentication. Confirm public publication if it is actually required.

## Specification

- Tables: `contents`, `tags`, `content_tag`, `bookmarks`; existing IDs/timestamps remain intact. Content belongs to an author and optional diagnosis. Tags belong to an author and have unique `(author_id,slug)`. Content/tag and user/content bookmark pairs are unique.
- Admin/superadmin can create/update/delete content; patient/clinician cannot. Creator/actor is session-derived. No wholesale model filling. Author identity is immutable unless a separate reassignment workflow is approved.
- Validate title <=255, description <=2000, body <=100000 characters, diagnosis existence, and at most three tag names <=50 each (proposed consistent limits). Normalize/deduplicate tags and ignore no invalid slug silently: reject invalid tag names. Wrap content/tag/pivot writes and audit/intent in one transaction.
- Lists filter title/description search, diagnosis **values**, current-user bookmark state and sort/pagination. Select only current-user bookmark existence, never every bookmark row. Detail not found returns 404 rather than success/null. Explicit Resources expose required author display fields only.
- Bookmark PUT and DELETE are idempotent, actor-scoped and backed by unique pair constraints; no check-then-create race. `/bookmarks` uses the same content list representation. Other users' bookmark IDs cannot change ownership.
- Render markdown through explicit sanitization after raw HTML parsing, or disable raw HTML. Editor preview sanitization alone does not establish display safety. Do not use regex to sanitize HTML. Keep the installed renderer's supported safe path and test malicious attributes/links.
- Deleting content removes its tag pivot/bookmarks as expected but preserves audit evidence; it does not delete the author or shared tags. Clinical references never cascade through CMS operations.

## Acceptance and verification

Test role denial for all writes, public/member read policy, missing detail, own bookmarks, duplicate concurrent bookmarking, tag normalization/rollback, diagnosis value filtering, pagination and unsafe markdown rendering. Verify `php artisan test --filter=Content`; client content tests/typecheck/build plus browser render fixture. Fixture output contains no other readers' bookmarks.

## Task plan

1. **C1 — Read catalog/detail.** Dependency: I2/T1/P4. Files: content schema migration, models (two files initially; separate tags if needed), controller/Resource, feature test (split into <=five-file slices). Acceptance: imported relations and bounded member reads, filters and explicit projections. Verify: `php artisan test --filter=ContentRead`.
2. **C2 — Authorize/write articles.** Dependency: C1/P3. Files: content request, policy, write Action, controller change, feature test (five). Acceptance: admin-only transactional content/tag sync, valid null/omission behavior and durable audit. Verify: `php artisan test --filter=ContentWrite`.
3. **C3 — Personal bookmarks.** Dependency: C1. Files: bookmark migration/model, controller, routes, feature test (five). Acceptance: idempotent ownership-safe writes and paginated own list under concurrency. Verify: `php artisan test --filter=ContentBookmark` on PostgreSQL.
4. **C4 — Connect and safely render content.** Dependency: C2/C3. Files: client API, field types/schema, detail renderer, one hook group, render test (five per batch). Acceptance: new Resource fields/errors, consistent limits and explicit sanitization. Verify: typecheck, focused render test and browser create/filter/bookmark/edit/delete.

## Exclusions

No drafts/publishing engine, search service, HTML transformation on import, new asset uploads or tag administration module. Confirm member-only read behavior before exposing the replacement API.
