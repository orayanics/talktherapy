# TalkTherapy backend

This is the Laravel 13 API in `server/`; the React client is in `../client` and private speech inference is in `../py`. Legacy Bun reference code is in `../_server` and must not be restored into this application.

Follow `../tasks/phase-1.md`, the migration specs in `../docs/migration/modules`, and the user's decisions at the end of `../docs/migration/ARCHITECTURE.md`. Local database is SQLite; Redis client is Predis. There is no legacy data import or Bun password conversion. Use Laravel hashing and new UUIDs.

Use conventional Laravel controllers, Form Requests, explicit API Resources, policies and transactions. Business routes use `/api/v1`. Clinical access requires the actual patient/clinician relationship; administrator status does not grant clinical access. Do not exempt the API from request-forgery protection.

Keep audit and outbox intents in the business transaction. Do not log passwords, OTPs, clinical notes, transcripts or audio. Outbox delivery-only secrets must be encrypted and expire. Python remains a private bounded inference service, not the application backend.

Test changes using `php artisan test --compact` and format with `php vendor/bin/pint`. SQLite tests cannot prove PostgreSQL locking or multi-instance Redis coordination. Keep later-phase work pending until its evidence exists. Do not start production services or migrate a production database.
