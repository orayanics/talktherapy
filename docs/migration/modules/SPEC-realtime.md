# Realtime sessions

Status: implemented; multi-instance revocation, TURN, and two-browser evidence remain.

## Scope

- Accepted appointment participants receive session descriptors.
- Reverb channels require active, verified participant sessions.
- Signalling validates participant, target, generation, and message bounds.
- WebRTC media remains peer-to-peer or TURN-relayed.
- Chat is ephemeral and never persisted as clinical data.

## Evidence

- `RealtimeSessionTest` and Reverb configuration tests pass.
- The client room hook uses Echo/Reverb transport.

## Remaining gates

- Verify revocation across workers and account transitions.
- Verify TURN credentials, media cleanup, and separate-network calls.
