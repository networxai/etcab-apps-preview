/* The mockup viewer (index.html). window.NAV comes from nav-data.js: surfaces → groups → screens → states, where a
   state's q is the query string that draws it (state=riding, intake=booking, active=1 …). One iframe at a time, so
   only one live 2GIS map runs. The view is the hash: #p=<screen file>&s=<q>&t=light|dark|sun. */
(() => {
  const NAV = window.NAV, $ = (id) => document.getElementById(id)
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const TOPICS = [
    ['Վճարում', /pay|cash|card|\bpos\b|nfc|receipt|fiscal|վճար|կտրոն|կանխիկ|քարտ|ստացական/i],
    ['Նախնական պատվեր', /pre-?order|booking|scheduled|նախնական|T−30/i],
    ['Ընկերություններ', /compan|corporate|ընկերութ/i],
    ['Տրանսֆեր', /transfer|տրանսֆեր|flight/i],
    ['Ակցիաներ', /promo|referral|\bads?\b|ակցի|պրոմո/i],
    ['Սակագին և գոտի', /tariff|zone|commission|սակագ|գոտ|միջնորդ/i],
    ['Գործընկեր', /partner|գործընկեր|top-?up|wallet|balance|հաշվեկշ/i],
    ['Անվտանգություն', /\bsos\b|112|safety|blacklist|սև ցուցակ/i],
    ['Կապ չկա', /offline|degraded|error|կապ չկա|socket/i],
  ]

  /* Every state once, in order: prev/next walk this within a surface. */
  const ALL = []
  NAV.forEach((sf) => sf.groups.forEach((g) => g.screens.forEach((sc) => sc.states.forEach((st) => ALL.push({ sf, g, sc, st })))))
  const text = (x) => [x.sc.title, x.sc.en, x.st.label, lab(x.st.label), x.st.sub, x.st.note, x.st.group, x.g.label].join(' ')
  $('count').textContent = ALL.length + ' վիճակ'

  let cur = null, query = '', topic = -1
  /* Language: Armenian is the source; ru / en come from i18n/<lang>.js through i18n.js, which also translates this
     page's own chrome. App state labels were written in English, so i18n/labels.js maps them to hy and ru. */
  const LANG = (() => { const l = new URLSearchParams(location.hash.slice(1)).get('l') || (() => { try { return sessionStorage.getItem('mock-lang') } catch (e) { return null } })(); return ['ru', 'en'].includes(l) ? l : 'hy' })()
  try { sessionStorage.setItem('mock-lang', LANG) } catch (e) { console.warn('[viewer] no sessionStorage', e) }
  const lab = (s) => (s && window.I18N_LABELS && window.I18N_LABELS[s] && window.I18N_LABELS[s][LANG]) || s
  if (LANG !== 'hy') {
    const load = (src) => new Promise((ok, no) => { const el = document.createElement('script'); el.src = src; el.onload = ok; el.onerror = no; document.head.appendChild(el) })
    load('i18n.js').then(() => load('i18n/' + LANG + '.js')).then(() => window.I18N.use(window.I18N_DICT || {}, LANG), (e) => console.warn('[viewer] no dictionary for', LANG, e))
  }
  const find = (p, s) => ALL.find((x) => x.sc.file === p && x.st.q === s) || ALL.find((x) => x.sc.file === p)

  function read() {
    const h = new URLSearchParams(location.hash.slice(1))
    const x = find(h.get('p'), h.get('s') || '') || ALL[0]
    const t = ['light', 'dark', 'sun'].includes(h.get('t')) ? h.get('t') : 'light'
    return { x, t: t === 'sun' && x.sf.kind !== 'driver' ? 'light' : t }
  }
  function go(x, t = cur ? cur.t : 'light') {
    if (t === 'sun' && x.sf.kind !== 'driver') t = 'light'
    cur = { x, t }
    const h = new URLSearchParams({ p: x.sc.file, s: x.st.q, t, l: LANG })
    history.replaceState(null, '', '#' + h.toString())
    render()
  }
  const src = (x, t, embed) => `${x.sc.file}.html?theme=${t === 'sun' ? 'light&sun=1' : t}${x.st.q ? '&' + x.st.q : ''}${embed ? '&embed=1' : ''}&lang=${LANG}`

  function render() {
    const { x, t } = cur
    document.documentElement.dataset.theme = t === 'dark' ? 'dark' : 'light'
    $('surf').innerHTML = NAV.map((sf) => {
      const n = sf.groups.reduce((a, g) => a + g.screens.length, 0)
      return `<button role="tab" aria-selected="${sf === x.sf}" class="${sf === x.sf ? 'on' : ''}" data-sf="${sf.id}">${esc(sf.label)}<small>${n}</small></button>`
    }).join('')
    $('topics').innerHTML = TOPICS.map(([l], i) => `<button aria-pressed="${i === topic}" class="${i === topic ? 'on' : ''}" data-t="${i}">${esc(l)}</button>`).join('')
    tree()
    const pos = ALL.filter((y) => y.sc === x.sc).indexOf(x) + 1
    $('crumb').innerHTML = `<span>${esc(x.sf.label)}</span><i data-lucide="chevron-right"></i><span class="hide-s">${esc(x.g.label)}</span><i data-lucide="chevron-right" class="hide-s"></i><b>${esc(x.sc.title)}</b><i data-lucide="chevron-right"></i><b>${esc(lab(x.st.label))}</b><span class="pos">${pos} / ${x.sc.states.length}</span>`
    const themes = [['light', 'Ցերեկ'], ['dark', 'Գիշեր']].concat(x.sf.kind === 'driver' ? [['sun', 'Արև']] : [])
    $('lang').innerHTML = [['hy', 'Հայ'], ['ru', 'Рус'], ['en', 'Eng']].map(([id, l]) => `<button role="radio" aria-checked="${id === LANG}" class="${id === LANG ? 'on' : ''}" data-lang="${id}" lang="${id}">${l}</button>`).join('')
    $('theme').innerHTML = themes.map(([id, l]) => `<button role="radio" aria-checked="${id === t}" class="${id === t ? 'on' : ''}" data-th="${id}">${l}</button>`).join('')
    $('open').href = src(x, t, false)
    const dev = $('dev'), f = $('frame'), want = src(x, t, true)
    dev.className = 'dev ' + (x.sf.kind === 'console' || x.sc.device === 'desk' ? 'desk' : 'phone')
    if (f.getAttribute('src') !== want) f.setAttribute('src', want)
    f.title = `${x.sc.title} · ${lab(x.st.label)}`
    const note = x.st.note || x.st.sub || (pos === 1 ? x.sc.sub : '')
    $('note').innerHTML = note || x.sc.en ? `<i data-lucide="info"></i><div><b>${esc(lab(x.st.label))}</b>${x.st.sub && x.st.sub !== note ? ' · ' + esc(x.st.sub) : ''}${note ? ' — ' + esc(note) : ''}</div><span class="keys"><kbd>←</kbd> <kbd>→</kbd> վիճակներ · <kbd>/</kbd> որոնում</span>` : ''
    fit()
    if (window.lucide) lucide.createIcons()
  }

  function tree() {
    const { x } = cur, el = $('tree')
    if (query || topic >= 0) {
      const words = query.toLowerCase().split(/\s+/).filter(Boolean)
      const hits = ALL.filter((y) => { const s = text(y).toLowerCase(); return words.every((w) => s.includes(w)) && (topic < 0 || TOPICS[topic][1].test(text(y))) })
      el.innerHTML = hits.length ? hits.slice(0, 300).map((y) => `<button class="hit${y === x ? ' on' : ''}" data-i="${ALL.indexOf(y)}"><b>${esc(lab(y.st.label))}</b><span>${esc(y.sf.label)} · ${esc(y.sc.title)}</span></button>`).join('')
        + (hits.length > 300 ? `<div class="empty">և ևս ${hits.length - 300}…</div>` : '') : '<div class="empty">Ոչինչ չգտնվեց</div>'
      return
    }
    el.innerHTML = x.sf.groups.map((g) => `<div class="grp">${esc(g.label)}</div>` + g.screens.map((sc) => {
      const open = sc === x.sc
      let last = null
      const sts = open ? `<div class="sts">${sc.states.map((st) => {
        const gh = st.group && st.group !== last ? `<div class="sg">${esc(lab(st.group))}</div>` : ''
        last = st.group || last
        const y = ALL.find((z) => z.sc === sc && z.st === st)
        return `${gh}<button class="st${st === x.st ? ' on' : ''}" data-i="${ALL.indexOf(y)}"${st === x.st ? ' aria-current="true"' : ''}>${esc(lab(st.label))}</button>`
      }).join('')}</div>` : ''
      const first = ALL.find((z) => z.sc === sc)
      return `<button class="scr${open ? ' on' : ''}" data-i="${ALL.indexOf(first)}" aria-expanded="${open}"><i data-lucide="chevron-right" class="chev"></i><span class="t">${esc(sc.title)}</span><span class="n">${sc.states.length}</span></button>${sts}`
    }).join('')).join('')
    const on = el.querySelector('.st.on') || el.querySelector('.scr.on')
    if (on) on.scrollIntoView({ block: 'nearest' })
  }

  /* Scale the device to the stage, never above 1:1. */
  function fit() {
    const st = $('stage'), dev = $('dev'), W = st.clientWidth, H = st.clientHeight
    const w = dev.offsetWidth, h = dev.offsetHeight, k = Math.min((W - 40) / w, (H - 40) / h, 1)
    dev.style.transform = `scale(${k})`
    dev.style.left = Math.round((W - w * k) / 2) + 'px'
    dev.style.top = Math.round((H - h * k) / 2) + 'px'
  }

  function step(d) {
    const list = ALL.filter((y) => y.sf === cur.x.sf), i = list.indexOf(cur.x)
    go(list[(i + d + list.length) % list.length])
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return
    if (b.dataset.i) { go(ALL[+b.dataset.i]); $('app').classList.remove('open') }
    else if (b.dataset.sf) { const sf = NAV.find((s) => s.id === b.dataset.sf); query = ''; topic = -1; $('q').value = ''; go(ALL.find((y) => y.sf === sf)) }
    else if (b.dataset.t) { topic = topic === +b.dataset.t ? -1 : +b.dataset.t; render() }
    else if (b.dataset.th) go(cur.x, b.dataset.th)
    else if (b.dataset.lang) { try { sessionStorage.setItem('mock-lang', b.dataset.lang) } catch (err) { console.warn('[viewer] no sessionStorage', err) } const h = new URLSearchParams(location.hash.slice(1)); h.set('l', b.dataset.lang); location.hash = h.toString(); location.reload() }
    else if (b.id === 'prev') step(-1)
    else if (b.id === 'next') step(1)
    else if (b.id === 'menu') $('app').classList.toggle('open')
    else if (b.id === 'copy') navigator.clipboard.writeText(location.href).then(() => { b.title = 'Պատճենված է' }, (err) => console.warn('[viewer] copy failed', err))
  })
  $('q').addEventListener('input', (e) => { query = e.target.value.trim(); tree(); if (window.lucide) lucide.createIcons() })
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input')) { if (e.key === 'Escape') { e.target.value = ''; query = ''; e.target.blur(); tree() } return }
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.key === 'ArrowRight') step(1)
    else if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === '/') { e.preventDefault(); $('q').focus() }
  })
  addEventListener('resize', fit)
  addEventListener('hashchange', () => { const r = read(); if (r.x !== cur.x || r.t !== cur.t) { cur = r; render() } })
  cur = read()
  render()
})()
