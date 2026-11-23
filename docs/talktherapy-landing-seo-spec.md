# Public TalkTherapy homepage

## Problem Statement

Patients and families need to know what TalkTherapy offers, who can create an account, and what happens after signup. The homepage leads with a slogan, and several feature descriptions appear only after a visitor selects a preview.

The production build emits a shared HTML shell with a starter title and no homepage copy or signup link. JavaScript renders the landing page after a session check, which can delay or interrupt access to the page. The supplied Lighthouse development run passed its rendered SEO checks, so the release needs to verify both the initial response and the rendered page.

## Solution

Serve a prerendered, indexable homepage at `/` to everyone. Lead with appointments and speech practice for patients and families, and give clinicians a dedicated section. Show all four feature summaries on first render and retain the interactive preview. Explain patient registration, email verification, appointment requests and clinician acceptance, and where patients can find available exercises. Link to approved privacy and support information before public launch.

## User Stories

1. As a patient arriving from search, I want the search title and homepage headline to describe TalkTherapy, so that I can tell whether it fits what I need.
2. As a family member, I want the opening copy to describe how TalkTherapy supports patients, so that I can decide whether to share it with someone I support.
3. As a first-time visitor, I want the main content to load before JavaScript runs, so that I can read it on a slow connection.
4. As a signed-out visitor, I want the homepage to load during a session API outage, so that I can still learn about TalkTherapy.
5. As a signed-in user opening the homepage, I want to see the public page, so that a shared homepage link behaves the same for me as for other visitors.
6. As a signed-in user, I want to reach my dashboard through the existing entry points, so that I can resume my work.
7. As a prospective patient, I want a clearly labeled patient signup button, so that I know what kind of account I am creating.
8. As an existing patient, I want a visible login link, so that I can use my current account.
9. As a clinician, I want a dedicated section and an obvious path to log in, so that I can find the relevant workflow.
10. As a new patient, I want to know that signup includes email verification, so that I know what to do after submitting the form.
11. As a patient considering an appointment, I want to know that a request needs clinician acceptance, so that I can tell when an appointment is confirmed.
12. As a patient interested in speech practice, I want to know how to find available exercises, so that I can prepare to use the feature after signing in.
13. As a patient who practices in English or Filipino, I want to see those options described on the page, so that I can recognize the practice tools relevant to me.
14. As a first-time visitor, I want to read summaries of appointments, speech practice, resources, and care records before interacting with the preview, so that I can understand the product at a glance.
15. As a visitor comparing features, I want to explore the interactive preview, so that I can see how the features are presented.
16. As a keyboard or assistive-technology user, I want a logical heading outline and descriptive links, so that I can navigate to the information I need.
17. As a prospective patient, I want to know who operates TalkTherapy and read its privacy notice before creating an account, so that I can make an informed choice.
18. As a visitor with a question, I want a working support contact, so that I know whom to ask.
19. As someone sharing TalkTherapy, I want the homepage link to show an accurate title, description, and image, so that the recipient knows what to expect.
20. As a site maintainer, I want the preferred HTTPS homepage URL to be explicit, so that search engines receive consistent canonical signals.
21. As a visitor on a mobile connection, I want the hero to load promptly and remain stable, so that I can read it and select the right action.
22. As a release maintainer, I want reproducible build and crawl checks, so that launch decisions reflect the page users and crawlers actually receive.

## Implementation Decisions

- Prerender the TanStack Start homepage. The first response at `/` contains the TalkTherapy title, meta description, primary heading, supporting copy, feature summaries, and links to registration and login. The production host must serve the generated homepage at `/`.
- Give the homepage a route outside the guest-only session guard. The homepage is public for anonymous and authenticated visitors and can load without the session service. Preserve existing guest and authenticated behavior on the login, registration, dashboard, and protected app routes. Laravel continues to own authentication, authorization, and application business rules.
- Use **Speech therapy appointments and practice in one place** as the H1. Use a descriptive page title and meta description that name TalkTherapy and describe the offer. Lead with patients and families, and give clinicians a dedicated section with a path to log in.
- Use **Create a patient account** for links to registration and **Log in** for existing users. Explain account creation, email verification, and sign-in. Explain that eligible patients can request an available appointment after intake, and the clinician has to accept it. Describe exercise access based on availability or assignment. Use copy consistent with the current patient account flow.
- Show visible text for appointments, speech practice, resources, and care records. Describe English and Filipino practice and recording and replay where supported. Keep the preview interactive, use a logical heading order, and point **How it works** to the onboarding explanation.
- Before public launch, confirm the production origin, operator name, support contact, and approved privacy notice. Display the operator and provide working support and privacy links. Add a self-referencing production canonical and social preview metadata to the initial HTML. Keep the canonical and preferred HTTPS host aligned.

## Testing Decisions

- Use the built homepage as the main test boundary. Exercise the production-build output over HTTP and in a browser, checking status, document content, navigation, and visible behavior. Test outcomes through the route and ignore details such as component state and generated asset names.
- Inspect a direct request and a JavaScript-disabled visit. Expect HTTP 200, a descriptive TalkTherapy title and meta description, one H1, visible feature summaries, and usable links to signup and login.
- With JavaScript enabled, check normal signed-out, signed-in, and session-API-unavailable visits. Verify that each visit shows the same landing content. Verify signup and login navigation, dashboard entry for an authenticated user, and the preview interaction.
- Reuse the existing client router and session tests as regression coverage for guest redirects and protected entry. They provide prior art for asserting observable navigation and session outcomes. The existing server-side session test covers keeping browser-cookie lookups out of server execution.
- Once production inputs are available, verify the anonymous HTTPS response, canonical and preferred host redirects, robots directives and headers, social previews, working trust links, and treatment of unknown URLs. Inspect Google's rendered page and canonical selection in Search Console when available.
- Run three comparable mobile Lighthouse navigations against the production build. Record the median LCP and CLS. Target LCP of at most 2.5 seconds and CLS of at most 0.1. Review any miss against the trace before launch. Use field data at the 75th percentile for LCP, CLS, and INP once available.

## Out of Scope

- Changes to account types, signup eligibility, diagnosis selection, intake, appointment state transitions, exercise assignment, authorization, or API contracts.
- Clinical outcome claims, new clinical services, and changes to the private speech service.
- Standalone feature or location pages, new locale variants, structured data, and broader asset optimization are assumed to be follow-ups. Revisit if launch verification or the production-build trace identifies a specific need.

## Further Notes

- Implementation and local verification can proceed with the current repository. Publication depends on the confirmed launch inputs and live-host checks.
- The supplied localhost Lighthouse run measured the Vite development build. Its 100 SEO score reflects the rendered page, and its 36 performance score reflects that development run. Use the three production-build runs for release decisions.
- [Landing page SEO audit](talktherapy-landing-seo-audit.md)
