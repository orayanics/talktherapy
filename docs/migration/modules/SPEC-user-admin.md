# User administration

Status: implemented; browser hierarchy and deployment evidence remain.

## Scope

- Administrators list users, details, role counts, and account status.
- Privileged invitations create pending accounts without plaintext temporary passwords.
- Suspension requires a reason and revokes sessions.
- Reactivation preserves audit history and requires authorization.
- Clinical permissions remain separate from account administration.

## Evidence

- `UserAdminReadTest`, `UserAdminWriteTest`, and `BootstrapSuperadminTest` pass.
- Client screens live under `client/src/modules/users` and `client/src/modules/register`.

## Remaining gates

- Verify role hierarchy and suspension flows in a deployed browser.
