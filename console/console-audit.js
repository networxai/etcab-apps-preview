/* Console v2 audits, adapted from ../audit.js (overlap, clip, contrast).
   Console additions: anything wholly outside its scroll container is not on screen (skipped);
   text partly cut by a scroll container is listed as `scrolled`, not a clip; deliberate truncation
   ([data-truncate] or .trunc / table cells) is listed under `truncated` so the reviewer sees every case.
   Contrast: WCAG AA is the failure line; text under 13px below 7:1 is listed under `small7`
   (the console's own floor), except --ink-faint, which is guarded at 4.5 by design.
   Conventions the screens use to state intent (each one is listed in the result):
   - [data-overlay]  deliberate overlay (map markers under a sheet, etc.)
   - [data-peek]     deliberately cut by the screen edge (next carousel card)
   - [data-photo]    text sits on a photo: contrast is computed against a WHITE photo under the scrim (worst case)
   - [data-bg]       explicit backdrop colour ('map' = the basemap's ground for the theme) */
window.audit = function () {
  const screen = document.querySelector('.screen')
  const S = screen.getBoundingClientRect()
  const vis = (el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el)
    if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden' || cs.display === 'none') return false
    for (let e = el; e && e !== document.body; e = e.parentElement) if (+getComputedStyle(e).opacity === 0) return false
    if (!(r.right > S.left && r.left < S.right && r.bottom > S.top && r.top < S.bottom)) return false
    for (let p = el.parentElement; p && p !== screen; p = p.parentElement) {
      const o = getComputedStyle(p).overflow
      if (o !== 'visible') { const q = p.getBoundingClientRect(); if (r.bottom <= q.top + 1 || r.top >= q.bottom - 1 || r.right <= q.left + 1 || r.left >= q.right - 1) return false }
    }
    return true
  }
  const hasText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
  /* Vendor map chrome (2GIS logo/copyright, Leaflet) is the provider's, not ours: not audited. */
  const vendor = (el) => !!el.closest(':where(#map, .map-host)') && !el.closest('[data-marker]')
  /* A label inside a pill, chip, plate or button is never allowed to truncate, even in a table cell. */
  const truncOK = (el) => !!el.closest('[data-truncate], .trunc, td') && !el.closest('.pill, .typ, .chip, .plate, .tag, .btn, th')
  const all = [...screen.querySelectorAll('*')].filter((el) => !el.closest('svg') && !vendor(el) && vis(el))
  const texts = all.filter(hasText)
  /* textarea/select: their text is the control's value; a Range over it measures nothing on screen. */
  const inter = all.filter((el) => el.matches('button,a,input,textarea,select,[role=button],[role=slider]'))
  const items = [...new Set([...texts, ...inter])]
  const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.className || el.tagName).toString().trim().replace(/\s+/g, ' ').slice(0, 40)
  const textRect = (el) => {
    if (!hasText(el) || inter.includes(el) || getComputedStyle(el).textOverflow === 'ellipsis') return el.getBoundingClientRect()
    const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect()
  }

  /* What the eye can see of a box: its rect clipped by every non-visible-overflow ancestor. */
  const clipR = (el, r) => {
    let L = r.left, T = r.top, R = r.right, B = r.bottom
    for (let p = el.parentElement; p && p !== screen; p = p.parentElement) {
      if (getComputedStyle(p).overflow !== 'visible') { const q = p.getBoundingClientRect(); L = Math.max(L, q.left); T = Math.max(T, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom) }
    }
    return { left: L, top: T, right: R, bottom: B }
  }
  /* 1. Overlap */
  const overlaps = [], excepted = []
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j]
    if (a.contains(b) || b.contains(a)) continue
    const ra = clipR(a, textRect(a)), rb = clipR(b, textRect(b))
    const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
    const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
    if (w > 0.5 && h > 0.5) {
      const rec = `${name(a)} × ${name(b)} (${w.toFixed(1)}×${h.toFixed(1)})`
      if (a.closest('[data-overlay]') || b.closest('[data-overlay]')) excepted.push(rec); else overlaps.push(rec)
    }
  }
  /* occlusion: a text whose centre is covered by something that is not itself */
  for (const el of texts) {
    if (el.closest('[data-peek]') || getComputedStyle(el).pointerEvents === 'none') continue
    const r = textRect(el), x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2
    /* A text whose centre is past its own scroll box's edge is cut by that edge (listed under `scrolled`), not covered:
       the probe would land on whatever sits beyond the box (a card footer, the next panel). */
    const cr = clipR(el, r)
    if (x < cr.left + 1 || x > cr.right - 1 || y < cr.top + 1 || y > cr.bottom - 1) continue
    const top = document.elementFromPoint(x, y)
    if (top && !el.contains(top) && !top.contains(el) && !el.closest('[data-overlay]')) {
      const e2 = top.closest('svg') ? top.closest('svg').parentElement : top
      if (!el.contains(e2) && !e2.contains(el)) (e2.closest('[data-overlay]') ? excepted : overlaps).push(`occluded: ${name(el)} under ${name(e2)}`)
    }
  }

  /* 2. Clip */
  const clips = [], scrolled = [], truncated = []
  for (const el of texts) {
    const cs = getComputedStyle(el)
    const ell = cs.textOverflow === 'ellipsis'
    const overX = el.scrollWidth > el.clientWidth + 1 && cs.display !== 'inline'
    if (overX) (ell && truncOK(el) ? truncated : clips).push(`scrollWidth ${el.scrollWidth}>${el.clientWidth}: ${name(el)}`)
    if (el.scrollHeight > el.clientHeight + 1 && cs.display !== 'inline' && !ell) clips.push(`scrollHeight ${el.scrollHeight}>${el.clientHeight}: ${name(el)}`)
    if (ell && !overX && !truncOK(el)) clips.push(`ellipsis without data-truncate: ${name(el)}`)
    const r = textRect(el)
    let inScroller = false, ellCut = false
    for (let p = el.parentElement; p && p !== screen; p = p.parentElement) {
      const pc = getComputedStyle(p)
      if (pc.overflow !== 'visible' && !el.closest('[data-peek]')) {
        const pr = p.getBoundingClientRect()
        if (r.left < pr.left - .5 || r.right > pr.right + .5 || r.top < pr.top - .5 || r.bottom > pr.bottom + .5) {
          const cutX = r.left < pr.left - .5 || r.right > pr.right + .5
          const scroller = cutX ? /auto|scroll/.test(pc.overflowX) : /auto|scroll/.test(pc.overflowY)
          if (scroller) { scrolled.push(name(el)); inScroller = true; break }
          /* An ancestor's ellipsis only renders for inline content; a flex/block child is silently cut. */
          let inlineChain = true
          for (let e = el; e && e !== p; e = e.parentElement) if (e !== el && getComputedStyle(e).display !== 'inline') inlineChain = false
          if (getComputedStyle(el).display !== 'inline' && el !== p) inlineChain = inlineChain && false
          /* cut by an ancestor's own ellipsis: deliberate truncation, so not also «off-screen» */
          if ((ell || (pc.textOverflow === 'ellipsis' && inlineChain)) && truncOK(el)) { ellCut = true; break }
          clips.push(`cut by ${p.className}: ${name(el)}`)
        }
      }
    }
    if (!inScroller && !ellCut && !el.closest('[data-peek]') && (r.left < S.left || r.right > S.right || r.top < S.top || r.bottom > S.bottom)) clips.push(`off-screen: ${name(el)}`)
  }

  /* 3. Contrast */
  /* Computed colours arrive as rgb()/rgba(), or — for color-mix() and other CSS Color 4 values — as
     color(srgb r g b / a) with 0–1 channels. Anything else is resolved through a canvas. */
  const cvs = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const parse = (c) => {
    const srgb = c.match(/^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\)/)
    if (srgb) return { r: +srgb[1] * 255, g: +srgb[2] * 255, b: +srgb[3] * 255, a: srgb[4] !== undefined ? +srgb[4] : 1 }
    if (/^rgba?\(/.test(c)) { const m = c.match(/[-\d.e]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 } }
    cvs.clearRect(0, 0, 1, 1); cvs.fillStyle = '#000'; cvs.fillStyle = c; cvs.fillRect(0, 0, 1, 1)
    const d = cvs.getImageData(0, 0, 1, 1).data
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }
  }
  const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), a: 1 })
  const over = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 })
  const lum = (c) => { const f = (v) => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b) }
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05) }
  const mapGround = THEME === 'dark' ? hex('#1B1C1E') : hex('#F4F4F2')
  const scrimAt = (card, y) => {
    const stops = card.dataset.scrim.split(',').map((s) => s.split(':').map(Number))
    const t = (y - card.getBoundingClientRect().top) / card.getBoundingClientRect().height
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) {
      const [t0, a0] = stops[i - 1], [t1, a1] = stops[i]; return a0 + (a1 - a0) * Math.max(0, (t - t0) / (t1 - t0))
    }
    return stops[stops.length - 1][1]
  }
  const backdrop = (el) => {
    const layers = []
    for (let e = el; e; e = e.parentElement) {
      if (e.dataset && e.dataset.bg) { let b = e.dataset.bg === 'map' ? mapGround : hex(e.dataset.bg); for (const l of layers.reverse()) b = over(l, b); return b }
      if (e.dataset && e.dataset.photo !== undefined) {
        let b = over({ r: 0, g: 0, b: 0, a: scrimAt(e, textRect(el).top) }, hex('#FFFFFF'))
        for (const l of layers.reverse()) b = over(l, b); return b
      }
      const c = parse(getComputedStyle(e).backgroundColor)
      if (c.a > 0) { if (c.a >= 1) { let b = c; for (const l of layers.reverse()) b = over(l, b); return b } layers.push(c) }
      if (e === screen) break
    }
    let b = parse(getComputedStyle(screen).backgroundColor); for (const l of layers.reverse()) b = over(l, b); return b
  }
  const contrast = [], small7 = []
  const faint = (() => { const d = document.createElement('i'); d.style.color = 'var(--ink-faint)'; screen.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c })()
  let worst = 99
  for (const el of texts) {
    /* WCAG 1.4.3 exempts inactive controls. */
    if (el.closest(':disabled, [aria-disabled="true"]')) continue
    const cs = getComputedStyle(el)
    const bg = backdrop(el)
    const fgc = parse(cs.color)
    let op = 1; for (let e = el; e && e !== screen; e = e.parentElement) op *= +getComputedStyle(e).opacity
    const fg = over({ ...fgc, a: fgc.a * op }, bg)
    const px = parseFloat(cs.fontSize), wt = +cs.fontWeight
    const large = px >= 24 || (px >= 18.66 && wt >= 700)
    const need = large ? 3 : 4.5
    const r = ratio(fg, bg)
    worst = Math.min(worst, r / need)
    if (r < need) contrast.push(`${r.toFixed(2)} < ${need}: ${name(el)} (${px}px/${wt})`)
    else if (px < 13 && r < 7 && cs.color !== faint) small7.push(`${r.toFixed(2)}: ${name(el)} (${px}px)`)
  }
  return { theme: THEME, checked: { texts: texts.length, interactive: inter.length }, overlaps, excepted, clips, contrast, small7, scrolled: scrolled.length, truncated, worstMargin: +worst.toFixed(2) }
}
