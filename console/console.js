/* Console v2 mock plumbing: shell (nav + live cluster), fleet data, small helpers.
   Map, carTop and theme-from-?theme= come from ../kit.js (loaded first). */
(function () {
  const A = '../assets/eco/'
  window.ASSET = A

  /* ── Eco tiers, verbatim and in sort order (apps v2 NOTES §Tariffs). fixed_upfront, rounded to 100 ֏. ── */
  window.TIERS = [
    { id: 'city', name: 'Eco City', car: 'ID.3', seats: 4, base: 600, km: 90, min: 12, floor: 700, cls: 'Էկոնոմ', blurb: 'Մինչև 4 ուղևոր', pic: 'uploaded' },
    { id: 'partner', name: 'Eco Partner', car: 'Model 3', seats: 4, base: 700, km: 110, min: 14, floor: 900, cls: 'Կոմֆորտ', blurb: 'Tesla Model 3', pic: 'uploaded' },
    { id: 'kids', name: 'Eco Kids', car: 'ID.3 + մանկական նստոց', seats: 3, base: 900, km: 130, min: 18, floor: 1200, cls: 'Մանկական', blurb: 'Մանկական նստոցով', pic: 'uploaded' },
    { id: 'business', name: 'Eco Business', car: 'ID.4', seats: 4, base: 1000, km: 150, min: 20, floor: 1400, cls: 'Բիզնես', blurb: 'Ընդարձակ սրահ', pic: 'icon' },
    { id: 'van', name: 'Eco Van', car: 'MPV', seats: 7, base: 1200, km: 170, min: 22, floor: 1600, cls: 'Միկրոավտոբուս', blurb: 'Մինչև 7 ուղևոր', pic: 'uploading' },
    { id: 'vip', name: 'Eco Vip', car: 'ID.6', seats: 4, base: 1500, km: 220, min: 30, floor: 2000, cls: 'VIP', blurb: 'Պրեմիում սպասարկում', pic: 'refused' },
  ]
  window.fare = (t, km, mn) => Math.max(t.floor, Math.round((t.base + t.km * km + t.min * mn) / 100) * 100)
  window.nf = (n) => n.toLocaleString('en-US').replace(/,/g, '\u202F')
  window.amd = (n) => n.toLocaleString('en-US').replace(/,/g, ' ') + ' ֏'
  window.carImg = (id, alt) => `<img src="${A}cars/${id}.webp" alt="${alt || ''}" decoding="async">`
  window.tierById = (id) => TIERS.find((t) => t.id === id)

  /* ── Navigation (strings from lib/i18n.ts hy). "Պատվերներ" is the one new route (rides list). ── */
  /* IA follows docs/superpowers/design/2026-10-11-console-gaps.md §3: Requests inbox, Money group, Rider app group.
     Items marked * in NOTES are gap screens not designed in this phase. */
  const NAV = [
    { items: [['overview', 'layout-dashboard', 'Ընդհանուր'], ['dispatch', 'activity', 'Դիսպետչեր', '2', true], ['rides', 'list', 'Պատվերներ'], ['requests', 'inbox', 'Հարցումներ', '4', true]] },
    { group: 'Ավտոպարկ', items: [['drivers', 'users', 'Վարորդներ', '42'], ['vehicles', 'car', 'Մեքենաներ', '40'], ['tariffs', 'tag', 'Սակագներ'], ['zones', 'map', 'Գոտիներ']] },
    { group: 'Ֆինանսներ', items: [['settlement', 'wallet', 'Վարորդների հաշիվներ'], ['billing', 'receipt', 'Վճարային պլաններ'], ['customers', 'user-check', 'Հաճախորդներ'], ['companies', 'building-2', 'Կազմակերպություններ'], ['fiscal', 'scroll-text', 'Ֆիսկալ հերթ'], ['reports', 'chart-column', 'Հաշվետվություններ']] },
    { group: 'Ուղևորի հավելված', items: [['promotions', 'megaphone', 'Ակցիաներ'], ['partners', 'handshake', 'Գործընկերներ'], ['apptexts', 'smartphone', 'Տեքստեր և կապ']] },
    { group: 'Կառավարում', items: [['operators', 'user-cog', 'Օպերատորներ'], ['integrations', 'plug', 'Ինտեգրումներ'], ['audit', 'history', 'Աուդիտ'], ['settings', 'settings', 'Կարգավորումներ']] },
  ]
  const href = (id) => (['overview', 'dispatch', 'rides', 'drivers', 'tariffs'].includes(id) ? `${id}.html?theme=${THEME}` : '#')

  window.shell = function (active) {
    const screen = document.getElementById('screen')
    const rail = screen.classList.contains('rail')
    const nav = document.createElement('nav')
    nav.className = 'nav'
    nav.setAttribute('aria-label', 'Բաժիններ')
    let h = rail
      ? `<div class="brand" style="padding:0;margin-bottom:8px"><img class="mark" src="${A}mark.png" alt="Eco Taxi"></div>`
      : `<div class="brand"><img class="wide" src="${A}logo-wide.png" alt="Eco Taxi"><button class="btn ghost icon s" aria-label="Փակել վահանակը"><i data-lucide="panel-left-close"></i></button></div>
         <div class="search"><i data-lucide="search"></i><span class="grow">Որոնել…</span><span class="kbd">⌘K</span></div>`
    h += '<div class="scroll">'
    NAV.forEach((g, gi) => {
      if (rail) { if (gi) h += '<div class="sep"></div>' } else if (g.group) h += `<div class="group">${g.group}</div>`
      g.items.forEach(([id, icon, label, n, alarm]) => {
        h += `<a href="${href(id)}" class="${id === active ? 'on' : ''}" ${rail ? `aria-label="${label}" title="${label}"` : ''}><i data-lucide="${icon}"></i>${rail ? '' : `<span>${label}</span>`}${n ? `<span class="n${alarm ? ' alarm' : ''} num"${alarm ? ` aria-label="${n} խնդիր"` : ''}>${n}</span>` : ''}</a>`
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
      <span class="pill ok" title="WebSocket միացված է"><i class="d"></i>Ուղիղ</span>
      <span class="row-flex" style="gap:0" aria-label="Աշխատում են՝ 3 դիսպետչեր">
        <span class="av" style="width:24px;height:24px;font-size:11px">ԱԴ</span><span class="av" style="width:24px;height:24px;font-size:11px;margin-left:-6px">ՄՀ</span><span class="av" style="width:24px;height:24px;font-size:11px;margin-left:-6px">ՍԱ</span>
      </span>
      <button class="btn ghost icon" aria-label="Ձայներ՝ միացված (յուրաքանչյուր իրադարձություն առանձին)"><i data-lucide="volume-2"></i></button>
      <button class="btn ghost s" aria-label="Լեզու">Հայ</button>
      <a class="btn ghost icon" href="?theme=${THEME === 'dark' ? 'light' : 'dark'}" aria-label="Թեմա"><i data-lucide="${THEME === 'dark' ? 'sun' : 'moon'}"></i></a>`)

    /* Mock-only switcher, outside .screen so audits ignore it. */
    const mb = document.createElement('div')
    mb.className = 'mockbar'
    mb.innerHTML = `<a href="index.html">Ինդեքս</a><a class="${THEME === 'light' ? 'on' : ''}" href="?theme=light">Light</a><a class="${THEME === 'dark' ? 'on' : ''}" href="?theme=dark">Dark</a>`
    document.body.appendChild(mb)
    if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  }
  window.icons = () => window.lucide && lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })

  /* ── Fleet (invented but plausible; plates NN LL NNN; phones 0XX XX-XX-XX) ── */
  window.DRIVERS = [
    ['Արամ Պետրոսյան', 'ԱՊ', '093 44-55-66', '01 ET 001', 'city', 'ride', [40.1836, 44.5091]],
    ['Սուրեն Մկրտչյան', 'ՍՄ', '094 12-40-77', '22 OU 447', 'city', 'free', [40.1868, 44.5148]],
    ['Լիլիթ Մանուկյան', 'ԼՄ', '077 18-30-22', '18 OL 220', 'kids', 'free', [40.1772, 44.5040]],
    ['Գագիկ Ավետիսյան', 'ԳԱ', '055 20-44-19', '34 LS 108', 'partner', 'ride', [40.1925, 44.5021]],
    ['Նարեկ Հովհաննիսյան', 'ՆՀ', '098 23-55-90', '07 AB 913', 'business', 'free', [40.1745, 44.5212]],
    ['Վահե Սարգսյան', 'ՎՍ', '091 77-31-08', '55 SM 620', 'city', 'away', [40.1702, 44.4988]],
    ['Արմեն Գրիգորյան', 'ԱԳ', '099 11-22-33', '35 OS 512', 'van', 'ride', [40.1960, 44.4935]],
    ['Տիգրան Աբրահամյան', 'ՏԱ', '093 60-12-48', '12 TT 304', 'city', 'free', [40.1810, 44.5265]],
    ['Կարեն Մելքոնյան', 'ԿՄ', '077 50-12-12', '44 KM 771', 'partner', 'free', [40.1890, 44.5190]],
    ['Դավիթ Կարապետյան', 'ԴԿ', '041 33-90-15', '09 DK 118', 'vip', 'ride', [40.1760, 44.5130]],
    ['Հայկ Սահակյան', 'ՀՍ', '096 48-71-02', '61 HS 450', 'city', 'lost', [40.2010, 44.5080]],
    ['Էդգար Պողոսյան', 'ԷՊ', '095 14-28-63', '27 EP 336', 'city', 'free', [40.1700, 44.5170]],
  ].map(([name, ini, phone, plate, tier, state, ll], i) => ({ name, ini, phone, plate, tier, state, ll,
    /* Owner, 2026-10-11: fleet drivers drive our cars; partner drivers own theirs and keep a prepaid wallet. */
    type: [3, 4, 8, 9, 11].includes(i) ? 'partner' : 'fleet',
    wallet: { 3: 18400, 4: 2600, 8: -1200, 9: 41000, 11: 7300 }[i] }))
  window.DTYPE = { fleet: ['Պարկի', 'Պարկի վարորդ', 'car'], partner: ['Գործընկեր', 'Գործընկեր վարորդ', 'handshake'] }
  window.DSTATE = {
    free: ['ok', 'Ազատ'], ride: ['', 'Պատվերով'], away: ['warn', 'Դադարի մեջ'], lost: ['bad', 'Լռում է'], off: ['', 'Անջատված'],
  }
})()
