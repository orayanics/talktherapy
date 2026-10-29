# Product improvements plan/task matrix

Research date: 2026-10-29. This matrix is planning-only; implementation remains unchecked in `tasks/todo.md`.

## Research-informed decisions

| Area | Decision | Evidence / improvement |
|---|---|---|
| Mutation feedback | Use one Sonner promise lifecycle per mutation (`loading` → `success`/`error`) and invalidate/refetch only after success. Keep server validation errors visible in the form and reset transient state on settle/unmount/account change. | Sonner's official integration exposes a single `Toaster` and `toast()` surface; use that existing dependency rather than adding a second toast system. [Sonner README](https://github.com/emilkowalski/sonner) |
| Notification delivery | Keep the existing durable outbox/in-app model, add channel preferences at delivery time, and publish a user-scoped realtime event after the database write. Store a stable notification type/payload for UI and audit. | Laravel supports mail, database and broadcast channels, separate database/broadcast representations, and unread/read accessors. [Laravel 13 notifications](https://laravel.com/framework/docs/13.x/notifications) |
| Notification UI | Reuse the installed DaisyUI drawer/modal styles, but control open/close with React state and semantic buttons/dialog behavior rather than the legacy checkbox-only interaction. Keep title/description, focus handling, Escape/outside close, scrollable content and a visible close action. | DaisyUI documents drawer styling and recommends the native dialog method for accessible modals; the repo already has `daisyui` installed. [DaisyUI drawer source](https://github.com/saadeghi/daisyui/blob/master/packages/docs/src/routes/%28routes%29/components/drawer/%2Bpage.md?plain=1), [DaisyUI modal docs](https://daisyui.com/components/modal/) |
| XLSX exports | Add XLSX as an explicit format, stream/chunk the query, and queue exports that exceed the synchronous threshold. Persist status/path/error and audit completion/failure; never make queued downloads depend on a local-only temporary path. | Laravel Excel documents queued, chunked exports and batch callbacks; multi-server deployments need a shared temporary/storage strategy. [Laravel Excel performance](https://docs.laravel-excel.com/4.x/exports/performance.html) |
| Diagnoses | Reuse current taxonomy/resource conventions. Backend policy is the trust boundary; frontend only exposes CRUD controls to admin/superadmin and treats archive/delete as an explicit state transition. | Existing `DiagnosisController`, resource, policy and appointment diagnosis selector are already present in this repository. |
| Suspension modal | Use the house modal component, not `window.prompt()`. Require a non-empty reason, show the irreversible-action copy, preserve server-side validation, and clear reason/error/open state on close and after mutation settle. | Existing frontend modal primitives and required server reason validation are already available in this repository. |

## Ordered task matrix

| ID | Workstream / slice | Depends on | Main files likely touched | Acceptance criteria | Verification | Size |
|---|---|---|---|---|---|---|
| P0 | Shared contracts and research guardrails | None | `tasks/todo.md`, `tasks/plan-matrix.md`, client notification/mutation conventions | Define toast IDs/messages, transient-state reset rules, preference keys, export formats/threshold, diagnoses lifecycle and notification recipient rules. | Matrix reviewed; no implementation starts with unresolved ownership or channel semantics. | S |
| P1 | Mutation toasts and transient-state reset | P0 | `client/src/context/AlertContext.tsx`, mutation hooks, `client/src/components/AlertToast*`, shared query/error helpers | Every targeted mutation has one loading/success/error lifecycle; duplicate toasts are prevented; alerts/errors/loading/selection state reset on settle, route change and account switch. | Focused Vitest tests; `npm run typecheck`; `npm run lint`; `npm run build`. | M |
| P2 | Notification side drawer | P1 | `client/src/modules/notifications/components/*`, `client/src/modules/notifications/hooks/*`, app shell/sidebar, DaisyUI drawer classes | Drawer opens from notification trigger, supports keyboard focus/close, unread badge, realtime append/refetch, mark-read and pagination; popover is removed. | Component tests plus real-browser keyboard/reconnect check. | M |
| P3 | XLSX export and audit completion | P0 | `server/app/Http/Controllers/Api/V1/AuditLogController.php`, export job/model/tests, client logs export hook/UI | `xlsx` is validated and authorized; small exports download; large exports queue; status/download works; completion and failure audit records are idempotent; temporary files are cleaned. | Feature/job tests for format, authorization, retries and audit records; queue worker smoke test. | L (split if >5 files) |
| P4 | Admin/superadmin custom in-app notifications | P1 | `server/app/Services/NotificationService.php`, notification request/controller/event/tests, client notification composer/list | Admin/superadmin can target permitted recipients, create durable in-app notifications, emit user-scoped Reverb events, and see audit/idempotency outcomes; ordinary users cannot send. | Policy/request/service feature tests; two-session Reverb/browser smoke. | L (split backend/frontend) |
| P5 | User notification preferences | P4 | user preference migration/model/request/controller/service, delivery command, client settings UI/types/hooks | Authenticated user can independently toggle in-app/email preferences; delivery honors preferences without dropping required security/account messages; defaults are explicit and documented. | Migration/API/policy tests; outbox suppression/delivery matrix; UI typecheck/build. | L (split backend/frontend) |
| P6 | Diagnoses CRUD backend | P0 | `server/app/Models/Diagnosis.php`, migration, policy, requests/resource/controller/routes, feature tests | Authorized admin/superadmin can list/create/update/archive diagnoses; validation and uniqueness are enforced; clinician/patient denial and appointment read behavior remain safe. | Laravel feature/policy tests; Pint; migration from fresh DB. | L (split schema/API/tests) |
| P7 | Diagnoses CRUD frontend | P6 + P1 | `client/src/modules/diagnoses/*`, admin routes/navigation, appointment diagnosis selector | Admin UI supports search/list/create/edit/archive with loading/error/empty states and consistent mutation feedback; appointment consumers use active diagnoses only. | Component/API tests; typecheck/lint/build; browser CRUD smoke. | L |
| P8 | Suspension modal prompt | P1 | `client/src/modules/users/components/UsersList.tsx`, `client/src/modules/users/hooks/useActions.tsx`, modal/tests | Browser prompt is removed; modal requires a trimmed reason, confirms target, shows server errors, and resets stale reason/error/open state on close/success/account change. | Focused frontend tests plus browser suspend/reactivate smoke; existing backend request/audit/email tests remain green. | M |

## Checkpoints and sequencing

1. **Foundation:** P0–P1. No feature slice proceeds until transient-state and toast behavior is consistent.
2. **User-facing notification shell:** P2, then P4–P5 so the drawer, custom sends and preferences share one contract.
3. **Reporting:** P3 independently, with XLSX and queued large exports verified before exposing the format in the UI.
4. **Taxonomy:** P6 then P7, because the frontend must consume the authorized CRUD contract and active/inactive semantics.
5. **Account safety:** P8 after P1; verify suspension reason handling in UI, audit and email as one flow.

## Risks and mitigations

| Risk | Mitigation / stop condition |
|---|---|
| Preferences suppress a required security or account message | Classify notifications as mandatory vs user-configurable; mandatory delivery bypasses optional toggles and is tested explicitly. |
| Realtime event arrives before durable write is visible | Commit notification/outbox first, then broadcast; client refetches on reconnect and deduplicates by notification ID. |
| XLSX memory/temp-file pressure | Queue above a measured threshold, chunk queries, use shared storage/temp configuration, and expose failure status instead of timing out the request. |
| Diagnosis deletion breaks historical appointments | Prefer archive/inactive state; do not hard-delete referenced diagnoses without an explicit migration decision. |
| Transient state leaks between users/routes | Reset on mutation settle, query-key/account change and unmount; add account-switch/browser assertions. |

## Deferred / not included in this pass

- No new toast library, drawer library, export package or notification transport is proposed unless the existing dependencies cannot satisfy the contracts.
- No implementation, migration execution, browser session, or full-suite run was performed while creating this matrix.
