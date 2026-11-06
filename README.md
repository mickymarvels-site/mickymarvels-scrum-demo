# MickyMarvels LLC — separate test website

A dependency-free, responsive static website. No production site or existing deployment has been modified.

## Preview locally

Open `index.html` in a browser, or run `python3 -m http.server 8080` from this directory and visit http://localhost:8080.

## Deploy as a NEW Netlify project

1. Create a separate GitHub repository, for example `mickymarvels-test`, and upload all files in this folder.
2. In Netlify, create a new project by importing that repository. Do not select or edit an existing project.
3. Use no build command. The publish directory is `.` (also declared in netlify.toml).
4. Enable Netlify form detection and deploy. The static HTML includes the `consultation` form, form-name hidden input, and honeypot.
5. Confirm Netlify lists the consultation form, then submit sample information and verify its receipt in Netlify. Email notifications must be configured separately in the Netlify dashboard.
6. Review the generated netlify.app URL. Do not attach mickymarvels.info or change DNS.

The form uses an ordinary HTTP POST and redirects to thank-you.html after processing. Local previews intentionally show a preview message instead of submitting. Hosted submission has not yet been verified.

## Test-site safeguards

- Visible test banner and sample-data notice.
- Search indexing disabled through HTML metadata, robots.txt, and X-Robots-Tag.
- No external fonts, third-party scripts, dependencies, or image downloads.
- No invented clients, testimonials, certifications, projects, street address, business phone, or email address.
- System font stack, inline-purpose SVG logo asset, accessible labels, reduced-motion support, and mobile menu.

Before a future production release, supply approved business contact details and privacy language, review copy, remove test notices and noindex restrictions, and verify form handling. Do not use the test configuration to overwrite a production project.

## Files

- index.html: six requested website sections and consultation form.
- styles.css: responsive navy, white, and gold design.
- script.js: mobile navigation, service selection, local form preview handling.
- assets/mark.svg: original typographic brand mark concept.
- thank-you.html: Netlify form confirmation destination.
- netlify.toml: static publishing and test-site response headers.
- robots.txt: test-site indexing restriction.

## Verification

Source checks verify internal section links, local asset references, unique element IDs, required form fields, and Netlify form configuration. Browser rendering and hosted form processing remain unverified because browser access and Netlify deployment access were unavailable.
