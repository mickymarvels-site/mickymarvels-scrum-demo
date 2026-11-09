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

### Worker location switch

**Worker scenarios** replaces the Cameroon-only tab. Choose **US Worker** ($65/hour billing, $45/hour pay) or **Cameroon Worker** ($45/hour billing, $10/hour pay). Rates, hours, worker count and unknown additional costs persist independently for each location; switching never resets edits. The selected location and both sets of assumptions use the existing Save changes action. Older workspaces keep their Cameroon values and receive missing US defaults. Existing W-2/1099 assumptions remain separate.

Client billing and rate inputs remain in USD. Results show US worker pay/spread in USD and Cameroon pay/spread in XAF using the saved manual exchange rate, with per-worker gross spread also shown in USD. At 160 hours, per-worker monthly gross spread is $3,200 (US) or $5,600 (Cameroon), before other costs and taxes.

Worker scenarios show both biweekly and monthly pay and gross spread per worker and for the team. Biweekly means every two weeks (26 periods/year): monthly estimate × 12 ÷ 26. It is not semimonthly pay (twice per month). Actual pay depends on worked hours; displayed currency amounts are rounded only after calculations.

### Worker deductions, tax estimates and Cameroon health insurance

Worker scenarios includes all 50 states and DC, 2026 tax-year and filing-status inputs, W-4 planning adjustments, a state withholding override, and monthly/biweekly take-home. Federal income-tax estimates use IRS Publication 15-T (2026) Worksheet 1A percentage tables. Employee Social Security uses the 2026 $184,500 annual wage cap and 6.2%; Medicare uses 1.45% plus employer withholding of 0.9% above $200,000 regardless of filing status. The year input is editable, but unsupported years return Unknown rather than reuse 2026 rates. No US health-insurance premium is modeled.

**These are planning estimates, not a payroll processor or a legal compliance determination.** Federal inputs assume a 2020-or-later W-4, uniform annualized wages and a US-resident employee. State estimates use a bundled MIT-licensed snapshot of state income-tax schedules (with the selected state's limitations shown in the dashboard); they do not fully implement state withholding elections, exemptions, credits, local taxes, disability/paid-leave taxes, reciprocity, nonresident or multistate rules. California, Arkansas and Ohio automatic amounts are deliberately unavailable because current schedules could not be verified consistently; select the state and enter a verified monthly state amount. Blank overrides use the automatic estimate where available; an explicit zero is respected. Overrides are scoped to the saved state and filing status and do not silently carry to another selection. Other state estimates should be verified against current state payroll instructions before use.

State snapshot attribution and license: `staffing/tax-data-LICENSE.txt`, source https://github.com/edyda99/us-tax-engines. Snapshot reviewed November 9, 2026; Nebraska and Oklahoma were updated using official 2026 state documents, Utah's rate corrected to 4.45%, and Arizona's standard-deduction assumption updated. The snapshot is bundled for reproducible calculations; it does not update live. Review every year and when state rules change.

Cameroon has manual **monthly XAF amounts per worker** for tax/social deductions, worker-paid health insurance and company-paid health insurance. All start unknown, with explicit zeros required for known absence of a cost. Worker-paid premiums are modeled after tax. Worker taxes and worker premiums reduce worker take-home; company premiums reduce modeled company contribution. Worker withholdings never increase company gross spread. Do not double-count the company premium in shared additional costs. The IRS does not set Cameroon deductions or the legal split: confirm employment/contracting, local tax, CNPS and insurer obligations with a qualified Cameroon adviser.

References: https://www.irs.gov/publications/p15t ; https://www.irs.gov/taxtopics/tc751 ; https://www.ssa.gov/oact/cola/cbb.html ; https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/f_1040N-ES.pdf ; https://oklahoma.gov/content/dam/ok/en/tax/documents/resources/publications/businesses/withholding-tables/WHTables-2026.pdf ; https://tax.utah.gov/forms-pubs/pub-14/ ; https://www.cnps.cm/en/employeurs/obligations-de-lemployeur1.html .

New string enum fields (state and filing status) are validated against allowlists; numeric assumptions retain nonnegative finite-string validation. The assumption count limit is now 64 to accommodate the new fields while retaining size limits, record validation, authentication and optimistic concurrency. Missing defaults are merged only in memory until an explicit save.
