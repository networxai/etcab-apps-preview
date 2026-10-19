# Rider app v2: the remaining screens

These screens follow the four approved heroes. Each file is one screen with a state switcher.
- `rider-x.html` opens the review page, showing day and night side by side. `#state` picks a state, and "All" shows every state; phones load lazily, so 2–4 live maps run at most.
- `rider-x.html?state=id&theme=dark` shows one phone. Audits and screenshots run against this view.
- `rider-index.html` is the hub, with thumbnails of every screen.
- Shots are saved as `shots/rider-<screen>-<state>-<theme>.png`, at 390×844, scale 2.

## Screens and states (96 states on 13 screens, plus `trip-share.html` (2) and the home flags `?preorder=1`, `?active=1`, `?active=preorder`)
| File | States |
|---|---|
| `rider-opening` (6) | live loop, letters (0.9 s), leaf (2.2 s), done, slow boot, Reduce Motion |
| `rider-login` (10) | phone: empty, filled, sending, bad number, offline · code: typing, checking, wrong code, resend · name (first sign-in) |
| `rider-search` (7) | start (saved and recent), suggest (2GIS, Armenian keyboard up), loading, empty, error, pick on map, pick while moving |
| `rider-book` (12) | details, scheduled (note off: «Նշումը հասանելի է միայն հիմա պատվիրելիս»), scheduled-company, note, when (7 day chips + quarter-hour slots from now + 30, «Հիմա»), when-tomorrow (08:30 picked), payment · **company**: company ride (Company / Personal + cost-centre code), code missing, personal, over limit (company refusal) · scheduled-ok (→ «Ուղևորություններ» › «Նախնական պատվերներ») |
| `rider-searching` (5) | searching (pulse and real nearby cars), driver answering, no cars (call the dispatcher, cancel: as `Searching.tsx`), cancel confirm, preorder-nocars |
| `rider-ride` (15) | assigned, arriving, arrived (large plate, free-wait timer), riding, offline, cancel reason, message (chat, quick replies), share · company, cancelled-by, reassigned, cancel-failed, preorder, early, downgraded |
| `rider-done` (5) | rate, **company ride** (billed to the company), rated (with compliments), low rating (reasons), thanks |
| `rider-history` (7) | list (pre-orders group in the real geometry, then rides with a company ride), loading, empty, receipt, **receipt · company**, **receipt · paid by you** (downgraded company pre-booking), cancelled |
| `rider-account` (13) | main (with Help and Legal), **company rider**, **help**, name, places, place removed (undo), wallet (debt), wallet clear, language, theme, sign out, delete, delete blocked |
| `rider-offline` (7) | offline banner, reconnecting, back online, map unavailable, location off, full-screen error, no connection at start |
| `rider-preorders` (9) | list, detail, detail-nodriver, detail-company, start-confirm («Սկսե՞լ հիմա»), call (dispatcher), reminder (lock screen), reminder-inapp, activated (lock screen) |

## Audit
- Every state passes in both themes: 0 overlaps, 0 clips, 0 contrast failures, 0 console errors. All map states run on live 2GIS.
- The tightest text is 1.03× its threshold (ride `share`, light). Most screens are at 1.12× or more.
- Deliberate exceptions, each marked in the markup:
  - The keyboard and keypad are `data-overlay`.
  - The base list under the account modal sheets is `data-overlay` and inert. These are listed in `excepted`.
- Two runs hit transient 2GIS tile "Network error" console lines (book `when`, ride `arrived`). Both passed on re-run.

