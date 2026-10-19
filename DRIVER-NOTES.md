# Driver app: the remaining screens (v2 style)

Start at `driver-index.html`, a static gallery of every state's screenshot in day and night that links to the live pages.
On a page, `?state=` picks the state, `?theme=dark` selects night and `?sun=1` the high-contrast day option.
Past 600px of width, a state switcher appears to the right of the 390×844 screen.
Shared plumbing is `driver.css` (two density tiers, sun tokens, flat soft-status tokens, the call-like offer) and `driver.js` (states, switcher, `D.ring`, `D.mini`, `D.offer`/`D.offerMap`, `D.eco`, and the `DROUTES` pre-order routes from OSRM).
Every driver phone page, the two heroes included, loads `driver.css` + `driver.js`, so `?sun=1` works on all of them (review P0: the heroes had no Sun).

## Screens and states (as of 2026-10-14; see that section for what changed)
| File | States |
|---|---|
| driver-login | phone · code · dispatcher (§11.2 code read out by the dispatcher) · error · offline · kicked (another device) · disabled · deleted — 8 |
| driver-ready | checklist 2/4 · location (the Play disclosure) · battery (OEM steps) · ios (Time-Sensitive, §10.4) · done · notif-denied — 6 |
| driver-shift | choose (car renders, ID.3 «01 ET 001» preselected) · taken (amber, a 409 is not an error) · empty · operator · end (summary) — 5 |
| driver-home-states | away · offline · lost · active · demo · noshift · location · held · nomap · newoffer · docexpiry · insurance · insurance-sent — 13 |
| driver-preorders | list · details · startable · starting · started · refused · noconn · earlier · reminder · activated · empty · offline · error · onride · balance-partner · noshift · changed · blacklisted · company — 19 |
| driver-offer | ringing (the hero, §10.1) — 1 |
| driver-offer-states | taken · expired · decline (one tap on a reason, countdown still running) · declined · company (paid by company) · preorder-now · preorder-any · lock-android · lock-ios — 9 |
| driver-ride | assigned · enroute (in-app guidance) · arrived (wait meter) · noshow · noshowsent · inprogress · done (collect cash) · forced · offline (outbox) · call · cancel (cancel or give back) · cancel-reason (after Cancel) · chat · company-inprogress · company-done · changed · destchanged · sos — 18 |
| driver-earnings | today · week (bar chart) · rides (all rides by day) · unavailable — 4 |
| driver-inbox | list (3 unread) · detail (insurance reminder) · empty — 3 |
| driver-account | main · docs (expiry chips) · language · theme (Auto / Day / Night / Sun) · demo · demorunning · delete · deleterequested · signout (blocked by the open shift) · deleteblocked (open ride) · help · legal · update · diag · rating — 15 |

Every state passes `audit.js` in both themes: 0 overlaps, 0 clips and 0 contrast failures. Map states rendered on live 2GIS.
The worst margin is 1.01× (preorders activated, light); most states sit at 1.12× or above.
Deliberate exceptions are marked `data-overlay`: the content under a modal scrim (ride call/cancel, offer decline, account signout).

## Design decisions (each checkable on a screen)
- **Morphing primary (§10.2):** depart and arrive are a 76px tap (`.go`); start, complete and accept are a 76px slide (owner floor, DEC-13 «76, not 96»; `--h-go`, `--h-slide`, `--h-drive` all 76). There is one filled accent per screen.
- **Offer = an incoming call (§10.1, review P1).** Full screen, no sheet: a ringing bell with two breathing halos and «Նոր պատվեր»; a map *strip card* (256px, ≈28 % of the screen) that carries only the route;
  the fare as the one hero (40/48); pickup distance «4 րոպե · 1,4 կմ» at 22/28 **ink**; the trip «4,3 կմ · 6 րոպե» at 17; pickup and drop; the countdown ring in seconds with the unit inline («9 վրկ», amber from 5 s);
  the 76px accept slide in the thumb zone and decline as a quiet 48px chip top-right. Built once (`D.offer`) for the hero and all four offer states, so they cannot drift.
