# Partner («Գործընկեր») driver variants: notes (2026-10-11)

There is one driver app. Fleet drivers and partners see the same frame, tokens, pill, offer and ride flow; only the content differs.
Pages: `driver-partner-onboarding` (7 states), `driver-partner-home` (7), `driver-partner-wallet` (13), `driver-partner-car` (7).
Plus `driver-types.html`, which puts fleet and partner side by side: going online, home, money (earnings vs balance), blocked (insurance vs balance).
`driver-index.html` got five new list entries. `driver.css` / `driver.js` were appended to: `p-*` classes, `.go.x` (76px) and `D.partnerNav()`. No existing page changed.

## Numbers (Eco Comfort tier, Tesla Model 3 «44 KM 771», partner Կարեն Մելքոնյան: the console's own row)
Shared facts come from `kit.js` → `ECO.PARTNER`, which the console reads too: the payment code, the warning and block thresholds, the bank and office details.
- Fee («Միջնորդավճար») is **15 % per ride**, set by the partner's tariff (`ECO.PARTNER.rules.comfort`, console Tariffs / Fee plans). Today: 7 rides, 9 800 ֏ → **−1 470 ֏**.
- Per-ride example (Komitas trip at the Eco Comfort tariff, 700 + 110·4,3 + 14·6 → 1 300 ֏): fee −195 ֏. On a cash ride the driver keeps 1 105 ֏ and the balance pays −195 ֏.
- Week to date: 47 rides, 94 000 ֏ → fees 14 100 ֏. Statement: 12 550 + 20 000 − 14 100 = **18 450 ֏** (about 8 days at about 2 300 ֏/day).
- Warning below **3 000 ֏** (`ECO.PARTNER.rules.comfort.warnBelow`: Eco Comfort's rule; the console's partners list and Tariffs warn at the same value). Every screen that shows a rule names the tariff: «Միջնորդավճար 15 % · Eco Comfort». Block at `blockBelow` 0 ֏. The runway tick sits at 9 % of the 14-day scale. Low state is 1 850 ֏. Blocked state is −320 ֏. Mid-ride dip is −45 ֏.
- **Taxes are never a number.** Every tax line is dashed, with the «առաջարկ» tag and "—", until the accountant answers Q3.

## Decisions (each checkable on a screen)
1. **Home leads with the balance («Հաշվեկշիռ»):** balance hero, today's fee, and a runway bar measured in days of fees, with a tick at `warnBelow`. There is no car picker. The car chip has no chevron, because there is nothing to choose.
2. **One at-speed action per state, 76px:** «Ընդունել պատվերներ» · «Դադարեցնել» · «Լիցքավորեք հաշվեկշիռը» (blocked) · «Վերադառնալ պատվերին» (mid-ride) · «Կապ չկա» (disabled when offline). Low balance keeps top-up as a 44px pill inside the notice, so the big button never changes meaning while driving.
3. **Blocked is amber, not red.** It is a domain refusal, like the fleet's insurance block. Below zero, the shortfall is drawn left of a zero tick.
4. **The current ride always finishes** (`finish` state). The balance goes amber and a neutral notice says "next one after a top-up".
5. **Balance visuals:**
   - a ring for days left (14-day scale);
   - a per-ride stacked bar: keep / fee / hatched tax;
   - a weekly waterfall with one axis, signed labels, a dashed zero tax stub and a one-line key (balance / top-up / fee / tax). Fees are `--ink-2`, not full ink, on both the bar and the waterfall.
6. **Top-up:**
   - Hero is the personal «Վճարման կոդ» **000041**, with copy (48px) and a 3-step visual: code → transfer → balance. The format is the API's `driver.paymentReference` (six digits, zero-padded; migration `20261011100000_driver_payment_reference`), and the console's top-up matching reads the same code.
   - Two methods are live: bank (1 business day) and office cash (instant).
   - Bank details are one 48px row each (recipient, bank and masked account, purpose = the code); the whole row copies on tap.
   - Idram, Telcell and card are one quiet line, «Շուտով՝ Idram, Telcell, քարտ», not three disabled tiles.
   - The code is cached, so top-up instructions work offline.
7. **Car:**
   - The tariff is shown as set by the office («Սակագինը սահմանում է գրասենյակը»). While pending or rejected it reads «Սակագին՝ —».
   - Rejected (amber, like every domain refusal) shows the reason, the doc row, and one fix button. Expiring shows a 6-day chip plus «15.10-ից պատվերներ չեն գա».
