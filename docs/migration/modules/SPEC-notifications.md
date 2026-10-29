# Spec: notifications

Status: proposed. Depends on: identity, platform. Inherits [common conventions](../ARCHITECTURE.md). Addresses audit 5, 13, 14, 17, 18.

## Objective and current scope

Preserve current-user inbox/list/read, administrator manual send and live updates for bookings/transitions/SOAP. Sources: notification routes/service/templates/ws hub, domain call sites, custom Prisma Notification model, `client/src/lib/notificationClient.ts`, notification API/hook/list. Existing Notification is a custom table, not Laravel's default polymorphic notification schema.

## Specification

- Retain custom `notifications` inbox with string ID/user ID/type/title/message/entity/read/timestamps. Use a `UserNotification` model if needed to avoid confusion with Laravel Notification classes. Laravel mail notifications may be used separately; do not point stock database notification APIs at this incompatible table.
- List only current user's rows with pagination, unread filter and stable timestamp/ID order. Read marker scopes by owner, is idempotent and returns 204. Manual create is admin-only, validates active recipient/type/entity, writes audit and returns 201; never exposes clinical note/intake bodies.
- Business modules write minimal outbox intent in their own transaction. Consumer claims leased rows, writes inbox idempotently by unique event/recipient delivery key, then broadcasts an ID/type invalidation event. Store inbox row and delivery state consistently; recover a crash after inbox insertion and before broadcast by retry/refetch. No exactly-once broadcast promise.
- Mail delivery uses a distinct delivery key/channel and retry status so a mail retry does not recreate inbox items. Failed attempts are visible with redacted errors and retry budget. Durably recover pending intents even if the queue broker was unavailable immediately after commit.
- Reverb/Echo private `users.{id}.{access_epoch}` channel, authorized via cookie/session identity and active state. Remove raw session-token and shared custom join-token authentication. Channel authorization alone does not revoke an existing subscriber: advance access epoch on suspension/logout-all, stop publishing to the old epoch and deny old-epoch subscriptions. Reconnect fetches current descriptor and full inbox.
- Live delivery is advisory; REST remains the source of truth. Client deduplicates by notification ID, refetches after reconnect and clears all singleton/user query state at identity change. HTTP writes use CSRF-aware client rather than current raw fetch paths.

## Acceptance and verification

Owner-only read/list; valid/expired/revoked/suspended subscription matrix; other-user channel denial; two-instance delivery; duplicate/out-of-order broadcast; reconnect replay; mailbox/worker outage; crash after insert before broadcast; no private content in event payload. Verify `php artisan test --filter=Notification`, a real Reverb client integration test and browser switching accounts without stale inbox data. Use Redis/Reverb for process tests rather than a local map mock alone.

## Task plan

1. **N1 — Durable inbox API.** Dependency: I2/P3/P4. Files: inbox migration/model, controller/request, Resource, feature test (max five; split route registration). Acceptance: read/list/manual-send contracts and owner/admin policies. Verify: `php artisan test --filter=NotificationInbox`.
2. **N2 — Recoverable outbox delivery.** Dependency: N1/P3. Files: delivery job, scanner command, console schedule, outbox model change, feature test (five). Acceptance: lease recovery, unique inbox rows, retry budget and failure visibility. Verify: `php artisan test --filter=NotificationDelivery` with injected process/failure checkpoints.
3. **N3 — Authorize private delivery.** Dependency: I2/N2/P5. Files: channels, channel descriptor/controller, broadcast event, epoch/revocation integration, integration test (five per slice). Acceptance: only active recipient gets new-generation events, including across instances. Verify: private-channel/Reverb integration checks.
4. **N4 — Connect client inbox.** Dependency: N1/N3/I8. Files: notification client, API, hook, list reader, client test (five). Acceptance: CSRF writes, ID dedup/refetch and identity reset. Verify: client tests/typecheck and browser reconnect/account-switch workflow.

## Exclusions

No new push/SMS provider or notification-preference engine. Delivery failures must be observable; do not preserve swallowed errors as intended behavior. Manual send remains explicitly administrator-controlled.
