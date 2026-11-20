# Notifications

Status: implemented; browser delivery and reconnect evidence remain.

## Scope

- Users receive owner-scoped in-app notifications.
- Read markers are idempotent and owner-authorized.
- Administrators can send validated notifications.
- Email and inbox delivery use transactional outbox intents.
- Preferences apply separately to in-app and email delivery.
- Echo/Reverb updates prompt safe cache refreshes.

## Evidence

- Inbox, delivery, preference, and realtime tests pass.
- Client notifications live under `client/src/modules/notifications`.

## Remaining gates

- Verify Mailpit delivery, reconnect, and account switching in a browser.
- Add scheduled reminders and security notifications.