8. **Onboarding:** the office took a first cash top-up at signup, so day one starts at 10 000 ֏, not 0. The approved moment has a single «Ընդունել պատվերներ».

## Audits and shots
- `audit.js` passes on every state in light, dark and sun: **57 runs, 0 overlaps, 0 clips, 0 contrast failures.**
- Shots are at @2x in `shots/driver-partner-*-{light,dark,sun}.png`. The comparison page is `shots/driver-partner-types-*.png` (full page) and `shots/driver-types-*.png` (index thumbnail).
- The runner is in the session scratchpad (local Playwright against :8090). Shared `tools/` were not touched.

## Placeholders (missing assets or content, still to supply)
- Bank recipient («Էկո Տաքսի ՍՊԸ»), bank and account (Ամերիաբանկ, 1570 •••• 4417), office address and hours (Կոմիտասի պող. 38 · Երկ–Շբթ · 09:00–20:00) are **example fixtures** from `ECO.PARTNER`. The real values come from the tenant's `settlement.topUpInstructions` (office / bank), which the wallet API returns.
- The partner's car photo is the fleet's Tesla render. Real partner cars need an uploaded photo or a per-model render.

## Open questions for the owner and design-head
- Resolved: the tier is «Eco Comfort» (owner, 2026-10-11), so it no longer collides with the driver type «Գործընկեր».
- Resolved 2026-10-12: the shared `--h-drive` is 76px, so fleet and partner at-speed buttons match.
- **Shared token request:** add `--p-plus` (money-in green) to `tokens.css`. `driver-earnings` defines the same value locally as `--plus`.

## Benchmarked against Uber Driver, Bolt Driver and Yandex Pro
- **Ahead:**
  - The balance as days of runway: Yandex shows only a raw balance.
  - Taxes shown as explicit off/proposal lines rather than hidden.
  - One big button per state: Bolt puts a top-up next to go-online.
- **Behind:**
  - No in-app card top-up yet: Yandex Pro tops up in two taps.

## Review fixes (2026-10-12)
X4 code and threshold unified with the console through `ECO.PARTNER`; X5 blocked verified amber with a lock in every partner state; the top-up placeholders were replaced with example fixtures; the copy rows are now 48px; the «Շուտով» tiles became one line; the waterfall got a key and fees moved to `--ink-2`; money uses a narrow no-break space («18 450 ֏»).

## P1/P2 pass, 2026-10-12: partner gaps (P02–P17)
### Shared with p12-c-ops (console approvals ?tab=applied)
- Self sign-up applicant in driver-partner-onboarding#applied: **Հովհաննես Գալստյան**, 093 18-62-04, Hyundai Ioniq 5 · 2023 · մոխրագույն, plate **19 HG 519**, applied «այսօր, 08:47», «Հայտ № A-0007». Drawn with a car icon, not an Eco render (an applicant's car has no livery).
- Rejected/moreinfo/suspended use Կարեն Մելքոնյան (ECO.PARTNER, 44 KM 771). Car#register shows the applicant's Hyundai Ioniq 5 · 19 HG 519; there are no page-local plates.
- Top-up: ECO.TOPUP (TU-0419, 5 000 ֏, office, 10:12, Անի Դավթյան). The console Top-ups page should list this row.

### Drawn
Onboarding rejected/moreinfo/suspended/terms/applied; car suspended/none/register; wallet receipt/arrived/unavailable/noaccount/notset/statement; home ridedone. Status bar 10:12 on receipt/arrived, 14:52 on ridedone.