## Review fixes (2026-10-12)
- **One data set.** Every shared fact comes from `kit.js` `ECO`: the ride (Մաշտոցի պող. 37 → Կոմիտասի պող. 22, assigned 9:41, pickup 9:45, drop 9:51, 4,3 կմ, 6 րոպե, 1 100 ֏, Արամ Պետրոսյան 01 ET 001), the day (Friday 9 Oct; pre-orders say «Վաղը», Saturday 10), money (`R.amd` = `ECO.amd`, narrow nbsp, «1 100 ֏»), decimals with a comma («4,3 կմ», «4,9»), the payment roster and the company. Status bars follow the clock: assigned 9:41, arriving 9:44, arrived 9:45, riding 9:47 («4 րոպե · ժամանում 9:51»), done 9:51.
- **Payment roster** (superseded 2026-10-15/16: card, Apple Pay, Google Pay and NFC · POS are live with the +2 % fee, and «Ծախսերի կոդ» is gone since 2026-10-14; kept as the record of the app as it was). Cash is the one live personal method; card «Քարտով» is listed, disabled, «Շուտով» (PaySheet.tsx). A company rider sees a Company / Personal segmented row on the order sheet (payment-row.tsx), the billed-to line «Վճարում է՝ Արարատ Սոֆթ ՍՊԸ», and, when the agreement asks, the «Ծախսերի կոդ» field (reference-field.tsx): order stays dark until it holds something; a server refusal focuses it and says why in amber. Over the limit: «Ընկերությունը չի կարող վճարել…», one way forward «Վճարել ինքս». Receipts name the company where the method would be; a downgraded pre-booking gets one neutral notice. No history filter by profile: the real app has none.
- **Tiers CTA names the order:** «Պատվիրել · Eco City · 800 ֏» (fits at 360 px). The card ETA is the car's arrival (car icon, «3 ր»); the map tag carries the trip («2,1 կմ · 4 ր»), so two minute numbers never sit unlabelled side by side. Eco Kids shows the ID.3 alone with a small seat badge.
- **Driver face:** initials on a brand-tinted disc (the driver app's avatar), never a grey glyph; a fleet photo replaces it when uploaded.
- **One scrim** (`--scrim-modal`, .48 day / .62 night) behind every modal sheet. Searching pulse: two rings in `--brand` at 24% with a 1px brand edge; Reduce Motion shows one still ring.
- **Rate:** «Ուղարկել» is pinned and disabled until a star is chosen; «Բաց թողնել» stays under it in every state, so nothing jumps.
- **Cancel** says the cost before the red button: «Չեղարկումն անվճար է» (this fleet has no rider cancellation fee).
- **Account:** Help (call the office, questions) and Legal (terms, privacy) above sign-out; language codes in their own script, «ՀՅ / РУ / EN». The wallet lists the linked company (AccountSheets.tsx).
- **Offline:** by night the banner is `--surface-3` with ink text and an amber icon (no white slab); the location-off button sits under its text; the error code sits behind «Մանրամասներ» at caption size.
- **Targets:** sheet close 44, field clear 44 (negative margin, field height unchanged), toggle chips 44.
- **Mock chrome out of the phone:** the opening's replay pill is gone (the live state loops). Home ads are tagged «Գովազդ» (not «Գործընկեր», which is a driver type); three cards, three dots, the strip snap-scrolls.
- **Login head** matches the driver login: logo top-left, car centred, title, then the lead line.

## Decisions
- **One ride everywhere.** The rider's searching, ride and done screens show the driver offer's ride: Eco City, Mashtots 37 → Komitas 22, 4,3 km, 6 min, 600 + 387 + 72 = 1 059 → **1 100 ֏**. The receipt shows the rounding (+41).
- **Opening** uses the real app's clock (`logo-reveal.tsx`): letters 200 ms apart, back(1.7) landing, the O solid, then a 150 ms beat, and the leaf grows over 1.1 s (2.83 s in all). The counter is a CSS mask in the ground colour, so it reads as a real hole in both themes.
- **Keyboards are drawn.** The login keypad and the Armenian phonetic keyboard (search, name) are there so each layout is judged with the keyboard up.
- **Banner pattern.** An ink card (by night `--surface-3`) sits under the status bar: icon, words, and an optional action. Reconnecting turns it amber. A recovery collapses it into a toast. Stale cars are drawn grey.
- **Offline behaviour.** A network error never wipes a screen that still has truth on it. The in-ride card stays, and the ETA becomes "≈".
- **Honesty.** (Card is live since 2026-10-15; this described the launch roster.) Card payment shows "Շուտով" in both the payment sheet and the wallet; it is never hidden. Debt is paid in cash to the next driver. The dispatcher (a person) is the way out of no-cars and fatal errors. Delete account is always visible.
- **Plate.** The plate is a physical object, so it is white in both themes, with an AM strip. It is the largest identity element on arrival.
- **New rider-only tokens** (in `rider.css`): `--t-large` 600 28/36, used for page titles (36, not 34, because of Armenian ascenders); `--scrim-modal`; `--danger-soft`; and the key colours.

## Skipped or placeholder assets
- **Driver photo:** none exists, so the driver's initials on a brand-tinted disc stand in (no stock faces).
- **Share targets:** messaging-app icons are skipped, and a single "Ուղարկել" button is used instead. The share link `ecotaxi.am/r/7KQ2X` is invented; `trip-share.html` is what it opens.
- **Lucide 1.54 has no `map-off`.** The map-unavailable state uses `map`.

## Changes I'd want in shared files (not made)
1. **`tokens.css`:** `--ok` #0F8A4A measures **4.42:1** on white, not the 4.6 that NOTES claims. That is under AA for text, and 3.98 on `--surface-2`. Darken it to about #0B7A41 (5.4:1), or keep it to icons only, as these screens do.
2. **`tokens.css`:** add `--t-large` (600 28/36) as a shared page-title token, because driver page titles need it too.
3. **`kit.css`:** `.btn-quiet` (`--surface-2`) is invisible on `--ground` in light (#F3F3F1 on #F4F4F2). Pages on ground had to use `--surface`. A `.btn-quiet.on-ground` variant, or a rule, would stop this recurring.
4. **`kit.css`:** `.map` is a global absolute-fill class. A list row named `map` covered a whole screen. Rename it `.map-host`, or scope it.
5. **`kit.js` `makeMap`:** let it take the height of a raised keyboard, so 2GIS's logo is not covered (search worked around this with a spacer).
6. **`audit.js`:** treat disabled controls as exempt from contrast, as WCAG does. We raised disabled text to `--ink-2` anyway.
7. **`index.html`:** link `rider-index.html`.

Helpers that are still duplicated in page files and should move into `rider.js`/`rider.css`:
- the tier row (copied from `rider-tiers`)
- the text-field caret
- the centre pin
- the time wheel
- the driver card (`identity`/`driver`/`acts`)
- the stop list
- `.btn-text`
- the modal-over-page helper

Also, never declare a page-level `const top`: it collides with `window.top`.

## P0 pass (2026-10-12): pre-orders, interrupted rides, messages and share

Owner decisions of 12 October apply: the rider **cannot cancel or edit** a pre-order in the app (changes go through the dispatcher), **can start it sooner** («Սկսել հիմա»), gets a **reminder push** (lead set in console Settings, 30 min), and rider–driver **messages** and **share my trip** are in. Pre-order data is `ECO.BOOKINGS` (`air`, `sun`, `co`) in `kit.js`, shared with the driver and console mockups.

### Drawn ahead of the app
Mobile must catch up on each of these; the drawing is the target.
- **No cancel in the rider app** (owner). The real History has an inline «Չեղարկել» that cancels in one tap with no confirmation; it must go. In its place: «Զանգել դիսպետչերին» (`dispatcherPhone`) on the detail and a «Փոփոխել կամ չեղարկել» row on the list (`rider-preorders#list`, `#call`, `rider-history#list`). `book.scheduledNote` («…կարող եք չեղարկել ուղևորությունների ցանկից») needs the new wording drawn in `rider-book#scheduled-ok`.
- **Pre-order detail screen** (`rider-preorders#detail`, `-nodriver`, `-company`; R35). Today a tap on a booking goes nowhere. `customerScheduledRideSchema` also needs tier, fare, payment / billedTo + reference, and the pre-assigned driver (name, rating, car, plate).
- **«Սկսել հիմա»** (`rider-preorders#detail`, `#start-confirm`). Needs a customer endpoint that activates the booking now at the same quote.
- **Reminder push N minutes before pickup** (`rider-preorders#reminder`, `#reminder-inapp`). No rider push type exists (`rider-notifier.service.ts`); the lead is console Settings → Dispatch (`ECO.DISPATCH.reminderMin`).
- **Activation push carries the booked time** («Վարորդը նշանակված է · 08:30-ին», `rider-preorders#activated`). Today `ride_assigned` has no booking context.
- **Company marker on a booking** (list tag; detail payer and code). The booking wire carries no billing.
- **Home live-ride card** (`rider-home?active=1`, R14) and its activated-booking form (`rider-home?active=preorder`, R41). Today the only way back to a live ride is a push.
- **Booking context on the ride** (`rider-ride#preorder`, `#early`; `rider-searching#preorder-nocars`). The customer ride needs `scheduledFor` or the booking id.
- **Driver gave the ride back** (`rider-ride#reassigned`, R50). Today the driver card just disappears into Searching; the one-line notice needs a give-back signal.
- **Messages** (`rider-ride#message`) and **share my trip** (`rider-ride#share`, `trip-share.html`). No backend for either. The share link shows car, route and arrival only, never phone numbers, and stops when the ride ends.

Matching the real app (no catch-up needed): the When sheet (`rider-book#when`, `#when-tomorrow`), the note off on a pre-order, the confirmation going to History, the upcoming card geometry, `rider-ride#cancelled-by`, `#company`, `#cancel-failed`, `#downgraded` (`BillingNotice`), and `rider-searching#no-cars`.

### Needs owner decision
- When the rider starts a pre-order now, does the pre-assigned driver get the first offer, or does it go to ordinary dispatch? The drawing says "dispatch decides".

### New strings (no i18n key yet)
Pre-orders (as revised 2026-10-14, see the last section): «Փոխելու համար զանգեք դիսպետչերին», «Նախնական պատվեր · {day}», «Սկսել հիմա», «Սկսե՞լ հիմա», «Ոչ, թողնել», «Փոփոխել կամ չեղարկել», «Փոխել կամ չեղարկել՝ միայն դիսպետչերի միջոցով», «Մեքենան կգտնենք ավտոմատ», «Ժամին՝ մոտակա {tier}», «Մեքենան՝ ավտոմատ որոնմամբ», «Նախնական պատվեր՝ {n} րոպեից», «Վարորդը նշանակված է · {time}-ին». Ride: «{time}-ին», «Նախնական պատվեր · {time}-ին», «Վարորդը շուտ դուրս եկավ», «Կսպասի մինչև {time} · շտապել պետք չէ», «Վարորդը փոխվեց · որոնում ենք նորը», «Ձեր {time}-ի նախնական պատվերը», «Ընթացիկ ուղևորություն». Chat: «Հաղորդագրություն», «Դուրս եմ գալիս», «Սպասեք, խնդրում եմ», «Ես մուտքի մոտ եմ», «Զանգեք ինձ», «կարդացված». Share: «Կիսվել ուղևորությամբ», «Մեքենան քարտեզին և ժամանման ժամը», «Ձեր համարը չի երևում», «Հղումն անջատվում է ուղևորության ավարտին», «Ուղարկել», «Պատճենել հղումը». Trip page: «{name}ն ուղևորվում է», «ժամանում՝ {n} րոպեից», «Ուղիղ», «Ավարտված», «{name}ն տեղ հասավ {time}-ին», «Մեքենայի դիրքն այլևս չի ցուցադրվում», «Պատվիրել Eco Taxi». Reusable keys: `ride.callDispatcher`, `app.soon`, `hub.open`.

## P1/P2 pass, 2026-10-12: entry, home, booking and system states (R06–R09, R12, R13, R17, R22–R26, R29, R31, R68)
### Drawn
- rider-login `#terms`, `#expired`, `#locked`; rider-home `?partner=`, `?ads=0`, `?new=1`; rider-search `#later`; rider-book `#company-unavailable`, `#blacklisted`, `#refused`, `#offline-order`, `#quote-loading`, `#no-quote`, `#no-route`, `#metered`, `#when-late`; rider-offline `#notif-ask`, `#notif-denied`, `#update`, `#maintenance`.
- Refusals at order use the real slot: a neutral Notice above Order (book.tsx orderError), never red, typed data kept.
- `#scheduled` order button now carries the time: «Պատվիրել · Վաղը, 08:30 · 1 900 ֏» (R31).

### Drawn ahead of the app
- Consent at first sign-in (R06): continuing = accepting; store the accepted terms version on the customer.
- Session-ended notice on login (R07): `_layout.tsx` replaces to /login silently today.
- OTP lock-out state with a wait (R08): the app shows only «Կոդը սխալ է» on a 429.
- Notification pre-prompt and denied card (R09): `registerForPush` 'denied' is not surfaced.
- Update required / maintenance (R68): needs a minimum-version + maintenance-window endpoint (ECO.APP).
- Late-evening When (R29): when today has no slot, open on Tomorrow and strike Today (real sheet opens on an empty Today).
- «Նախապես» line on search (R17).
- House card drawn without the «Գործընկեր» tag the real PartnerCarousel puts on it (it is the fleet's own card; the tag means a partner).
- Partner sheet body line «Ցույց տվեք այս էջը վճարելիս · մինչև …» is example promotion copy (the promotion's own `body`), not an app string.

### Needs owner decision
- None new. (Whether the blacklisted rider should also get «Զանգել դիսպետչերին» under the refusal is a product call; drawn as the real app: one neutral line.)

### New strings without i18n keys
- login: «Մուտքի ժամկետն ավարտվել է», «Մուտք գործեք նույն համարով․ ուղևորություններն ու հասցեները պահված են», «Փորձերը սպառվեցին», «Նոր կոդ կարող եք խնդրել … հետո», «Շարունակելով՝ ընդունում եք Eco Taxi-ի պայմաններն ու գաղտնիության քաղաքականությունը», «Պայմաններ», «Գաղտնիություն» (app name from config, not a literal).
- offline: «Միացրեք ծանուցումները», «Ուղևորության մասին ամեն ինչ գալիս է ծանուցումով․ SMS չենք ուղարկում», three reason lines, «Միացնել», «Հետո», «Ծանուցումներն անջատված են», «Չեք իմանա, երբ մեքենան ժամանի», «Թարմացրեք հավելվածը», «Այս տարբերակով այլևս հնարավոր չէ պատվիրել», «Ձերը՝ / պետք է՝», «Թարմացնել», «Տեխնիկական աշխատանքներ», «Հավելվածը կաշխատի ժամը 03:30-ից».
- book: «Այսօր ազատ ժամ չկա · մինչև 7 օր առաջ», «Պատվերը չի ուղարկվել» (banner sub-line).
- search: «· ժամը կընտրեք հաջորդ քայլում».
- Existing keys used: book.blacklisted, book.refused, app.offline, company.unavailable, company.refusedTitle, company.payMyself, book.estimate, partner.book, partner.open, home.houseTitle, hub.noRecent, offline.settings, ride.callDispatcher, login.changeNumber.

## P1/P2 pass, 2026-10-12: ride, receipt, history, account and the «Սկսել հիմա» ruling (R37, R51, R55, R56, R58, R61, R63, R64)
Owner ruling (a), drawn ahead: when the rider presses «Սկսել հիմա», the pre-assigned driver gets the first offer; if he declines or lets it lapse the ride goes to normal dispatch (`rider-preorders#start-confirm`, `#start-sent`, `#start-fallback`).
### Drawn
- `rider-ride#carstale` (R51): real `ride.carStale` as a warn tag on the driver card (DriverCard.tsx tone warn); car faded at its last fix; ETA hedged «≈ 3 րոպե». No banner: the network is fine, which is what tells it apart from `#offline`.
- `rider-ride#destchanged` (R55): neutral Notice «Դիսպետչերը փոխեց նպատակակետը · Ձեր խնդրանքով՝ Կոմիտասի պող. 28», old fare struck «1 100 ֏», new «1 200 ֏ · նոր գին». Actions trimmed to the mini card (the change is the news).
- `rider-ride#sos` (R56): modal from the riding shield. Where you are + plate first (read it out on the phone), «Զանգել 112» the one red action, then quiet rows «Տեղեկացնել դիսպետչերին» («Կտեսնի անմիջապես՝ ձեզ և մեքենան»; owner #2: a red alert at the top of console Dispatch) and «Կիսվել ուղևորությամբ».
- `rider-done#fiscal` (R58): paper card from ECO.FISCAL (seller, ՀՎՀՀ, ՀԴՄ, կտրոն №, date, one service line «Տաքսու ծառայություն · Eco City · R-2417», total, method, a stand-in QR always dark-on-white). Primary «Կիսվել», quiet «Պահել PDF».
- `rider-history#receipt-error` (R61): real `history/[id].tsx` — neutral Notice app.offline + «Կրկնել»; no map.
- `rider-account#place-add`, `#place-remove-failed` (R64); `#delete-blocked-ride`, `#delete-blocked-other` (R63, real strings).
- `rider-preorders#start-confirm` rewritten, `#start-sent`, `#start-fallback` (owner ruling a).
- Data: `rider-account` name field and saved places now read `ECO.CUSTOMER` («Աննա Հակոբյան», Work = «Վազգեն Սարգսյանի 26/1», the company booking's drop-off).
- R37 not drawn: superseded by the no-in-app-cancel rule.

### Drawn ahead of the app
- **Start now → pre-assigned driver first (owner ruling a, 2026-10-12).** After «Սկսել հիմա» the booking becomes a live ride, the offer rings on the pre-assigned driver's phone first (ECO.BOOKINGS.air.startNow: Սուրեն Մ., 20 s); on decline/expiry, normal dispatch. Needs a start-now endpoint and a dispatch rule ("offer the booking's driver first").
- SOS sheet (no API: an alert-to-dispatcher event with position; 112 is a plain tel:).
- Destination-change notice and re-quote to the rider (no rider event for an operator PATCH today).
- Fiscal receipt view and PDF share (no fiscal API).
- Save-a-place sheet (`POST /customer/places` exists; no add UI).

### Needs owner decision
- **After «Սկսել հիմա», may the rider cancel the search in the app?** It is now a live ride search (Searching.tsx offers cancel), but it came from a booking, which the rider may not cancel in-app. Drawn with «Զանգել դիսպետչերին» only; no cancel drawn.

### New strings (no i18n key)
- ride: «Դիսպետչերը փոխեց նպատակակետը», «Ձեր խնդրանքով», «նոր գին», «Անվտանգություն», «Զանգել 112», «Տեղեկացնել դիսպետչերին», «Կտեսնի անմիջապես՝ ձեզ և մեքենան», «Ուղիղ հղում հարազատին».
- done: «Ֆիսկալ կտրոն», «ՀԴՄ», «Կտրոն №», «Ամսաթիվ», «Տաքսու ծառայություն», «Ստուգեք կտրոնը ՊԵԿ կայքում», «Կիսվել», «Պահել PDF».
- account: «Պահպանել հասցեն», «Անվանում», «Այլ», «Պահել», «Բացել ուղևորությունը», «Զանգել գրասենյակ» (exists on help as a label).
- preorders: «Նախ՝ {name}ին», «Չկարողանա՝ մոտակա {tier}», «Գինը նույնն է · {fare}», «Հարցնում ենք ձեր վարորդին», «{name}ը հիմա չի կարող · ընտրում ենք մոտակա մեքենան».

## 2026-10-14 copy + style pass

Every visible Armenian string in the rider files was re-read against the glossary (`armenian-copy.md` §1–2). The rule of thumb on the late-added states: one title, at most one line under it, and a picture (icon disc, step strip, chip) instead of a second sentence.

- **Pickup time is «{time}-ին», never «նստել {time}»** (that reads as an order, "sit at…"): home live card, ride pre-order tag, activation push.
- **Tariff, not class:** the tier row's label is «Սակագին» (was «Դաս», `book.class`). Day chips in «Ե՞րբ» use short forms («Երկ · 12 հոկտ.»).
- **Pre-orders are per tariff (owner #1).** On a booking for later (`rider-book#scheduled`, `#scheduled-company`) the row shows only tariffs with `ECO.TIERS[].preorders` (today Eco Kids and Eco Van drop out). They are **left out, not greyed**: a dead card in a radio row is a tap that does nothing, and a horizontal row that hides its disabled cards past the fold would need a caption to explain them anyway. The when-sheets are modals over the map with no tier row; `rider-search#later` has none either. The rider still cannot cancel or edit a pre-order (one line: «Փոխելու համար զանգեք դիսպետչերին»); «Սկսել հիմա» stays.
- **Start now** (`rider-preorders#start-confirm`): three sentences became a two-step strip (1 your driver, 2 the nearest car) and the price as a fact.
- **SOS (owner #2):** the dispatcher row is «Տեղեկացնել դիսպետչերին · Կտեսնի անմիջապես՝ ձեզ և մեքենան»; the place and time come from `ECO.SOS` (9:47, Մաշտոցի պող. 18 · Մատենադարանից 300 մ), the same alert the console raises.
- **Low rating (owner #15):** 1–3 ★ (`ECO.DISPATCH.lowRating.max`); `rider-done#low` is drawn at 3 ★; 4 ★ gets compliments, like 5 ★.
- **No invoices (owner #11):** the rider files never had any; company badges stay. («Ծախսերի կոդ» was removed by the 2026-10-14 change list, below.)
- **Blacklisted (owner #12):** `rider-book#blacklisted` stays one neutral line, no reason.
- **Rider money is «Վճարում», not «Հաշվեկշիռ»:** a rider has a debt or none, not a balance (balance is the partner's word). Debt reads «Պարտք».
- **Company refusals** have a short title («Ընկերությունը չի վճարում»), an icon disc and one line; `#offline-order` no longer says «Կապ չկա» twice (banner says why, the line says the order did not go).
- **Receipt offline** (`rider-history#receipt-error`) is the blank-state pattern with Retry at the foot, not a floating notice.
- «Կենդանի» on the shared trip page meant "alive"; it is «Ուղիղ» (live). «Զանգել օպերատորին» → «Զանգել դիսպետչերին». «Ինչ-որ բան սխալ գնաց» (a calque) → «Հավելվածը չբացվեց».
- **Pre-orders search automatically (owner Q1).** When a booking comes due, or after «Սկսել հիմա», the system searches by itself: the pre-assigned driver first, if there is one, then any driver of that booking's tariff. No rider string implies that a person assigns the car. A booking with no driver carries a neutral tag «Մեքենան՝ ավտոմատ որոնմամբ» (it was a warn tag «Մեքենան դեռ նշանակված չէ»). `#detail-nodriver` says «Մեքենան կգտնենք ավտոմատ · Ժամին՝ մոտակա {tier}». The start-now strip and its fallback name the tariff («մոտակա Eco City»). `rider-searching#no-cars` and `#preorder-nocars` read «Որոնումը շարունակվում է» (was «Դիսպետչերը շարունակում է որոնել»). Changes and cancellation still go through the dispatcher.

## 2026-10-14 change list (owner)

| # | change | file#state |
|---|---|---|
| R1 | Privacy Policy + Terms **checkbox** on its own row above «Ուղարկել կոդը», both documents linked (underlined, separate targets); the whole row is the checkbox's ≥ 48 px hit area. Unticked → Send is off. Shown ticked on the filled phone states, unticked on empty | rider-login#terms, #phone, #phone-empty (+ every phone state) |
| R2 | Tariff cards compacted 132 → 108 px (art 88×44, name 14/20, price 15/20): three full cards + the fourth peeking at 390 px | rider-tiers, rider-book (every tier row) |
| R3 | Cost-centre code removed: rider-book#company-ref state deleted, the code field and its label gone from booking and from the company pre-order detail | rider-book, rider-preorders#detail-company |
| R4 | Every charged ride in History has a receipt button at the row's end (cancelled rides: none); the receipt opens as a document with «Ներբեռնել PDF» and share; the History detail sheet also gets «Ստացական» | rider-history#list, #receipt, #detail |
| C1 | Monthly limit left on the billed-to line («Մնացել է՝ 12 600 ֏»); over the limit → Personal is chosen, Company greyed, one line why | rider-book#company, #company-limit |
| C4 | Allowed places: a trip not between them → Personal, Company greyed, the allowed places as chips; Account → Payment → company shows the limit and the places | rider-book#company-places, rider-account#company |
| P | Promo code: Account tile «Պրոմոկոդ» → rider-account#promo; booking row «Պրոմոկոդ» (details) → rider-book#promo-enter; applied: tier card and button show 1 100 struck → 935 ֏; receipt line «Պրոմոկոդ · AUTUMN15 −165 ֏» on Trip complete and on the receipt document | rider-book#details, #promo, #promo-enter, rider-done#promo, rider-history#receipt, rider-account#promo |
| P | Referral: Account tile «Հրավիրեք ընկերոջը» → rider-account#referral (700 ֏ + 700 ֏, own code with copy, «Կիսվել հղումով», own stats) | rider-account#referral |

Account list: Promo + Invite are two tiles under Payment; the separate «Իրավական» row is folded into Help (Help already lists terms and privacy), so Sign out and Delete stay on screen.

### Drawn ahead of the app
- The consent checkbox and a stored accepted version (no consent step in the app today).
- Per-employee monthly limits and allowed places (ECO.COMPANY.empLimit / places): no field in the corporate API, no client check.
- Promo codes (entry, application, discount on quote and receipt) and the referral programme (ECO.PROMO): nothing in the API or the app.
- The receipt document view and its PDF; the fiscal number on it (ECO.FISCAL) is itself drawn ahead.
- Dark thumbnails of changed (not new) states were not re-shot (light-only verification); the new states have both.

## Laws of UX follow-up (2026-10-16)
- **Details sheet is canonical in `rider-book`** (when · note · payment chips + promo). `rider-tiers` is the tier-row reference only: its cards, ETA, seats, price and ringed selection are the approved base, but its payment row and note icon are not the spec. The page now says so in a side annotation.
- **Search accepts any script** (Postel): `rider-search#suggest-latin` («mashtots», English keyboard) and `#suggest-ru` («Маштоц», Russian keyboard) return the same Armenian rows, the matched name in bold. `R.keyboard('en' | 'ru')` draws the layouts.
- **When sheet is chunked** (Choice Overload): slots sit under Գիշեր / Առավոտ / Ցերեկ / Երեկո headers, four to a row, still no wheel, in a fixed 300 px window. Only whole rows that fit are drawn, so none sits under «Հաստատել»: the earlier overlap with the confirm button was real in the audit (a sixth, clipped row of slots was still in the DOM over the button) and is gone.
- **Smaller fixes:** the selected tier shows a check, not a leaf (Mental Model); Order carries a price skeleton while quotes load (Doherty); Cancel is a text button under the call / write / share row (Fitts); the home ad is 112 px tall, not 156 (Selective Attention); Account names only the phone's own wallet (Hick); a `next-offer` searching state says the offer moved on (Goal-gradient); 5 ★ is sent on the tap with a 4 s undo bar, 1–4 ★ keep «Ուղարկել» (Peak-End); History's fare has its own right-aligned column (Proximity); the thanks screen carries a small trip card at the optical centre (Aesthetic-Usability); the trip-share page ends on its privacy line with the order link small beneath it (Serial Position).

## 2026-10-16: NFC via the ACBA app, the driver confirms (owner)

- **Decision.** NFC is paid on the driver's phone in the bank's ACBA app; our app reads no card. The driver says whether it worked. A rider who chose NFC is matched with fleet cars only. Fee unchanged (+2 %, 1 100 → 1 122 ֏).
- The payment list's NFC row now reads «վարորդի հեռախոսով, ավարտին · +2 %», and a quiet line under the list says «NFC-ը վճարվում է վարորդի հեռախոսով՝ ավարտին։ Միայն Eco Taxi-ի մեքենաներով» (book payment sheet, airport payment, mid-ride change).
- New `rider-done#nfc-wait`: fare hero 1 122 ֏ with a neutral «Սպասում ենք» chip, «Հպեք քարտը կամ հեռախոսը վարորդի հեռախոսին», disabled «Սպասում ենք վարորդի հաստատմանը…». The driver's «Վճարվեց» leads to the normal done screen.
- New `rider-done#nfc-failed`: the driver marked «Չստացվեց»; amber «Վճարումը չստացվեց», «Վարորդը կրկին կփորձի, կամ վճարեք կանխիկ», footer «Վճարել կանխիկ՝ 1 100 ֏» (no fee).
- New Armenian strings: Սպասում ենք · Հպեք քարտը կամ հեռախոսը վարորդի հեռախոսին · Վճարում եք 1 122 ֏ · վարորդը կհաստատի · Սպասում ենք վարորդի հաստատմանը… · Վճարումը չստացվեց · Վարորդը կրկին կփորձի, կամ վճարեք կանխիկ · Կանխիկ՝ 1 100 ֏, առանց սպասարկման վճարի · վարորդի հեռախոսով, ավարտին · +2 % · NFC-ը վճարվում է վարորդի հեռախոսով՝ ավարտին։ Միայն Eco Taxi-ի մեքենաներով.

## 2026-10-16: team review, e-mail for receipts and card retry (R1, R2)

- **R1.** `rider-login#name` gains an OPTIONAL e-mail field after the name («Էլ. հասցե · ըստ ցանկության») and the line «Ստացականները կուղարկենք այստեղ». «Շարունակել» works with it empty. Receipts are our receipt plus the link to the Tax Service receipt; there are no invoices (company reports are separate). New `rider-account#email` edits it later (pencil beside the name); the profile row shows the address under the phone.
- **R2.** `rider-done#card-declined`: «Կրկնել · ·· 4242 · 1 122 ֏» (the same card again) is the primary button and comes first; the other methods follow under «Կամ այլ եղանակ», none preselected; the line reads «Կրկնեք նույն քարտով, կամ ընտրեք այլ եղանակ».
- New Armenian strings: Էլ. հասցե · ըստ ցանկության · Ստացականները կուղարկենք այստեղ · Էլ. հասցե · Կրկնել · Կրկնեք նույն քարտով, կամ ընտրեք այլ եղանակ · Կամ այլ եղանակ.

## Fare details (owner 2026-10-16)

- **Entry.** The chosen tier card carries a small «i» (bottom right); tapping the chosen card again, or the «i», opens `rider-book?state=fare`. Cards that are not chosen select as before. `rider-tiers` carries the same «i».
- **Sheet.** A bottom sheet over the one shared scrim (like When / Payment), closed by the X or a tap outside, about 680 px tall so the map still shows above it. No inner scroll. Content, top down: the tier's picture and name; «Ֆիքսված գին» with the quote the rider is held to (fixed_upfront, so the sentence is true for every tier); km bands, base, per-minute, minimum, free and paid waiting; extras; time windows; the +2 % card rule; the company's comment for riders.
- **Numbers** are the console's (`console.js` TIERS, `tariffs.html` Գին / Ժամային գներ / Սպասարկման վճար): City 600 + 90 ֏/կմ (77 from 10 km, 66 from 30 km) + 12 ֏/ր, minimum 700 ֏, 3 ր free then 50 ֏/ր. The comment is per tariff; a tariff with none shows no block.
- **States.** `fare` (13:20, no window in force), `fare-night` (23:41: the Գիշերային row is brand-soft with «Հիմա», and the fixed fare carries it: 1 100 ֏ + 15 % → 1 300 ֏), `fare-airport` (pickup in Զվարթնոց: one line for the +500 ֏ zone charge and the 3 000 ֏ zone minimum, which also replaces the minimum cell: 3 500 ֏). The walkthrough clock (Friday 9:41) is inside the morning rush window, which is why the fare states set their own time.
- **Offline.** Nothing here is a mutation; the sheet renders from the quote already on the phone.
