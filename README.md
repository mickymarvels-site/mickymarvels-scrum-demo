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

## Native staffing workspace

`/staffing/` is a first-party dashboard on this Netlify site. It has no ChatGPT hosting or sign-in dependency. The public home page includes a Staffing Workspace button in its footer.

### One-time owner setup

In the Netlify project for **mickydemo**, open **Project configuration → Environment variables**. Add **STAFFING_ADMIN_PASSWORD**, a unique password at least 20 characters long, to the **Functions** scope (or all scopes), in the production context. Keep it secret. Do not put the password in GitHub, source code, a build command, or chat. Redeploy the project after setting it. Use that password at `/staffing/`.

If the variable is absent or too short, the backend stays locked and returns setup required. There is no default password or public registration. A Netlify project administrator can rotate this variable and redeploy; that invalidates existing owner sessions. This version is a single-owner workspace, not a multi-user permission system.

### Hosting and storage

Netlify installs the locked dependency and runs `npm run build`. Only `public/` is published. Server source, tests, package metadata and docs are excluded from the public directory. Netlify Functions runs `staffing.mjs`; the private workspace is stored in the site-wide `mm-staffing-owner-workspace` Netlify Blobs store. No extra storage credentials are needed inside Netlify Functions. Every data read and write requires the owner session. Blobs persists across redeploys; deleting the store/project deletes that persistence. Hosting and storage usage follow the project's Netlify plan.

Login creates an eight-hour Secure, HttpOnly, SameSite=Strict cookie. Mutations check request origin. The function is rate-limited to 30 requests per minute per IP/domain. The entire workspace is one versioned document, with conditional writes to prevent a stale tab overwriting a newer save. This is suitable for an initial owner-operated team; evaluate a relational database and individual identities for concurrent team growth.

Use **Apply changes** to update a record on screen and **Save changes** to persist it. Unsaved changes are held only in page memory, not browser storage. Export JSON backups regularly. Export includes personal and business data: keep backups private. JSON export is a backup/readable snapshot; no import UI is included in this version.

Candidates, clients and placements start empty. Starter actions are planning prompts, not assertions of completed work. Rate assumptions are explicitly illustrative. Blank cost inputs produce Unknown margins. All calculations are in USD and are planning estimates, not payroll execution or classification decisions. Local employment/contracting options and offshore client approval are recorded separately from US model estimates.

### Verification

Run `npm test`, `npm run build`, and `node --check staffing/dashboard.js`. Backend tests use isolated in-memory storage and disposable test credentials. They verify fail-closed configuration, authentication, origin checks, invalid data rejection, session expiration, password rotation and stale-write protection. They do not write to hosted Netlify data. Verify hosted login and persistence after configuring the production secret.

### Cameroon Team scenario

The separate **Cameroon Team** tab defaults to $45/hour client billing, $10/hour worker pay, 160 billable hours per worker per month, and one worker. These are scenario inputs only; no worker records are created. Additional monthly costs are team-wide and remain unknown until entered; only an explicit zero removes additional costs from contribution. Gross spread is distinct from net profit. Confirm Cameroon employment/contracting arrangements and offshore client approval.

Edit inputs and select **Save changes** to persist through the existing authenticated Function/Blobs workspace. Missing Cameroon assumption fields are merged on load without replacing existing values (including blanks or zeros), records, or US model assumptions. They are included in the next explicit save; loading alone does not write to storage. Existing conflict detection still protects concurrent saves.

`npm test` includes default calculation, team scaling, unknown-versus-zero cost, loss/zero-revenue, immutable legacy-merge, and authenticated save/reload compatibility checks. Tests use isolated fixtures and never modify live workspace records.

Cameroon Team also shows hourly, monthly per-worker, and monthly whole-team pay in Central African CFA francs (XAF). Enter **XAF per 1 USD**, then Save changes. The rate starts unknown, is stored with scenario assumptions, and is not a live market quote. Converted figures are rounded to whole CFA francs for display; transfer fees are excluded. Existing USD margin calculations are unchanged.
