# Apps v2: notes on the four hero screens

`index.html` shows rider home, rider tiers, driver home and driver offer, each in day and night, plus the rider home
pre-order variant. Every screen is drawn from `tokens.css` + `kit.css` + `kit.js`. Nothing on a screen sets its own colour or size.

## Owner rule added mid-round (2026-10-09)
**Rider tiers scroll horizontally.** They sit in a snap-scrolling row of 132px cards in the sheet, and the third card
peeks about 100px at the edge. Each card holds the car art, the name, the ETA and seats, and the price. The selected card
is `--surface` with a 2px `--ink` inset ring and the green leaf check; unselected cards are `--surface-2`. The payment row and the
52px order button stay fixed under the row. **Carry this into every later rider screen that chooses a tier.**

## Tokens (`tokens.css`)
| Group | Token | Light | Dark |
|---|---|---|---|
| Type | hero (one per screen) | 700 40/48 | same |
| | title / headline | 600 22/28 · 600 17/24 | same |
| | body / secondary / caption | 400 16/22 · 400 13/18 · 500 12/16 | same |
| Space | s1–s8 | 4 8 12 16 20 24 32; margin 16 | same |
| Radius | card / control / sheet / pill | 12 / 14 / 24 / 999 | same |
| Size | rider button / driver primary / slide track / tap | 52 / **76** (DEC-13, was 64) / 72 / 44 (driver fabs 48) | same |
| Shadow | e1 · e2 · sheet | `0 1px 2px /.06, 0 8px 24px /.10` (e2) | the same, deeper; no border with a shadow |
| Ground | ground · surface · surface-2 · surface-3 · raised | #F4F4F2 · #FFF · #F3F3F1 · #EAEAE7 · #FFF | #0E0E0F · #161618 · #1F1F22 · #2A2A2E · #2E2E33 |
| Ink | ink · ink-2 · ink-3 | #111113 (18.9) · #5E5E63 (6.45) · #6B6B70 (5.30 / 4.77 on s-2) | #F2F2F3 (16.2) · #A1A1A6 (7.0) · #8E8E93 (5.5 / 5.0) |
| Brand (Eco) | brand · brand-ink · brand-vivid | **#2F7D0A** · #2F7D0A · #43A70A | #2F7D0A · #7CC90C · #6CC417 |
| Status | ok · warn · danger | #0B7A41 (5.42; was #0F8A4A at 4.42) · #B45309 · #C81E1E | #3DD68C (9.63) · #F5B14C · #F26B6B |
| Soft grounds | ok- · warn- · danger-soft (flat hex, text may sit on them) | #E7F3ED · #F6EAE1 · #FAE9E9 | #1A2924 · #31291E · #2C1F20 |
| Edge / title | `--line` (control edge on ground) · `--t-large` | rgb(17 17 19/.16) · 600 28/36 | rgb(255 255 255/.14) |
| Map | route · approach · map-fade | #2F7D0A · ink dotted · #F4F4F2 | #9BCD50 (lime) · ink dotted · #232423 |

## Font
**Google Sans, one family for hy, ru and en.** Verified on Google Fonts: the 400–700 faces ship `armenian`, `cyrillic` and `latin` subsets.
The Armenian woff2 has 88 code points including ֏, plus `tnum`/`lnum`. Google Sans Flex has no Armenian; Noto Sans Armenian (no Cyrillic) is the fallback.
That means one RN `fontFamily`, tabular digits everywhere, and static 400–700 instances. The hero line height is 48, because the face is 47px tall at 40px.

