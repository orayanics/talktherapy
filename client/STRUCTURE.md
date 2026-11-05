# Source structure

Feature code lives in `src/modules/<feature>/`. Keep its API calls in `api/`, domain types and validation in `types/`, React state in `hooks/`, and UI in `components/`. Add a folder only when the feature needs it. Tests stay beside the code they cover.

`src/routes/` defines URLs, route guards, search validation, and thin adapters to feature pages. Keep substantive page UI and state in the owning module. Feature components may use typed router hooks; they must not import route files or the generated route tree.

`src/components/` contains reusable UI without feature rules, such as tables, modals, loading states, filters, and charts. Feature-specific display belongs to its module: account badges belong to users, dashboard statistics to dashboard, and the scheduling calendar to schedules. Another feature can import that owner's component directly.

`src/lib/`, `src/utils/`, `src/context/`, and `src/integrations/` hold shared infrastructure. Application-wide configuration remains in `src/constants/`; authentication roles and permissions belong to auth. Keep component props beside their component unless multiple consumers need the same contract.

Before extracting a helper or component, look for an existing equivalent and actual repeated behavior. Share the common presentation or logic while keeping domain-specific labels, permissions, and mappings with the feature. Avoid forwarding barrels, compatibility re-exports, and generic frameworks for single uses.

Validate changes with `bun run test`, `bunx tsc --noEmit`, `bun run lint`, and `bun run build`. Keep regression tests beside the feature or shared component they exercise.
