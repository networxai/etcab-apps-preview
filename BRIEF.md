# Apps v2: the high-end pass (hero screens first)

The owner reviewed v1 (`../rider`, `../driver`). His words: **"they are very cheap, overlapped, big everything, not high-end result."**
v1 tried to draw 208 states at once, and the quality was spread thin. v2 inverts that. **Four hero screens are drawn to App-Store-feature quality first.** Nothing else gets drawn until the owner approves those four.

## What was wrong in v1 (seen on rider/home.html, 2026-10-09)
- The taxi image sits on top of the "Where to?" button, and «Նախապես» is clipped inside a square tile. Objects overlap and labels get cut.
- Everything is oversized: chunky 40px-ish type, fat pills, heavy rounded boxes. It reads like a kids' app, not like Uber, Bolt or Yandex Go.
- The art is clip art: flat SVG mountains and cable cars, tiny 144×88 palette PNG cars, and a fake hand-drawn map.
- The palette is loud: a saturated green slab on beige, with too many tinted tiles.

## The four hero screens (v2 scope, nothing more)
1. **Rider home.** A map-first column. The partner advertising carousel is always visible, Yandex Go style; this is the owner's rule.
2. **Rider tier choice + fare.** The route on the map, a bottom sheet with tiers (car art, ETA, price) and the order button.
3. **Driver home, online.** Status, today's earnings at a glance, the pre-orders entry, and the map.
4. **Driver incoming offer.** A countdown ring, pickup → drop, fare/distance, and slide to accept.

Draw each in light and dark. Each phone frame is 390×844, laid out side by side on one page: `v2/index.html`. Draw no other states, though the rider home may show one variant with an upcoming pre-order.

## Quality bar (each item is checked)
- **Scale like iOS/Material, not larger.**
  - Body 15–16px. Secondary 13px. Caption 12px. Screen title 28px at most.
  - The single hero number (fare, earnings, countdown) may be 32–44px, and only one per screen.
  - Rider buttons are 52px high. Driver at-speed actions are 64–76px, and only the one primary action.
  - Weights: 400 / 500 / 600. 700 appears only on the hero number.
- **8-pt grid.**
  - Spacing: 4, 8, 12, 16, 20, 24, 32.
  - Screen side margins are 16px.
  - Radii: 12 for cards, 20–28 for sheets, and pills only where it is a pill.
  - Shadows are soft and layered (e.g. `0 1px 2px rgb(0 0 0 / .06), 0 8px 24px rgb(0 0 0 / .08)`), never a hard border plus a shadow.
- **Restraint.** Use a neutral ground, one accent, and colour only where it means something (status, primary action). There are no tinted tile soups.
  - The accent is a placeholder brand colour, `--brand`, because white-labelling means the fleet sets it. Show one tasteful default.
- **Real imagery, not clip art.**
  - **Map:** real map tiles of central Yerevan. Use CARTO basemaps (`https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png`, and `dark_all` for dark), positioned with static `<img>` tiles or Leaflet from cdnjs. Use a real route polyline on real streets, for example Republic Square → Cascade.
  - **Partner ads:** real photography. Unsplash image URLs via `images.unsplash.com` are fine for a mockup: a café, a restaurant, a wellness/spa scene. Use a gradient scrim for the text.
  - **Cars:** high-resolution side or ¾ renders with transparent backgrounds. If you cannot find properly licensed ones, use an elegant, consistent **line or silhouette** set drawn at high resolution in SVG. That is better than cheap 3D. Never reuse the 144×88 PNGs.
- **Icons:** one set only (Lucide via its CDN, or Phosphor), 1.5–1.75 stroke, 20/24px.
- **Font:**
  - It must render Armenian, Cyrillic and Latin well.
  - Check what Google Fonts actually serves with an Armenian subset: Noto Sans Armenian; possibly "Google Sans" / "Google Sans Flex".
  - For the mockup you may pair Inter (Latin/Cyrillic, tabular numbers) with Noto Sans Armenian through a CSS font stack, and say so.
- **Copy:** short real Armenian. Use the strings in `apps/rider/lib/i18n.ts` and `apps/driver/lib/i18n.ts` where they exist. No explanatory paragraphs on screen.
- **Benchmarks to match in finish:** Uber (2024–25 app), Bolt, Yandex Go, Revolut and Airbnb. Read `../research/*.md`, especially each file's top-15 list and the "Recommended visual direction kit". Lean towards the calm-premium direction: Uber/Revolut finish with a warm accent, not loud.

## Mechanical checks you must run and pass before reporting (with Playwright)
1. **Overlap audit.** For every visible text or interactive element, there is no intersecting bounding box with another visible text or interactive element, unless one is a deliberate overlay (map pins under a sheet). List the exceptions.
2. **Clip audit.** No text element has `scrollWidth > clientWidth` or `scrollHeight > clientHeight`, and no ellipsis, except where truncation is deliberate.
3. **Contrast.** Body text is ≥ 4.5:1 and large text ≥ 3:1 in both themes. Text on photos sits on a scrim that meets this.
4. **Screenshots.** Save `v2/shots/<screen>-<theme>.png` at device scale 2, then **look at each one** and fix what looks cheap. Iterate at least twice per screen.

## Constraints
- Write only under `docs/superpowers/design/2026-10-09-apps/v2/`. Leave v1 untouched.
- No builds, tests or dev servers. A static server already serves `docs/superpowers/design/` on port 8090 (`http://localhost:8090/2026-10-09-apps/v2/index.html`). Do not start or stop servers, and never touch ports 3100 or 3199.
- The owner's earlier corrections still hold:
  - less text, more visuals;
  - the driver has a pre-orders page (on these screens, only its entry point);
  - partners are always on the rider home.
