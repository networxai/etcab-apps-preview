# Console v2, phase 1: the apps system on a control-room console

`index.html` shows five screens (plus a fleet-driver variant), each at 1440×900 in light and dark. Each shot links to its live mock.
The pages are built only from `console.css` (which imports `../2026-10-09-apps/v2/tokens.css` unchanged), `console.js` and
v2's `kit.js` (theme from `?theme=`, the 2GIS MapGL adapter, `carTop`). The key loads from the git-ignored `v2/mapgl.local.js`.
Strings are Armenian, taken from `apps/operator/lib/i18n.ts` where a key exists. Tiers, tariffs and car renders are the real Eco ones.

## Token mapping: app to console
| Role | App v2 | Console v2 | Why |
|---|---|---|---|
| Font | Google Sans 400–700 | same; numbers in **Google Sans Code** via `.mono` | Columns of ages, phones, plates and fares need fixed-width digits *and* letters (plates). The Code face keeps the same family. JetBrains Mono and Inter are dropped. |
| Type | 40 / 22 / 17 / 16 / 13 / 12 | kpi 28 · title 18 · head 14 · **row 14** · body 13 · small/label 12 | Desktop density, readable from across the desk. Nothing below 12px. No uppercase labels (Armenian). |
| Grounds | ground #F4F4F2 · surface #FFF · surface-2 #F3F3F1 | `--ground` · `--surface` · `--surface-alt` = surface-2 | These are still the console's three named grounds. Dark: #0E0E0F / #161618 / #1F1F22. |
| Ink | ink · ink-2 #5E5E63 · ink-3 #6B6B70 | ink · **ink-muted #46464B** (8.45 on surface-alt) · ink-faint = ink-3 (4.77) | ink-2 is only 5.80 on surface-alt, under the console's 7:1. Dark: #C8C8CC 9.86 · #8E8E93 5.04. |
| Lines | hairline, `--line` | `--line-soft` = hairline · line-control #86868B (3.26) · line-strong #737378 (4.72 / 4.25) | Intake inputs keep a measured ≥3:1 edge. Panels use the app shadow with no border. |
| Radii | card 12 · control 14 · pill | card 12 · **control 8** · tag 6 · pill | 14 is right on a 52px thumb button and reads as a pill on a 28–36px desktop control. |
| Shadow | e1 / e2 | e1 on panels, e2 on popovers and map overlays | The same values. Never a border together with a shadow. |
| Brand | #2F7D0A fill (5.17), brand-ink, vivid #43A70A, lime | fill **#276608** (white 7.02) · text #215606 (7.88) · vivid and lime for graphics only. Dark: fill **#7CC90C** with ink #0E0E0F (9.39) | The console holds 13px labels to 7:1. The dark fill is the logo's end green, so the primary *is* Eco in both themes. |
| Status | ok #0B7A41 · warn · danger #C81E1E | `--ok-text` #075A30 (7.33 on ok-soft) · **guarded console warning #6B4400, danger #8A1C1C, info #2563EB, five lane oklch values unchanged** | The e2e `queue.spec` pins the guarded values at 7:1. The app's red is 5.9. |
| Icons | Lucide 1.54, stroke 1.75 | same, at 16px (14 in pills) | One icon set across all three surfaces. |
| Sizes | button 52 · row 56 · tap 44 | controls S28 / M32 / L36 (intake) · table row 40, two-line 52 · queue row 56–84 · head 48 | Mouse and keyboard, not thumbs. |
| Theme | `data-theme` on `<html>` | same. Light is the base, dark is first-class, never `prefers-color-scheme`. | Unchanged console rule. |

