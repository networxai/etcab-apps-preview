/* Console v2 mock plumbing: shell (nav + live cluster), fleet data, small helpers.
   Map, carTop and theme-from-?theme= come from ../kit.js (loaded first). */
(function () {
  const A = '../assets/eco/'
  window.ASSET = A

  /* ── Eco tiers, verbatim and in sort order (apps v2 NOTES §Tariffs). fixed_upfront, rounded to 100 ֏. ── */
  window.TIERS = [
    { id: 'city', name: 'Eco City', car: 'ID.3', seats: 4, base: 600, km: 90, min: 12, floor: 700, blurb: 'Մինչև 4 ուղևոր', pic: 'uploaded' },
    { id: 'partner', name: 'Eco Comfort', car: 'Model 3', seats: 4, base: 700, km: 110, min: 14, floor: 900, blurb: 'Tesla Model 3', pic: 'uploaded' },
    { id: 'kids', name: 'Eco Kids', car: 'ID.3 + մանկական նստոց', seats: 3, base: 900, km: 130, min: 18, floor: 1200, blurb: 'Մանկական նստոցով', pic: 'uploaded' },
    { id: 'business', name: 'Eco Business', car: 'ID.4', seats: 4, base: 1000, km: 150, min: 20, floor: 1400, blurb: 'Ընդարձակ սրահ', pic: 'icon' },
    { id: 'van', name: 'Eco Van', car: 'MPV', seats: 7, base: 1200, km: 170, min: 22, floor: 1600, blurb: 'Մինչև 7 ուղևոր', pic: 'uploading' },
    { id: 'vip', name: 'Eco Vip', car: 'ID.6', seats: 4, base: 1500, km: 220, min: 30, floor: 2000, blurb: 'Պրեմիում սպասարկում', pic: 'refused' },
  ]
  /* X10: the operator's class picker IS the tier list — names verbatim, one casing («Eco Vip»). */
  TIERS.forEach((t) => { t.cls = t.name })
  window.fare = (t, km, mn) => Math.max(t.floor, Math.round((t.base + t.km * km + t.min * mn) / 100) * 100)
  window.nf = (n) => ECO.num(n) /* one formatter for every surface (kit.js ECO): no-break space between thousands */
  window.amd = (n) => ECO.amd(n)
  window.carImg = (id, alt) => `<img src="${A}cars/${id}.webp" alt="${alt || ''}" decoding="async">`
  window.tierById = (id) => TIERS.find((t) => t.id === id)

  /* ── Navigation (strings from lib/i18n.ts hy where a key exists).
     IA: 2026-10-11-console-gaps.md §3 + owner 2026-10-11 «partners must have a different management section».
     Drivers = fleet drivers only; Partners is its own group. The rider-app item formerly «Գործընկերներ» (businesses
     on the rider home) is renamed «Բիզնես գործընկերներ» so the word means one thing in this nav.
     Groups marked fold:true render collapsed unless they hold the active page (keeps the nav inside 900px). ── */
  const NAV = [
    { items: [['overview', 'layout-dashboard', 'Ընդհանուր'], ['dispatch', 'activity', 'Դիսպետչերական', '2', true], ['rides', 'list', 'Պատվերներ'], ['transfers', 'plane', 'Տրանսֆերներ', '3'], ['requests', 'inbox', 'Հարցումներ', '3', true]] },
    { group: 'Ավտոպարկ', items: [['drivers', 'users', 'Վարորդներ', '30'], ['vehicles', 'car', 'Մեքենաներ', '28'], ['tariffs', 'tag', 'Սակագներ'], ['zones', 'map', 'Գոտիներ']] },
    { group: 'Գործընկերներ', items: [['partners', 'handshake', 'Գործընկերներ', '12'], ['approvals', 'badge-check', 'Հաստատումներ', '3', true], ['topups', 'wallet', 'Լիցքավորումներ'], ['feeplans', 'percent', 'Միջնորդավճարներ']] },
    /* Owner 2026-10-14: fleet drivers have no balance (#3), so fleet billing plans («Հաշվարկներ», billing.html) are gone;
       no invoicing (#11), so «Հաշիվների ձևավորում» is gone — company reports live on the company page and in Reports. */
    { group: 'Ֆինանսներ', items: [['customers', 'user-check', 'Ուղևորներ'], ['companies', 'building-2', 'Ընկերություններ'], ['monthly', 'calendar-check', 'Ըստ ամսի'], ['fiscal', 'scroll-text', 'Ֆիսկալ կտրոններ'], ['reports', 'chart-column', 'Հաշվետվություններ']] },
    { group: 'Ուղևորի հավելված', fold: true, items: [['promotions', 'ticket-percent', 'Ակցիաներ'], ['bizpartners', 'store', 'Գովազդատուներ'], ['apptexts', 'smartphone', 'Տեքստեր և կապ']] },
    { group: 'Կառավարում', fold: true, items: [['operators', 'user-cog', 'Օպերատորներ'], ['integrations', 'plug', 'Ինտեգրումներ'], ['audit', 'history', 'Մատյան'], ['settings', 'settings', 'Կարգավորումներ']] },
  ]
  const PAGES = ['overview', 'dispatch', 'rides', 'drivers', 'tariffs', 'partners', 'approvals', 'topups', 'feeplans', 'companies', 'company', 'monthly', 'settings',
    /* p1p2 pass: the remaining real routes, plus the planned Requests inbox. */
    'requests', 'vehicles', 'zones', 'customers', 'reports', 'promotions', 'transfers', 'operators', 'integrations', 'audit', 'search']
  /* Nav ids whose file is named after the real route rather than the nav word. */
  const FILE = { customers: 'customer' }
  const href = (id) => (PAGES.includes(id) ? `${FILE[id] || id}.html?theme=${THEME}` : '#')

  window.shell = function (active) {
    const screen = document.getElementById('screen')
    const rail = screen.classList.contains('rail')
    const nav = document.createElement('nav')
    nav.className = 'nav'
    nav.setAttribute('aria-label', 'Բաժիններ')
    let h = rail
      ? `<div class="brand" style="padding:0;margin-bottom:8px"><img class="mark" src="${A}mark.png" alt="Eco Taxi"></div>`
      : `<div class="brand"><img class="wide" src="${A}logo-wide.png" alt="Eco Taxi"><button class="btn ghost icon s" aria-label="Փակել վահանակը"><i data-lucide="panel-left-close"></i></button></div>
         <a class="search" href="search.html?theme=${THEME}" style="text-decoration:none"><i data-lucide="search"></i><span class="grow">Որոնել…</span><span class="kbd">⌘K</span></a>`
    h += '<div class="scroll">'
    NAV.forEach((g, gi) => {
      const folded = !rail && g.fold && !g.items.some(([id]) => id === active)
      if (rail) { if (gi) h += '<div class="sep"></div>' } else if (g.group) h += folded
        ? `<button class="group fold" aria-expanded="false">${g.group}<i data-lucide="chevron-right"></i></button>`
        : `<div class="group">${g.group}</div>`
      if (folded) return
      g.items.forEach(([id, icon, label, n, alarm]) => {
        h += `<a href="${href(id)}" class="${id === active ? 'on' : ''}" ${rail ? `aria-label="${label}" title="${label}"` : ''}><i data-lucide="${icon}"></i>${rail ? '' : `<span>${label}</span>`}${n ? `<span class="n${alarm ? ' alarm' : ''} num"${alarm ? ` aria-label="${n} սպասում է"` : ''}>${n}</span>` : ''}</a>`
      })
    })
    h += '</div>'
    h += rail
      ? `<div class="me" style="border:0;padding:6px 0 0;justify-content:center"><span class="av" aria-label="Անի Դավթյան">ԱԴ</span></div>`
      : `<div class="me"><span class="av">ԱԴ</span><span class="who"><b>Անի Դավթյան</b><span>Դիսպետչեր</span></span><button class="btn ghost icon s" aria-label="Դուրս գալ"><i data-lucide="log-out"></i></button></div>`
    nav.innerHTML = h
    screen.prepend(nav)

    /* Live cluster: present on every page, so a problem is visible from admin screens too (§9.2). */
    const live = document.querySelector('.bar .live')
    if (live) live.insertAdjacentHTML('beforeend', `
      <a class="pill bad" href="dispatch.html?theme=${THEME}" style="text-decoration:none" aria-label="2 խնդիր հերթում"><i data-lucide="circle-alert"></i><span class="num">2</span> խնդիր</a>
      <span class="pill ok" title="Կապը կենդանի է"><i class="d"></i>Կապ կա</span>
      <span class="row-flex" style="gap:0" aria-label="Աշխատում են՝ 3 դիսպետչեր">
        <span class="av" style="width:24px;height:24px;font-size:11px">ԱԴ</span><span class="av" style="width:24px;height:24px;font-size:11px;margin-left:-6px">ՄՀ</span><span class="av" style="width:24px;height:24px;font-size:11px;margin-left:-6px">ՍԱ</span>
      </span>
      <button class="btn ghost icon" aria-label="Ձայնը միացված է"><i data-lucide="volume-2"></i></button>
      <button class="btn ghost s" aria-label="Լեզու">ՀՅ</button>
      <a class="btn ghost icon" href="?theme=${THEME === 'dark' ? 'light' : 'dark'}" aria-label="Թեմա"><i data-lucide="${THEME === 'dark' ? 'sun' : 'moon'}"></i></a>`)

    /* Review chrome (C1): no floating switcher over product content. The index link docks in the top bar beside the
       real theme toggle, which already switches ?theme=. */
    if (live) live.insertAdjacentHTML('afterbegin', `<a class="btn ghost s mocklink" href="index.html?theme=${THEME}" title="Բոլոր էջերը">Ինդեքս</a>`)
    if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  }
  window.icons = () => window.lucide && lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })

  /* ── Fleet (invented but plausible; plates NN LL NNN; phones 0XX XX-XX-XX). Արամ Պետրոսյան, 01 ET 001 = ECO.RIDE.driver:
     free at 9:41, being offered the walkthrough ride. ── */
  window.DRIVERS = [
    ['Արամ Պետրոսյան', 'ԱՊ', '093 44-55-66', '01 ET 001', 'city', 'free', [40.1836, 44.5091]],
    ['Սուրեն Մկրտչյան', 'ՍՄ', '094 12-40-77', '22 OU 447', 'city', 'free', [40.1868, 44.5148]],
    ['Լիլիթ Մանուկյան', 'ԼՄ', '077 18-30-22', '18 OL 220', 'kids', 'free', [40.1772, 44.5040]],
    ['Գագիկ Ավետիսյան', 'ԳԱ', '055 20-44-19', '34 LS 108', 'partner', 'ride', [40.1925, 44.5021]],
    ['Նարեկ Հովհաննիսյան', 'ՆՀ', '098 23-55-90', '07 AB 913', 'business', 'free', [40.1745, 44.5212]],
    ['Վահե Սարգսյան', 'ՎՍ', '091 77-31-08', '55 SM 620', 'city', 'off' /* ECO.DOCS.blocked: orders stopped, insurance expired 05.10 */, [40.1702, 44.4988]],
    ['Արմեն Գրիգորյան', 'ԱԳ', '099 11-22-33', '35 OS 512', 'van', 'ride', [40.1960, 44.4935]],
    ['Տիգրան Աբրահամյան', 'ՏԱ', '093 60-12-48', '12 TT 304', 'city', 'ride', [40.1810, 44.5265]],
    ['Կարեն Մելքոնյան', 'ԿՄ', '077 50-12-12', '44 KM 771', 'partner', 'free', [40.1890, 44.5190]],
    ['Դավիթ Կարապետյան', 'ԴԿ', '041 33-90-15', '09 DK 118', 'vip', 'ride', [40.1760, 44.5130]],
    ['Հայկ Սահակյան', 'ՀՍ', '096 48-71-02', '61 HS 450', 'city', 'lost', [40.2010, 44.5080]],
    ['Էդգար Պողոսյան', 'ԷՊ', '095 14-28-63', '27 EP 336', 'city', 'free', [40.1700, 44.5170]],
  ].map(([name, ini, phone, plate, tier, state, ll], i) => ({ name, ini, phone, plate, tier, state, ll,
    /* Owner, 2026-10-11: fleet drivers drive our cars; partners own one car each and keep a prepaid balance.
       Owner 2026-10-14 (#3): fleet drivers have NO balance — wallet is set for partners only. */
    type: [3, 4, 8, 9, 11].includes(i) ? 'partner' : 'fleet',
    wallet: { 3: 18400, 4: 2600, 8: -1200, 9: 41000, 11: 7300 }[i] }))
  window.DTYPE = { fleet: ['Ավտոպարկի', 'Ավտոպարկի վարորդ', 'car'], partner: ['Գործընկեր', 'Գործընկեր', 'handshake'] }
  /* ── Partners (owner 2026-10-11): own car, prepaid wallet, blocked below 0, warned below ~1 day of fees (3 000 ֏).
     code = «Վճարման կոդ», the API's driver.paymentReference: six digits, zero-padded (ECO.PARTNER.ref). car: [tier render, model, plate, approval]. ── */
  window.WARN_BELOW = ECO.PARTNER.warnBelow /* one threshold, shared with the partner app (review X4) */
  window.PARTNERS = [
    ['Գագիկ Ավետիսյան', 'ԳԱ', '055 20-44-19', '000034', 18400, 'ride', ['partner', 'Tesla Model 3 · 2022 · սպիտակ', '34 LS 108', 'approved'], 'ok'],
    ['Նարեկ Հովհաննիսյան', 'ՆՀ', '098 23-55-90', '000035', 2600, 'free', ['business', 'VW ID.4 · 2023 · սպիտակ', '07 AB 913', 'approved'], 'ok'],
    ['Կարեն Մելքոնյան', 'ԿՄ', '077 50-12-12', '000041', -1200, 'off', ['partner', 'Tesla Model 3 · 2021 · սպիտակ', '44 KM 771', 'approved'], 'warn'],
    ['Դավիթ Կարապետյան', 'ԴԿ', '041 33-90-15', '000042', 41000, 'ride', ['vip', 'VW ID.6 · 2024 · սպիտակ', '09 DK 118', 'approved'], 'ok'],
    ['Էդգար Պողոսյան', 'ԷՊ', '095 14-28-63', '000043', 7300, 'free', ['city', 'VW ID.3 · 2022 · սպիտակ', '27 EP 336', 'approved'], 'ok'],
    ['Մարինե Գևորգյան', 'ՄԳ', '093 71-40-05', '000047', 950, 'free', ['city', 'VW ID.3 · 2021 · արծաթ', '16 MG 205', 'approved'], 'ok'],
    ['Արթուր Սիմոնյան', 'ԱՍ', '094 88-12-30', '000048', 12800, 'away', ['business', 'VW ID.4 · 2022 · սև', '88 AS 012', 'approved'], 'ok'],
    ['Լևոն Թադևոսյան', 'ԼԹ', '099 05-61-77', '000050', 0, 'off', ['van', 'Mercedes V · 2020 · սև', '50 LT 650', 'pending'], 'ok'],
    ['Սամվել Հարությունյան', 'ՍՀ', '077 33-08-91', '000051', 5400, 'off', ['partner', 'Tesla Model Y · 2023 · մոխրագույն', '11 SH 511', 'pending'], 'warn'],
    ['Գոռ Մարտիրոսյան', 'ԳՄ', '096 20-17-44', '000052', 21900, 'free', ['partner', 'Tesla Model 3 · 2023 · կապույտ', '42 GM 420', 'approved'], 'ok'],
    ['Անահիտ Վարդանյան', 'ԱՎ', '091 64-93-12', '000053', -3400, 'off', ['kids', 'VW ID.3 · 2022 · սպիտակ', '31 AV 310', 'suspended'], 'bad'],
    ['Ռաֆայել Ղուկասյան', 'ՌՂ', '055 47-02-86', '000054', 0, 'off', ['business', 'Skoda Enyaq · 2024 · կանաչ', '73 RG 730', 'pending'], 'ok'],
  ].map(([name, ini, phone, code, bal, state, [tier, model, plate, appr], docs]) => ({ name, ini, phone, code, bal, state, tier, model, plate, appr, docs }))
  window.APPR = { approved: ['ok', 'Հաստատված', 'badge-check'], pending: ['warn', 'Սպասում է', 'clock'], rejected: ['bad', 'Մերժված', 'x'], suspended: ['warn', 'Կասեցված', 'pause'] /* a domain state, amber like blocked (X5) */ }
  /* Blocked is amber + lock on every surface (X5): a domain refusal, not a failure. */
  /* Owner #3: the thresholds are the partner's tariff's (ECO.PARTNER.rules); console id 'partner' = kit id 'comfort'. */
  window.tierRules = (id) => (ECO.PARTNER.rules || {})[id === 'partner' ? 'comfort' : id] || { warnBelow: WARN_BELOW, blockBelow: ECO.PARTNER.blockBelow }
  window.tierPre = (id) => ((ECO.TIERS || []).find((x) => x.id === (id === 'partner' ? 'comfort' : id)) || { preorders: true }).preorders
  window.balTone = (b, tier) => { const r = tierRules(tier || 'comfort'); return b < r.blockBelow ? ['warn', 'Կանգնած', 'lock'] : b < r.warnBelow ? ['warn', 'Ցածր', 'triangle-alert'] : null }
  /* Balance cell: amount + marker. Low/blocked carry an icon and a word, never colour alone. */
  window.balCell = (b, tier) => {
    const t = balTone(b, tier), txt = amd(b)
    return t ? `<span class="pill ${t[0]} bal"><i data-lucide="${t[2]}"></i><span class="mono">${txt}</span></span>` : `<span class="mono">${txt}</span>`
  }
  window.DSTATE = {
    free: ['ok', 'Ազատ'], ride: ['', 'Պատվերով'], away: ['warn', 'Բացակա'], lost: ['bad', 'Կապ չկա'], off: ['', 'Անցանց'],
  }
})()
