# Spec: realtime

Status: proposed. Depends on: appointments, platform. Inherits [common conventions](../ARCHITECTURE.md). Addresses audit 5, 13, 17, 18. Decision D12.

## Objective and source contract

Preserve one clinician/one patient WebRTC calls, offer/answer/ICE signalling, join/leave/ready/resync, mic/camera toggles and ephemeral chat. Sources: server session index/model/service, `lib/joinToken.ts`, appointment join-token route, `client/src/modules/session/room/useRoomSession.ts` and components. Reverb is an event transport using the Pusher protocol; it cannot receive the current custom raw-WebSocket messages unchanged. [Broadcasting](https://laravel.com/framework/docs/13.x/broadcasting), [Reverb](https://laravel.com/framework/docs/13.x/reverb).

## Specification

- `POST /api/v1/appointments/{id}/session` checks ACCEPTED status, current active/verified participant and returns appointment/room IDs, channel name, current room access generation, permitted peer information and public transport/TURN configuration. No raw login session token is returned. Room ID and appointment ID are separate identifiers.
- Use authenticated presence/private Reverb channels, with explicit allowed origins. Both initial subscription and every signal POST check current appointment/participant/account state. Do not route authoritative signalling through unchecked Echo whispers/client events; channel membership alone is insufficient after suspension/completion.
- `POST /api/v1/appointments/{id}/signals`: validated discriminated payload with type, peer ID, target peer ID where needed, negotiation ID and current generation. Server derives sender user/role/display data. Types cover offer, answer, ice_candidate, ready, media_toggle, chat_message and resync; join/leave comes from authenticated membership plus bounded server leases. Return 204 on accepted signal; 404/409 for inaccessible/stale session.
- Proposed limits: chat 1..2000 characters, SDP <=64 KiB, ICE candidate <=4 KiB, fixed permitted media kinds/boolean fields, 120 signals/minute/participant with limited burst allowance. Confirm budgets against real ICE traffic; don't rate-limit a healthy negotiation into failure. Reject unknown types/fields and cross-room target IDs.
- Shared Redis presence/participant leases limit the room to the two authorized user IDs. A reconnect replaces the previous peer lease for that user rather than creating a third participant; stale sockets cannot send with old peer/generation. Expire leases/heartbeats and handle tab close/restart. Avoid per-process room maps.
- On completion, suspension or session revocation, atomically increment relevant room/user access generation. Stop publishing to old channel generations; delivery checks current generation/account state. Existing subscribers cannot receive new signals on a stale generation or subscribe to the new one. Legitimate clients reauthorize/refetch after membership change. Already transmitted frames cannot be recalled; never claim channel auth alone disconnects them.
- Signal broadcasts use a low-latency path after authorization; avoid the default slow mail queue for offer/answer/ICE. Do not persist SDP, ICE, media/chat payloads in outbox/logs. Durable business notifications remain a different flow. Handle post-authorization state changes with generation validation at publish time.
- Media remains peer-to-peer; TURN is the fallback relay for restrictive NAT/firewalls. Reverb and Laravel do not carry audio/video. Keep server-side TURN secrets private and issue expiring scoped relay credentials if the chosen relay supports them.
- Client retains negotiation recovery/resync, candidate buffering, media cleanup and clear denied/waiting states. Stop tracks and close connection/channel on leave/logout; no stored chat/recording feature is added.

## Acceptance and verification

Real two-browser/device tests: clinician+patient call/chat/toggles; unrelated/suspended/unverified/expired user denied; two Reverb instances exchange events; refresh/rejoin recovers without third peer; competing offers do not wedge connection; stale generation and target-room injection rejected; completion/suspension stops new signalling; logout closes local media; TURN works when direct UDP connectivity is blocked. Test audio/video across actual separate networks, not just two localhost tabs. Record relay/hardware/network setup without retaining patient media.

Verify `php artisan test --filter=Realtime` for policy/schema/state behavior, then integration/browser/network tests. HTTP tests alone do not prove a call works.

## Task plan

1. **W1 — Define/authorize session descriptor.** Dependency: A4/I2/P5. Files: session request/controller, channel policy, generation migration/model change, feature test (five). Acceptance: participant eligibility and stable IDs; no credential leaks. Verify: `php artisan test --filter=RealtimeAccess`.
2. **W2 — Relay validated signals.** Dependency: W1. Files: signal Form Request, controller/Action, broadcast event, route, feature test (five). Acceptance: payload bounds, actor/target/generation checks and safe immediate publishing. Verify: `php artisan test --filter=RealtimeSignal`.
3. **W3 — Coordinate presence and revocation.** Dependency: W2/U3/A6. Files: Redis lease service, channel auth update, generation revocation Action, integration test and disconnect handler (five). Acceptance: reconnect replacement and no new publish/subscription after revocation; two-instance coordination. Verify: real Redis/Reverb integration suite.
4. **W4 — Migrate browser transport.** Dependency: W2/W3. Files: room hook, transport setup, session route, one component, client test per batch (max five). Acceptance: current room features work via descriptor/signals, no old join-token calls. Verify: typecheck plus two-browser reconnection/negotiation checks.
5. **W5 — Verify network media fallback.** Dependency: W4. Files: relay credential integration, public environment config, browser network fixture, operations runbook/test record (<=five). Acceptance: TURN-only network scenario, credential expiry and complete track cleanup. Verify: separate-network/device trial and failure/revocation scenarios.

## Exclusions

No media recording, group calls, SFU, stored chat, or extra time window by assumption. Any third-party relay needs deployment/privacy review before routing real clinical media through it.
