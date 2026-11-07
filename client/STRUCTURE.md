# Source structure

Feature code lives in `src/modules/<feature>/`. Keep its API calls in `api/`, domain types and validation in `types/`, React state in `hooks/`, and UI in `components/`. Add a folder only when the feature needs it. Tests stay beside the code they cover.

`src/routes/` defines URLs, route guards, search validation, and thin adapters to feature pages. Keep substantive page UI and state in the owning module. Feature components may use typed router hooks; they must not import route files or the generated route tree.

`src/components/` contains reusable UI without feature rules, such as tables, modals, loading states, filters, and charts. Feature-specific display belongs to its module: account badges belong to users, dashboard statistics to dashboard, and the scheduling calendar to schedules. Another feature can import that owner's component directly.

`src/lib/`, `src/utils/`, `src/context/`, and `src/integrations/` hold shared infrastructure. Application-wide configuration remains in `src/constants/`; authentication roles and permissions belong to auth. Keep component props beside their component unless multiple consumers need the same contract.

Before extracting a helper or component, look for an existing equivalent and actual repeated behavior. Share the common presentation or logic while keeping domain-specific labels, permissions, and mappings with the feature. Avoid forwarding barrels, compatibility re-exports, and generic frameworks for single uses.

Validate changes with `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Keep regression tests beside the feature or shared component they exercise.

Detail queries must not reuse previous-resource placeholder data. Scope pagination placeholders to the same resource and owner. Editors retain their initial draft and version until save, identity change, or explicit reload; background query refreshes must not reset a draft.

## TanStack routing and queries

Define each resource's `queryOptions` once beside its API operation. Reuse those options in route guards, loaders and subscribing hooks; use installed Query v5's `queryClient.query()` for imperative reads. Keep `queryKey` and `queryFn` together, and forward the query's `signal` to the HTTP client so cancellation reaches the request.

Authentication belongs in browser-only parent routes' `beforeLoad`; return the resolved user in route context and provide it through `SessionProvider`. Role-specific child routes call `requireRole` in `beforeLoad`, before their loaders and UI run. Keep `ssr: false` on session/guest parents: Laravel browser cookies are not forwarded by the Start server. Only a confirmed 401 is signed-out state; propagate forbidden, network and service errors to the retry boundary.

Session preloads may reuse a result for 30 seconds; real navigation revalidates before loading protected children. Mounted protected layouts observe the same session query for focus/reconnect checks and invalidate Router context when identity, user details or errors change. Successful logout clears user-bound Query data before the existing full-page login navigation. Identity/role changes discard prior resource caches; successful profile changes invalidate both session data and route context.

Use loaders to await data required before rendering, with `useQuery`/`useSuspenseQuery` subscribing to those same options as appropriate. Keep noncritical data in normal queries rather than blocking unrelated routes. Set `defaultPreloadStaleTime: 0` so Query controls freshness; choose resource-specific stale times rather than copying one global timeout. Never apply previous-resource placeholders globally; any pagination placeholder must retain the same resource and owner.

References: installed `@tanstack/router-core/skills/router-core/auth-and-guards/SKILL.md` and `@tanstack/react-router/skills/compositions/router-query/SKILL.md`; [authenticated routes](https://tanstack.com/router/latest/docs/guide/authenticated-routes), [query options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options), and [selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr).

Resource query functions forward `{ signal }` to `api`. Reuse `retryApiQuery` for normal resource reads: retry transient Axios network/408/429/5xx failures at most three times, and do not retry permanent 4xx, cancellation, or non-Axios programming errors. Session checks retain `retry: false` so auth failures reach route guards promptly. Mutation invalidations for independent resources start together with `Promise.all`; await the group before success UI or navigation. Keep ordered invalidation where later work depends on the refreshed result.

Content and SOAP detail/editor routes await their existing query options in loaders. Components continue subscribing through normal `useQuery`; shared cache keys and resource stale times prevent duplicate initial requests. Add other critical loaders only when the route has explicit resource identity and matching component query options; do not guess filters or block noncritical dashboard data.

API modules contain HTTP operations, response mapping/types, and plain query options. React queries/mutations, navigation, alerts, and cache invalidation belong in the feature's `hooks/` directory. Mutation hooks use `use*Mutation` names; `mutate*` API functions perform the request directly. Keep grouped feature hooks where related actions share cache behavior. Auth's identity-cache coordination lives in `auth/lib/session-query.ts`; its API only fetches/maps the session and performs logout. The Echo API configuration remains transport setup, not a React hook.
