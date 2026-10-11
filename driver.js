/* Driver mock plumbing beyond kit.js: states (?state=), the sun option (?sun=1), the switcher, rings, mini maps.
   Load after kit.js (and routes.js where a page needs ROUTES). */
(function () {
  const q = new URLSearchParams(location.search)
  const root = document.documentElement
  if (q.get('sun') === '1' && window.THEME === 'light') root.dataset.sun = '1'

  /* Pre-order routes: real street geometry from OSRM (OSM, ODbL), fetched 2026-10-09, simplified. [lat, lng].
     air  Baghramyan 24 → Zvartnots (13.1 km, 19 min, City 2 000 ֏)
     kom  Komitas 49 → Republic Sq (5.8 km, 8 min, City 1 200 ֏)
     tsi  Cascade → Tsitsernakaberd (3.8 km, 7 min, City 1 000 ֏) */
  window.DROUTES = {
  air: { m: 13059, s: 1123, pts: [[40.190498,44.504998],[40.191086,44.504207],[40.189151,44.503781],[40.186569,44.504604],[40.182373,44.499249],[40.180378,44.499212],[40.179331,44.501604],[40.177367,44.503168],[40.174802,44.501558],[40.174217,44.500613],[40.175731,44.498082],[40.166739,44.483274],[40.159097,44.466149],[40.156551,44.456605],[40.160031,44.441338],[40.158044,44.433704],[40.158596,44.430668],[40.164586,44.416141],[40.163649,44.403366],[40.160949,44.40358],[40.158713,44.401525],[40.154534,44.400387],[40.152973,44.398702]] },
  kom: { m: 5780, s: 501, pts: [[40.205102,44.508542],[40.204858,44.509544],[40.204114,44.508365],[40.197831,44.492978],[40.19619,44.493927],[40.192609,44.499628],[40.192343,44.50047],[40.191433,44.51012],[40.191036,44.511375],[40.190357,44.512358],[40.18512,44.516942],[40.183667,44.518817],[40.177963,44.511977],[40.177185,44.512796],[40.177777,44.513721],[40.177384,44.514083],[40.177467,44.514432]] },
  tsi: { m: 3823, s: 439, pts: [[40.187002,44.515502],[40.187053,44.51506],[40.18691,44.514726],[40.17657,44.502463],[40.174988,44.501788],[40.174217,44.500613],[40.175636,44.498741],[40.176564,44.498573],[40.1777,44.497801],[40.177984,44.497424],[40.179215,44.494193],[40.179215,44.493567],[40.178732,44.492066],[40.178957,44.491602],[40.181462,44.492065],[40.183446,44.492791],[40.184954,44.491461],[40.185417,44.490553]] }
  }

  const SCREENS = [
    ['driver-login', 'Login'], ['driver-ready', 'Readiness'], ['driver-shift', 'Shift'], ['driver-home', 'Home (hero)'],
    ['driver-home-states', 'Home, other states'], ['driver-preorders', 'Pre-orders'], ['driver-offer', 'Offer (hero)'],
    ['driver-offer-states', 'Offer, other states'], ['driver-ride', 'Ride flow'], ['driver-earnings', 'Earnings'], ['driver-account', 'Account'],
  ]

  const link = (over) => {
    const p = new URLSearchParams(location.search)
    Object.entries(over).forEach(([k, v]) => (v == null ? p.delete(k) : p.set(k, v)))
    return '?' + p.toString()
  }

  window.D = {
    state: null,
    /* states: [[id, label], …]. Elements with data-s="a b" show only in those states; data-not="a b" hides in them. */
    init(states, onState) {
      const ids = states.map((s) => s[0])
      const st = ids.includes(q.get('state')) ? q.get('state') : ids[0]
      this.state = st
      root.dataset.state = st
      document.querySelectorAll('[data-s]').forEach((el) => { el.hidden = !el.dataset.s.split(' ').includes(st) })
      document.querySelectorAll('[data-not]').forEach((el) => { if (el.dataset.not.split(' ').includes(st)) el.hidden = true })
      const here = location.pathname.split('/').pop().replace('.html', '')
      const sw = document.createElement('nav')
      sw.className = 'dswitch'
      sw.setAttribute('aria-label', 'Mock states')
      sw.innerHTML = '<h2>States</h2>' + states.map(([id, label]) => '<a href="' + link({ state: id }) + '"' + (id === st ? ' aria-current="true"' : '') + '>' + label + '</a>').join('') +
        '<div class="themes"><a href="' + link({ theme: 'light', sun: null }) + '">Day</a><a href="' + link({ theme: 'dark', sun: null }) + '">Night</a><a href="' + link({ theme: 'light', sun: '1' }) + '">Sun</a></div>' +
        '<h2>Screens</h2>' + SCREENS.map(([f, l]) => '<a href="' + f + '.html?theme=' + window.THEME + '"' + (f === here ? ' aria-current="true"' : '') + '>' + l + '</a>').join('')
      document.body.appendChild(sw)
      if (onState) onState(st)
      return st
    },
    /* A state with no map: report ready once fonts are in, so the shooter does not wait on a map. */
    noMap() { document.fonts.ready.then(() => setTimeout(() => { if (!root.dataset.mapReady) root.dataset.mapReady = 'none' }, 300)) },
    ring(size, stroke, frac, inner, color) {
      const r = (size - stroke) / 2, c = 2 * Math.PI * r
      return '<div class="dring" style="width:' + size + 'px;height:' + size + 'px"><svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" aria-hidden="true">' +
        '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--surface-3)" stroke-width="' + stroke + '"/>' +
        '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + (color || 'var(--ring)') + '" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - frac)).toFixed(1) + '"/>' +
        '</svg><div class="in">' + (inner || '') + '</div></div>'
    },
    /* A small live 2GIS map with one route (pre-order cards). Keep to ≤ 3 per page. */
    mini(el, pts, opts) {
      opts = opts || {}
      const m = makeMap(el, { fit: pts, padTL: [16, 16], padBR: [16, 16], badge: { top: '4px', left: '4px' }, ...opts })
      drawRoute(m, pts, { weight: 4 })
      htmlMarker(m, pts[0], '<div class="pin a sm"></div>', [12, 12])
      htmlMarker(m, pts[pts.length - 1], '<div class="pin b sm"></div>', [12, 12])
      return m
    },
  }
})()

/* Partner («Գործընկեր») screens, 2026-10-11: appended to the switcher by pages that call D.partnerNav(). */
window.D && (window.D.partnerNav = function () {
  const sw = document.querySelector('.dswitch'); if (!sw) return
  const here = location.pathname.split('/').pop().replace('.html', '')
  const P = [['driver-partner-onboarding', 'Onboarding'], ['driver-partner-home', 'Home'], ['driver-partner-wallet', 'Wallet'], ['driver-partner-car', 'My car'], ['driver-types', 'Fleet vs Partner']]
  const box = document.createElement('div')
  box.className = 'p-nav'
  box.innerHTML = '<h2>Partner</h2>' + P.map(([f, l]) => '<a href="' + f + '.html?theme=' + window.THEME + '"' + (f === here ? ' aria-current="true"' : '') + '>' + l + '</a>').join('')
  sw.appendChild(box)
})
