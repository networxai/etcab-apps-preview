/* Shared mock plumbing: theme from ?theme=, status bar, icons, map, car art. */
(function () {
  const q = new URLSearchParams(location.search)
  const theme = q.get('theme') === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  window.THEME = theme

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
      style: MAP_STYLE[theme], zoomControl: false,
    })
    map.on('error', (ev) => { if (ev && ev.type === 'invalidtilekey') onRefused() })
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
    loadMapGL().then((mapgl) => {
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
