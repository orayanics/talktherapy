# TalkTherapy client

React 19 and TanStack Start frontend for the Laravel API. See the [repository guide](../README.md), [documentation index](../docs/INDEX.md), and [source structure](STRUCTURE.md).

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

Routes live in `src/routes` and delegate UI and state to feature modules. Parent guards provide typed session context to child routes. Critical list and detail routes preload their Query options before rendering. Mounted sessions revalidate on focus and reconnect. Business API functions use `/api/v1`; authentication and CSRF remain unversioned.

Styling uses Tailwind CSS 4 and daisyUI 5. Reuse the existing shared fields, modals, tables and state components rather than introducing another component system.
