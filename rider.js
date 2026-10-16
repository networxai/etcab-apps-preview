/* Rider app, v2: one file per screen, many states per file.
   rider-x.html                       → the review page: a state switcher and the state in day and night (iframes)
   rider-x.html?state=id&theme=dark   → one phone, one state: what audit.js and the screenshots run against
   A screen file calls Rider.page({ title, sub, states: [{ id, label, group, note, html(s), map(s) }] }).
   html() returns the phone's markup; map(), when present, runs after icons and owns the live 2GIS map. */
(function () {
  const q = new URLSearchParams(location.search)
  const NB = ECO.NB /* no-break space: thousands and before ֏ (kit.js ECO, the one formatter) */

  const R = {
    NB,
    amd: (n) => ECO.amd(n), /* one formatter for every surface: «1 100 ֏» */
    km: (x) => ECO.km(x),   /* decimal comma: «4,3 կմ» */
    i: (name, extra) => `<i data-lucide="${name}"${extra ? ' ' + extra : ''}></i>`,
    plate: (no, lg) => `<span class="plate${lg ? ' lg' : ''}" role="img" aria-label="Համարանիշ ${no}"><span class="eu" aria-hidden="true"><i></i><b>AM</b></span><span class="no">${no}</span></span>`,
    /* The driver's face: no photo yet, so initials on a brand-tinted disc (the driver app's own avatar), never a grey glyph.
       A photo URL from the backend replaces the initials when the fleet uploads one. */
    avatar: (lg, ini) => `<span class="avatar ini${lg ? ' lg' : ''}" role="img" aria-label="Վարորդ՝ ${ECO.RIDE.driver.name}">${ini || ECO.RIDE.driver.ini}</span>`,
    car: (kind, w, h, alt) => `<span class="carart" style="width:${w}px;height:${h}px">${carImg(kind, alt)}</span>`,

    /* The real OSRM polyline, projected (equirectangular, cos φ) into a w×h box: a route you can recognise, no basemap. */
    trace(key, w, h, o = {}) {
      const pts = ROUTES[key].pts, k = Math.cos(pts[0][0] * Math.PI / 180)
      const xs = pts.map((p) => p[1] * k), ys = pts.map((p) => -p[0])
      const pad = o.pad == null ? 12 : o.pad
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
      const sc = Math.min((w - 2 * pad) / (x1 - x0 || 1), (h - 2 * pad) / (y1 - y0 || 1))
      const ox = (w - (x1 - x0) * sc) / 2, oy = (h - (y1 - y0) * sc) / 2
      const P = pts.map((p, i) => [ox + (xs[i] - x0) * sc, oy + (ys[i] - y0) * sc])
      const d = 'M' + P.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')
      const a = P[0], b = P[P.length - 1], r = o.r || 4
      let grid = ''
      if (o.grid !== false) for (let g = 16; g < Math.max(w, h); g += 16) grid += `M${g} 0V${h}M0 ${g}H${w}`
      return `<svg class="trace" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${grid ? `<path class="gr" d="${grid}"/>` : ''}
        <path class="ln" d="${d}" style="stroke-width:${o.sw || 3}"/><circle class="a" cx="${a[0]}" cy="${a[1]}" r="${r}"/><rect class="b" x="${b[0] - r}" y="${b[1] - r}" width="${2 * r}" height="${2 * r}" rx="1.5"/></svg>`
    },

    keypad() {
      const k = (d) => `<button class="k" aria-label="${d}">${d}</button>`
      return `<div class="keypad" data-overlay aria-hidden="true">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k).join('')}<span class="k blank"></span>${k(0)}<button class="k blank" aria-label="Ջնջել">${R.i('delete')}</button></div>`
    },

    /* iOS Armenian phonetic keyboard (ք ո ե ռ տ … = q w e r t …). */
    /* layout: 'hy' (default), 'en' or 'ru' — a rider may type an address in any of the three scripts (2GIS suggest is hy/ru/en). */
    keyboard(layout = 'hy') {
      const L = { hy: ['քոեռտըւիօպ', 'ասդֆգհյկլ', 'զղցվբնմ', 'բացատ'], en: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'space'], ru: ['йцукенгшщзх', 'фывапролджэ', 'ячсмитьбю', 'пробел'] }[layout]
      const row = (ks, cls = '') => `<div class="kr ${cls}">${[...ks].filter((c) => c !== ' ').map((c) => `<span class="kk">${c}</span>`).join('')}</div>`
      return `<div class="keyboard" data-overlay aria-hidden="true" translate="no">${row(L[0])}${row(L[1], 'in')}
        <div class="kr"><span class="kk fn">${R.i('arrow-big-up')}</span>${[...L[2]].map((c) => `<span class="kk">${c}</span>`).join('')}<span class="kk fn">${R.i('delete')}</span></div>
        <div class="kr"><span class="kk fn w">123</span><span class="kk sp">${L[3]}</span><span class="kk fn w">${R.i('corner-down-left')}</span></div></div>`
    },

    banner({ icon = 'wifi-off', t1, t2, action, kind = '', top }) {
      return `<div class="banner ${kind}" role="status"${top ? ` style="top:${top}px"` : ''}>${R.i(icon)}<span class="bt"><span class="b1">${t1}</span>${t2 ? `<span class="b2">${t2}</span>` : ''}</span>${action ? `<button class="ba">${action}</button>` : ''}</div>`
    },

    /* Live map behind a sheet. fit = [[lat,lng],…]; the sheet is #sheet (measured after icons have drawn). */
    map(s, o) {
      const sheet = s.querySelector(o.sheet || '#sheet')
      const sheetH = sheet ? sheet.offsetHeight : 0
      const m = makeMap(s.querySelector('#map'), {
        sheetH, fit: o.fit, padTL: o.padTL || [48, 120], padBR: o.padBR || [48, sheetH + 40],
        badge: { top: '116px', left: '16px' },
      })
      return m
    },
    bbox(pt, dLat, dLng) { return [[pt[0] - dLat, pt[1] - dLng], [pt[0] + dLat, pt[1] + dLng]] },
  }
  /* Payment methods (owner 2026-10-15). Apple Pay shows on iPhone, Google Pay on Android — never both on one phone (UX audit
     2026-10-15, Hick's law: five rows, not six; a wallet the phone cannot use is a row that can only fail). The mock is an iPhone;
     o.os = 'android' draws the Google Pay row instead. */
  R.payList = (sel, o = {}) => {
    const os = o.os || (sel === 'googlepay' ? 'android' : 'ios')
    const P = ECO.PAY, row = (id, ic, t, t2, cls) => `<button class="choice" role="radio" aria-checked="${sel === id}"><span class="ico ${cls || ''}">${R.i(ic)}</span><span class="t">${t}<span class="t2">${t2}</span></span><span class="radio"></span></button>`
    const div = '<div class="divider" style="margin-left:48px"></div>'
    return `<div class="paylist" role="radiogroup" aria-label="Վճարման եղանակ">${[
      row('cash', 'banknote', P.cash.label, o.ride ? 'վարորդին՝ ավարտին' : 'վարորդին', 'cashc'),
      row('card', 'credit-card', `${P.card.label} ·· ${P.card.last4}`, 'կգանձվի ավարտին'),
      os === 'ios' ? row('applepay', 'smartphone', P.applepay.label, 'iPhone-ում') : row('googlepay', 'smartphone', P.googlepay.label, 'Android-ում'),
      row('nfc', 'smartphone-nfc', P.nfc.label, 'վարորդի հեռախոսով, ավարտին · +2 %'),
    ].join(div)}${div}<button class="choice"><span class="ico">${R.i('plus')}</span><span class="t">Ավելացնել քարտ</span></button></div><div class="paynote">${R.i('smartphone-nfc')}<span>NFC-ը վճարվում է վարորդի հեռախոսով՝ ավարտին։ Միայն Eco Taxi-ի մեքենաներով</span></div>`
  }
  window.R = R

  function ready() {
    const imgs = [...document.images].map((im) => (im.complete ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r })))
    Promise.all([document.fonts.ready, ...imgs]).then(() => setTimeout(() => { document.documentElement.dataset.mapReady = 'none' }, 300))
  }

  function phone(cfg, st) {
    document.title = `${cfg.title} · ${st.label}`
    const s = document.createElement('main')
    s.className = 'screen'
    s.id = 's'
    s.innerHTML = st.html(s)
    document.body.appendChild(s)
    statusBar(s, st.time)
    /* A page with no map: the status bar's contrast is measured against what is really behind it. */
    if (!st.map) delete s.querySelector('.statusbar').dataset.bg
    icons()
    if (st.map) st.map(s)
    else ready()
    if (st.after) st.after(s)
  }

  function gallery(cfg) {
    document.title = cfg.title
    window.RIDER_STATES = cfg.states.map((s) => s.id)
    /* tools/build-nav reads this to list the screen in the viewer (index.html). */
    window.RIDER_CFG = { title: cfg.title, sub: cfg.sub, states: cfg.states.map((s) => ({ id: s.id, label: s.label, group: s.group, note: s.note })) }
    const st = document.createElement('style')
    st.textContent = `
      html,body{background:#E9E9E6} body{color:#111113;font:400 15px/22px var(--font);padding:32px 16px 64px;font-feature-settings:'tnum' 1}
      @media (prefers-color-scheme: dark){html,body{background:#0A0A0B;color:#F2F2F3} .g-sub,.g-cap span,figcaption{color:#A1A1A6!important} .g-sw button{background:#1F1F22!important;color:#F2F2F3!important} .g-sw button.on{background:#F2F2F3!important;color:#111113!important}}
      .g-head{max-width:1100px;margin:0 auto 20px} .g-head h1{font:600 28px/36px var(--font)} .g-sub{color:#5E5E63;margin-top:4px;max-width:760px}
      .g-sw{max-width:1100px;margin:0 auto 28px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
      .g-sw b{font:500 12px/16px var(--font);color:#8E8E93;margin:0 4px 0 10px} .g-sw b:first-child{margin-left:0}
      .g-sw button{height:32px;padding:0 12px;border-radius:999px;background:#fff;color:#111113;font:500 13px/32px var(--font);white-space:nowrap}
      .g-sw button.on{background:#111113;color:#fff}
      .g-grid{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:40px}
      .g-cap{margin-bottom:12px} .g-cap b{font:600 17px/24px var(--font)} .g-cap span{display:block;color:#5E5E63;font-size:13px;line-height:18px}
      .g-pair{display:flex;gap:24px;flex-wrap:wrap} figure{display:flex;flex-direction:column;gap:8px;align-items:center;margin:0}
      figcaption{font-size:12px;color:#5E5E63} .g-ph{width:406px;height:860px;padding:8px;border-radius:56px;background:#0B0B0C;box-shadow:0 1px 2px rgb(0 0 0/.1),0 24px 60px rgb(0 0 0/.18)}
      .g-ph iframe{width:390px;height:844px;border:0;border-radius:48px;display:block;background:#000}
      @media (max-width:460px){.g-ph{zoom:.82}}`
    document.head.appendChild(st)
    let last = null
    const sw = cfg.states.map((s) => {
      const g = s.group && s.group !== last ? `<b>${s.group}</b>` : ''
      last = s.group || last
      return `${g}<button data-s="${s.id}">${s.label}</button>`
    }).join('')
    document.body.innerHTML = `<header class="g-head"><h1>${cfg.title}</h1><p class="g-sub">${cfg.sub || ''} · ${cfg.states.length} states, day and night</p></header>
      <nav class="g-sw" aria-label="States">${sw}<b>·</b><button data-s="*">All</button></nav><div class="g-grid" id="g"></div>`
    const file = location.pathname.split('/').pop()
    const sec = (s) => `<section><div class="g-cap"><b>${s.label}</b>${s.note ? `<span>${s.note}</span>` : ''}</div><div class="g-pair">${['light', 'dark'].map((th) =>
      `<figure><div class="g-ph"><iframe title="${s.label}, ${th}" data-src="${file}?state=${s.id}&theme=${th}"></iframe></div><figcaption>${th === 'light' ? 'Day' : 'Night'}</figcaption></figure>`).join('')}</div></section>`
    let io = null
    const show = (id) => {
      if (io) io.disconnect()
      const list = id === '*' ? cfg.states : cfg.states.filter((s) => s.id === id)
      document.getElementById('g').innerHTML = list.map(sec).join('')
      document.querySelectorAll('.g-sw button').forEach((b) => b.classList.toggle('on', b.dataset.s === id))
      /* Each live 2GIS map is a WebGL context: phones run only while near the viewport (at most 2–4 at once). */
      io = new IntersectionObserver((es) => es.forEach((e) => {
        const f = e.target
        if (e.isIntersecting) { if (!f.src || f.src === 'about:blank') f.src = f.dataset.src } else if (f.src && f.src !== 'about:blank') f.src = 'about:blank'
      }))
      document.querySelectorAll('iframe[data-src]').forEach((f) => io.observe(f))
    }
    document.querySelector('.g-sw').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return
      history.replaceState(null, '', '#' + b.dataset.s); show(b.dataset.s)
    })
    const h = location.hash.slice(1)
    show(h && (h === '*' || cfg.states.some((s) => s.id === h)) ? h : cfg.states[0].id)
  }

  window.Rider = {
    page(cfg) {
      const id = q.get('state')
      const st = id && cfg.states.find((s) => s.id === id)
      if (st) phone(cfg, st)
      else gallery(cfg)
    },
  }
})()