## What changed from the current console, and why
- **Look:** warm app neutrals replace the cool Vercel greys. Panels float on the ground as 12px cards with e1, replacing hairline-boxed regions. The real Eco logo heads the nav, and the mark heads the collapsed rail.
  Tier pictures (the owner's renders) appear wherever a tier is chosen or shown: intake, rides, driver car, tariffs and overview.
- **Dispatch uses a 56px icon rail** (the nav collapses; the counts stay as badges). The 168px it frees goes to the queue (452px) and the map.
  The driver strip is new: free drivers first, longest idle first, with car, plate, state and idle time.
- **Queue lanes are reordered as problems, unassigned, searching, active** (a departure: code order puts problems last). Whatever needs a human sits at the top and can never fall below the fold.
  Problem rows take a third line so that Assign, Send to search, Force state and Call stay one click deep (§9.4). The reason is never truncated.
- **No tint on late rows.** Lateness shows in the age colour and the 2px SLA bar only (a tint floods at 16 rows). Selection uses `--surface-alt` plus a 1px `--line-strong` ring.
- **Intake** keeps phone and pickup as the only required fields. The tier picker is a 2-column grid of car and price for the typed route (keys 1–7).
  Clearing became an icon button (Esc), so the summary «1 100 ֏ · Eco City · 4,3 կմ · 6 ր» never truncates.
- **Live cluster on every page:** problem count, socket state, operators present, per-event sound, language and theme sit in the top bar, so admin screens still hear and see the queue (§9.2).
- **Rides list is a route of its own, beside Search (owner decision, 2026-10-12).** The code has `rides/[id]` and `/search` only; the owner keeps both: Rides is today's master–detail list with a docked panel, never a modal (§9.8), and continuous scroll; Search stays the cross-date lookup (§9.5). The console must add the `/rides` route.
- **Drivers is fleet drivers only (phase 2).** Shift car, documents, «Ավարտել հերթափոխը» visible. Tabs Overview / Rides / Shifts / Documents / Rating. (Owner 2026-10-14: fleet drivers have no balance, so the settlement-by-billing-plan and Money tab are gone.)
- **Tariffs and tiers** draws every tier-picture state at the rider card size (108×56): uploaded with Replace and Remove, bundled icon with Upload, uploading, and refused with focus on the button plus a `aria-describedby` error.
  A tariff matrix shows each tier's price for the reference route, and the right rail previews the rider app's own tier row (owner rule: snap row with a peek).
- **Overview** has a KPI strip, rides per hour against the same weekday last week (bars against a dashed step line, so the two differ by form as well as colour), tier and payment mix in a single hue, a live map, and «Needs a decision», which feeds Requests.

## Trends refused on the console, and why
- Glassmorphism and translucent map overlays: they drop label contrast over a busy basemap on a cheap panel. Overlays are opaque `--surface` with e2.
- Animated state transitions and skeleton shimmer: a delayed read under stress. State changes stay colour, motion (the SLA bar) and sound together.
- Bento and generous whitespace on Dispatch: it costs rows (§9.8 #1). The admin screens get more air; the queue does not.

## Phase 2: Partners, its own nav group (owner: «the partners must have a different management section»)
Group «Գործընկերներ»: Partners · Approvals (alarm badge) · Top-ups · Fee plans. Rider app's «Գործընկերներ» (businesses) became «Բիզնես գործընկերներ» so one word means one thing.
Rider app and Admin groups fold (chevron) unless they hold the page, so 25 items fit in 900px. Term «Գործընկեր» per the owner, replacing «Անկախ».
- **Partners list** (`partners.html`): balance column, normal, **low** (< 3 000 ֏, amber + triangle + amount) or **blocked** (< 0, **amber** + lock, the same as the partner app and the fleet driver app: a domain refusal, not a failure); never colour alone. Thresholds read `ECO.PARTNER` (kit.js), the one source shared with the partner app.
  Also car approval, documents and online state. Filters: all / blocked / low / pending approval / documents expiring. «Նոր գործընկեր» (office creates partners).
- **Partner detail**: tabs Overview, Wallet, Car, Documents, Rides, ★. Overview: amber blocked notice (a domain state, so amber, not red), wallet with the personal «Վճարման կոդ» (six digits, `000041`: the API's `driver.paymentReference`, the same code the partner app shows), car with its operator-set class, plan and documents.
- **Wallet** (`?tab=wallet`): the list narrows to name + balance and the panel widens; the top-up is an **inline panel, never a modal**.
  It takes office cash or bank transfer, the amount (quick chips), a receipt number that is automatic and locked, who received it, an optional note, and SMS receipt and print.
  It shows the new balance and that the block lifts. The ledger keeps a running balance: per-ride fees (15% × fare), daily fee groups, an adjustment *with its reason*, and a reversal with reason (the reversed top-up is struck through). There are statement and adjustment actions.
- **Approvals** (`approvals.html`): pending cars oldest first. Six document slots side by side, each with a «checked» box; a missing photo shows as «Պակասում է».
  The operator sets the class (and so the tier and fee). Reject stays disabled until a reason is typed, and the reason goes to the partner. «Ask to complete» sits between Reject and Approve.
- **Top-ups** (`topups.html`): today's top-ups with method, receipt or reference and who recorded each; a reversed one is muted. Till close compares expected against counted.
  Bank lines are matched by «Վճարման կոդ» (tolerant of spaces: «000 035» matches 000035); a match still needs the operator's «Գրանցել». No code means «Ընտրել գործընկեր».
- **Fee plans** (`feeplans.html`): Standard (default) as % per tier with the example split for us and the partner, plus individual plans and balance rules (block below 0, warn below 3 000 ֏, where checked).
  Tax lines are present and **off**, with empty rates and an amber «accountant decides» note; no rate is invented. Versions are effective-dated. Fleet plans stay under Ֆինանսներ.
Illustrative numbers (my choice, the owner to set): 15/15/16/18/18/20% per tier, warn at 3 000 ֏.

## Review fixes, 2026-10-12
- **One data set.** Shared facts come from `ECO` in `../2026-10-09-apps/v2/kit.js`: money «1 100 ֏» (narrow nbsp), comma decimals, the demo day (Ուրբաթ, 9 հոկտ.), the walkthrough ride, the launch payment roster (cash + company account; card/Idram/Telcell «Շուտով» everywhere), partner «Վճարման կոդ» (six digits, `000041`, the API's `driver.paymentReference`) and the warn/block thresholds. `amd()`/`nf()` here delegate to it.
- **Dispatch at 9:41.** The walkthrough ride (Մաշտոցի պող. 37 → Կոմիտասի պող. 22, booked in the rider app at 9:40) sits in the Searching lane, offered to Արամ Պ. (01 ET 001, free), and its route is the one on the map. The intake is a separate phone order (Կոմիտաս 12 → Հալաբյան 41, 3,6 կմ · 9 ր, 1 000 ֏). Rides list carries the same ride finished (#R-2417, 1 100 ֏). Other pages are later in the same day (14:26).
- **Review chrome.** The floating «Ինդեքս · Light · Dark» switcher is gone; «Ինդեքս» is a link in the top bar beside the real theme toggle.
- **Shortcut legend** is the queue card's footer (32px, surface-alt), outside the scroll box; rows scrolled behind it are not on screen. The generic review crawler's occlusion hits there were scrolled-out rows; `console-audit.js` (clipped rects) reports 0.
- **Tiers** are named verbatim everywhere, including the approvals class picker and the approve button («Հաստատել՝ Eco Comfort»); the old class words (Էկոնոմ, Կոմֆորտ…) are gone.
- Pills are never ellipsised (`.tbl td:has(> .pill)`), document rows wrap the title with the validity date on its own line, the partner wallet list shows «Անուն Ա.» with the balance column fixed.

## Row count (`#queue`, rows wholly inside the scroll box)
**9 at 1440×900** (bar ≥ 8), with 12 rides loaded and two 3-line problem rows. **7 at 1366×768.** Rides list 14 · drivers 12 · partners 12 rows at 1440×900.

## Audits (`console-audit.js`, adapted from v2 `audit.js`; `tools/mk.sh "<pages>" "[[w,h],…]"`, then run `tools/shoot.js` in the Playwright MCP)
10 pages × 2 themes × 2 sizes is **40 runs** (live 2GIS where there is a map): **0 overlaps, 0 clips, 0 contrast failures, 0 console errors, 0 small-text results under 7:1** (ink-faint excepted, guarded at 4.5). The tightest margin is 1.06×.
- Console additions: anything outside its scroll box is off screen; overlaps use clipped rects; a horizontal cut is a clip.
  Truncation is allowed only in `[data-truncate]` / `.trunc` / cells, and never in pills, chips, plates, tags, buttons or table heads.
  An ancestor's ellipsis counts only for inline content (it caught tier names silently cut in the fee table). Every truncation is counted.
- Fixed in phase 1: problem-reason truncation, the strip overlap, the intake summary, panel actions off the edge, the 1366 tier chip and map key, `--ok` at 4.76 in pills (now `--ok-text`).
- Fixed in phase 2: the partner list's cut phones and state pills at 1366, ledger reasons truncated (now wrap), the top-up method labels, and disabled tax fields that had been faded below AA.

## Gap screens (from `2026-10-11-console-gaps.md` §3): where each goes in the nav (not designed)
- **Requests** (new, top group, alarm badge): deletion requests, wrong-car reports, documents expiring within 14 days, blacklisted riders refused in the app, later withdrawals. Kept out of the live queue (§9.8).
- **Dispatch**: the driver's «Չեմ հասցնի» is now drawn (see P0 pass below) as a problem row in the Scheduled lane with Release / Reassign; `low_rating` (24 h SLA) is still to be drawn in the Problems lane.
- **Drivers → detail tabs**: Rides (commitments, Release), Money (fleet settlement), Documents, Ratings. Partner money is designed in phase 2.
- **Ֆինանսներ (Money) group**: Riders (debt), Companies, By month (company tracking), Fiscal receipts, Reports (incl. the company report; partner fees and taxes for the accountant). No fleet settlement and no invoicing (owner 2026-10-14).
- **Ուղևորի հավելված (Rider app) group**: Promotions (upload, schedule, preview), Business partners, App texts and contact (support phone, OTP text, hours), later Broadcast push.
- **Ride detail**: cancelling party and reason, rating and comment, demo flag, no-show timer source. Everything has a slot in the panel's sections.
- **Settings → Money tab**: partner top-up SMS and instructions, company-credit estimate, tax lines (off). Partner fee and minimum balance are per tariff in Միջնորդավճարներ.

## Open
- Problems-first lanes and the dispatch rail: **approved** (owner, 2026-10-11).
- Applied partners (self-sign-up, ADR-V2) have a tab in Approvals but no screen yet. The Vehicles list still needs an owner column and partner cars (gap #57).
- Google Sans trademark (carried from apps v2), and whether Google Sans Code is acceptable as the console's mono.

## P0 pass, 2026-10-12: pre-orders and corporate intake (coverage audit batch 3)
All booking data reads `ECO.BOOKINGS` (kit.js), the same five bookings the rider and driver apps show, plus one local row
(Դավիթ Կ.'s 10:00 airport run, set off at 09:35 — the car the Active lane shows «Ճանապարհին» to Հալաբյան 41).
- **`dispatch.html?tab=scheduled` (C04).** «Պլանավորված 6» selected. As in `scheduled-lane.tsx`: the booking form sits at the
  top of the lane, then the lane header, then rows ordered by the promised hour, which leads in its own mono column (weekday
  above it when not today). No age, no SLA bar, no claim. Line 1 pickup; line 2 phone + destination, or the reason in the
  destination's slot (`problem.driver_blocked` on the Sunday booking). «Կարող է մեկնել 09:35-ից» / «Վարորդը մեկնեց 09:35»
  take a small third line (the real row puts them beside the pickup; at 452px the pickup lost). Cancel is on every row
  (real: two-press ArmButton «Չեղարկել ամրագրումը»; drawn with the short word, the full name in `aria-label`).
- **`?intake=booking` (C05).** The same form filled: phone, pickup, Company / Personal (the caller is a company rider; the
  booking is personal), the typed `DateTimePicker` «10.10 08:30» and its read-back «Ամրագրվում է Շբթ, 10 հոկտեմբերի, 08:30»
  (`formatWeekdayDateTime`; the year only when not this one), «Ամրագրել» secondary (the new-order submit stays the screen's one
  primary). Keyboard path: phone ⇥ pickup ⇥ «10.10 08:30» ⏎, well under 20 s. `&picker=1` opens the calendar
  popover (month grid, the three quick picks «+30ր · Մեկ ժամից · Վաղը առավոտյան», «⏎ հաստատել · Esc փակել»).
  There is **no driver field** in the form, as in the real `BookingIntake`: pre-assigning is the booking panel's.
- **`?intake=company` (C08).** Customer card with the company badge «Արարատ Սոֆթ ՍՊԸ · հաշվեկշռով» (`intake.card.onAccount`),
  «Ով է վճարում» Company / Personal (`intake-billing.tsx`). *Superseded 2026-10-14:* the cost-centre code field is removed
  (owner change list); the state now shows the employee's remaining monthly limit and whether the trip is between allowed places.
- **Intake sub-tabs (C10, contradiction fixed).** The loose «Նշումներ» field is gone; band 3 is the real tablist
  «Քարտեզ · Նշումներ · Համաձայնեցված գին» (`intake-sub-tabs.tsx`). `?intake=price` selects the agreed price («2 400 ֏»), and
  the summary reads «2 400 ֏ · Համաձայնեցված գին». The map tab points at the map column in this layout.
- **`rides.html?ride=booking` (C06).** The list filtered to «Պլանավորված 6»; the docked panel for B-0912 (Աննա, Շբթ 08:30,
  Սուրեն Մ.): Reassign (A), «Ազատել վարորդին», the ArmButton «Չեղարկել ամրագրումը»; time, addresses and agreed price edited
  in place; the pre-assigned driver with «Նոր պատվերներ չեն գա 08:00-ից», «Կարող է մեկնել 08:00-ից», activation 08:15.
- **Ride timeline shows a driver's decline reason** (`rides.html`, 14:08 «Առաջարկ · հրաժարվեց [Հեռու է]», who: Վահե Ս.).
- **`settings.html` (C45, Dispatch tab only).** The real `dispatch-settings.tsx` five groups in one column, values in units;
  Money and Invoicing are tab heads only. The Pre-bookings group carries the new rider reminder lead
  «Հիշեցում ուղևորին նախնական պատվերից առաջ · 30 րոպե» (`ECO.DISPATCH.reminderMin`).

### Drawn ahead of the app
The console must catch up with these; each is drawn as the target design.
- **Booking panel** (`rides.html?ride=booking`): pre-assign / release / edit time, addresses and price. The API has
  `PATCH /scheduled-rides/:id`; the console has only the lane's cancel and the create form.
- **Pre-assigned driver on the lane row** (line 2's name): `queueBookingRowSchema` carries no driver.
- **«Չեմ հասցնի» as a request** (owner decision 2026-10-12): a problem row in the Scheduled lane, «Չեմ հասցնի · Արամ Պ.-ի
  հարցումը, 09:31», with «Ազատել» / «Վերանշանակել A» / call the driver one click deep. No API, no problem kind yet
  (`pre_assigned_driver_cant_make_it` proposed).
- **Driver decline reason in the ride timeline / decision log** (owner decision: the driver must pick a reason). The decline
  route takes no body today; `offer.declined` would carry the reason code, and the reports read it.
- **Rider reminder lead in Settings → Dispatch → Նախնական պատվերներ** (owner decision): no config field
  (`scheduled.reminderLeadMin` proposed, 0 = off) and no rider push type yet.
- **Rides list route** `/rides` (owner decision: keep it beside Search).
- **Settings tabs** Dispatch / Money (the Invoicing tab was removed, owner 2026-10-14).

### Needs owner decision
- Nothing left from the P0 batches on the console. (Rides list vs Search and the cancel/decline/can't-make-it rules were
  decided 2026-10-12.)

### Data note
- Resolved in the p1p2 pass: Արամ's booking B-0898 is now 10:35, held from 10:05, so it no longer overlaps the 9:41
  walkthrough offer. The lane reads `ECO.BOOKINGS.kom`, so its row says «Կարող է մեկնել 10:05-ից».

## P1/P2 pass, 2026-10-12: the remaining real routes, the Requests inbox and every console P1/P2 state (coverage audit batches 5 and 7)
Every real console route now has a v2 mockup. The nav links all of them (`console.js` PAGES; `settlement` → billing.html,
`customers` → customer.html, the nav search box → search.html).
- **Owner ruling (a), drawn ahead:** when a rider presses «Սկսել հիմա», the pre-assigned driver gets the first offer; on
  decline or timeout the ride goes to normal dispatch (`rides.html?ride=booking-now`; driver `driver-offer-states#preorder-now`;
  rider `rider-preorders#start-sent` / `#start-fallback`).
- **Data:** Արամ's insurance is expired on 02.10.2026 on every surface (driver-account#docs, requests, drivers list and detail);
  his rides tab reads the 9:41 day (R-2417 live, one earlier ride, 1 200 ֏) and holds today's 10:35 booking.

### Sign-in, search, customer, vehicles, billing, operators (p12-c-admin1)
### Drawn
- login.html, search.html, customer.html, vehicles.html, billing.html and operators.html are all in console.css + console.js shell() (login has no shell). Each mirrors its real route and components; the header comment in each file names them.
- console.js: the NAV label for `settlement` is now «Հաշվարկներ» (nav.billing), replacing «Վարորդների հաշիվներ».
- kit.js: `email` was added to each ECO.OPERATORS entry. The real operator model has an email and no name.

#### Drawn ahead of the app
- **Login.** A QR on the enrolment card. setup-key.tsx enrols by key text only, and §6.19 lists the QR as a proposal. The hy string `auth.totp.explain` already says «Սկանավորեք կոդը».
- **Customer.**
  - The summary strip: rides, rating, debt and no-shows in 90 days. The real record only links to search.
  - The anonymised view: copy for §10.13's rules (what is removed, what stays).
- **Operators.**
  - The person's name under the email. The API has no name field.
  - ?as=dispatcher: a lock page in place of the silent `router.replace('/dispatch')`.
- **Vehicles.** The class column uses the tier list (Eco City … Eco Vip), following v2 ruling X10. The real `vehicle.class.*` is Էկոնոմ / Կոմֆորտ / Միկրոավտոբուս. Mobile and frontend should converge on one.

#### Decided by the owner, 2026-10-14 (formerly open)
- ~~**Recovery codes at TOTP enrolment.**~~ **No backup codes; the owner resets an operator's two-step sign-in from Operators.** Not drawn. Neither the API nor the console has them; today recovery is an admin's «Վերակայել նույնականացումը».
- **Vehicle class = tariff tier** (owner). The real `vehicle.class.*` must converge on the tariff names.
- **Dispatchers see Rides and Requests** (owner); the ?as=dispatcher rail now includes both.

#### New strings without i18n keys
- **login:** «QR · նախագիծ», the three enrolment steps (1–3).
- **customer:**
  - «Ամփոփում»;
  - the KPI labels: «Պատվերներ», «Գնահատական», «Պարտք», «Չներկայացավ», «վարորդներից», «պարտք չկա», «90 օրում»;
  - the blacklist byline «հաջորդ պատվերը մերժվում է, հավելվածում մերժվեց …-ին»;
  - the anon banner «Ուղևորը ջնջել է հաշիվը · …» plus its sentence, and «Հեռախոսը հեռացված է»;
  - «Զանգել».
- **operators:**
  - «Առաջին մուտքին կկարգավորի նույնականացումը»;
  - the ?as=dispatcher copy: «Այս էջը ադմինի համար է…», «Օպերատորներին ավելացնում…», «… · այսօր՝ անձայն վերահղում…».
- **vehicles:** the dispatcher line «Մեքենա ավելացնել, հաստատել և հանել կարող է ադմինը…».
- **billing:** the lead line naming fleet drivers vs partners, with the link to Վճարի պլաններ.

### Promotions, reports, zones, requests, audit, integrations, settings tabs (p12-c-admin2)
### P1/P2 pass: admin pages B (promotions, reports, zones, requests, audit, integrations, settings tabs)
- **`promotions.html` (C43).** promotions.tsx's image-led rows (thumbnail · title/subtitle · what a tap does · order · state ·
  edit + on/off), the on/off chips, search; the right column is the rider home's lower half (search bar, place chips, the ad
  carousel) at 0.72, built from the same values as rider-home.html, cards = `ECO.PROMOS`. `?new=1`: promotion-create.tsx's
  12-column card (title 6 · subtitle 6 · body 12 · image 6 · link 6 · destination 9 · order 3); submit disabled until the
  address is picked from the suggestions; the draft slots into the preview at order 25. Order header is «Հերթ.» (abbr title
  the full word) so the column stays 64px at 1366.
- **`reports.html` (C44).** daily-report.tsx/report-ledger.tsx: Today/Yesterday, from/to, driver, company, «Ներբեռնել CSV»;
  the window in words in Yerevan time; total 186 with the bounded-table line; twelve fixed columns, headers wrap to two lines;
  the variance column empty with `report.varianceExplains` above the table. `?company=1` = the corporate CSV. No chart, on
  purpose (the real report has none; the only interesting series, variance, is unmeasured).
- **`zones.html` (C42).** Live 2GIS map (loads mapgl.local.js like dispatch; raster fallback otherwise), three zones in lane
  hues, the toolbar top-left on the map, the list or the editor in a 360px panel. `?edit=1` opens the airport zone.
- **`requests.html` (C49, C50).** Drawn ahead. See "Drawn ahead".
- **`audit.html` (C47), `integrations.html` (C48).** Straight from audit-log/audit-ledger.tsx and integrations.tsx.
- **`settings.html` (C45).** Tab heads are links; `?tab=money` and `?tab=invoicing` render from `settings-money.js` using
  the page's own row builders; Dispatch is unchanged (reminder row and scroll-to-it intact).

#### Drawn ahead of the app
- **Requests inbox** (`/requests`, no route): one inbox for decisions that are not rides — driver deletion requests (today
  only on the driver detail as `drivers.deletionRequested`), wrong-car reports (the driver's «Սխալ մեքենա է» has no console
  surface), documents expired / expiring within 14 days (today only per driver), blacklisted callers refused in the rider app
  (no event reaches the console today). Badge = decision rows only (4).
- **Fiscal and unsettled exceptions** (`requests.html?tab=fiscal`): no fiscal API, no unsettled-ride query. Proposed: a
  receipt state per ride (issued / pending / failed with attempts) and a "company ride with unknown fare" list.
- **Settings → Invoicing as its own tab**: real money-settings.tsx renders InvoicingSettings at the bottom of Money.
- **Wrong-car repair action** «Վերաբացել հերթափոխը … -ով»: today the operator ends the shift and opens a new one.
- Earlier NOTES said "today admin/settings renders only DispatchSettings" — it renders Dispatch and Money as a segmented
  control (dispatch-settings.tsx `settings.tab.*`); only Invoicing-as-a-tab is ahead.

#### Data choices
- Requests reuse app facts: Արամ's deletion request at 15:10 (driver-account#deleterequested says «Այսօր, 15:10»; the inbox,
  seen at 9:41 the next morning, says «երեկ 15:10»), his insurance expired 02.10.2026 and permit until 21.10.2026
  (driver-account#docs), Վահե's expired and Լիլիթ's/Վարդան's 9-day documents (drivers.html docState), ECO.BLACKLIST refused
  at 9:12. Wrong car is page-local (Տիգրան Ա., 35 OS 512 vs 12 TT 304) so the walkthrough driver's car stays right.
- Inconsistency spotted, not mine to fix: drivers.html marks Արամ's documents «Կարգին» in the list while his panel shows
  ԱՊՊԱ until 20.10.2026 and the driver app shows insurance expired 02.10.2026. Recommend drivers.html list → «Ժամկետանց».
- Fleet thresholds −5 000 / −3 000 ֏ come from driver-earnings (Սահմանաչափ՝ −5 000 ֏; «Մոտ է սահմանին» at −3 850).

#### Decided by the owner, 2026-10-14 (formerly open)
- No invoicing at all: the Invoicing tab and every invoice screen are removed; company reports replace them.
- A blacklisted rider refused in the app reaches dispatchers as an information notice (Requests row + one queue-footer line).

#### New strings without i18n keys
- Requests: «Հարցումներ», «Որոշում է պետք», «Տեղեկություն», «Այլ բաժիններում», «Ֆիսկալ և չհաշվարկված», «Ջնջման հայտ»,
  «Սխալ մեքենա», «Ապահովագրությունը ժամկետանց է», «Վկայականը ժամկետանց է», «Սև ցուցակ · մերժվեց հավելվածում»,
  «Գործընկերների մեքենաներ և հայտեր՝ Հաստատումներում», «Բանկային փոխանցումներ՝ համադրման սպասող», «Վերաբացել
  հերթափոխը … -ով», «Փակել՝ առանց փոփոխության», «Հերթափոխը բաց է», «Հաշվարկը բաց է», fiscal: «Ֆիսկալ կտրոններ ·
  չթողարկված», «ՀԴՄ-ն չպատասխանեց», «Չհաշվարկված պատվերներ», «Ընկերության պատվեր՝ գինն անհայտ», «Նշել գինը»,
  «Վերջին թողարկվածները», «Նշել որպես ձեռքով թողարկված», «Կտրոնը պատրաստվում է».
- Promotions: «Ինչպես է տեսնում ուղևորը», «Հերթ.» (abbr), «Նկարը չի բացվում», «Նոր · չպահպանված».
- Audit: «Համակարգ» as the system actor's name (real shows only «(ավտոմատ)»), the target-trail footnote.
- Settings: Money/Invoicing lead lines, «Տարբերակ 14 · մեկ կարգավորում, մեկ պահպանում».
- Zones/Reports/Integrations: none beyond the catalogue (integration field names and hints are the real English, by design).

### Dispatch, ride panel, drivers, partners and approvals states (p12-c-ops)
### Drawn
New companion scripts keep pages under 500 lines; each page loads one: `rides-panels.js` (rides.html), `dispatch-states.js` (dispatch.html, hooks `DX.lanes()` / `DX.after()`), `drivers-tabs.js`, `partners-tabs.js`, `approvals-applied.js`.
- **rides.html** panel states open in place under the panel head (head and action row stay in view; no scroll, no modal): `?panel=force`, `force-nodriver`, `reassign`, `decisions`, `edit`, `conflict`, `noshow`, `billing`, `cancelled`; `?ride=booking-now`. The action row gains a details (pencil) button; the open control is outlined.
- **dispatch.html** `?state=problems|degraded|conflict|quiet|expired`, `?intake=blacklist|reused|refusal`. Rows: 9 at 1440 / 7 at 1366 everywhere except problems (8 / 7, problem rows are 3-line) and quiet (2 by design).
- **drivers.html** `?tab=rides|money|docs|rating`, `?action=create|code|offline|shift|deletion` (with `&d=` for the driver concerned: Հայկ Ս. lost → force offline; Մհեր Ա. off → open shift; Սոնա Խ. → deletion request).
- **partners.html** `?tab=car|docs|rides|rating`. **approvals.html** `?tab=applied` (Հովհաննես Գալստյան, 19 HG 519, A-0007 — same as driver-partner-onboarding#applied).

#### Drawn ahead of the console/API
- Ruling (a) start-now: `rides.html?ride=booking-now` — first offer to the pre-assigned driver (ECO.BOOKINGS.air.startNow, 20 s), then normal dispatch. No start-now endpoint.
- Decline reason chip in the decision log (offer.declined carries no reason).
- Problem kinds: driver cancelled with reason, low rating (24 h SLA), «Չեմ հասցնի» request (no problem kind; `pre_assigned_driver_cant_make_it` proposed).
- Ride panel: rating + comment, demo flag, cancel reason text (party is real).
- Session expiry keeping the draft (today `session.ts` resets the intake draft on sign-out).
- Degraded freshness line «թարմացվեց N վրկ առաջ» and map «դիրքերը՝ N վրկ առաջ».
- Driver tabs Rides (commitments + Release) and Rating; office «Բացել հերթապահություն» (no operator shift-open route); «Ճշգրտում» button (adjustment is a ledger kind, no form).
- Partner tabs Car, Docs, Rides, Rating; approvals «Գործընկերոջ հայտեր» (self-sign-up, ADR-V2).

#### Design decisions recorded (spec silent)
- Claim conflict sentence uses the queue footer slot (32 px) so no row moves; the row gets a one-shot blue outline + flash (motion + colour + word; reduced motion: outline only). Sound: the existing claim-lost tick (per-event, mutable).
- Opened panel controls sit directly under the panel head rather than scrolling to them: identity and the action row never leave view.
- Quiet state: lane headers stay with «Դատարկ է» rather than collapsing — the lanes' order is the room's map.

#### Decided by the owner, 2026-10-14 (formerly open)
- **Blacklist tone: amber + octagon** (owner #13), never red. ~~**Blacklist tone.**~~ The real `BlacklistNotice` / customer-card flag uses the error (red) tone; the console rule says red only for failures, amber for domain refusals. Drawn red as built. Recommend amber + octagon icon; owner/design call.
- **No override** (owner #14): intake disables «Ստեղծել պատվեր» the moment the phone matches.
- **Low rating = 1–3 ★, follow-up within 24 h**, configurable in Settings → Dispatch (owner #15).

#### New strings without i18n keys (hy)
Panel: «Մանրամասներ» (as button label reuses ride.edit), «գրանցվում է՝ Անի Դ.», «Նշանակված, Ճանապարհին, Տեղում, Ուղևորի հետ և Ավարտված վիճակները վարորդ են պահանջում․ նախ նշանակեք», «Նշանակելիս … ստանում է «Պատվերը փոխվել է»…», «Ուղևորը չի երևում», «վարորդը տեղում է … -ից», «սպասում · անվճար սպասումը՝», «Վարորդը նշեց «Ուղևորը չեկավ»», «Գնահատական», «Ուղևորից/Վարորդից», «Մեկնաբանություն», «Փորձնական պատվեր», «Չեղարկում», «Վարորդին · Ոչինչ չի գանձվել», «Ավարտված պատվերը չի փոխվում», «Ուղևորը սկսեց հիմա», «Առաջարկ նախապես նշանակված վարորդին», «Եթե հրաժարվի կամ չպատասխանի՝ սովորական որոնում», «Սկսվեց հիմա · առաջարկ».
Dispatch: «թարմացվեց N վրկ առաջ», «դիրքերը՝ N վրկ առաջ», «Սեսիան ավարտվեց», «Սեսիան ավարտվեց · պատվերը պահված է», «մուտքից հետո «Ստեղծել պատվեր» ⏎», «Հերթը հանգիստ է», «Վերջին պատվերը՝», «Նոր պատվերը կզանգի իր ձայնով», «Վերցնելու հասցեն քարտեզի վրա չէ · պատվերը կընդունվի, ավտոմատ որոնում չի լինի» (reuses ride.actions.notSearching.pickup_not_geocoded), problem lines «Վարորդը չեղարկեց», «Ցածր գնահատական», «Չեմ հասցնի», buttons «Նշանակել այլ», «Բացել պատվերը», «Դիտված է».
Drivers/partners: «Պարտավորություններ», «Թողնել իրեն», «Ճշգրտում» (button), «Բացել հերթապահություն», «Ընտրեք մեքենան․ վարորդը կտեսնի «Բացել է դիսպետչերը»», «Երկրորդ սեղմումը ջնջում է», «Կասեցնել մեքենան», «Փոխել դասը», «Հաստատման պատմություն», «Գործընկերոջ հայտ», «Հաստատել գործընկերոջը», «Ինչ է լինում հաստատելիս».

#### Audit (quick, light/dark at 1440 only — final pass left to parent per instruction)
console-audit: 0 overlap / 0 clip / 0 contrast / 0 small7 on all rides panels, drivers, partners, approvals states and dispatch problems/degraded/conflict/quiet/blacklist/reused/refusal after fixes. Known false positive: `dispatch?state=expired` lists 2 "occluded" intake fields (Երբ/Վճարում) half-scrolled under the re-sign-in strip — same category as rows under the queue footer. Row counts: problems 8@1440 / 7@1366; reused 7@1366; conflict 7@1366; others 9@1440. Thumbnails not shot (per instruction).


## 2026-10-14: Armenian copy pass, style pass and the owner decisions of 14 October
- **Copy.** Every visible string was rewritten to one glossary: `scratchpad/armenian-copy.md`, summarised here.
  - «ուղևոր», not «հաճախորդ».
  - «նախնական պատվեր», not «ամրագրում» or «Պլանավորված».
  - «սակագին», not «դաս».
  - «հերթափոխ».
  - «Ուղևորը չեկավ».
  - «միջնորդավճար».
  - «հաշվեկշիռ», partners only.
  - Buttons are infinitive verbs. There are no «՛» marks.
- **Nav (console.js).** «Հաշվարկներ» (fleet billing plans) and «Հաշիվների ձևավորում» are gone; «Ըստ ամսի» is new; «Ուղևորներ», «Միջնորդավճարներ», «Գովազդներ», «Գովազդատուներ», «Ֆիսկալ կտրոններ», «Մատյան» ⚠. Requests badge 3.
- **Pre-orders (#1, Q1).** A per-tariff switch in Tariffs (`ECO.TIERS[].preorders`). When due, or started now by the rider, the system searches automatically among that tariff's drivers, the pre-assigned driver first. The lane reads «ավտոմատ որոնում · {tier} · {time}-ին».
- **Redirects kept so old links do not 404:** `billing.html` → `feeplans.html`; `invoices.html` → `reports.html?company=1`.

### Operations pages
### Ops pages, owner decisions of 2026-10-14
- **SOS (dispatch?state=sos).** An SOS is the one thing on this console allowed to fill a strip in red. It sits between the top bar and the work area — above every lane, covering nothing — so §9.8's "modal that steals focus mid-call" cannot happen: a dispatcher typing an order keeps the cursor. It does not time out; only «Լուծված է» clears it (the press is audited). Signalled by colour + one pulse (icon disc, queue row, map pin) + the SOS sound, which repeats until resolved and is the one sound the per-operator mute does not silence (⚠ owner to confirm). It costs one queue row; at ≤1400px the "near" clause and the sound note drop before any button wraps.
- **Blacklist is amber, and final.** Intake flags it before any field, disables «Ստեղծել պատվեր» and tells the dispatcher to end the call — no override (owner #14). The real console today lets the form be typed and the API refuses at create (BlacklistNotice); the design moves the refusal up to the moment the phone matches. When the rider app refuses a blacklisted rider, dispatchers get information, not a decision: a Requests «Տեղեկություն» row (no badge) and one dismissible line in the queue footer (dispatch?state=blacklist-info).
- **Low rating = 1–3 ★, 24 h.** The threshold and the window come from Settings → Dispatch (ECO.DISPATCH.lowRating). The problem row shows both: the band in the reason, the stars as a tag, the hours left on the action line.
- **Expired insurance stops orders until approved.** The example is Վահե Ս. (expired 05.10, photo 9:20); Արամ's documents are valid (insurance 20.10, permit 21.10) and appear only as «soon». The approval is a Requests row: old vs new document, the new date typed from the photo, «Հաստատել» / «Մերժել».
- **No money on fleet drivers, no invoices.** Ride and request panels never show a fleet driver's balance or debt; a partner's fee is shown as «Միջնորդավճար». The company ride panel shows the month (link to the company statement), never an invoice.
- **Search and the rider record are built like the queue.** Flat blocks with sticky 28px heads, mono columns, a spine on the focused row; «Ըստ» is one select (the server reads the query by itself), not a row of chips. The rider record shows the last rides — what a dispatcher wants when the caller says "like last time".

### Fleet and partner pages
- **Fleet drivers have no balance (#3).** drivers.html lost the settlement block and the «Այսօր պարկին» column. The
  detail tab `?tab=money` is now `?tab=shifts` «Հերթափոխեր» (money is kept as an alias): this week's total, then per
  shift the car, hours, rides, fares and cash taken. It is a record of work, with no owed, limit, adjustment or ledger.
  The real driver-money.tsx / driver-ledger.tsx / record-payment.tsx / driver-payout.tsx are to be removed for fleet
  drivers.
- **Partner rules live in one place: Միջնորդավճարներ (feeplans.html).** One row per tariff: fee %, warn below, stop
  below (`ECO.PARTNER.rules`), plus the example split. Named plans are gone. Tariffs links there. The partner list,
  panel and approvals read the partner's own tariff. Karen (Eco Comfort): 15 %, warn below 3 000 ֏, stop below 0 ֏.
- **Pre-orders per tariff (#1).** Tariffs: a «Նախնական պատվեր» switch per tariff and an Այո/Ոչ column in «Գներ»
  (`ECO.TIERS[].preorders`; Kids and Van are off). The rider preview draws «Հիմա» and «Նախապես» rows, and the latter
  shows only the allowed tariffs plus «Eco Kids, Eco Van՝ միայն հիմա». «Սակագին» is the tier everywhere (#9). The price
  table is «Գներ».
- **Documents (#5).** The live example is Վահե Ս. (`ECO.DOCS.blocked`): «🔒 Կանգնած» in the list, and on the panel
  «Պատվերները կանգնած են · ապահովագրություն» with the 9:20 photo waiting for «Հաստատել» (Մերժել beside it).
  `drivers?tab=docs` opens on him. Արամ is valid until 20.10.2026 on every row of this page (the earlier
  list/panel/app inconsistency is resolved).
- **One car per partner (#6).** Vehicles «Նոր մեքենա» adds a fleet car only. A partner's car arrives from the partner app
  for approval.
- **Suspended partner (#7).** `partners?p=10` states «2 նախնական պատվեր վերադարձվեց հերթ» as a fact, with no step.
- **Vehicles restyled.** One toolbar line (state segment, one tariff picker, fleet/partner chips). In-service cars carry
  no pill, and only pending, suspended and retired cars do.

### Admin pages
**Owner decisions of 2026-10-14 on the admin pages.**
- **No invoices (decision 11 + Q11).** The invoice run, overdue list, credit notes, numbering and the Invoicing settings tab are gone. A company is tracked per month instead: `monthly.html` lists every company's rides, amount, credit in use and an optional «Վճարված» mark (a checkbox with who and when — bookkeeping, not a document), with Excel / CSV / PDF and «Ուղարկել» to the company's email. The company page's «Հաշվետվություն» tab (`?tab=report`; the old ids statement, rides, invoices, months open it) is the company report for a month or chosen days: rides with date, employee, route, tariff, cost code and price, total, Excel / CSV / PDF, one primary «Ուղարկել ընկերությանը» (inline send panel with the company email). Reports → «Ընկերություններ» (`reports.html?company=1`) is the same report with a company filter. `monthly.html` («Ըստ ամսի») is a cross-company overview: one row per company per month with the optional «Վճարված» mark. The credit limit stays. `invoices.html` redirects to `reports.html?company=1`. One generator (`company-report.js`) draws all four, so figures cannot drift: Արարատ Սոֆթ September 214 rides · 268 400 ֏ · paid 6 հոկտ.; October so far 131 · 184 600 ֏ = credit in use.
- **Fleet billing plans are gone (decision 3).** Fleet drivers keep no balance, so nothing is withheld from them by plan; `billing.html` redirects to Fee plans, where partner fees and minimum balance are set per tariff. Settings → Money keeps only partner top-up SMS, top-up instructions, the company-credit estimate for a metered ride, and the (off) tax lines.
- **Two-step sign-in (decision 8).** No backup codes. A lost phone is the admin's: Operators → «Վերակայել երկքայլ մուտքը» (revealed on hover and focus, armed in place, no modal); the operator enrols again at the next sign-in. Login says so in one line.
- **Low rating (decision 15)** is configurable in Settings → Dispatch: 1–3 ★, answer within 24 h.
- **Copy:** «Հաստատման կոդ», «Սահմանաչափ», «Սակագին» (not «դաս»), «Պահել», «Գովազդներ», «Ուղևոր». Lead paragraphs on admin pages became one-line captions or fact strips.

## 2026-10-14 (later): owner change list — transfers, promotions, corporate limits

**Removed everywhere on the console.** Corporate **fixed routes** (the agreement's routes table and its editor, «Ֆիքսված գինը չի
զեղչվում») and the **company / cost-centre code** («Կոդի անվանում», «Ծախսերի կոդ», «Կոդը պարտադիր է», the report's code column
and its «կոդ չկա» marker, the ride panel's code line, the intake's required code field). `company?tab=routes` stays as the id
of the inline «Նոր տարբերակ» form; it no longer edits routes. `ECO.COMPANY.refLabel/ref` and `BOOKINGS.co.ref` are deleted in kit.js.

**Corporate (drawn ahead of the API).**
- `company` agreement: the version in force carries the **default monthly limit per employee** (`ECO.COMPANY.empLimit.default`,
  50 000 ֏); the new-version form chooses amount / rides / none. One neutral line: over the limit or outside allowed places the
  rider pays himself.
- `company?tab=employees`: columns «Սահմանաչափ» (value + «անհատական»/«լռելյայն»), «Մնացել է» (bar + mono value), «Հասցեներ»
  (count). `&emp=0` opens Աննա's panel **under her row** (never a modal): limit seg Լռելյայն / Գումար / Ուղևորություններ, the
  month's used / left, and **allowed places** (`ECO.COMPANY.places`: Տուն, Գրասենյակ (company, fixed), Զվարթնոց; radius
  300 m) with an add row. The rule: company billing only when pickup **and** destination are each within an allowed place.
- `dispatch?intake=company`: a neutral line «Մնացել է՝ 12 600 ֏ այս ամիս · Տուն → Գրասենյակ՝ թույլատրված» replaces the code
  field and the amber over-limit notice (the operator sees the same facts the rider app uses to decide).

**Transfers (new page `transfers.html`, nav «Տրանսֆերներ» under Operations; drawn ahead — no transfer entity).**
- A transfer is a pre-order on the tariff **«Transfer»** (`ECO.TRANSFER_TIER`, 6 000 ֏, 60 min free waiting) plus flight
  fields: direction (arrival/departure), flight, landing/departure time, pickup 30 min after landing, terminal/exit, passenger
  name and phone (foreign numbers allowed), pax/bags, name sign, payer (cash or a company). Data: `ECO.TRANSFERS`.
- List with tabs Այսօր / Առաջիկա / Ավարտված; `?state=new` the create card inline above the list; `?t=T-0031` the detail as a
  right column (payer and state columns drop out of the list so the route stays readable) with Edit / Reassign / Cancel.
- `dispatch?intake=transfer`: the tier picker gains **Transfer** (key 8, label «1–8»); choosing it turns intake into the
  transfer form, «Ստեղծել տրանսֆեր». The pre-order lane (`dispatch?tab=scheduled`) shows transfers with a flight badge; the
  lane's phone column is the booker's, because a foreign passenger number does not fit the mono column.
- Drivers receive transfers exactly like pre-orders: `driver-preorders` badge «Տրանսֆեր» + flight (driver fork).

**Promotions (`promotions.html`, nav «Ակցիաներ»; three tabs in the top bar).** Default tab **Պրոմոկոդեր** (`ECO.PROMO.codes`):
code, discount (% with a cap, or ֏), used / total with a bar, validity, who + tariffs, state; the selected code's figures in the
right column; `&new=1` the create card (code, % / ֏, cap, total and per-rider uses, dates, tariffs, «Միայն նոր ուղևորներին»).
**Հրավերներ** (`ECO.PROMO.referral`): totals, the terms (inviter 700 ֏ / invitee 700 ֏, after the invitee's first ride, 30 days),
top inviters, and a preview of the rider's invite screen. **Գովազդներ** (`?tab=ads`, and the old `?new=1`) is the ads page as
it was. Drawn ahead: no promo or referral entity. Recorded decision: the fleet funds the discount; the driver's fare is unchanged.

**Glossary.** «Ակցիաներ» now names the section that holds promo codes, referral and ads (the glossary forbids it only for the
ads themselves, which stay «Գովազդներ»). ⚠ strings are listed in the scratchpad's changes-2026-10-14.md.

**Thumbnails.** New states have the light 1440 thumbnail only; the index renders those as one image plus a link that opens the
dark page live (`fresh` flag). Changed states were re-shot in light; their dark thumbnails predate this pass. The nav gained
«Տրանսֆերներ», so every older thumbnail shows the previous nav.
