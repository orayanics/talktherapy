# TalkTherapy homepage performance

## Problem Statement

Patients and families on slower mobile connections wait for the homepage’s main content even though the production build includes it in the initial HTML. Three local production-build Lighthouse runs at `/` had a median Largest Contentful Paint (LCP) of 3.37 seconds against a 2.5-second target. Median Cumulative Layout Shift (CLS) was 0.022. The production trace identified the shared app stylesheet, about 59 KB transferred, on the render-blocking path.

The newer supplied Lighthouse report opened `/#get-to-know` in Vite development mode. Its simulated LCP was 86.2 seconds, and the observed trace was 1.98 seconds with an overview paragraph as the LCP element. The run loaded development JavaScript. Establish a separate production-build baseline for that URL.

## Solution

Give the prerendered homepage a smaller stylesheet while preserving its current design, themes, copy, and interactive previews. Keep app styles available on login, registration, and the rest of the app. Measure `/` and `/#get-to-know` separately before and after the change. If the stylesheet split helps and the homepage still misses the target, try one focused font-loading change only when the new trace identifies the font as delaying paint.

## User Stories

1. As a prospective patient on a slow mobile connection, I want the homepage headline to paint promptly, so that I can tell what TalkTherapy offers.
2. As a family member following an overview link, I want `/#get-to-know` to open at the intended section just as quickly, so that I can read the information someone shared.
3. As a visitor on a small screen, I want the page to stay stable during loading, so that buttons and text remain where I expect them.
4. As a returning visitor, I want the homepage to honor my light or dark theme, so that the page looks familiar from the first paint.
5. As a visitor who cannot run JavaScript, I want the main copy, feature summaries, and signup and login links to remain available, so that I can read the page and navigate.
6. As a visitor comparing features, I want the previews to remain interactive, so that I can explore appointments, speech practice, resources, and care records.
7. As a prospective patient navigating from the homepage to registration, I want the registration page to render with its usual styles, so that I can complete the existing signup flow.
8. As an existing user navigating to login or another app route, I want the normal layout and theme, so that I can recognize the controls.
9. As a visitor returning from an app route, I want the homepage to retain its design and interactions, so that client-side navigation feels consistent with a direct visit.
10. As a visitor arriving during a session API outage, I want the homepage to remain readable, so that I can learn about TalkTherapy while the app is unavailable.
11. As a maintainer, I want comparable production-build measurements for both URLs, so that I can decide whether to keep the optimization.
12. As a maintainer, I want evidence of what delayed paint after the split, so that the next experiment addresses a measured cause.

## Implementation Decisions

- Keep the existing TanStack Start prerendered homepage and app shell. The first experiment is a lean stylesheet for the homepage that preserves its existing reset, theme tokens, type, buttons, and layout. Attach the full stylesheet wherever app routes need it, including the shell and fallback pages. Verify CSS selection on direct requests and client-side navigation in both directions. Keep the stylesheets compatible if the browser retains both after navigation.
- Preserve the current visuals in light and dark modes, complete initial HTML, section links, feature previews, and existing access behavior. Keep the homepage independent of the session API.
- Keep the stylesheet split only if it delivers a repeatable LCP improvement at `/` and passes the regression checks. Revert the experiment if it produces no repeatable gain. Base subsequent decisions on the resulting trace.
- Once a useful split is in place, stop if both URL checks pass. If `/` still misses 2.5 seconds and the new trace shows the font delaying paint, test one targeted font-loading change using the same measurement and regression checks.

## Testing Decisions

- Test through the built site over HTTP and in a browser. Reuse the existing homepage HTTP smoke check for the prerendered document, signup and login entry points, and unknown URL behavior. Use the production preview for performance and browser checks.
- Collect three cold mobile Lighthouse runs **per URL, before and after** the stylesheet change. Keep the Lighthouse version, browser, viewport, throttling, clean browser state, host setup, and build inputs comparable. Record the individual results, medians, LCP element, and relevant request or timing evidence. Use `/` as the primary benchmark and `/#get-to-know` as the secondary benchmark. Compare each URL with its own baseline.
- Target median LCP of **2.5 seconds or less** at `/`, no repeatable LCP regression at `/#get-to-know`, and median CLS of **0.1 or less** on both. Use run-to-run variation and the traces to judge repeatability. Record any target miss and its likely cause. A repeatable gain at `/` can justify keeping the split even if that URL still misses 2.5 seconds, provided the regression checks pass.
- In the browser, check first paint and interactions on the homepage in light and dark modes. Verify the fragment lands at the overview, initial content is readable with JavaScript disabled, and the page still loads when the session API is unavailable. Check direct loads of login, registration, and an authenticated app route, plus navigation between the homepage and app in both directions. Compare the visible result rather than generated filenames or chunk counts.

## Out of Scope

- Visual redesign, landing-page copy changes, removal of interactivity, or changes to account and app behavior.
- A JavaScript rewrite or broad asset optimization in this pass. The production trace recorded no image requests on initial load, so the practice-preview image is outside this experiment.
- Deployment changes and live-host performance verification, which remain part of the existing public homepage cutover.

## Further Notes

- The prior `/` production-build data is a reference point. The new before-and-after comparison needs fresh matched runs for both URLs.
- [Public homepage spec](talktherapy-landing-seo-spec.md)
