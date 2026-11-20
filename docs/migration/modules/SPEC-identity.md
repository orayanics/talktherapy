# Identity

Status: implemented; deployed-browser cookie and CSRF verification remain.

## Scope

- Laravel sessions replace the retired authentication runtime.
- Registration creates pending patient accounts with consent evidence.
- OTP activation uses expiring, hashed, attempt-limited challenges.
- Password recovery, password changes, email changes, and session revocation are implemented.
- Protected routes require active, verified accounts.

## Evidence

- Identity registration, activation, email, password, profile, and session tests pass.
- Client auth screens and guards live under `client/src/modules/auth`.

## Remaining gates

- Verify same-origin cookies, CSRF, redirects, refresh, and logout in a real browser.
- Keep credentials and challenge codes out of logs and jobs.
