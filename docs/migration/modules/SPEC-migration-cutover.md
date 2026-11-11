# Migration cutover

Status: legacy import retired; deployment tasks remain pending.

## Scope

- No legacy records or credentials are imported.
- Laravel, client, and Python release together.
- Deployment uses backup, restore, rollback, and observation gates.
- Legacy runtime references are removed only after global searches.

## Remaining gates

- Choose production database, Redis, proxy, domain, and TURN provider.
- Rehearse secrets, backups, restore, rollback, and monitoring.
- Verify the release candidate through browser and PostgreSQL checks.
- Retire unused legacy deployment references after the observation window.