## Imagery and licences
- **Map: 2GIS MapGL JS** (`mapgl.2gis.com/api/js/v1`), the fleet's only provider. `kit.js → makeMap()` is one adapter for both
  backends. Routes are `Polyline` with a casing (`width2`/`color2`); pins, puck and cars are `HtmlMarker` with the same designs as before.
  Night is 2GIS's public dark style (the console's `MAP_STYLE.dark`), with no dimming. The zoom control is off. Icons: Lucide 1.54.0 (ISC), stroke 1.75.
  **Review fixes, 2026-10-12 (preview-review X1–X3):**
  - **Labels are Armenian:** `lang: 'hy'` (2GIS renders «Մեսրոպ Մաշտոցի պողոտա»); `?lang=ru` / `?lang=en` follow the UI language. Never English by default.
  - **A calm "ride" basemap:** the public day/night style is fetched once and these groups are dropped before `setStyle()`: POI icons (and their labels),
    Sights, Mega POI, Zoo, parking, traffic lights, every 3D model group and 3D trees. `graphicsPreset: 'light'` removes the remaining 3D props
    (the Opera blob is gone). Streets, house numbers, metro and district labels stay, because a pickup is read against them. If the style fetch
    fails the full style is used. RN WebView: the same constant list (`CALM_DROP` in `kit.js`).
  - **The 2GIS logo is always visible (2GIS terms):** after every `idle`, `kit.js` hit-tests the logo's corners with `elementFromPoint`; whatever page
    element covers it (sheet, card, button bar) lifts the copyright pane by the overlap + 6px (`setControlsLayoutPadding` does not move it in MapGL v1).
    A full-screen scrim is exempt (the logo is dimmed with the map, not hidden). Checked on every map screen with the review's own logo check.
  **The key is never in a file.** The order is `window.MAPGL_KEY` (from the git-ignored `mapgl.local.js`), then `?mapglKey=`, then localStorage `mapglKey`.
  No key, a refused key (`invalidtilekey`) or a CDN failure each fall back to the Stadia raster map, with a badge saying why.
  **One canonical data set (`window.ECO` in `kit.js`):** the walkthrough ride, the demo day (Friday 9 October 2026, 9:41), the money and number
  formatters («1 100 ֏» with a narrow nbsp, decimal comma «4,3 կմ»), the payment roster (cash, company account, card, Apple Pay / Google Pay and NFC · POS live since 2026-10-15/16; Idram, Telcell «Շուտով»),
  the corporate client, and the partner rules (six-digit «Վճարման կոդ» = the API's `paymentReference`, warn below 3 000 ֏, block below 0, both amber).
  Rider, driver, partner and console pages read these from `ECO`; a fact that appears on two surfaces is never typed twice.
  **Owner setup, one line:** create `v2/mapgl.local.js` containing `window.MAPGL_KEY="<browser key>"`. Use the browser key from the
  2gis-platform.md §6 split, restricted to the page's origin. The file is listed in `v2/.gitignore`.
  **Tested with the owner's dev key** (never read): every screen renders 2GIS in both themes with 0 console errors. The dark style
  `e05ac437-…` loads, so no dim is needed. The blank dark phone and the bare beige tiers were WebGL-context exhaustion and capture timing:
  `index.html` only runs the phones in view and unloads the rest, the camera re-fits on `styleload` and the first `idle`,
  and pages set `data-map-ready` after that, which `tools/shoot.js` waits on. With no key the fallback is unchanged, and a fake key falls back cleanly.
- **Routes:** real street geometry from OSRM (`router.project-osrm.org`, OSM data, ODbL), stored in `routes.js`.
  The routes are Republic Square → Cascade (2.1 km, about 4 min), driver → pickup on Mashtots (1.4 km), and pickup → Komitas (4.3 km).
- **Partner photos:** Unsplash Licence. They are `photo-1495474472287` (latte) and `photo-1414235077428` (plate); `photo-1540555700478` (spa) is spare. The names are invented.
- **Cars:** the owner's renders (`assets/eco/cars/*.webp`: trimmed, ¾ front, transparent). The fleet is **electric**:
  City is an ID.3 with the TAXI sign, Comfort a Tesla Model 3, Kids an ID.3 with a child seat, Business an ID.4, Van a premium MPV, Vip an ID.6 / ID.4 Crozz.
  Tier cards share one baseline: a 108×56 box, bottom-aligned, `contain`, max 54px tall. A soft `--car-ground` ellipse keeps white cars from floating on dark.
  The van shows at most 216×108 device px, under its 352×171 source. The map markers are `carTop()`, with a lime roof sign.

## Audits (Playwright, 390×844 @2x, `audit.js`; run with `tools/mk.sh "<screens>"`, then `tools/shoot.js`)
**Every hero, in both themes, has 0 overlaps, clips and contrast failures.** The tightest text is 1.15× its threshold.
The audits check overlap (box pairs plus centre occlusion), clipping (scroll size, ellipsis, an overflow ancestor, off-screen) and
WCAG 2.1 contrast through alpha layers (text on photos is measured against a white photo). Tier cards: 5–65px spare. Audited on the live 2GIS path.

Deliberate exceptions, each marked in the markup:
- `data-peek` marks the second partner card and tier cards 3–6, cut by the edge on purpose. The status bar is measured on the basemap ground.
- Map labels are map content and are not audited.

Fixed along the way: the hero clipped (44 → 48 line height), the ring digits overlapped, the partner tag was 11px on a thin scrim, and «Նախապես» was duplicated.

## Carry into the remaining screens
- Use only the tokens. A new screen picks from ground / surface / surface-2 and never adds a fourth ground.
- Each screen has one hero number at 40/48 700, and only one accent fill.
- Rider: map-first with an opaque sheet, and floating 44px circular controls over the map.
  Tiers are always a horizontal snap row with a peek (owner rule). Partners are always visible on home.
- Driver: one at-speed action per screen. Two density tiers: moving 76 primary (DEC-13) / 56 targets; parked 52 / 48.
  Slide for accept, start and complete; tap for arrived. Status is a pill with dot and word, never colour alone.
- **Offer ring = seconds (§10.1, coordinator ruling):** the ring drains the accept window and shows «9 վ». The pickup ETA moves to
  the first fact line, «4 րոպե · 1,4 կմ», above the trip line. `driver-offer-states` follows the same rule.
- Shared kit: `.btn-quiet` and `.chip` carry a `--line` edge, so they hold on `--ground`. `.on-ground` lifts them to surface + e1.
  Map styles are scoped to `#map` / `.map-host`, never a bare `.map`. `makeMap({ keyboard })` keeps the 2GIS logo above a raised keyboard.
- `audit.js` resolves `color(srgb …)` (`color-mix()`) backgrounds and skips disabled controls (WCAG 1.4.3).
  It also skips vendor map chrome, meaning anything in the map not inside our `[data-marker]`.
- **All rider and driver pages, every state, day and night (driver also sun): 362 audit runs, 0 failures.** Shots were refreshed
  for every page that uses chips, quiet buttons or `--ok`. Tools: `tools/mk-audit.sh` and `tools/mk-shootall.sh`.
- Not done: moving the rider pages' duplicated helpers (tier row, caret, centre pin, wheel, driver card, stops, `.btn-text`, modal)
  into `rider.js`/`rider.css`. Those are the rider designer's files; it is a mechanical follow-up.
- Every changing number uses `tabular-nums`, and prices use a narrow nbsp before ֏.
- Map labels are a surface tag with `--e2`. The ETA inside is an inverted ink badge.
- Run `audit.js` on every screen in both themes before review. Its `data-*` intent markers are part of the spec.
- Open question for the owner: the Google Sans trademark rule (the name cannot be used in a renamed derivative).

## Brand application (Eco Taxi)
**Greens**, measured with the WCAG 2.1 formula:
| Token | Light | Ratio | Dark | Ratio | Use |
|---|---|---|---|---|---|
| `--brand` | #2F7D0A (= EXPO_PUBLIC_BRAND_COLOR) | white on it 5.17 | #2F7D0A | white on it 5.17 | primary button, slide track, puck, own car, tier check |
| `--brand-ink` | #2F7D0A | 5.17 on surface, 4.66 on surface-2 | #7CC90C (logo end) | 8.79 on surface | green as text and icons |
| `--brand-vivid` | #43A70A (logo start) | 3.10 on white (graphics only) | #6CC417 | 8.21 | spare accent |
| `--route` | #2F7D0A | about 4.7 on the basemap | #9BCD50 | — | route line |
| `--lime` | #9BCD50, sampled from the stripe in city.webp | 1.87 on white: **never text** | #9BCD50 | 9.67 on surface | livery echo (map-car roof sign), ring on dark |
| `--ring` | #43A70A | 3.10 on white (non-text, ≥3) | #9BCD50 | 9.67 | countdown ring: lime by night, logo green by day, because lime fails 3:1 on white |

`--ok` (online, cash) stays its own green: a status claim, always next to a word.

**Logo.**
- `logo-wide.png` appears on the rider home map top (112×20) and the driver home map top (100×18), over the status-bar fade.
- The offer and tier screens carry no logo, because the task owns the screen. The leaf appears once, as the selected-tier check. `letters/` is for the splash.

**Tariffs.** The tiers display verbatim and in sort order: Eco City, Eco Comfort, Eco Kids, Eco Business, Eco Van, Eco Vip.
Every tariff is `fixed_upfront`: fare = max(min, base + per_km·km + per_min·min), rounded to 100 ֏.
The rider route is Republic Sq → Cascade: OSRM gives 2,146 m, shown as **2.1 km**, and the map tag shows **4 min**.
| Tier | base + km + min | = | Rounded | ≥ min |
|---|---|---|---|---|
| City | 600 + 90·2.1 + 12·4 = 600 + 189 + 48 | 837 | **800** | 700 ✓ |
| Comfort | 700 + 231 + 56 | 987 | **1 000** | 900 ✓ |
| Kids | 900 + 273 + 72 | 1 245 | **1 200** | 1 200 ✓ |
| Business | 1 000 + 315 + 80 | 1 395 | **1 400** | 1 400 ✓ |
| Van | 1 200 + 357 + 88 | 1 645 | **1 600** | 1 600 ✓ |
| Vip | 1 500 + 462 + 120 | 2 082 | **2 100** | 2 000 ✓ |

**Driver.**
- **Offer:** Eco City, pickup → Komitas, 4,289 m and 375 s (shown as 4.3 km, 6 min). The fare is 600 + 387 + 72 = 1 059 → **1 100 ֏**.
- **Home (9:41, shift opened 09:12):** 1 ride so far, **1 200 ֏** cash. The full Friday (earnings, shift end at 15:20) is 7 rides, 9 800 ֏ = cash 7 600 + company 2 200.
- **Car:** «01 ET 001» sits on the driver home sheet. It is an image chip, the ID.3 render beside the plate, for the open-shift car.

## 2026-10-14: Armenian copy, style pass and the owner decisions
- **One glossary on every surface.** It is in the session's `armenian-copy.md`, and each page's NOTES file lists its own changes. Notably:
  - pre-order is «նախնական պատվեր», with the «Նախապես» chip;
  - shift is «հերթափոխ»;
  - the driver pill is «Առցանց / Անցանց», with «Ընդունել պատվերներ / Դադարեցնել»;
  - decline is «Մերժել»;
  - no-show is «Ուղևորը չեկավ»;
  - the partner's balance is «հաշվեկշիռ», fee is «միջնորդավճար», and fare is «գին»;
  - tariff, and so car class, is «սակագին»;
  - the fleet's people are «գրասենյակ»; «ընկերություն» means corporate clients only;
  - there are no «՛» marks, buttons are 1–3-word verbs, and amounts read «1 100 ֏», «4,3 կմ», «14 հոկտ.».
- **New `ECO` facts in kit.js.**
  - `TIERS[].preorders`: pre-orders per tariff. «Նախապես» offers only those tariffs. When due, a pre-order is searched automatically among that tariff's drivers, the pre-assigned driver first.
  - `PARTNER.rules`: partner fee and minimum balance per tariff.
  - `SOS`: the rider alert, shown on console Dispatch until «Լուծված է».
  - `DISPATCH.lowRating`: 1–3 ★, 24 h.
  - `DOCS`: expired insurance stops orders until a new document is approved.
  - `COMPANY.months`: no invoices; a company report plus an optional «Վճարված» mark.
- **Fleet drivers have no balance.** Every fleet balance, debt, top-up and balance-block state is removed (see DRIVER-NOTES). Only partners keep a balance, and each partner has exactly one car.
- **New:** the driver notifications inbox (`driver-inbox.html`) and the insurance block (`driver-home-states#insurance`, `#insurance-sent`).

## 2026-10-14 (later): owner change list

Shared facts added to `kit.js` ECO: `COMPANY.empLimit` (default 50 000 ֏ a month per employee; Աննա 65 000, 12 600 left;
an over-limit variant with 600 ֏ left), `COMPANY.places` (allowed places, 300 m), `TRANSFER_TIER` and `TRANSFERS` (four airport
transfers; T-0031 is Արամ's, Saturday 14:10, flight FZ 715), `CAR_TIERS` (the tariffs each car may take: Արամ City + Kids,
Կարեն Comfort + City), `PROMO` (codes, the applied AUTUMN15 example 1 100 → 935 ֏, the referral programme). Removed:
`COMPANY.refLabel/ref` and `BOOKINGS.co.ref` (no cost-centre code anywhere) — and no fixed routes on any surface.

Per surface: RIDER-NOTES.md, DRIVER-NOTES.md, PARTNER-NOTES.md and the console NOTES each have a "2026-10-14 change list"
section with what was drawn and what is **drawn ahead of the app** (promo codes, referral, per-employee limits and allowed
places, the receipt document, the consent checkbox, the driver's own order, the earnings date range, transfers). The hub links
every new page: Transfers, Promotions (codes / referral / ads), the employee limit panel, the driver's new order, the receipt.