### Drawn ahead
- Single-car registration from the app (P15, #none → #register): no API; §21 has driver-side upload post-v1.
- Partner self sign-up (P04) and the applied state: ADR-V2 `approval_status=applied`, no app flow yet.
- Versioned partner terms acceptance (P03): no terms-version field or accept endpoint.
- «More information needed» (P02 moreinfo) as an approval status with a per-document ask.
- Monthly statement (P11) and the top-up receipt detail with «Ընդունեց» / receipt number (P10): the ledger entry has no receipt id or operator name on the wire.
- Account-level suspension (P02 suspended) vs car-level (P13): both amber with a lock.
- Suspended car (P13) is a future scenario (insurance lapsed 15.10; the demo day is 9 Oct, where #expiring shows «6 օր»).


### New strings without i18n keys
«Մեքենան չի հաստատվել», «Եվս մեկ փաստաթուղթ», «Հաշիվը կասեցված է», «Գրասենյակի որոշմամբ», «Նոր պայմաններ», «Գործընկերոջ պայմաններ · տարբերակ 3», «Ընդունում եմ», «Ամբողջ տեքստը», «Հայտն ուղարկված է», «Գրասենյակը կզանգի», «Պատվերներ չեն գա» (replaces wallet.ordersOff «Նոր պատվերներ՝ ոչ»), «Կասեցված», «Մեքենայի գրանցում», «Գրանցել մեքենան», «Ուղարկել · մնաց N», «Լիցքավորումը ստացվեց», «Պատվերները նորից կգան», «Կտրոն», «Կտրոնի համար», «Ընդունեց», «Ուղարկել կտրոնը», «Քաղվածք», «Միջնորդավճար 15 %», «1 նախնական պատվեր · Ավտոմատ վերադարձավ դիսպետչերին», «Պատվերն ավարտված է».
Real keys used: wallet.unavailable, wallet.noAccount, topup.notSet, car.none, wallet.ordersOn, ride.collectCash, app.retry, car.title.

### Audit
crawl-local driver ×4 pages, 34 states × day/night/sun = 105 runs: 0 errors, overlap, occlusion, clip, contrast, small, targets<44, broken img. Screens looked at in all three themes; fixed moreinfo overflow, the applied step overflow, the multi-car row overflow, register counts.

## 2026-10-14: owner decisions and the copy pass
- **Words** (glossary): balance «Հաշվեկշիռ» (never «Դրամապանակ» / «Մնացորդ»), fee «Միջնորդավճար», top-up «Լիցքավորում», status pill «Առցանց» / «Անցանց», go online «Ընդունել պատվերներ», go offline «Դադարեցնել». No «՛».
- **One car per partner (decision 6).** `driver-partner-car#choose` is gone, with «Իմ մեքենաները», «Նոր մեքենա», «Հերթափոխ · ո՞ր մեքենայով» and the page-local plates 27 KM 202 / 46 KM 146. `#register` stays only as the one-car registration a partner with no car reaches from `#none`.
- **Rules come from the tariff (decision 3).** Fee 15 %, warning below 3 000 ֏, block below 0 ֏ are Eco Comfort's (`ECO.PARTNER.rules.comfort`). Wherever a rule is shown it names the tariff: home blocked, ridedone, onboarding facts and terms, wallet main/empty/breakdown. No "Standard plan" anywhere.
- **Blocked CTA** is exactly «Լիցքավորեք հաշվեկշիռը» (home#blocked, 76px).
- **Suspended (decision 7).** onboarding#suspended and car#suspended each carry one line: «1 նախնական պատվեր · Ավտոմատ վերադարձավ դիսպետչերին». No button; the partner does nothing.
- **Insurance block (decision 5)** for a partner is car#suspended: no orders until a new photo is uploaded and approved; the button is «Լուսանկարել նորը».
- **driver-types:** the fleet column has no balance, top-up or debt. Money compares earnings (fleet) with balance (partner); blocked compares expired insurance (fleet) with balance below 0 (partner).
- Car rejected is amber now (it was red), like onboarding#rejected: a refusal, not a failure.


## 2026-10-14 change list (owner)
- **Own order, partner variant** (driver-neworder#partner, drawn ahead): the tariff step offers only Կարեն's car tariffs (ECO.CAR_TIERS.partner: Eco Comfort, Eco City), each with its fare, plus one line «Միջնորդավճար 15 % · 195 ֏ · Հաշվեկշիռ 4 680 ֏» (ECO.PARTNER.rules.comfort; balance = ECO.TOPUP.after). Below 0 ֏ he cannot start it, as with any order.

## 2026-10-16: partners have no NFC (owner)

NFC (taken in the ACBA app, driver-confirmed) is a fleet-car method only. Partner screens carry none of it: the end-of-ride screen is cash only, and the onboarding payout card lists «Քարտ, Apple Pay, Google Pay» (Idram payouts). NFC orders are dispatched to fleet cars only.

## 2026-10-16: no payment switch for partners (D3)

Fleet drivers may switch Cash ↔ NFC at Complete (recorded on the ride); partners may not. `driver-partner-home#ridedone` is cash only, with no switch and no NFC.
