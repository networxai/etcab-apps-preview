/* drivers.html detail tabs and actions (coverage C29, C30). Loaded after the page script; re-renders the docked panel.
   ?tab=rides | shifts | docs | rating | payouts (C29; payouts = Idram via ETAPI, owner 2026-10-15) — Rides, Shifts and Rating are drawn ahead. `money` is kept as an alias of
   `shifts`: owner #3 (2026-10-14) — a fleet driver has no balance, so the real driver-money.tsx / driver-ledger.tsx /
   record-payment.tsx / driver-payout.tsx (fleet settlement) are to be removed, not drawn.
   ?action=create | code | offline | shift | deletion   (C30) — use with &d=N to pick the driver the action is about
   Real: fleet-drivers.tsx (create), driver-login-code.tsx, driver-end-shift.tsx / fleet.forceOfflineWarning, driver-account.tsx,
   driver-documents.tsx.
   Strings: lib/i18n.ts + money-i18n.ts hy. Dangerous actions are ArmButtons (two presses, visible), never a dialog. */
(function () {
  const QS = new URLSearchParams(location.search)
  const TAB = QS.get('tab') === 'money' ? 'shifts' : QS.get('tab'), ACT = QS.get('action')
  if (!TAB && !ACT) return
  document.head.insertAdjacentHTML('beforeend', `<style>
    .cm { display: grid; grid-template-columns: 52px minmax(0, 1fr); column-gap: 10px; row-gap: 4px; padding: 10px 0; border-bottom: 1px solid var(--line-soft); }
    .cm:last-child { border-bottom: 0; }
    .cm time { grid-row: 1 / 3; font: 500 14px/20px var(--mono); display: flex; flex-direction: column; }
    .cm time small { font: 400 12px/16px var(--font); color: var(--ink-faint); }
    .cm .a { font: var(--c-strong); min-width: 0; overflow-wrap: anywhere; }
    .cm .m { font: var(--c-small); color: var(--ink-muted); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .cm .b { grid-column: 2; display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
    .lt { width: 100%; border-collapse: collapse; font: var(--c-body); table-layout: fixed; margin-top: 6px; }
    .lt td, .lt th { padding: 6px 0; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
    .lt th { font: var(--c-label); color: var(--ink-faint); text-align: left; }
    .lt .n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .lt td small { display: block; font: var(--c-small); color: var(--ink-faint); }
    .lt col.w { width: 52px; } .lt col.a { width: 92px; }
    .frm { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
    .frm .two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .frm .btns { display: flex; gap: 6px; justify-content: flex-end; }
    .xblk { margin: 12px var(--inset) 0; border-radius: var(--r-card); background: var(--surface); padding: 12px; box-shadow: inset 0 0 0 1px var(--line-soft), inset 3px 0 0 var(--ink); }
    .xblk h3 { font: var(--c-head); display: flex; align-items: center; gap: 6px; }
    .xblk h3 svg { width: 16px; height: 16px; }
    .xblk p { font: var(--c-body); color: var(--ink-muted); margin-top: 4px; }
    .lt col.r { width: 56px; } .lt col.c { width: 72px; }
    @media (max-width: 1400px) { .newrow { grid-template-columns: 140px minmax(0, 1fr) 96px 104px auto !important; } .lt col.a { width: 76px; } .lt col.c { width: 64px; } .lt col.r { width: 54px; } }
    .sum { display: flex; align-items: baseline; gap: 8px; margin-top: 4px; white-space: nowrap; }
    .sum b { font: var(--c-kpi); font-variant-numeric: tabular-nums; } .sum span { font: var(--c-small); color: var(--ink-faint); }
    .code { font: 600 32px/40px var(--mono); letter-spacing: .08em; margin: 8px 0 4px; }
    .armed { background: var(--danger-c) !important; color: var(--danger-ink) !important; }
    .opts2 > div { display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; gap: 10px; align-items: center; min-height: 44px; padding: 4px 8px; border-radius: 6px; }
    .opts2 > div.on { background: var(--surface-alt); box-shadow: inset 0 0 0 1px var(--line-strong); }
    .opts2 > div.held { color: var(--ink-muted); }
    .opts2 .s { font: var(--c-small); color: var(--ink-faint); }
    .bars { display: grid; grid-template-columns: 24px minmax(0, 1fr) 32px; gap: 4px 8px; align-items: center; font: var(--c-small); color: var(--ink-muted); margin-top: 8px; }
    .bars i { display: block; height: 6px; border-radius: 3px; background: var(--ink); }
    .bars span:last-child { text-align: right; }
    .rf { display: flex; gap: 4px; flex-wrap: wrap; margin: 12px var(--inset) 0; }
    .rf .chip { text-decoration: none; padding: 0 9px; } .rf .chip svg { width: 14px; height: 14px; color: inherit; }
    .rcu { display: grid; grid-template-columns: minmax(0, 1fr) 10px minmax(0, 1fr) auto; gap: 6px; align-items: end; margin: 8px var(--inset) 0; padding: 8px; border-radius: var(--r-card); background: var(--surface-alt); }
    .rcu label { display: flex; flex-direction: column; gap: 3px; font: var(--c-label); color: var(--ink-muted); min-width: 0; }
    .rcu .dash { text-align: center; color: var(--ink-faint); height: var(--h-m); line-height: var(--h-m); }
    .rcu .input input { all: unset; width: 100%; min-width: 0; font: 400 13px/18px var(--mono); color: var(--ink); }
    .rcu .input:focus-within { box-shadow: inset 0 0 0 1px var(--focus-ring), 0 0 0 3px var(--brand-soft); }
    .rcu .ferr { grid-column: 1 / -1; display: flex; gap: 6px; align-items: center; font: var(--c-small); color: var(--danger-c); } .rcu .ferr svg { width: 14px; height: 14px; }
    .rcu .btn:disabled { opacity: .5; }
    .tot4 { display: grid; grid-template-columns: repeat(4, auto); justify-content: space-between; gap: 6px; margin-top: 8px; }
    .tot4 > div { display: flex; flex-direction: column; min-width: 0; }
    .tot4 b { font: 600 16px/24px var(--mono); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .tot4 span { font: var(--c-small); color: var(--ink-muted); white-space: nowrap; } .tot4 small { font: var(--c-small); color: var(--ink-faint); white-space: nowrap; }
    .sk { display: block; height: 14px; width: 56px; margin: 5px 0; border-radius: 4px; background: var(--surface-3); animation: skp 1.4s ease-in-out infinite; }
    @keyframes skp { 50% { opacity: .5; } } @media (prefers-reduced-motion: reduce) { .sk { animation: none; } }
    .skrow { display: grid; grid-template-columns: 52px minmax(0, 1fr) 80px; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line-soft); } .skrow .sk { width: 100%; margin: 3px 0; }
    .lt tr.dh th { padding-top: 12px; font: var(--c-label); color: var(--ink-muted); } .lt tr.dh th span { float: right; color: var(--ink-faint); }
    .more { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 8px; font: var(--c-small); }
    .blk.empty { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; padding: 20px 12px; } .blk.empty svg { width: 24px; height: 24px; color: var(--ink-faint); }
    .blk.empty b { font: var(--c-head); } .blk.empty span { font: var(--c-small); color: var(--ink-muted); margin-bottom: 6px; }
    .newrow { display: grid; grid-template-columns: 150px minmax(0, 1fr) 112px 120px auto; gap: 8px; align-items: end; padding: 10px var(--inset); border-bottom: 1px solid var(--line-soft); background: var(--surface-alt); }
    .newrow .lbl { font: var(--c-label); color: var(--ink-muted); margin-bottom: 4px; display: block; }
  </style>`)
  const dp = document.getElementById('dp')
  const tabs = dp.querySelector('.tabsl')
  const B = ECO.BOOKINGS
  const setTab = (i) => tabs.querySelectorAll('button').forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i) })
  const clearBelow = () => { let n = tabs.nextElementSibling; while (n) { const x = n.nextElementSibling; n.remove(); n = x } }
  const add = (html) => tabs.parentElement.insertAdjacentHTML('beforeend', html)
  const afterActs = (html) => dp.querySelector('.acts').insertAdjacentHTML('afterend', html)
  const arm = (label, armed, note) => `<button class="btn danger s armed" aria-label="${label}">${armed}</button>${note ? `<span class="faint" style="font:var(--c-small)">${note}</span>` : ''}`

  /* ── Period filter (owner 2026-10-16): the Rides and Shifts tabs share one bar — quick chips and, for «Ընտրել օրերը»,
     a from–to row inline (never a modal) — and the totals above the list follow the chosen period. ?r= today | yest | 7 | 30 |
     custom (12.10–14.10) | empty (a period with nothing in it) | bad (from after to) | load | err. Rides default to today,
     Shifts to 7 days. Totals of the two tabs agree for the same period (35 rides · 51 600 ֏ for 12.10–14.10). ── */
  const R = QS.get('r') || (TAB === 'shifts' ? '7' : 'today')
  const RNG = { today: ['Այսօր', '16.10'], yest: ['Երեկ', '15.10'], 7: ['Վերջին 7 օր', '10.10–16.10'], 30: ['Վերջին 30 օր', '17.09–16.10'], custom: ['Ընտրված օրեր', '12.10–14.10'], empty: ['Ընտրված օրեր', '02.10–04.10'], bad: ['Վերջին 7 օր', '10.10–16.10'], load: ['Ընտրված օրեր', '12.10–14.10'], err: ['Ընտրված օրեր', '12.10–14.10'] }
  const isCustom = ['custom', 'empty', 'bad', 'load', 'err'].includes(R)
  const rhref = (v) => { const u = new URLSearchParams(location.search); if (v) u.set('r', v); else u.delete('r'); return '?' + u }
  const filterBar = () => {
    const chip = (v, l) => `<a class="chip${R === v || (v === 'custom' && isCustom) ? ' on' : ''}" href="${rhref(v)}"${R === v || (v === 'custom' && isCustom) ? ' aria-current="true"' : ''}>${v === 'custom' ? '<i data-lucide="calendar-range"></i>' : ''}${l}</a>`
    const [a, b] = R === 'empty' ? ['02.10.2026', '04.10.2026'] : R === 'bad' ? ['14.10.2026', '12.10.2026'] : ['12.10.2026', '14.10.2026']
    return `<nav class="rf" aria-label="Ժամանակահատված">${chip('today', 'Այսօր')}${chip('yest', 'Երեկ')}${chip('7', '7 օր')}${chip('30', '30 օր')}${chip('custom', 'Ընտրել օրերը')}</nav>
      ${isCustom ? `<form class="rcu" onsubmit="return false" aria-label="Օրերի միջակայք">
        <label>Սկսած<span class="input${R === 'bad' ? ' err' : ''}"><input class="mono" inputmode="numeric" value="${a}" aria-invalid="${R === 'bad'}" aria-describedby="${R === 'bad' ? 'rerr' : ''}"></span></label><span class="dash" aria-hidden="true">–</span>
        <label>Մինչև<span class="input"><input class="mono" inputmode="numeric" value="${b}"></span></label><button class="btn primary s"${R === 'bad' ? ' disabled' : ''}>Կիրառել</button>
        ${R === 'bad' ? '<span id="rerr" class="ferr" role="status"><i data-lucide="circle-alert"></i>Սկիզբը չի կարող լինել ավարտից հետո</span>' : ''}</form>` : ''}`
  }
  /* totals: rides [count, amount, cash, cancelled]; shifts [count, hours, rides, amount, cash] */
  const TR = { today: [9, 14820, 6200, 0], yest: [14, 21300, 9800, 1], 7: [58, 87720, 39700, 3], 30: [241, 362400, 158900, 11], custom: [35, 51600, 23700, 2], empty: [0, 0, 0, 0] }
  const TS = { today: [1, '6 ժ 14 ր', 9, 14820, 6200], yest: [1, '9 ժ 45 ր', 14, 21300, 9800], 7: [5, '40 ժ 54 ր', 58, 87720, 39700], 30: [21, '168 ժ 30 ր', 241, 362400, 158900], custom: [3, '24 ժ 55 ր', 35, 51600, 23700], empty: [0, '—', 0, 0, 0] }
  const dataKey = ['load', 'err'].includes(R) ? null : R === 'bad' ? '7' : R
  const stat = (v, l, sub) => `<div><b class="mono">${v}</b><span>${l}</span>${sub ? `<small class="mono">${sub}</small>` : ''}</div>`
  const totals = (icon, cells) => `<div class="blk"><h3><i data-lucide="${icon}"></i>${RNG[R][0]}<span class="end faint mono" style="font-weight:400">${RNG[R][1]}</span></h3>
    <div class="tot4" aria-live="polite" aria-busy="${R === 'load'}">${dataKey === null ? cells.map(([, l]) => `<div><b class="sk" aria-hidden="true"></b><span>${l}</span></div>`).join('') : cells.map(([v, l, s]) => stat(v, l, s)).join('')}</div></div>`
  const stateBlock = (title) => R === 'load' ? `<div class="blk" style="margin-bottom:12px" role="status" aria-label="Բեռնվում է"><h3><i data-lucide="list"></i>${title}</h3>${[0, 1, 2, 3].map(() => '<div class="skrow"><i class="sk"></i><i class="sk"></i><i class="sk"></i></div>').join('')}</div>`
    : R === 'err' ? `<div style="margin:12px var(--inset)"><div class="notice red" role="alert"><i data-lucide="circle-alert"></i><span><b>Չհաջողվեց բեռնել</b><br>Կապը կտրվեց։ Ցանկը չի թարմացվել։</span><button class="btn secondary s" style="margin-left:auto">Կրկին փորձել</button></div></div>`
    : R === 'empty' ? `<div class="blk empty" style="margin-bottom:12px"><i data-lucide="calendar-x"></i><b>Այս օրերին ${TAB === 'shifts' ? 'հերթափոխ' : 'պատվեր'} չկա</b><span>Վարորդը ${TAB === 'shifts' ? 'չի աշխատել' : 'պատվեր չի կատարել'} 02.10–04.10 ընթացքում</span><a class="btn secondary s" href="${rhref('7')}">Ցույց տալ 7 օրը</a></div>` : ''
  const MORE = (shown, all) => `<div class="more"><span class="faint num">Ցուցադրված է ${shown} / ${all}</span>${all > shown ? `<button class="btn secondary s">Ցուցադրել ևս ${Math.min(all - shown, 20)}</button>` : ''}</div>`
  const POOL = [['Կոմիտասի պող. 22 → Մաշտոցի պող. 37', 1200], ['Արաբկիր 14 → Սասունցի Դավիթ հ.', 1600], ['Հանրապետության հրապ. → Զվարթնոց', 4500], ['Նալբանդյան 51 → Կասկադ', 900], ['Աբովյան 8 → Ավան, Բաբաջանյան 12', 1900], ['Գ. Նժդեհ 33 → Երևան Մոլ', 1400]]
  const rideRows = (n, id0, t0, cx) => Array.from({ length: n }, (_, i) => { const [r, f] = POOL[(i + id0) % 6], m = t0 - i * 47, t = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    return `<tr><td class="mono">${t}</td><td>${r}<small class="mono">#R-${20400 - id0 - i}${cx === i ? ' · չեղարկված' : ''}</small></td><td class="n mono">${cx === i ? '<span class="pill" style="height:20px">Չեղարկված</span>' : amd(f)}</td></tr>` }).join('')
  const dayHead = (l, c) => `<tr class="dh"><th colspan="3">${l}<span class="mono">${c}</span></th></tr>`
  const ridesTbl = (inner) => `<table class="lt"><colgroup><col class="w"><col><col class="a"></colgroup><tbody>${inner}</tbody></table>`

  /* ── C29 Rides: commitments first (today only — they are not history), then the period's totals and rides. ── */
  if (TAB === 'rides') {
    setTab(1); clearBelow()
    const pre = R !== 'today' ? '' : `<div class="blk"><h3><i data-lucide="calendar-clock"></i>Նախնական պատվերներ<span class="end faint" style="font-weight:400">նշանակված են իրեն</span></h3>
      <div class="cm"><time><small>Այսօր</small>${B.kom.time}</time><span class="a">${B.kom.pickup} → ${B.kom.drop}</span>
        <span class="m"><span class="mono">${B.kom.phone}</span>·<span class="mono">#${B.kom.id}</span>·<span>նոր պատվերներ չեն գա ${B.kom.held}-ից</span></span>
        <span class="b"><button class="btn secondary s">Ազատել</button></span></div>
      <div class="cm"><time><small>Շբթ</small>${B.bag.time}</time><span class="a">${B.bag.pickup} → ${B.bag.drop}</span>
        <span class="m"><span class="mono">${B.bag.phone}</span>·<span class="mono">#${B.bag.id}</span><span>նոր պատվերներ չեն գա 09:00-ից</span></span>
        <span class="b"><button class="btn secondary s">Ազատել</button><button class="btn secondary s">Վերանշանակել <span class="kbd">A</span></button></span></div>
      <div class="cm"><time><small>Կիր</small>11:30</time><span class="a">Կոմիտասի պող. 49 → Էրեբունի օդանավակայան</span>
        <span class="m"><span class="mono">091 44-02-17</span>·<span class="mono">#B-0930</span>·<span>նոր պատվերներ չեն գա 11:00-ից</span></span>
        <span class="b"><button class="btn secondary s">Ազատել</button></span></div></div>`
    const t = TR[dataKey] || TR[7]
    const live = `<tr><td class="mono">${ECO.RIDE.assigned}</td><td>${ECO.RIDE.pickup + ' → ' + ECO.RIDE.drop}<small class="mono">#R-${ECO.RIDE.no} · ընթացքում</small></td><td class="n mono"><span class="pill l-active" style="color:var(--lane);height:20px"><i class="d"></i>${amd(ECO.RIDE.fare)}</span></td></tr>`
    const list = R === 'today' ? ridesTbl(live + rideRows(5, 0, 525)) + MORE(6, 9)
      : R === 'yest' ? ridesTbl(rideRows(6, 2, 1005, 3)) + MORE(6, 14)
      : ridesTbl(dayHead('Երեկ · 15.10', '14') + rideRows(3, 1, 1005) + dayHead('Չրք · 14.10', '12') + rideRows(3, 4, 995, 1) + dayHead('Երք · 13.10', '13') + rideRows(2, 0, 1090)) + MORE(8, t[0])
    add(`${filterBar()}${pre}${totals('list-checks', [[t[0], 'Պատվեր'], [amd(t[1]), 'Գին'], [amd(t[2]), 'Կանխիկ'], [t[3], 'Չեղարկված']])}
      ${stateBlock('Պատվերներ') || `<div class="blk" style="margin-bottom:12px"><h3><i data-lucide="list"></i>Պատվերներ<span class="end faint num" style="font-weight:400">նորագույնը վերևում</span></h3>${list}</div>`}`)
  }

  /* ── C29 Shifts (owner #3: no balance for a fleet driver). What the driver did, per shift: car, hours, rides, fares and
     the cash taken. Facts only — no owed, limit, settlement, adjustment or ledger. ── */
  if (TAB === 'shifts') {
    setTab(2); clearBelow()
    const S = [['Այսօր', '01 ET 001', '08:12–', '6 ժ 14 ր', 9, 14820, 6200, 1], ['Հնգ', '01 ET 001', '07:55–17:40', '9 ժ 45 ր', 14, 21300, 9800], ['Չրք', '01 ET 002', '08:05–16:30', '8 ժ 25 ր', 12, 17900, 7400],
      ['Երք', '01 ET 001', '12:00–21:10', '9 ժ 10 ր', 13, 19600, 11200], ['Երկ', '01 ET 001', '08:00–15:20', '7 ժ 20 ր', 10, 14100, 5100]]
    const dated = (r, d) => [d, ...r.slice(1, 7)]
    const more = Array.from({ length: 4 }, (_, i) => dated(['', i % 2 ? '01 ET 002' : '01 ET 001', '08:30–16:40', '8 ժ 10 ր', 11 - i, 15800 - i * 900, 6400 - i * 300], `${String(10 - i * 1).padStart(2, '0')}.10`)).map((r, i) => (i === 0 ? r : r))
    const rows = { today: [S[0]], yest: [S[1]], 7: S, custom: [S[4], S[3], S[2]].map((r, i) => dated(r, ['12.10', '13.10', '14.10'][i])).reverse(), 30: S.map((r, i) => dated(r, ['16.10', '15.10', '14.10', '13.10', '12.10'][i])).concat(more) }[dataKey] || []
    const t = TS[dataKey] || TS[7]
    const table = `<table class="lt"><colgroup><col class="w"><col><col class="r"><col class="a"><col class="c"></colgroup>
      <thead><tr><th>Օր</th><th>Մեքենա · ժամեր</th><th class="n">Պատվեր</th><th class="n">Գին</th><th class="n">Կանխիկ</th></tr></thead><tbody>
      ${rows.map(([d, pl, tm, h, r, f, c, live]) => `<tr><td${/\d/.test(d) ? ' class="mono"' : ''}>${d}</td><td><span class="plate" style="height:20px">${pl}</span><small class="mono" title="${tm}">${h}${live ? ' · հիմա' : ''}</small></td>
        <td class="n mono">${r}</td><td class="n mono">${amd(f)}</td><td class="n mono">${amd(c)}</td></tr>`).join('')}
      </tbody></table>${dataKey === '30' ? MORE(rows.length, t[0]) : ''}`
    add(`${filterBar()}${totals('calendar-range', [[t[0], 'Հերթափոխ'], [t[1], 'Ժամ'], [t[2], 'Պատվեր'], [amd(t[3]), 'Գին', 'կանխիկ ' + amd(t[4]).replace(/\s*֏/, '')]])}
      ${stateBlock('Հերթափոխեր') || `<div class="blk" style="margin-bottom:12px"><h3><i data-lucide="list"></i>Հերթափոխեր<span class="end faint" style="font-weight:400">հաշվեկշիռ չկա</span></h3>${table}</div>`}`)
  }

  /* ── C29 Documents (driver-documents.tsx): the list with expiry, the expired one flagged, and the add form open. ── */
  if (TAB === 'docs') {
    /* Owner #5: the page script opens this tab on Վահե (ECO.DOCS.blocked) — orders stopped on expired insurance, the new
       photo waiting on «Հաստատել». The add form below is the office uploading on a driver's behalf. */
    setTab(3)
    const blk = [...dp.querySelectorAll('.blk')].find((b) => b.querySelector('.docs'))
    const stop = dp.querySelector('.notice.amber')
    clearBelow(); if (stop) add(stop.parentElement.outerHTML); add(blk.outerHTML)
    const nb = dp.querySelector('.docs').closest('.blk')
    nb.querySelector('.dropz').outerHTML = `<form class="frm" onsubmit="return false" aria-label="Ավելացնել փաստաթուղթ"><div class="two"><div><label class="label">Տեսակ</label><div class="input focus"><span class="val">Բժշկական տեղեկանք</span><i data-lucide="chevron-down"></i></div></div>
      <div><label class="label">Ժամկետ</label><div class="input"><span class="val mono">01.10.2027</span></div></div></div>
      <div class="dropz"><i data-lucide="file-check"></i>medical-2026.pdf · 412 ԿԲ</div><div class="btns"><button class="btn ghost s">Չեղարկել</button><button class="btn primary s">Ավելացնել</button></div></form>`
    nb.style.marginBottom = '12px'
  }

  /* ── ?tab=payouts «Վճարումներ» (owner 2026-10-15, drawn ahead: no ETAPI yet). Every completed non-cash, non-company
     ride is filed through ETAPI, which pays the fare to the driver's Idram — fleet drivers too. One row per ride, the
     newest first; cash rides have no payout and company rides are never sent, so neither appears. NFC · POS rides
     pay out the fare alone (the 2 % fee is the company's) and only once the ride is matched in ACBA's statement (owner 2026-10-16):
     until then the row waits, with the reason under the method. Fleet drivers only; partners have no NFC. Status is icon + word: paid, sending. ── */
  if (TAB === 'payouts') {
    setTab(5); clearBelow(); tabs.scrollLeft = tabs.scrollWidth
    const PO = [['13:12', '#R-20395', 'credit-card', 'Քարտ', 1500, ['', 'loader', 'Ուղարկվում է']], ['12:40', '#R-20388', 'smartphone', 'Apple Pay', 2200, ['ok', 'check', 'Վճարված']],
      ['11:05', '#R-20354', 'smartphone-nfc', 'NFC · POS', 900, ['ok', 'check', 'Վճարված'], 'Կանխիկ → NFC · 9:51'], ['10:22', '#R-20341', 'smartphone', 'Google Pay', 1300, ['ok', 'check', 'Վճարված']], ['14:08', '#R-20399', 'smartphone-nfc', 'NFC · POS', 1700, ['', 'clock', 'Սպասում է'], 'Կանխիկ → NFC · 14:02</small><small>ACBA քաղվածքում չկա'],
      ['Հնգ', '#R-20217', 'smartphone-nfc', 'NFC · POS', 2600, ['ok', 'check', 'Վճարված']], ['Հնգ', '#R-20180', 'credit-card', 'Քարտ', 1100, ['ok', 'check', 'Վճարված']]]
    add(`<div class="blk"><h3><i data-lucide="wallet"></i>Idram · այս շաբաթ<span class="end faint mono" style="font-weight:400">0412 5581</span></h3>
      <div class="sum"><b>${amd(PO.filter((r) => r[5][0] === 'ok' || r[5][2] === 'Ուղարկվում է').reduce((a, r) => a + r[4], 0) + 30300)}</b><span class="num">24 անկանխիկ պատվեր</span></div></div>
    <div class="blk" style="margin-bottom:12px"><h3><i data-lucide="list"></i>Վճարումներ<span class="end faint" style="font-weight:400">ETAPI → Idram · եղանակը՝ վերջնականը</span></h3>
      <table class="lt"><colgroup><col class="w"><col><col style="width:80px"><col style="width:108px"></colgroup>
      <thead><tr><th>Երբ</th><th>Պատվեր</th><th class="n">Գումար</th><th class="n">Վիճակ</th></tr></thead><tbody>
      ${PO.map(([t, id, ic, m, a, [tone, sic, w], why]) => `<tr><td class="mono">${t}</td><td><span class="mono">${id}</span><small style="display:flex;align-items:center;gap:4px;white-space:nowrap"><i data-lucide="${ic}" style="width:12px;height:12px"></i>${m}</small>${why ? `<small>${why}</small>` : ''}</td>
        <td class="n mono">${amd(a)}</td><td class="n"><span class="pill ${tone}" style="height:20px"><i data-lucide="${sic}"></i>${w}</span></td></tr>`).join('')}
      </tbody></table></div>`)
  }

  /* ── C29 Rating (drawn ahead: no rating view in the console yet). ── */
  if (TAB === 'rating') {
    setTab(4); clearBelow()
    const bar = (s, n, w) => `<span class="mono">${s}★</span><span><i style="width:${w}%"></i></span><span class="mono">${n}</span>`
    add(`<div class="blk"><h3><i data-lucide="star"></i>Գնահատական<span class="end faint" style="font-weight:400">վերջին 30 օր · 212 պատվեր</span></h3>
      <div class="wallet"><div class="bal num">4,9 <small>/ 5 · 168 գնահատված</small></div></div>
      <div class="bars">${bar(5, 151, 90)}${bar(4, 12, 7)}${bar(3, 3, 2)}${bar(2, 1, 1)}${bar(1, 1, 1)}</div></div>
    <div class="blk" style="margin-bottom:12px"><h3><i data-lucide="message-square"></i>Մեկնաբանություններ</h3>
      <table class="lt"><colgroup><col class="w"><col><col class="a"></colgroup><tbody>
      ${[['Այսօր', '«Մաքուր մեքենա, ճշտապահ»', '#R-' + ECO.RIDE.no, 5], ['Երեկ', '«Շատ արագ էր վարում»', '#R-20188 · դիտված է՝ Մարիամ Հ.', 2], ['Երք.', '«Օգնեց ճամպրուկով»', '#R-20011', 5]]
        .map(([t, c, s, n]) => `<tr><td>${t}</td><td>${c}<small class="mono">${s}</small></td><td class="n">${n <= ECO.DISPATCH.lowRating.max ? `<span class="pill warn" style="height:20px">★${n}</span>` : `<span class="mono">★${n}</span>`}</td></tr>`).join('')}
      </tbody></table></div>`)
  }

  /* ── C30 actions ── */
  if (ACT === 'create') {
    /* fleet-drivers.tsx: «Նոր վարորդ» opens a one-line form above the list (phone is the login; the code goes by SMS). */
    document.querySelector('.filters').insertAdjacentHTML('afterend', `<form class="newrow" onsubmit="return false" aria-label="Նոր վարորդ">
      <div><span class="lbl">Հեռախոս</span><div class="input focus"><i data-lucide="phone"></i><span class="val mono">077 18-44-90</span></div></div>
      <div><span class="lbl">Անուն</span><div class="input"><span class="val ph">օր. Արմեն Սարգսյան</span></div></div>
      <div><span class="lbl">ՀՎՀՀ</span><div class="input"><span class="val ph mono">8 թիվ</span></div></div>
      <div><span class="lbl">Idram ID</span><div class="input"><span class="val ph mono">0412 5581</span></div></div>
      <div style="display:flex;gap:6px"><button class="btn ghost s">Չեղարկել</button><button class="btn primary s">Ավելացնել</button></div>
      <span class="faint" style="font:var(--c-small);grid-column:1 / -1">Մուտքի կոդը՝ SMS-ով · ՀՎՀՀ և Idram ID՝ ոչ պարտադիր, բայց առանց դրանց անկանխիկ պատվերները ETAPI-ին չեն գնա</span></form>`)
    const nb = document.querySelector('.filters .btn'); if (nb) nb.style.boxShadow = 'inset 0 0 0 2px var(--ink)'
  }
  if (ACT === 'code') {
    afterActs(`<section class="xblk" aria-label="Մուտքի կոդ"><h3><i data-lucide="key-round"></i>Մուտքի կոդ</h3>
      <p>SMS-ը չի հասնում․ թելադրեք կոդը վարորդին</p>
      <div class="code" aria-label="Կոդը՝ 4 8 2 9 1 7">482 917</div>
      <div class="row-flex" style="gap:8px;font:var(--c-small);color:var(--ink-muted)">Գործում է մինչև <span class="mono" style="color:var(--ink)">14:36</span><span style="flex:1"></span><button class="btn secondary s"><i data-lucide="copy"></i>Պատճենել</button></div>
      <p style="font:var(--c-small)">Ցույց է տրվում մեկ անգամ</p></section>`)
    dp.querySelector('.acts .btn').style.boxShadow = 'inset 0 0 0 2px var(--ink)'
  }
  if (ACT === 'offline') {
    /* driver-end-shift.tsx: «Ավարտել հերթափոխը», armed: the second press ends it. The warning sits beside it. */
    const b = [...dp.querySelectorAll('.acts .btn')].pop()
    b.outerHTML = arm('Ավարտել հերթափոխը', '<i data-lucide="power"></i>Հաստատե՞լ')
    afterActs(`<section class="xblk" aria-label="Ավարտել հերթափոխը" style="box-shadow:inset 0 0 0 1px var(--line-soft),inset 3px 0 0 var(--danger-c)"><h3><i data-lucide="power"></i>Ավարտել հերթափոխը</h3>
      <p>Մեքենան կազատվի · ընթացիկ պատվերը կավարտվի նախ</p>
      <p style="font:var(--c-small)">Կապ չկա <span class="mono">03:40</span>-ից · վերջին դիրքը՝ Ավան</p></section>`)
  }
  if (ACT === 'shift') {
    /* Drawn ahead (driver-shift#operator is its app side): the office opens a shift for a driver with a car. */
    afterActs(`<section class="xblk" aria-label="Բացել հերթափոխ"><h3><i data-lucide="car"></i>Բացել հերթափոխ</h3>
      <p>Ընտրեք մեքենան</p>
      <div class="opts2" role="listbox" aria-label="Մեքենաներ" style="margin-top:8px">
        <div class="on" role="option" aria-selected="true"><span class="car s">${carImg('city')}</span><span><span class="plate">19 MA 190</span> <span class="s">ID.3 · ազատ</span></span><span class="s">Eco City</span></div>
        <div role="option"><span class="car s">${carImg('kids')}</span><span><span class="plate">20 SK 202</span> <span class="s">ID.3 · ազատ</span></span><span class="s">Eco Kids</span></div>
        <div class="held" role="option" aria-disabled="true"><span class="car s">${carImg('city')}</span><span><span class="plate">01 ET 001</span><span class="s" style="display:block;margin-top:2px">զբաղված է՝ Արամ Պ.</span></span><span class="s">Eco City</span></div></div>
      <div class="row-flex" style="justify-content:flex-end;gap:6px;margin-top:8px"><button class="btn ghost s">Չեղարկել</button><button class="btn primary s">Բացել հերթափոխ</button></div></section>`)
  }
  if (ACT === 'deletion') {
    afterActs(`<section class="xblk" aria-label="Ջնջման հարցում" style="box-shadow:inset 0 0 0 1px var(--line-soft),inset 3px 0 0 var(--warning)"><h3><i data-lucide="user-x"></i>Խնդրում է ջնջել հաշիվը</h3>
      <p>Կջնջվեն անունը, հեռախոսը, սարքերը · պատվերները կմնան</p>
      <p style="font:var(--c-small)">Հավելվածից, <span class="mono">8 հոկտ. 21:40</span> · ընթացիկ պատվեր չկա</p>
      <div class="row-flex" style="gap:8px;margin-top:8px">${arm('Ջնջել հաշիվը', 'Հաստատե՞լ', 'Երկրորդ սեղմումը ջնջում է')}</div></section>`)
  }
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
})()