- **Decline needs a reason (owner, 2026-10-12; reconfirmed 2026-10-16 against the UX audit's one-tap proposal).** The reason sheet has no preselected reason and no footer: tapping a reason is the decline. «Հետ» is a text button top-left; the ring keeps running.
  The console shows the chosen reason on the ride detail and in reports. The real app is behind (see "Drawn ahead of the app").
- **Night never inverts to white.** The guidance card and the offline strip are ink-on-white by day and in sun, and `--surface-3` with ink text at night (a white slab at the top of a dark car is glare).
- **The demo state's black primary is deliberate** («Ավարտել փորձը», `.go.ink`): a practice ride must not look like live work, and black keeps one accent per screen. Do not "fix" it to green.
- **Home logo vs the status pill:** the logo (88px since 2026-10-14) shows only while the pill keeps 12px clear of it, measured after fonts load; «Կապ չկա» is wider, so the logo steps out (two shapes, never one string).
  Secondary tools are 56px circles in a row above the primary, never beside it.
- **At-speed type:** button labels are 20/24 600, and the at-speed hero (manoeuvre distance, wait timer, ETA) is 40/48.
  I did not use the research's 32dp body text: it breaks the brief's scale, and the hero carries the glance.
- **No-show (§10.6):** the action is visibly locked (outlined, «5:00-ից») until the threshold passes, then turns amber.
  Raising it shows «Դիսպետչերը ստուգում է · պատվերը չի չեղարկվել», and Start stays the primary.
- **Offline (§10.7):** a persistent ink strip with a running timer, and the queued press shown as a «հերթում» chip. Never red.
- **Connection lost on home:** the pill reads «Կապ չկա» with a red dot, never «Առցանց» (research move 6, «never colour alone»).
- **Pre-orders (§8):** the driver cannot refuse a pre-order (team review 2026-10-16, D1): «Չեմ հասցնի» and its three states are gone; the dispatcher handles it. A booking the dispatcher takes away just leaves the list (D2): no notice, no `#gone`.
- **Company ride (corporate A8):** the offer carries «Վճարում է ընկերությունը» in place of the cash chip; in progress and at the drop the fare hero and «Վերցրեք կանխիկ» are replaced by one block, «Վճարում է ընկերությունը · ոչինչ մի վերցրեք». A driver who asks for cash charges the passenger twice.
- **Cancel or give back (§21, D19):** one sheet, two different acts — «Չեղարկել պատվերը» (danger-quiet) ends the ride, «Վերադարձնել պատվերը» (line) hands it back to dispatch — with `ride.giveBackWhy` under them. Reasons are 48px chips, none preselected, and appear only on the second step (state `cancel-reason`, reached by «Չեղարկել պատվերը»); the first step is the two outcomes and a quiet «Հետ» (UX audit).
- **A ride taken away (D21):** cancelled mid-approach (a dispatcher reassignment reads the same: owner 2026-10-14 removed the «given to another driver» notice), the sheet says «Պատվերը չեղարկվեց» in the blue concurrency notice («Պատվերը փոխվել է — թարմացվում է»), strikes the old pickup through, and offers one way back, «Գլխավոր», with the 2 s auto-return drawn as a draining underline. Never red: nothing failed.
- **Chat at speed:** the rider's message is 20/28; answers are four 56px quick replies in a 2×2 grid; there is no keyboard while moving («Գրելը՝ միայն կանգնած ժամանակ»). The en-route sheet shows an unread badge on a message tool beside Call.
  The ring counts to the commitment lead (T−30).
- **Sun:** this is not a third palette. Greys are pulled to ink, and shadows become 1.5px ink rings, because soft shadows vanish in sunlight.
- **Navigation is in-app:** the en-route and in-progress states show a guidance card. There is no hand-off to an external navigation app.

## Drawn ahead of the app
The real driver app (apps/driver on main) does not yet do these; the app and API must catch up.
- **Decline with a required reason** (`driver-offer-states#decline`, owner decision 2026-10-12). Today `app/offer/[id].tsx` asks once («Հրաժարվե՞լ պատվերից», Հրաժարվել / Ետ) and the decline route takes no body. Needs: a `reason` code on the decline API, the reason list as i18n keys, and the console ride detail / reports showing it.
- **Ride chat with quick replies** (`driver-ride#chat`, owner decision 2026-10-12). No messaging backend exists.
- **Who took the ride away** (`driver-ride#changed`; `#reassigned` removed 2026-10-14). Today a cancelled or reassigned ride leaves the ride screen with only «Սպասում ենք պատվերի» (`work.noWork`); the blue `ride.changed` notice appears only when a queued press was voided. Needs: the cancelling party on the driver's work read, and the notice on that transition.
- **Company block at speed** (`driver-ride#company-inprogress`, `#company-done`): the real app shows the same words as a brand `Tag`; the mockup sets them as a two-line block. Same strings, larger setting — acceptable drift, not a behaviour change.

## Resolved owner questions
- **Resolved 2026-10-12 (p1p2 pass): Արամ's hold vs the walkthrough offer.** `ECO.BOOKINGS.kom` moved from 10:05 to **10:35**
  (held from 10:05, activates 10:20), after R-2417 drops at 9:51, so the 9:41 offer and the hold no longer overlap. driver-home,
  driver-home-states and driver-preorders follow it; the pre-order states that sit inside the window now carry status-bar
  times from 10:10 (list/startable 10:11, starting 10:12, started 10:13, reminder 10:10, activated 10:20).

## Skipped or placeholder assets
- Driver photo: shown as initials. Bank card: a text VISA chip, not a real logo.
- The plates of the Model 3, ID.4 and van (01 ET 014 / 007 / 021) and the van's name «Մինիվեն» are invented.
- The walkthrough ride is kit.js `ECO.RIDE` (rider «Աննա», Մաշտոցի պող. 37 → Կոմիտասի պող. 22, assigned 9:41, pickup 9:45, drop 9:51, 1 100 ֏ cash) — the same trip the rider and the console show. Text bound with `data-eco` is filled from it by `D.eco()`.
- Pre-order routes come from OSRM (simplified geometry), not 2GIS routing.

## Shared-file changes I would want (not made)
1. **tokens.css `--ok` #0F8A4A is 4.42:1 on white**, not the 4.6 NOTES claims, and fails at 13–16px. Two pages use a local #0B7A3F.
   Suggest about #0B7A41.
2. **kit.css `.btn-quiet` and `.chip` are invisible on `--ground`** (`--surface-2` on `--ground` is about 1.01:1).
   The pages lift them locally to surface + e1. A shared on-ground variant is needed.
   `driver.css .seg` now uses `--surface-3`.
3. **NOTES/BRIEF:** record the two density tiers (moving 72 / 56, parked 52 / 48) and the `--warn-soft` / `--ok-soft` / `--danger-soft` tokens.
   Text cannot sit on `color-mix()` grounds, because audit.js cannot parse `color(srgb …)` and misreports contrast.
   Either move these tokens into tokens.css, or teach `audit.js` the `color()` syntax.
4. **audit.js** also checks anchors inside the map: the 2GIS logo link collides with modal sheets. Skipping `.map a` would remove that class of exception.
5. **index.html** could link `driver-index.html`.
6. ~~Hero links~~ — done: pre-orders row → driver-preorders, decline → driver-offer-states?state=decline.
7. ~~Hero offer ring~~ — resolved: the ring counts seconds («9 վրկ»), as the real app's `offerCountdown` does.

## P1/P2 pass, 2026-10-12: fleet driver gaps (coverage audit batches 4, 6, 7)
Owner ruling (a) is drawn at `driver-offer-states#preorder-now` (see Drawn ahead). Արամ's booking moved to 10:35 (see Resolved above).
### Drawn (p1p2 pass)
- Pre-order start blocks, copied from StartControl.tsx: on_ride (outlined), balance (partner only since 2026-10-14; amber notice + 76 «Լիցքավորեք հաշվեկշիռը»), no_shift (76 «Սկսել հերթափոխը»), 409 changed (blue info), customer_blacklisted (amber), preorders.gone, company badge.
- Home: noshift, location warning, held (T−30), map unavailable, pending-offer card, document expiry. (lowfleet removed 2026-10-14.)
- Ready: notifications denied for good. Login: disabled, deleted. Offer: lock screens (Android, iOS). Ride: destination changed, SOS. Account: help, legal, update, delete blocked (open ride), diagnostics, rating + past rides.
- Data fixes: driver-login phone was Աննա's (91 23 45 67) → Արամ's 93 44 55 66; driver-account phone +374 93 41 22 08 → +374 93 44 55 66; account version 1.4.0 → 2.3.1 (ECO.APP.driver min 2.3.0).
- The 18:30 Կասկադ booking (page-local) is now the company-paid one in every list state.
- driver.js D.offer gained o.ride / o.context and D.offerMap an alt route (additive; existing callers unchanged).

### Drawn ahead of the app
- **Pre-order started now (owner ruling a):** driver-offer-states#preorder-now. Pre-assigned Սուրեն gets the normal call-like offer first, with «Ձեր նախնական պատվերը · ուղևորը սկսում է հիմա»; decline (reason required) or expiry, and the system searches automatically among the tariff's drivers (owner Q1, see 2026-10-14). Needs the start-now endpoint plus an offer flag. The trip line uses DROUTES.air (from Բաղրամյան 24) to stand in for Կոմիտասի 22 → Զվարթնոց.
- Disabled or deleted login with a reason (today a generic failure). Help and Legal screens. SOS (alert with position, 112). Update-required gate (no min-version API). Destination changed by the dispatcher, shown on the driver's ride. Rating and past rides (no endpoints). Document-expiry banner on home, and (2026-10-14) the in-app insurance upload and block. The Android lock-screen line «ապակողպել պետք չէ» assumes showWhenLocked on the offer activity.

### New strings without i18n keys (hy)
Ծանուցումներն անջատված են · Առանց դրանց պատվերը չի հնչի, երբ հավելվածը փակ է։ · Պատվերներ՝ «Հրատապ» · Հաշիվն անջատված է · Անջատել է ընկերությունը · Հաշիվը ջնջված է · Նոր հաշիվ բացում է ընկերությունը · Կողպված էկրանին · ապակողպել պետք չէ · Ժամանակազգայուն · Ձեր նախնական պատվերը · ուղևորը սկսեց հիմա · Աննա · հիմա · Դիսպետչերը փոխեց նպատակակետը · Ուղևորի խնդրանքով · Անվտանգություն · Դիսպետչերը կտեսնի ձեր դիրքը · Ահազանգել դիսպետչերին · Զանգել 112 · Օգնություն և իրավական · Օգնություն · Ինչպես սկսել հերթափոխը · Պատվերներ չեն գալիս · Մոռացված իր մեքենայում · Իրավական · Օգտագործման պայմաններ · Գաղտնիության քաղաքականություն (+ body) · Բացել կայքում · Թարմացրեք հավելվածը · Այս տարբերակով պատվերներ չեն գա · Թարմացնել · նվազագույնը՝ · Գնահատական · վերջին 100 գնահատական · Ընթացիկ պատվեր չկա · Ընկերություն (badge) · Ոչինչ մի վերցրեք ուղևորից · diagnostics row labels.

### Verification
Per the parent's speed order, no crawl/audit and no thumbnail re-shoot were run. I made quick visual checks (Playwright screenshots in scratchpad/p1p2/look/, 0 page errors) of every new state in light, plus dark/sun spot checks; clipping found in them was fixed. Known risk for the final audit: rating rows ellipsise route names on purpose.

## 2026-10-14: copy pass, style pass, owner decisions
Armenian copy now follows the shared glossary. Every changed string is listed in the coordinator's `cp-driver-copy.md`.
- The status pill reads «Առցանց» / «Անցանց». Go online is «Ընդունել պատվերներ»; go offline is «Դադարեցնել».
- A shift is a «հերթափոխ» (⚠ the owner's team should confirm drivers say this).
- Decline is «Մերժել». No-show is «Ուղևորը չեկավ». A pre-order is a «նախնական պատվեր». Back is «Հետ».
- There are no «՛» marks. Em-dash chains became «·».
- The office is «գրասենյակ», never «ընկերություն».

**Owner #3: fleet drivers have no balance.** Removed from fleet screens:
- driver-earnings `owed`, `blocked`, `credit`, `withdraw` and `withdrawsent`, and the «Հաշվեկշիռ» tab.
- driver-earnings `ledger` became `rides`. It lists every ride by day with how it was paid. Commission, daily-fee and settlement rows are gone.
- driver-home-states `blocked` (debt over the limit) and `lowfleet` («հանձնեք կանխիկը»).
- driver-preorders `balance` (fleet). `balance-partner` stays.
- driver-account `deleteblocked` now blocks only on an open ride («Վերադառնալ պատվերին»). Help's «Կանխիկի հանձնում» became «Փաստաթղթերի թարմացում».
- What stays: what he drove (today, week, rides) and the cash he collected (the cash/company split).
- driver-shift's end-of-shift hero is labelled «Պատվերների գումարը», not «Վաստակ».

**Owner #5: expired insurance blocks orders.** These states use ECO.DOCS.aram: insurance valid until 20.10.2026, permit until 21.10.2026.
- driver-home-states `insurance` is the 21 Oct scenario at 8:05. The pill is «Անցանց», the map is greyed, and the block reads «Ապահովագրությունը ժամկետանց է · 20.10.2026-ից».
  It has a three-step strip (Վերբեռնել → Ստուգում → Պատվերներ) and one 76px primary, «Վերբեռնել ապահովագրությունը», which goes to account docs. «Զանգել դիսպետչերին» is a 48px text button.
- `insurance-sent` (8:14): «Լուսանկարն ուղարկվեց». The strip is at step 2, and the only control is a quiet 76px «Զանգել դիսպետչերին». Amber, never red: it is a rule, not a failure.
- driver-account#docs agrees: insurance is valid until 20.10 (11 days), on an amber card with «Վերբեռնել նորը». The account row's chip reads «11 օր».
- driver-home-states#docexpiry is now the insurance warning: «Ապահովագրությունը՝ 11 օրից», not the permit.

**Owner #4: notifications inbox.** The new page is `driver-inbox.html` (list · detail · empty), parked tier.
- List items: a dispatcher message, a pre-order assignment, the insurance reminder (unread), a rule change from the office and new office hours (read).
- Fleet drivers have no fee, so the «rule change» item is a waiting rule, not a fee.
- Unread items show a 600 title plus a brand dot; colour is never the only signal. The detail is the insurance reminder, with «Վերբեռնել նորը».
- Entry points: a bell fab with an unread dot on home and home-states (between the logo and Account), and Account → «Ծանուցումներ» with a count.
- To make room for that row, the account's car card became one line under the name; the car belongs to the shift (§4.3).
- Drawn ahead: there is no push-history endpoint.

**Other style changes:**
- noshift: the dashed «Ընտրեք մեքենան» chip duplicated the 76px primary, so it is gone.
- The pre-order start blocks no longer repeat the button in the notice. They show «Հերթափոխ չկա» / «Դուք անցանց եք» above «Սկսել հերթափոխը» / «Ընդունել պատվերներ».
- The SOS sheet is titled «Անվտանգություն».

**Owner Q1: pre-orders are searched automatically, by tariff.**
- When a pre-order comes due (T−15), or the rider presses «Սկսել հիմա», the system offers it to that tariff's drivers on its own.
- The pre-assigned driver, if there is one, still gets the first offer (`preorder-now`).
- `driver-offer-states#preorder-any` shows that any Eco City driver (here Արամ, at 8:15) can receive it.
  It is the normal call-like offer with one context chip, «Նախնական պատվեր · 08:30», and the pickup line «Աննա · 08:30-ին».


## 2026-10-14 change list (owner)
| item | page#state |
|---|---|
| Driver #1: the «dispatcher gave this order to another driver» notice is removed. A reassignment away from the driver shows exactly like a cancel: «Պատվերը չեղարկվեց». The pre-order «Այս պատվերն այլևս ձերը չէ» line (#gone) was removed 2026-10-16 (D2): a taken-away booking just disappears from the list. | driver-ride#changed (state `reassigned` removed) |
| Driver #2: earnings date filter, segmented «Այսօր · Շաբաթ · Ամիս · Ընտրել»; «Ընտրել» opens a month-grid range sheet (48px day targets, first tap = start, second = end, «Ցույց տալ»). Fleet still has no balance. | driver-earnings#month, #picker, #range |
| Driver #3: the driver's own order. Entry: «Նոր պատվեր», a 56dp pill on the home map (left, above the sheet), never in the sheet beside the 76dp primary. Flow: who («Ինձ համար» = street pickup / «Ուղևորի համար» + phone) → only the car's tariffs (ECO.CAR_TIERS) with fares → fare + one 76dp «Սկսել» → the ride's in-progress state. | driver-home; driver-neworder#form, #customer, #tariff, #ready, #partner |
| Console Transfers #1: transfers reach the driver as pre-orders, with a black «Տրանսֆեր» badge, the flight line «Չվերթ FZ 715 · 13:40» on the card, and a flight block in the detail (flight, origin, landing time, terminal/exit, pax/bags, name sign); company payment shows the usual «Վճարում է ընկերությունը». | driver-preorders#list-end, #transfer |

### Drawn ahead of the app
- **Driver-created order** (driver-neworder): no endpoint lets a driver create a ride; D1 has only dispatcher/rider-created rides. Needs: a driver route that creates a ride already assigned to the open shift's car, tariff limited to the car's allowed tariffs, fare quoted by the same pricing as intake.
- **Earnings month/range** (driver-earnings#month/#picker/#range): the driver earnings endpoint takes today/week only.
- **Transfers** (driver-preorders#transfer): no transfer entity or flight fields on a scheduled ride; the driver sees a pre-order plus flight metadata.
- driver-home's pre-order count reads 4 (the transfer added); driver-home-states still say 3 (not re-drawn).

## 2026-10-16: NFC via the ACBA app, the driver confirms (owner)

- **Decision.** There is no reader in our app. NFC payments are taken in the bank's own ACBA app on the driver's phone; our app never sees the tap. Fleet cars only (partners have no NFC). The fee is unchanged: fare + 2 % (1 100 → 1 122 ֏), the company's; the driver still earns 1 100 ֏.
- `driver-ride#done-nfc`: «Վերցրեք վճարումը ACBA հավելվածով», the amount, one waiting line («Սպասում ենք… հավելվածը վճարումը չի տեսնում»), then two buttons: «Չստացվեց» (quiet) and «Վճարվեց» (primary). No button opens ACBA (no confirmed deep link). The switch Cash / NFC · POS stays above.
- `driver-ride#done-nfc-failed` (now «NFC marked Չստացվեց»): amber «Վճարումը չստացվեց», «Կրկին փորձել» back to waiting, or the switch to Cash at 1 100 ֏ with no fee.
- `driver-account#nfc` is now a checklist: phone supports NFC and NFC on (our app can read these; the failing line carries «Միացնել NFC-ն»), ACBA app installed and signed in (described, «ստուգեք ինքներդ», not verified by us). `#nfc-unsupported`: no NFC chip, so cash only (the car-terminal line is gone).
- Partner screens: NFC removed from the onboarding payout card («Քարտ, Apple Pay, Google Pay»); the partner Complete screen was already cash-only.
- New Armenian strings: Վերցրեք վճարումը ACBA հավելվածով · Ուղևորը քարտը կամ հեռախոսը մոտեցնում է ձեր հեռախոսին · Սպասում ենք… հավելվածը վճարումը չի տեսնում · Չստացվեց · Վճարվեց · Վճարումը չստացվեց · Կրկին փորձեք ACBA հավելվածով · Վճարումը վերցնում եք ACBA հավելվածով · ACBA հավելվածը տեղադրված է · Մուտք եք գործել ACBA-ում · ստուգեք ինքներդ · Վճարումը տեսնում է միայն ACBA-ն։ Վերջում դուք եք նշում՝ Վճարվեց թե Չստացվեց · NFC պատվերներ չեք ստանա.

## 2026-10-16: team review, pre-orders and the payment switch (D1-D3)

- **D1.** Pre-orders: «Չեմ հասցնի» and the states `cantmake`, `cantmake-released`, `cantmake-kept` are removed from driver-preorders (and the request endpoint / console problem item they implied is no longer needed). The driver cannot refuse a pre-order; the dispatcher handles it.
- **D2.** `driver-preorders#gone` ("Booking taken away by dispatcher") is removed with its notice. A booking taken away simply disappears from the list on the next refresh. A live ride already under way keeps its forced / cancelled handling.
- **D3.** Fleet drivers only. At Complete the driver may switch Cash → NFC with one 52px button, «Վերցնում եմ NFC-ով» (1 122 ֏), and NFC → Cash when the tap fails, «Վերցնում եմ կանխիկ» (1 100 ֏). It replaces the old Cash / NFC · POS segmented control in `done`, `done-nfc`, `done-nfc-failed`, `done-declined`. Under it: «Փոփոխությունը գրանցվում է պատվերում». Every switch is recorded on the ride (original method, new method, who, when); the console ride detail, rides list, payouts and reports show «Կանխիկ → NFC · վարորդը · 9:51». An NFC ride still waits for the ACBA statement match before the ETAPI payout. Partners get no switch at all: `driver-partner-home#ridedone` stays cash-only.
- New Armenian strings: Վերցնում եմ NFC-ով · Վերցնում եմ կանխիկ · Փոփոխությունը գրանցվում է պատվերում.
