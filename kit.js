/* Shared mock plumbing: theme from ?theme=, status bar, icons, map, car art. */
(function () {
  const q = new URLSearchParams(location.search)
  const theme = q.get('theme') === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  window.THEME = theme

  /* ── ECO: the one canonical data set (review X4–X7). Rider, driver, partner and console pages read their shared facts
     from here, so the same ride, day, money format, payment roster and partner rules cannot drift between surfaces.
     A page may invent its own local rows (history, queue), but anything that appears on two surfaces comes from ECO. ── */
  const NB = ' ' /* no-break space: thousands, and before ֏ (U+202F measured 2 px at 16 px in Google Sans and read as «1100») */
  const grp = (n) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, NB)
  window.ECO = {
    NB,
    /* Money: «1 100 ֏», negative «−3 400 ֏» (U+2212). Never «1100 ֏», never a comma or dot for thousands. */
    amd: (n) => (n < 0 ? '−' : '') + grp(n) + NB + '֏',
    /* A plain number with grouping: «9 800». */
    num: (n) => (Number.isInteger(n) ? (n < 0 ? '−' : '') + grp(n) : ECO.dec(n)),
    /* Decimals use the Armenian/Russian comma: «4,3». */
    dec: (x, d = 1) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(d).replace('.', ','),
    km: (x) => ECO.dec(x) + ' կմ',
    pct: (x) => grp(x) + NB + '%',

    /* The demo day: Friday 9 October 2026, the status bar reads 9:41. */
    DAY: { iso: '2026-10-09', now: '9:41', today: 'Ուրբաթ, 9 հոկտ.', todayLong: 'Ուրբաթ, 9 հոկտեմբերի', short: '9 հոկտ.',
      tomorrow: 'Վաղը, շաբաթ, 10 հոկտ.', yesterday: 'Երեկ, հինգշաբթի, 8 հոկտ.', ru: 'Пятница, 9 окт.' },

    /* «One ride everywhere»: the walkthrough trip, seen by the rider (rider-*), the driver (driver-offer/ride) and the
       console (dispatch, rides). Route geometry is routes.js pickupToDrop (4 289 m, 375 s) and driverToPickup (1,4 km). */
    RIDE: {
      no: '2417', tier: 'Eco City', tierId: 'city',
      pickup: 'Մաշտոցի պող. 37', pickupNote: 'Մատենադարանի դիմաց', drop: 'Կոմիտասի պող. 22',
      requested: '9:40', assigned: '9:41', pickupAt: '9:45', dropAt: '9:51',
      approachMin: 4, approachKm: 1.4, km: 4.3, min: 6, fare: 1100, pay: 'cash',
      riding: { clock: '9:47', left: 4 }, /* the riding state: status bar 9:47, «4 րոպե · ժամանում 9:51» */
      driver: { name: 'Արամ Պետրոսյան', short: 'Արամ Պ.', first: 'Արամ', ini: 'ԱՊ', phone: '093 44-55-66', plate: '01 ET 001',
        car: 'Volkswagen ID.3', carHy: 'Volkswagen ID.3 · սպիտակ', rating: '4,9' },
      rider: { name: 'Աննա', phone: '091 23-45-67', rating: '4,8' },
    },

    /* Payment roster at launch: cash and company account are live; card, Idram and Telcell are «Շուտով» everywhere.
       Driver earnings and the console's mix therefore split cash / company only. Strings from apps/rider i18n. */
    PAY: {
      cash: { label: 'Կանխիկ', icon: 'banknote', live: true },
      company: { label: 'Ընկերության հաշվին', short: 'Ընկերություն', icon: 'building-2', live: true },
      card: { label: 'Քարտով', icon: 'credit-card', live: false },
      idram: { label: 'Idram', live: false }, telcell: { label: 'Telcell', live: false },
      soon: 'Շուտով',
    },

    /* Corporate client used on every surface (rider booking, receipt, console Companies). */
    COMPANY: { name: 'Արարատ Սոֆթ ՍՊԸ', short: 'Արարատ Սոֆթ', tin: '02612345', refLabel: 'Ծախսերի կոդ', ref: 'MKT-204',
      rider: 'Աննա Հակոբյան', limit: 300000, used: 184600, invoice: 'INV-2026-00065', due: '24 հոկտ.' },

    /* Partner (own car, prepaid wallet). Reference = the API's driver.paymentReference: six digits, zero-padded
       (migration 20261011100000_driver_payment_reference), labelled «Վճարման կոդ» in both the app and the console.
       Blocked below 0 ֏, warned below 3 000 ֏ (the Standard fee plan), and both are amber: a domain refusal, not a failure. */
    PARTNER: { name: 'Կարեն Մելքոնյան', ref: '000041', refLabel: 'Վճարման կոդ', warnBelow: 3000, blockBelow: 0,
      bank: { name: 'Ամերիաբանկ', holder: 'Էկո Տաքսի ՍՊԸ', account: '1570 0412 3456 4417', accountMasked: '1570 •••• 4417' },
      office: { address: 'Կոմիտասի պող. 38', hours: 'Երկ–Շբթ · 09:00–20:00' } },
  }

  /* iOS status bar. */
  window.statusBar = function (host, time) {
    const el = document.createElement('div')
    el.className = 'statusbar'
    el.dataset.bg = 'map'
    el.setAttribute('aria-hidden', 'true')
    el.innerHTML = `<span>${time || '9:41'}</span><span class="sys">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .4 10.4 10.4 0 0 0 .8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.3-1.3A6.6 6.6 0 0 0 8 4a6.6 6.6 0 0 0-4.7 1.8l1.3 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.6c-.5 0-1 .2-1.3.5L8 11.2l1.3-1.3c-.3-.3-.8-.5-1.3-.5Z"/></svg>
      <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.8" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".45"/></svg>
    </span>`
    host.appendChild(el)
    const hb = document.createElement('div')
    hb.className = 'homebar'
    host.appendChild(hb)
  }

  /* Lucide, one set, 1.75 stroke. */
  window.icons = function () {
    if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  }

  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
  window.cssVar = css

  /* ── Map: 2GIS MapGL JS when a key is present, Stadia raster otherwise ──────────────────────────────
     2GIS is the fleet's only map provider (docs/reference/2gis-platform.md §5); the real apps render
     MapGL in a WebView. The key is NEVER in a file this folder commits. It is read at runtime from, in order:
       1. window.MAPGL_KEY, set by the optional, git-ignored v2/mapgl.local.js (one line);
       2. the ?mapglKey= URL parameter;
       3. localStorage 'mapglKey'.
     No key, a refused key ('invalidtilekey') or an unreachable CDN all fall back to the raster map with a
     small badge saying why. Day/night use 2GIS's own public day and night styles, the same ids as the console
     (apps/operator/components/map/mapgl.ts → MAP_STYLE), so night is a real dark map, not a dimmed one. */
  const MAPGL_URL = 'https://mapgl.2gis.com/api/js/v1'
  const MAP_STYLE = { light: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b', dark: 'e05ac437-fcc2-4845-ad74-b1de9ce07555' }
  /* Map language = the app's language (review X2). Armenian first; 2GIS renders hy labels («Մեսրոպ Մաշտոցի պողոտա»).
     ?lang=ru / ?lang=en switch it with the UI; anything else is hy. */
  const MAP_LANG = ({ ru: 'ru', en: 'en' })[q.get('lang')] || 'hy'
  /* The "ride" basemap (review X3): 2GIS's own day/night style, minus the groups that compete with our pins —
     POI icons and their labels, landmark and park 3D models, 3D trees, parking and traffic-light glyphs.
     Streets, house numbers, metro and district labels stay: a pickup is read against them. graphicsPreset 'light'
     also drops the remaining 3D props. Built at runtime from the public style (same request MapGL makes), so the
     filter is the whole spec: in the RN WebView it is one constant list. If the fetch fails the full style stays. */
  const CALM_DROP = /^(POI icons New|Non-unique icons POI|Sights|Mega POI|Zoo|Parking lots|Parking lots layer|Parking roof|Traffic lights|3D Models Animated|Immersive Model 3D|Immersive Model 3D 2GIS|Model 3D|3D trees (summer|autumn|winter)|Point 3D Entity\. Immersive park|3D Models\. Immersive park)$/
  const STYLE_PATHS = { fontsPath: 'https://mapgl.2gis.com/api/fonts', iconsPath: 'https://disk.2gis.com/styles/assets/icons', modelsPath: 'https://disk.2gis.com/styles/assets/models' }
  const calmStyles = {}
  const calmStyle = (id, key) => calmStyles[id] || (calmStyles[id] = fetch('https://styles.api.2gis.com/styles/' + id + '?key=' + encodeURIComponent(key))
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('style ' + r.status))))
    .then((j) => { const s = j.result || j; s.layers = (s.layers || []).filter((l) => !CALM_DROP.test(String(l.name || '').trim())); return s })
    .catch((e) => { console.warn('[v2] map: calm style unavailable, using the full 2GIS style', e); return null }))
  const mapglKey = () => {
    if (typeof window.MAPGL_KEY === 'string' && window.MAPGL_KEY) return window.MAPGL_KEY
    const q = new URLSearchParams(location.search).get('mapglKey')
    if (q) return q
    try { return localStorage.getItem('mapglKey') } catch (e) { console.warn('[v2] map: localStorage unavailable, no stored 2GIS key', e); return null }
  }
  let mapglLoading = null
  const loadMapGL = () => mapglLoading || (mapglLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = MAPGL_URL
    s.onload = () => (window.mapgl ? resolve(window.mapgl) : reject(new Error('mapgl global missing')))
    s.onerror = () => reject(new Error('MapGL script failed to load'))
    document.head.appendChild(s)
  }))

  const badge = (el, text, opts) => {
    const b = document.createElement('div')
    b.className = 'map-badge'
    b.setAttribute('role', 'note')
    b.textContent = text
    Object.assign(b.style, opts.badge || { top: '116px', left: '16px' })
    el.parentElement.appendChild(b)
  }

  /* Raster fallback (Stadia "Alidade Smooth"; CARTO now answers every request with an API-key tile). */
  const rasterBackend = (el, opts) => {
    const style = theme === 'dark' ? 'alidade_smooth_dark' : 'alidade_smooth'
    const map = L.map(el, { zoomControl: false, attributionControl: false, zoomSnap: 0.05, fadeAnimation: false,
      zoomAnimation: false, inertia: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, keyboard: false })
    L.tileLayer(`https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}@2x.png`, { maxZoom: 20, tileSize: 256 })
      .on('load', () => { document.documentElement.dataset.mapReady = 'raster' }).addTo(map)
    map.fitBounds(L.latLngBounds(opts.fit), { paddingTopLeft: opts.padTL || [24, 24], paddingBottomRight: opts.padBR || [24, 24] })
    return {
      route(pts, o) {
        L.polyline(pts, { color: css('--route-casing'), weight: (o.weight || 5) + 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(map)
        L.polyline(pts, { color: o.color || css('--route'), weight: o.weight || 5, opacity: 1, lineCap: 'round', lineJoin: 'round', dashArray: o.dash || null }).addTo(map)
      },
      html(ll, html, size, anchor) {
        L.marker(ll, { icon: L.divIcon({ className: 'marker-reset', html: `<div data-marker style="display:contents">${html}</div>`, iconSize: size, iconAnchor: anchor || [size[0] / 2, size[1] / 2] }), interactive: false, keyboard: false }).addTo(map)
      },
    }
  }

  /* MapGL backend. Coordinates are [lon, lat] in MapGL, [lat, lon] everywhere else in this mock. */
  const mapglBackend = (mapgl, el, node, opts, key, onRefused) => {
    /* The container stops at the sheet's rounded top, so 2GIS's logo and copyright (bottom-left, kept as the
       terms require) sit just above the sheet instead of under it. */
    /* opts.keyboard: the height of a raised on-screen keyboard (px). The map box also stops above it, so the
       2GIS logo is never under the keys (rider search used to need a spacer for this). */
    const inset = Math.max(0, (opts.sheetH || 0) - 24, opts.keyboard || 0)
    el.style.bottom = inset + 'px'
    const lats = opts.fit.map((p) => p[0]), lons = opts.fit.map((p) => p[1])
    const sw = [Math.min(...lons), Math.min(...lats)], ne = [Math.max(...lons), Math.max(...lats)]
    const map = new mapgl.Map(node, {
      key, center: [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2], zoom: 16,
      style: MAP_STYLE[theme], zoomControl: false, lang: MAP_LANG, graphicsPreset: 'light',
    })
    if (opts.calm) map.setStyle(opts.calm, STYLE_PATHS)
    map.on('error', (ev) => { if (ev && ev.type === 'invalidtilekey') onRefused() })
    /* 2GIS attribution must stay visible (2GIS terms; review X1). Whatever sits over the map's bottom edge — a sheet,
       a card, a button bar — the logo is lifted until nothing in the page covers it: elementFromPoint at its corners. */
    let logoPad = 0
    const keepLogo = () => {
      const a = el.querySelector('a[href*="2gis"]')
      if (!a) return
      for (let i = 0; i < 6; i++) {
        const r = a.getBoundingClientRect()
        if (r.width < 2) return
        const hit = [[r.left + 2, r.top + 2], [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2]]
          .map(([x, y]) => document.elementFromPoint(x, y)).find((t) => t && !el.contains(t))
        if (!hit) return
        const ht = hit.getBoundingClientRect()
        if (ht.top <= el.getBoundingClientRect().top + 80) return /* a full-screen scrim or modal: the logo is dimmed with the map, not hidden by a sheet */
        logoPad += Math.ceil(r.bottom - ht.top) + 6
        /* MapGL's setControlsLayoutPadding does not move the copyright, so its control pane is lifted directly. */
        let pane = a.parentElement
        while (pane && pane !== el && getComputedStyle(pane).position !== 'absolute') pane = pane.parentElement
        if (!pane || pane === el) return
        pane.style.setProperty('bottom', logoPad + 'px', 'important')
      }
    }
    map.on('idle', keepLogo)
    window.addEventListener('resize', keepLogo)
    /* 'idle' = style, tiles and overlays all drawn. Screenshots and the index wait on this flag. */
    let settled = false
    map.on('idle', () => {
      if (!settled) { settled = true; fit(); setTimeout(() => { document.documentElement.dataset.mapReady = '2gis' }, 3000); return } /* one re-fit on a fully laid-out map, then report ready */
      document.documentElement.dataset.mapReady = '2gis'
    })
    const [l, t] = opts.padTL || [24, 24], [r, b] = opts.padBR || [24, 24]
    /* Fit once now and again when the style has loaded: a fit issued before the style (or before an iframe
       is laid out) can land off-centre, which is what the index showed on one dark phone. */
    const fit = () => { map.invalidateSize && map.invalidateSize(); map.fitBounds({ southWest: sw, northEast: ne }, { padding: { top: t, left: l, right: r, bottom: Math.max(0, b - inset) }, skipAnimation: true }) }
    fit()
    map.on('styleload', fit)
    const ll = (p) => [p[1], p[0]]
    return {
      route(pts, o) {
        const dashed = !!o.dash
        new mapgl.Polyline(map, {
          coordinates: pts.map(ll), width: o.weight || 5, color: o.color || css('--route'),
          interactive: false,
          ...(dashed ? { dashLength: 3, gapLength: 6, gapColor: '#00000000' } : { width2: (o.weight || 5) + 4, color2: css('--route-casing') }),
        })
      },
      html(p, html, size, anchor) {
        new mapgl.HtmlMarker(map, {
          coordinates: ll(p), anchor: anchor || [size[0] / 2, size[1] / 2],
          html: `<div data-marker style="width:${size[0]}px;height:${size[1]}px;position:relative">${html}</div>`,
        })
      },
    }
  }

  window.makeMap = function (el, opts) {
    const ops = []
    let backend = null
    const replay = (b) => { backend = b; ops.forEach(([m, args]) => b[m](...args)) }
    /* Each backend gets its own host inside #map, so a refused MapGL can be hidden rather than torn down
       mid-frame (destroying it while it is still compiling shaders throws a WebGL context-lost error). */
    const host = () => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:0'; el.appendChild(d); return d }
    const fallback = (why) => {
      el.style.bottom = ''
      el.dataset.provider = 'raster'
      badge(el, why, opts)
      replay(rasterBackend(host(), opts))
    }
    const adapter = {
      route: (...a) => (ops.push(['route', a]), backend && backend.route(...a)),
      html: (...a) => (ops.push(['html', a]), backend && backend.html(...a)),
    }
    const key = mapglKey()
    if (!key) { fallback('2GIS key missing — add v2/mapgl.local.js'); return adapter }
    el.dataset.provider = '2gis'
    Promise.all([loadMapGL(), opts.calm === false ? null : calmStyle(MAP_STYLE[theme], key)]).then(([mapgl, calm]) => {
      opts = { ...opts, calm }
      let refused = false
      const glHost = host()
      replay(mapglBackend(mapgl, el, glHost, opts, key, () => {
        if (refused) return
        refused = true
        console.warn('[v2] map: 2GIS refused the key (invalidtilekey); showing the raster fallback')
        glHost.style.display = 'none'
        fallback('2GIS key refused — check v2/mapgl.local.js')
      }))
    }).catch((err) => {
      console.warn('[v2] map: MapGL unavailable; showing the raster fallback', err)
      fallback('2GIS map unavailable')
    })
    return adapter
  }
  window.drawRoute = (map, pts, o = {}) => map.route(pts, o)
  window.htmlMarker = (map, ll, html, size, anchor) => map.html(ll, html, size, anchor)

  /* Top-down car for the map. */
  window.carTop = function (deg, fill, glass) {
    return `<svg width="18" height="34" viewBox="0 0 18 34" style="transform:rotate(${deg}deg);filter:drop-shadow(0 1px 2px rgb(0 0 0 / .35))">
      <rect x="1" y="1" width="16" height="32" rx="6" fill="${fill || 'var(--car-top)'}" stroke="rgb(0 0 0 / .16)" stroke-width=".75"/>
      <path d="M3.5 10.5c3.6-1.6 7.4-1.6 11 0l-1 4.5c-2.9-.9-6.1-.9-9 0z" fill="${glass || 'var(--car-top-glass)'}"/>
      <path d="M4.5 25.5c2.9.7 6.1.7 9 0l.8 3.2c-3.5 1.1-7.1 1.1-10.6 0z" fill="${glass || 'var(--car-top-glass)'}" opacity=".8"/>
      <rect x="5.5" y="17.5" width="7" height="4" rx="1.2" fill="var(--lime)"/>
    </svg>`
  }

  /* Tier cars are the fleet's own renders (assets/eco/cars/*.webp, ¾ front, transparent). */
  window.carImg = function (kind, alt) {
    return `<img src="assets/eco/cars/${kind}.webp" alt="${alt || ''}" decoding="async">`
  }
})()
