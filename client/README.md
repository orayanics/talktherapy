# TalkTherapy client

React 19 and TanStack Start frontend for the Laravel API. See the [repository guide](../README.md), [documentation index](../docs/INDEX.md), and [source structure](STRUCTURE.md).

From this directory:

```sh
npm ci
npm run dev
```

The client listens on port 3000. Vite enables local HTTPS when both `../certs/localhost-key.pem` and `../certs/localhost.pem` exist; the `HTTPS` environment variable does not control it. For LAN devices, follow [the local HTTPS/Nginx guide](../SETUP_SSL.md).

Verify changes with:

```sh
npm test
npx tsc --noEmit
npm run lint
npm run build
```

After building, start `npm run preview` and run `npm run test:homepage` in another
terminal. This checks the initial HTML for the homepage, the app entry on login
and registration, and the 404 for an unknown URL.

Before publishing, set the approved `VITE_PUBLIC_*` values from `.env.example`
and rebuild. Serve the prerendered homepage at `/`, serve the app shell on known
app routes, and return HTTP 404 for unknown routes. Run the same check against the
preferred HTTPS host with `npm run test:homepage -- https://www.example.com`,
substituting the confirmed origin.

On the launch host, verify that HTTP and alternate hostnames redirect permanently
to the preferred HTTPS host. Inspect the initial HTML for its self-referencing
canonical, matching social URL, approved social image, operator name, and working
privacy and support links. Check `/robots.txt`, the homepage robots meta tag, and
the `X-Robots-Tag` response header for unintended crawl or indexing restrictions.
See the [homepage specification](../docs/talktherapy-landing-seo-spec.md) for the
browser, Search Console, and Lighthouse checks.

Routes live in `src/routes` and delegate UI and state to feature modules. Parent guards provide typed session context to child routes. Critical list and detail routes preload their Query options before rendering. Mounted sessions revalidate on focus and reconnect. Business API functions use `/api/v1`; authentication and CSRF remain unversioned.

Styling uses Tailwind CSS 4 and daisyUI 5. Reuse the existing shared fields, modals, tables and state components rather than introducing another component system.
