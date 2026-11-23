# Notifications

Status: implemented; browser delivery and reconnect evidence remain.

## Scope

- Users receive owner-scoped in-app notifications.
- Read markers are idempotent and owner-authorized.
- Administrators can send validated notifications.
- Email and inbox delivery use transactional outbox intents.
- Preferences apply separately to in-app and email delivery.
- Echo/Reverb updates prompt safe cache refreshes.

## Local email previews

With `APP_ENV=local` and `MAIL_PREVIEWS_ENABLED=true`, open `/email-previews` on the Laravel server. Both the catalog and direct sample pages return 404 unless both settings apply.

The catalog groups 15 fictional samples by workflow. Each shows the subject and rendered notification. Opening a sample requires no patient records, sends no mail, and issues no credentials. The password reset sample uses Laravel's reset email with a fictional destination.

## Evidence

- Inbox, delivery, preference, and realtime tests pass.
- Client notifications live under `client/src/modules/notifications`.

## Remaining gates

- Verify Mailpit delivery, reconnect, and account switching in a browser.
- Add scheduled reminders and security notifications.
