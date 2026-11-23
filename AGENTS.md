# Repository working agreement

Make the smallest complete, maintainable change that satisfies the request. Do not turn a focused task into unrelated refactoring, dependency upgrades, or cleanup.

## Architecture and ownership

| Directory | Responsibility                                                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `client/` | React application using TanStack Router and TanStack Start; UI, routing, client state, and existing frontend server-side facilities.      |
| `server/` | Laravel API; authoritative application business rules, authentication/authorization, persistence, and orchestration of internal services. |
| `py/`     | Private Python microservice; specialized processing invoked through Laravel, not directly from the browser.                               |

- Identify the affected directory and the request type from the prompt and repository evidence. Inspect relevant manifests, configuration, and callers; do not assume package versions or invent conventions.
- Read the root instructions and any applicable nested `AGENTS.md` files before editing. More specific local instructions take precedence within their scope; explicit user instructions take precedence over repository guidance.
- For Laravel work, follow `server/AGENTS.md`. For Python work, read `py/README.md` and any applicable nested instructions. Do not rewrite these files unless specifically requested.
- Stay within the affected concern unless a change to another concern is necessary for the requested behavior. Explain that dependency and keep the additional change minimal.
- Preserve existing user changes. Check relevant diffs before editing; never discard unrelated modifications, reset work, or overwrite files without authorization.
- Keep Laravel as the application API and the boundary to the private Python service. TanStack Start server functions may support the frontend, but must not silently bypass Laravel's domain, authorization, or service-integration responsibilities.

## Match work to the request

| Request              | Expected action                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Question/explanation | Inspect evidence and answer, summarize and put into bullet points maximum of 15 words or use tables; do not change code. |
| Plan                 | Provide an actionable plan, dependencies, and checks; do not implement.                                                  |
| Audit/review         | Report prioritized, actionable findings with file references, impact, and fixes; do not implement unless requested.      |
| Investigate a bug    | Reproduce or trace the failure and explain the cause with evidence; do not silently fix it.                              |
| Fix/implementation   | Make the requested changes, update affected callers, and verify them.                                                    |
| Integration          | Trace the actual producer/consumer contract; update the necessary sides and verify the affected boundary.                |

- State scope briefly for nontrivial work. Provide concise progress updates only when findings, decisions, or blockers materially affect the work.
- Ask about genuinely blocking ambiguity or a material tradeoff that cannot be resolved from repository evidence. Use a reasonable, reversible default for routine implementation choices; do not ask permission for every component or small edit.
- Continue independent, non-blocked work where possible, but do not guess at decisions that could change behavior, security, data, or public contracts.

## Implementation discipline

- Inspect existing implementations, patterns, tests, and available dependencies before writing new code. Reuse suitable components and utilities; create focused new ones when reuse would be awkward or less maintainable.
- Prefer existing packages. Add or upgrade dependencies only when justified by the task; check maintenance, licensing, compatibility, and lockfile changes. Do not install packages or search external implementations for routine edits without a concrete need.
- Follow the affected project's naming, typing, formatting, error-handling, and architecture conventions. Avoid duplicate logic and unrelated renames.
- Consult official, version-appropriate documentation when behavior or APIs are uncertain. Use applicable project skills/tools if available; do not fabricate tool usage, install skills, or let generic workflows expand the scope.
- Do not change generated files manually when their source should be changed instead. Update generated outputs only if the repository convention requires them.

## Agent skills

### Issue tracker

Track unfinished work in `tasks/todo.md`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Use one repository-wide glossary and ADR directory. See `docs/agents/domain.md`.
