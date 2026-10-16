/* Company console mock plumbing: shell (company nav + quiet top bar), the company's data, ride rows.
   Loaded after ../../kit.js (ECO, THEME), ../console.js (TIERS, fare, carImg, icons) and
   ../company-report.js (CO: months, report table, export buttons). One data set with the console's company page:
   the employees, their October figures and Աննա's limit and places are ECO.COMPANY's.
   Owner 2026-10-16: exactly ONE login per company (the company's manager); no roles. Nav: Live orders, New order,
   History, Settings (Employees, Tariffs, Company and account live under Settings). Live orders are view only. */
(function () {
  const q = new URLSearchParams(location.search)
  const C = ECO.COMPANY, amd = ECO.amd
  /* console.js resolves its assets from the console folder; this page sits one level down. */
  window.ASSET = '../../assets/eco/'
  window.carImg = (id, alt) => `<img src="${ASSET}cars/${id}.webp" alt="${alt || ''}" decoding="async">`
  window.STATE = q.get('state') || ''
  /* Same theme and role on every link, so a reviewer never falls out of the variant they opened. */
  window.u = (page, extra) => `${page}?theme=${THEME}${extra ? '&' + extra : ''}`

  /* The one portal login (owner 2026-10-16): the company's manager, set by the fleet on the console's company page.
     The manager need not be an employee (an employee is someone who rides). */
  window.ME = { name: 'Լուսինե Ավետիսյան', short: 'Լուսինե Ա.', ini: 'ԼԱ', phone: '091 40-22-18', last: 'այսօր, 9:12' }
  /* Tariffs the company lets its employees use (owner 2026-10-16): one setting, edited here and on the console's company
     page. Eco Vip is off for Արարատ Սոֆթ. New order, and the employees' rider app, offer only these. */
  window.ALLOWED = ['city', 'partner', 'kids', 'business', 'van']
  window.allowedTiers = () => TIERS.filter((t) => ALLOWED.includes(t.id))
  /* The fleet's dispatch line comes from tenant config (no client-brand literal); this is the mock's value. */
  window.FLEET_PHONE = '010 50-50-50'

  /* Employees = console company.html EMP (October to date) + September for the report. limit: null = company default. */
  const EL = C.empLimit
  window.EMP = [
    [C.rider, ECO.RIDE.rider.phone, 38, 52400, ['amd', EL.rider.amount], 3, 41, 57600],
    ['Տիգրան Մանուկյան', '094 55-10-20', 29, 61200, ['rides', 40], 2, 33, 62400],
    ['Լիանա Գրիգորյան', '077 31-44-90', 21, 25800, null, 2, 26, 31900],
    ['Արսեն Սահակյան', '099 82-17-03', 17, 18300, null, 1, 22, 24300],
    ['Նունե Պետրոսյան', '093 40-62-18', 14, 16900, ['rides', 15], 2, 19, 21800],
    ['Մարիամ Ավագյան', '055 70-09-41', 6, 7200, null, 1, 18, 19600],
    ['Վարդան Խաչատրյան', '091 66-38-12', 6, 2800, null, 2, 15, 14200],
    ['Էլեն Սարգսյան', '096 24-51-77', 0, 0, null, 1, 12, 13500],
    ['Կարեն Զաքարյան', '041 90-83-26', 0, 0, null, 1, 10, 9800],
    ['Անի Մկրտչյան', '094 13-75-40', 0, 0, null, 1, 8, 6900],
    ['Արամ Վարդանյան', '077 58-20-11', 0, 0, null, 1, 6, 3600],
    ['Սոնա Հովսեփյան', '099 07-66-35', 0, 0, null, 1, 4, 2800],
    ['Դավիթ Ղազարյան', '093 28-14-59', 0, 0, null, 1, 0, 0],
    ['Գևորգ Հարությունյան', '098 11-27-65', 0, 0, null, 1, 0, 0, true],
  ].map(([name, phone, rides, amount, limit, places, sepRides, sepAmount, stopped]) => ({ name, phone, rides, amount, limit, places, sep: { rides: sepRides, amount: sepAmount }, stopped: !!stopped }))
  /* Limit in force: [by, n, used, left, pct]. */
  window.limOf = (e) => {
    const [by, n] = e.limit || ['amd', EL.default.amount]
    const used = by === 'amd' ? e.amount : e.rides, left = Math.max(0, n - used)
    return { by, n, used, left, pct: Math.min(100, Math.round(used / n * 100)), own: !!e.limit,
      txt: by === 'amd' ? amd(n) : `${n} ուղևորություն`, leftTxt: by === 'amd' ? amd(left) : `${left} ուղևորություն` }
  }

  /* ── Rides of the company today, Fri 9 Oct 2026 at 9:41 (ECO.DAY). Drivers are ones the console shows on a ride. ── */
  window.ST = {
    search: ['st-search', 'Որոնում', 'search'], route: ['st-route', 'Ճանապարհին', 'car'], here: ['st-here', 'Տեղում', 'map-pin'],
    ride: ['st-ride', 'Ուղևորի հետ', 'navigation'], plan: ['st-plan', 'Նախնական', 'calendar-clock'],
    done: ['', 'Ավարտված', 'check'], cancel: ['', 'Չեղարկված', 'x'],
  }
  const BY = { app: 'Հավելվածից', call: 'Դիսպետչերով' }
  const B = ECO.BOOKINGS.co
  window.LIVE = [
    { id: '2425', t: '9:40', who: 'Արսեն Սահակյան', ph: '099 82-17-03', a: 'Վազգեն Սարգսյանի 26/1', b: 'Կասկադ', tier: 'city', st: 'search', eta: 'Որոնվում է՝ <span class="mono">1 ր</span>', price: 1200, by: 'Վահանակից' },
    { id: '2423', t: '9:31', who: 'Լիանա Գրիգորյան', ph: '077 31-44-90', a: 'Դավթաշեն 3-րդ թղմ.', b: 'Վազգեն Սարգսյանի 26/1', tier: 'city', st: 'route', eta: 'Կհասնի՝ <span class="mono">3 ր · 9:44</span>', price: 1600, by: BY.app,
      drv: { name: 'Տիգրան Աբրահամյան', short: 'Տիգրան Ա.', plate: '12 TT 304', car: 'Volkswagen ID.3 · սպիտակ', tier: 'city' } },
    { id: '2421', t: '9:18', who: 'Տիգրան Մանուկյան', ph: '094 55-10-20', a: 'Վազգեն Սարգսյանի 26/1', b: 'Զվարթնոց օդանավակայան', tier: 'partner', st: 'ride', eta: 'Ժամանում՝ <span class="mono">10:02</span>', price: 4300, by: 'Վահանակից',
      drv: { name: 'Գագիկ Ավետիսյան', short: 'Գագիկ Ա.', plate: '34 LS 108', car: 'Tesla Model 3 · սպիտակ', tier: 'partner' } },
  ]
  window.PLANNED = [
    { id: 'B-0930', t: '13:30', day: 'Այսօր', who: 'Նունե Պետրոսյան', ph: '093 40-62-18', a: 'Վազգեն Սարգսյանի 26/1', b: 'Զվարթնոց օդանավակայան', tier: 'partner', st: 'plan', eta: 'Մեքենան՝ <span class="mono">13:15</span>-ից', price: 4300, by: 'Վահանակից' },
    { id: 'B-0933', t: '19:00', day: 'Այսօր', who: 'Մարիամ Ավագյան', ph: '055 70-09-41', a: 'Վազգեն Սարգսյանի 26/1', b: 'Արաբկիր 31', tier: 'city', st: 'plan', eta: 'Մեքենան՝ <span class="mono">18:45</span>-ից', price: 1500, by: 'Վահանակից' },
    { id: B.id, t: B.time, day: '12 հոկտ.', who: B.rider, ph: B.phone, a: B.pickup, b: B.drop, tier: 'city', st: 'plan', eta: 'Մեքենան՝ <span class="mono">08:45</span>-ից', price: B.fare, by: BY.app },
  ]
  window.DONE = [
    { id: '2414', t: '8:52', who: 'Վարդան Խաչատրյան', ph: '091 66-38-12', a: 'Արշակունյաց 34', b: 'Վազգեն Սարգսյանի 26/1', tier: 'city', st: 'cancel', eta: 'Չեղարկեց աշխատակիցը՝ <span class="mono">8:55</span>', price: 0, by: BY.app },
    { id: '2408', t: '8:05', who: C.rider, ph: ECO.RIDE.rider.phone, a: 'Կոմիտասի պող. 22', b: 'Վազգեն Սարգսյանի 26/1', tier: 'city', st: 'done', eta: 'Ավարտվեց՝ <span class="mono">8:19</span>', price: 1100, by: BY.app,
      drv: { name: 'Արմեն Գրիգորյան', short: 'Արմեն Գ.', plate: '35 OS 512', car: 'Mercedes V · սև', tier: 'van' } },
  ]
  window.byId = (id) => [...LIVE, ...PLANNED, ...DONE].find((r) => r.id === id)
  window.tierName = (id) => tierById(id).name

  window.stPill = (k, extra) => {
    const [cls, word, ic] = ST[k]
    if (k === 'done') return `<span class="pill ok"><i data-lucide="check"></i>${word}</span>`
    if (k === 'cancel') return `<span class="pill"><i data-lucide="x"></i>${word}</span>`
    return `<span class="pill lane ${cls}"${extra || ''}><i class="d"></i>${word}</span>`
  }
  /* One ride row: time · employee + route · state + when · price · open. Links keep theme/role and the page's state. */
  window.lrow = (r, href, on, late) => `<a class="lr ${late ? 'st-late' : ST[r.st][0]}${on ? ' on' : ''}" href="${href}" aria-current="${on ? 'true' : 'false'}">
      <time>${r.t}${r.day && r.day !== 'Այսօր' ? `<small>${r.day}</small>` : ''}</time>
      <span class="w"><b>${r.who}</b><span class="rt">${r.a}<span class="arr">→</span>${r.b}</span></span>
      <span class="s">${late ? '<span class="pill warn"><i data-lucide="triangle-alert"></i>Մեքենա դեռ չկա</span>' : stPill(r.st)}<span class="eta">${late ? 'Որոնվում է՝ <span class="mono">8 ր</span>' : r.eta}</span></span>
      <span class="p">${r.price ? amd(r.price) : '<span class="dash">—</span>'}</span>
      <i data-lucide="chevron-right" class="go"></i></a>`

  /* ── Shell: the company's own nav (no fleet sections, no queue, no live problem count) ── */
  /* Settings sub-pages (one nav item): Employees (employees.html), Tariffs and Company & account (settings.html). */
  window.setTabs = (on) => `<div class="tabsl" role="tablist" aria-label="Կարգավորումներ" style="margin-top:0">${[['employees', 'employees.html', 'Աշխատակիցներ', EMP.length], ['tariffs', 'settings.html', 'Սակագներ'], ['account', 'settings.html?state=account', 'Ընկերություն']]
    .map(([k, f, l, n]) => { const [pg, qs] = f.split('?'); return `<a href="${u(pg, qs)}" role="tab" aria-selected="${k === on}" class="${k === on ? 'on' : ''}">${l}${n ? `<span class="c num">${n}</span>` : ''}</a>` }).join('')}</div>`

  const NAV = [
    ['today', 'index', 'radio', 'Ընթացիկ պատվերներ', 'Ընթացիկ'],
    ['new', 'new', 'plus', 'Նոր պատվեր', 'Պատվիրել', 'N'],
    ['history', 'history', 'history', 'Պատմություն', 'Պատմություն'],
    ['settings', 'employees', 'settings', 'Կարգավորումներ', 'Կարգավորումներ'],
  ]
  window.portalShell = function (active, opts = {}) {
    const screen = document.getElementById('screen')
    const nav = document.createElement('nav')
    nav.className = 'nav'
    nav.setAttribute('aria-label', 'Բաժիններ')
    let h = `<div class="brand"><img class="wide" src="${ASSET}logo-wide.png" alt="Eco Taxi"></div>
      <div class="co"><span class="ic"><i data-lucide="building-2"></i></span><div><b>${C.name}</b><span>Ընկերության վահանակ</span></div></div><div class="scroll">`
    NAV.forEach(([id, file, icon, label, phone, kbd]) => {
      h += `<a href="${u(file + '.html')}" class="${id === active ? 'on' : ''}"${id === active ? ' aria-current="page"' : ''}${kbd ? ` aria-keyshortcuts="${kbd}"` : ''}><i data-lucide="${icon}"></i><span class="lw">${label}</span>${phone && phone !== label ? `<span class="lp">${phone}</span>` : ''}${kbd ? `<span class="kbd">${kbd}</span>` : ''}</a>`
    })
    h += `</div>
      <div class="me"><span class="av">${ME.ini}</span><span class="who"><b>${ME.name}</b><span>Մենեջեր</span></span><a class="btn ghost icon s" href="${u('login.html')}" aria-label="Դուրս գալ"><i data-lucide="log-out"></i></a></div>`
    nav.innerHTML = h
    screen.prepend(nav)

    /* Quiet top bar: connection, language, theme. No sound and no problem count: the fleet's dispatch owns those. */
    const live = document.querySelector('.bar .live')
    if (live) live.insertAdjacentHTML('beforeend', `<a class="btn ghost s mocklink" href="../index.html?theme=${THEME}" title="Բոլոր էջերը">Ինդեքս</a>
      ${opts.offline ? '<span class="pill warn" title="Թարմացվում է 30 վայրկյանը մեկ" aria-label="Կապ չկա"><i data-lucide="wifi-off"></i><span class="hide-ph">Կապ չկա</span></span>' : '<span class="pill ok hide-ph" title="Կապը կենդանի է"><i class="d"></i>Կապ կա</span>'}
      <button class="btn ghost s" aria-label="Լեզու">ՀՅ</button>
      <a class="btn ghost icon" href="?${new URLSearchParams({ ...Object.fromEntries(q), theme: THEME === 'dark' ? 'light' : 'dark' })}" aria-label="Թեմա"><i data-lucide="${THEME === 'dark' ? 'sun' : 'moon'}"></i></a>`)
    icons()
    document.documentElement.dataset.mapReady = 'none'
  }
})()
