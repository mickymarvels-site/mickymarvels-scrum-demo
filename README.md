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

Cameroon supports automatic salaried-employee tax/social estimates and manual **monthly XAF totals per worker**, plus customizable worker-paid and company-paid health insurance. See the automatic Cameroon section below for its scope. All start unknown, with explicit zeros required for known absence of a cost. Worker-paid premiums are modeled after tax. Worker taxes and worker premiums reduce worker take-home; company premiums reduce modeled company contribution. Worker withholdings never increase company gross spread. Do not double-count the company premium in shared additional costs. The IRS does not set Cameroon deductions or the legal split: confirm employment/contracting, local tax, CNPS and insurer obligations with a qualified Cameroon adviser.

References: https://www.irs.gov/publications/p15t ; https://www.irs.gov/taxtopics/tc751 ; https://www.ssa.gov/oact/cola/cbb.html ; https://revenue.nebraska.gov/sites/default/files/doc/tax-forms/2025/f_1040N-ES.pdf ; https://oklahoma.gov/content/dam/ok/en/tax/documents/resources/publications/businesses/withholding-tables/WHTables-2026.pdf ; https://tax.utah.gov/forms-pubs/pub-14/ ; https://www.cnps.cm/en/employeurs/obligations-de-lemployeur1.html .

New string enum fields (state and filing status) are validated against allowlists; numeric assumptions retain nonnegative finite-string validation. The assumption count limit is now 64 to accommodate the new fields while retaining size limits, record validation, authentication and optimistic concurrency. Missing defaults are merged only in memory until an explicit save.

### Automatic Cameroon employee calculations (2026)

Cameroon worker deductions now support **Automatic employee estimate** and **Manual verified total**. Existing nonblank manual totals, including zero, migrate to manual mode without losing values. Workspaces with blank or missing totals start in automatic mode. Selecting a mode does not delete the other mode's saved amount.

The automatic ordinary-employee model uses annual gross cash pay, the 30% professional-expense deduction capped at 4,800,000 XAF/year, compulsory worker CNPS pension, a 500,000 XAF annual allowance, and the 10/15/25/35% IRPP bands. CAC adds 10% of IRPP. Monthly gross below 62,000 XAF is IRPP-exempt. It uses the current 4.2% pension contribution, rather than the outdated 2.8% pension term still visible in the historical salary-scale appendix. The output is an annualized estimate; exact administrative salary-scale and pay-period rounding are not reproduced.

Worker deductions also show pension CNPS, employee CFC (1% of the gross base rounded down to a thousand), RAV's monthly salary-band levy, and TDL's basic-salary annual band divided by 12. Gross cash pay is used as basic salary and CNPS contribution salary unless overridden. Benefits-in-kind, contribution exclusions, special exemptions and low-wage CFC exceptions require verified local payroll review or manual totals. The general scheme is a planning default, not an employer registration decision.

Employer charges are separate: pension 4.2%, selected family scheme 7%/5.65%/3.7%, and confirmed work-injury group 1.75%/2.5%/5%. Pension and family bases are capped at 750,000 XAF/month; injury uses the uncapped contribution salary. Employer CFC (1.5%) and FNE (1%) use the gross base rounded down to a thousand. A blank injury group leaves employer totals unknown until the group is confirmed or a verified employer-total override is entered. An employer override replaces the tax/CNPS total, while component rows remain reference estimates. It excludes health insurance and additional shared costs.

Company contribution now deducts modeled/overridden employer charges, customizable company-paid insurance, and entered shared costs. Worker withholdings do not increase company spread. Avoid entering employer charges or insurance again in shared costs. Blank insurance and shared costs stay unknown; explicit zero remains zero. Unsupported automatic tax years remain unknown. No records are created or changed by these calculations.

Sources reviewed November 9, 2026: Cameroon DGI 2026 General Tax Code, sections 29, 34, 69, C 86 and housing/FNE/RAV appendices: https://impots.cm/sites/default/files/documents/CODE%20GENERAL%20DES%20IMPOTS%202026%20DGI%20VERSION%20ANGLAISE.pdf ; CNPS contribution schedule: https://www.cnps.cm/images/documentutile/annuairestat2025.pdf . Confirm employment arrangement, registration, local exemptions, CNPS class and remittances with a Cameroon payroll professional before actual payroll.

