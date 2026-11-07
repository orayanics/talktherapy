# TalkTherapy client

React 19 and TanStack Start frontend for the Laravel API. See [the root setup guide](../README.md) for prerequisites, environment values, local accounts and service startup; see [STRUCTURE.md](STRUCTURE.md) for source ownership.

From this directory:

```sh
npm ci
npm run dev
```

The client listens on port 3000. Vite enables local HTTPS when both `../certs/localhost-key.pem` and `../certs/localhost.pem` exist; the `HTTPS` environment variable does not control it. Follow [the TLS guide](../SETUP_SSL.md) for proxy setup.

Verify changes with:

```sh
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Routes live in `src/routes` and delegate UI and state to feature modules. Session queries run in the browser. Business API functions supply `/api/v1` explicitly; the shared HTTP client uses the API origin so authentication and CSRF requests remain unversioned. Keep API calls separate from mutation hooks and preserve editor drafts across background refreshes.

Styling uses Tailwind CSS 4 and daisyUI 5. Reuse the existing shared fields, modals, tables and state components rather than introducing another component system.
