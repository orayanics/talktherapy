# Content

Status: implemented; browser workflow and PostgreSQL concurrency evidence remain.

## Scope

- Authenticated users browse content and diagnosis filters.
- Administrators create, edit, archive, and delete content.
- Tags are normalized and author-scoped.
- Bookmarks are actor-scoped and idempotent.
- Rendered content uses explicit sanitization.

## Evidence

- `ContentReadTest`, `ContentWriteTest`, and `ContentBookmarkTest` pass.
- Client content components and query options live under `client/src/modules/content`.

## Remaining gates

- Verify malicious markdown fixtures in the browser.
- Verify concurrent bookmark writes on PostgreSQL.