### Automatic Cameroon fields and customizable insurance
Salary bases, worker deductions, employer charges, and insurance portions display calculated XAF values and refresh when assumptions change. Optional manual overrides remain available and clearly labeled. Health insurance uses a customizable monthly insurer premium and company-paid percentage (0–100); the worker pays the remainder. Blank premium/share remains unknown; an explicit zero premium means no insurance expense. Existing separate worker/company insurance amounts migrate into saved-amount mode without changing records or values. Quote inputs switch to premium-split mode; editing separate amounts switches back. All inputs use the existing authenticated, version-checked workspace storage. Insurance is separate from tax/CNPS and counted once in company contribution.

### Micky company take-home
The Worker scenarios page includes a Micky summary with biweekly/monthly team revenue, gross wages, employer costs, company health insurance, additional operating expenses and a customizable company tax provision, plus allocated per-worker take-home. Cameroon uses modeled employer charges and the saved insurance split; US employer payroll taxes/benefits are a separate entered monthly team total. Company tax provisions are entered in USD separately for each location; the Cameroon summary converts to XAF. Required blank expense categories keep the final estimate unknown. Employee taxes and worker-paid insurance are already included in gross wages and are not deducted again. This is scenario company cash remaining, not personal after-tax distributions or a guaranteed net profit. New blank assumptions merge without overwriting saved data.

Micky company summary also shows an automatic provisional subtotal when expense categories are unconfirmed. It deducts all known costs, including known Cameroon employer components when the complete employer total is unavailable. Unknown costs stay unknown and are listed as excluded; final take-home remains unknown until all required categories are supplied. The subtotal becomes the final estimate when the categories are complete. No saved assumptions are changed.

### Single-owner LLC federal reserve (2026)
Worker scenarios now has an editable LLC tax treatment field, tax year, owner filing status, own W-2 wages, joint-return spouse W-2 wages and other ordinary income. Default planning assumptions are Schedule C treatment, US citizen/resident, single, standard deduction, no other income. S/C elections or unknown treatment do not use this model. Each worker scenario independently chooses automatic or saved manual reserve; existing nonblank manual provisions (including zero) migrate to manual mode. All settings use existing authenticated version-checked storage.

Automatic reserve annualizes scenario profit after operating expenses, calculates regular SE tax on 92.35% of positive profit (no regular-method SE tax below $400 net earnings), caps the 12.4% SS portion at the remaining $184,500 wage base after owner wages, adds 2.9% Medicare and applicable 0.9% Additional Medicare. Half of regular SE tax reduces income for progressive federal income tax. The income-tax reserve is incremental tax from adding profit to other entered ordinary income, with 2026 standard deduction. Annual reserve / 12 feeds the monthly USD expense, converted to XAF where applicable, exactly once. With incomplete expenses, a visibly provisional reserve uses known-expense profit; final take-home remains unknown. This is a scenario reserve, not a balance due or combined-business tax return. Defaults are not assertions of the owner's tax status.

Scope: no state/local taxes, QBI deduction, credits, itemized/age deductions, foreign tax credits, retirement contributions, other self-employment businesses, capital-gain rates, tax payments or withholding. All costs are assumed deductible. Manual mode allows an adviser’s complete reserve. Separate scenario taxes must not be added as a combined annual calculation.

Sources checked November 9, 2026: [2026 IRS brackets/standard deductions](https://www.irs.gov/irb/2025-45_IRB), [Schedule SE](https://www.irs.gov/pub/irs-pdf/f1040sse.pdf), [SE tax](https://www.irs.gov/taxtopics/tc554), [Additional Medicare](https://www.irs.gov/taxtopics/tc560), [LLC classification](https://www.irs.gov/businesses/small-businesses-self-employed/limited-liability-company-llc).
