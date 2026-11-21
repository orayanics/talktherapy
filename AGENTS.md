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

## Contracts, security, and data safety

- When changing an interface, trace both producer and consumer. Preserve or deliberately update request fields, response shapes, status codes, errors, authentication, and serialization; update associated types and affected tests.
- Treat browser, TanStack Start server functions/routes, Laravel endpoints, and Python HTTP endpoints as separate trust boundaries. Validate untrusted inputs and enforce authentication and authorization at the endpoint that accesses or changes protected data. UI route guards are not sufficient authorization.
- Keep secrets, internal service credentials, tokens, and privileged environment variables out of client bundles, SSR-serialized data, logs, test snapshots, and API responses. Do not commit `.env` files or real credentials.
- Preserve the existing session/token and CSRF/CORS design. Do not weaken protections to work around integration or local development issues.
- Validate file type, size, and content expectations for uploads, and handle storage and cleanup safely. Do not expose private files or sensitive diagnostic details in errors.
- For database changes, inspect existing schema and migrations. Make migrations and data changes safe for existing records; plan backfills and compatibility where needed. Never run destructive migrations, mass updates/deletions, production commands, or external side-effecting operations without explicit authorization.
- Do not introduce silent breaking changes to public APIs, persisted data formats, or job/message payloads. Document required coordinated deployment or migration steps.

## Verification and reporting

- Use existing scripts and tools in the affected directory. Run the narrowest meaningful check first: targeted tests, type-checking, linting, formatting, build, or manual inspection as appropriate.
- Add or update tests in proportion to changed behavior and regression risk. A purely visual/copy edit does not automatically require tests; authorization, validation, business logic, and contract changes usually do.
- Unit tests verify isolated logic. Boundary/contract tests verify requests and responses between components. Integration tests verify interacting services. End-to-end tests verify the complete user path. Do not describe one type as proof of another.
- Expand checks when shared behavior, security, integration risk, or failures warrant it. Do not repeatedly run unchanged successful checks without a reason.
- Use test fixtures and nonproduction environments. Do not point tests at live data or external paid services without authorization.
- If a service, model, credential, runtime, browser, or hardware is unavailable, run available checks and state exactly what remains unverified. Distinguish existing failures from new regressions, and mocks/stubs from live integration.
- Final report: summarize changed files and behavior, commands/checks run and results, and any limitations or required follow-up. For read-only tasks, report findings without implying code was changed.

## 1. Frontend — `client/` (React, TanStack Router, TanStack Start)

- For UI/UX-only tasks, work in `client/`. Do not alter Laravel or Python just to improve presentation.
- Search for reusable components, layouts, hooks, API clients, styles, and installed libraries first. Implement a new local component when needed; request approval only for a meaningful new dependency, design-system decision, or user-visible tradeoff that is genuinely ambiguous.
- Respect existing routing, loaders, actions, caching, and data-fetching conventions. Avoid duplicated requests, stale state, hydration mismatches, or unnecessary client/server round trips.
- Account for loading, empty, error, and success states. Keep interactive UI keyboard-accessible, properly labeled, responsive, and consistent with existing design patterns.
- Inspect existing API clients/types and the Laravel contract before changing data-driven behavior. Do not silently invent endpoint fields or error responses.
- Treat TanStack Start server functions and server routes as real endpoints: validate inputs, authorize protected operations on the server, preserve CSRF protections, and avoid exposing secrets through returned data or hydration. Reuse Laravel for authoritative business logic.
- For styling/copy changes, use relevant lint/build checks and visual/browser inspection when available; tests are not required solely because markup changed. For changed frontend behavior, add or adjust focused tests when needed to cover meaningful regressions.
- If visual/browser verification was not possible, disclose that instead of claiming the UI was inspected.

## 2. Backend — `server/` (Laravel API)

- Read and follow `server/AGENTS.md`, including Laravel Boost and domain-specific guidance. This root file supplements rather than duplicates its rules.
- Use Laravel Boost's applicable tools and version-aware documentation when available. If unavailable, rely on the installed versions, existing code, and relevant official Laravel documentation. Mention the absence of Boost only if it materially limited verification or the task specifically requires it.
- For API-only tasks, implement in `server/`. Inspect frontend and Python consumers as necessary for compatibility, but do not change them without a behavior-driven need.
- Follow existing Laravel conventions for routes, controllers, requests, policies/gates, services, models, resources, exceptions, and database access. Keep validation and authorization server-side; avoid moving domain logic into controllers or the frontend merely for convenience.
- Preserve documented request/response contracts, authorization behavior, HTTP status codes, and useful non-sensitive errors. For operations calling Python, enforce input validation, authenticated service access, appropriate timeouts, and controlled failure handling.
- Add or update meaningful automated tests for API behavior and bug fixes, including relevant success, validation, permission, and failure cases. Run targeted tests and the formatting/check commands required by `server/AGENTS.md`. Read-only requests do not require code or tests.
- Use migrations, transactions, and safe data-handling patterns when persistence changes; do not make unauthorized destructive changes.

## 3. Python — `py/` (private microservice)

- Read `py/README.md` and inspect the relevant service endpoints, implementation, dependencies, and Laravel caller before changes. Follow any nested `AGENTS.md`.
- Keep the service private. The browser must never access Python directly; Laravel remains the caller and owns public API authentication, authorization, and orchestration. Protect the internal boundary using the repository's established service-authentication mechanism.
- Check the affected request/response contract: fields, types, encodings, multipart uploads, size limits, response schema, error mapping, and any versioned model/output behavior. Handle malformed input, timeouts, unavailable dependencies, and service failures deliberately.
- For internal Python logic changes, write or update focused unit tests. For changes to HTTP endpoints, serialization, uploads, service authentication, or Laravel communication, add or update boundary/integration tests that exercise the changed interface. Run affected Laravel/client checks when their behavior or contracts changed.
- Trace the whole client → Laravel → Python → Laravel → client path when the requested change affects it; do not require a full E2E run for an isolated internal algorithm or refactor with unchanged contracts.
- Use existing pytest fixtures and test environments. Keep tests deterministic; mock expensive models or external services only where appropriate, and distinguish mocked results from actual service-to-service or live-inference verification.
- Do not rewrite unrelated frontend screens, Laravel routes, or Python modules simply because the microservice is involved.
