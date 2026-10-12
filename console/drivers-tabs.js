/* drivers.html detail tabs and actions (coverage C29, C30). Loaded after the page script; re-renders the docked panel.
   ?tab=rides | money | docs | rating      (C29) — real driver-detail.tsx has Overview + Money; Rides and Rating are drawn ahead
   ?action=create | code | offline | shift | deletion   (C30) — use with &d=N to pick the driver the action is about
   Real: fleet-drivers.tsx (create), driver-login-code.tsx, driver-end-shift.tsx / fleet.forceOfflineWarning, driver-account.tsx,
   driver-money.tsx, driver-ledger.tsx, record-payment.tsx, driver-payout.tsx, driver-documents.tsx.
   Strings: lib/i18n.ts + money-i18n.ts hy. Dangerous actions are ArmButtons (two presses, visible), never a dialog. */
(function () {
  const QS = new URLSearchParams(location.search)
  const TAB = QS.get('tab'), ACT = QS.get('action')
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
    .code { font: 600 32px/40px var(--mono); letter-spacing: .08em; margin: 8px 0 4px; }
    .armed { background: var(--danger-c) !important; color: var(--danger-ink) !important; }
    .opts2 > div { display: grid; grid-template-columns: 56px minmax(0, 1fr) auto; gap: 10px; align-items: center; min-height: 44px; padding: 4px 8px; border-radius: 6px; }
    .opts2 > div.on { background: var(--surface-alt); box-shadow: inset 0 0 0 1px var(--line-strong); }
    .opts2 > div.held { color: var(--ink-muted); }
    .opts2 .s { font: var(--c-small); color: var(--ink-faint); }
    .bars { display: grid; grid-template-columns: 24px minmax(0, 1fr) 32px; gap: 4px 8px; align-items: center; font: var(--c-small); color: var(--ink-muted); margin-top: 8px; }
    .bars i { display: block; height: 6px; border-radius: 3px; background: var(--ink); }
    .bars span:last-child { text-align: right; }
    .newrow { display: grid; grid-template-columns: 170px minmax(0, 1fr) auto; gap: 8px; align-items: end; padding: 10px var(--inset); border-bottom: 1px solid var(--line-soft); background: var(--surface-alt); }
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

  /* ── C29 Rides: commitments first (bookings this driver holds, Release one press from the row), then today's rides. ── */
  if (TAB === 'rides') {
    setTab(1); clearBelow()
    add(`<div class="blk"><h3><i data-lucide="calendar-clock"></i>Պարտավորություններ<span class="end faint" style="font-weight:400">նախապես նշանակված</span></h3>
      <div class="cm"><time><small>Այսօր</small>${B.kom.time}</time><span class="a">${B.kom.pickup} → ${B.kom.drop}</span>
        <span class="m"><span class="mono">${B.kom.phone}</span>·<span class="mono">#${B.kom.id}</span>·<span>ազատ մինչև ${B.kom.held}</span></span>
        <span class="b"><button class="btn secondary s">Ազատել</button></span></div>
      <div class="cm"><time><small>Շբթ</small>${B.bag.time}</time><span class="a">${B.bag.pickup} → ${B.bag.drop}</span>
        <span class="m"><span class="mono">${B.bag.phone}</span>·<span class="mono">#${B.bag.id}</span><span class="pill bad" style="height:20px"><i data-lucide="clock-alert"></i>Չեմ հասցնի · 09:31</span></span>
        <span class="b"><button class="btn secondary s">Ազատել</button><button class="btn secondary s">Վերանշանակել <span class="kbd">A</span></button><button class="btn ghost s">Թողնել իրեն</button></span></div>
      <div class="cm"><time><small>Կիր</small>11:30</time><span class="a">Կոմիտասի պող. 49 → Էրեբունի օդանավակայան</span>
        <span class="m"><span class="mono">091 44-02-17</span>·<span class="mono">#B-0930</span>·<span>ազատ մինչև 11:00</span></span>
        <span class="b"><button class="btn secondary s">Ազատել</button></span></div></div>
    <div class="blk" style="margin-bottom:12px"><h3><i data-lucide="list"></i>Այսօր<span class="end faint num" style="font-weight:400">1 պատվեր · 1 200 ֏ · 1 ընթացքում</span></h3>
      <table class="lt"><colgroup><col class="w"><col><col class="a"></colgroup><tbody>
      ${[[ECO.RIDE.assigned, ECO.RIDE.pickup + ' → ' + ECO.RIDE.drop, '#R-' + ECO.RIDE.no + ' · ընթացքում', ECO.RIDE.fare, 1], ['08:47', 'Կոմիտասի պող. 22 → Մաշտոցի պող. 37', '#R-2398', 1200]]
        .map(([t, r, id, f, live]) => `<tr><td class="mono">${t}</td><td>${r}<small class="mono">${id}</small></td><td class="n mono">${live ? '<span class="pill l-active" style="color:var(--lane);height:20px"><i class="d"></i>' + amd(f) + '</span>' : amd(f)}</td></tr>`).join('')}
      </tbody></table></div>`)
  }

  /* ── C29 Money (driver-money.tsx, fleet): balance as the fleet sees it, the plan, «Գրանցել վճարում» open inline,
     payout and the ledger with its reverse ArmButton. Adjustment is drawn ahead (an entry kind, no form). ── */
  if (TAB === 'money') {
    setTab(2); clearBelow()
    add(`<div class="blk wallet"><h3><i data-lucide="wallet"></i>Մնացորդ<span class="end pill warn" style="height:20px"><i data-lucide="triangle-alert"></i>Ցածր հաշվեկշիռ</span></h3>
      <div class="bal num">−2 964 <small>֏</small></div>
      <dl class="rows"><dt>Վճարի պլան</dt><dd>Պարկի ստանդարտ 20%</dd><dt>Կանխիկ պատվերները դադարում են՝ ցածր</dt><dd class="mono">−10 000 ֏</dd><dt>Զգուշացում՝ ցածր</dt><dd class="mono">−2 000 ֏</dd><dt>Վճարման կոդ</dt><dd class="mono">000012</dd></dl>
      <div class="btns"><button class="btn secondary s" style="box-shadow:inset 0 0 0 2px var(--ink)" aria-expanded="true"><i data-lucide="banknote"></i>Գրանցել վճարում</button><button class="btn secondary s">Վճարել վարորդին</button><button class="btn ghost s">Ճշգրտում</button></div>
      <form class="frm" onsubmit="return false" aria-label="Գրանցել վճարում">
        <div class="two"><div><label class="label">Գումար</label><div class="input focus"><span class="val mono">2 964</span><span class="faint">֏</span></div></div>
          <div><label class="label">Եղանակ</label><div class="input"><span class="val">Կանխիկ՝ գրասենյակում</span><i data-lucide="chevron-down"></i></div></div></div>
        <div><label class="label">Հղում <span class="faint" style="font-weight:400">· ոչ պարտադիր</span></label><div class="input"><span class="val ph">Անդորրագրի համարը կամ բանկային քաղվածքի հղումը</span></div></div>
        <div class="btns"><button class="btn ghost s">Փակել</button><button class="btn primary s">Գրանցել վճարումը</button></div></form></div>
    <div class="blk" style="margin-bottom:12px"><h3><i data-lucide="list"></i>Շարժեր<span class="end faint" style="font-weight:400">Վերջին 50-ը՝ նորերը վերևում</span></h3>
      <table class="lt"><colgroup><col class="w"><col><col class="a"></colgroup><thead><tr><th>Երբ</th><th>Ինչ</th><th class="n">Գումար</th></tr></thead><tbody>
      ${[['14:19', 'Պատվերի վճար', 'Պատվեր #R-20417 · Համակարգ', -160], ['12:20', 'Պատվերի վճար', 'Պատվեր #R-20380 · Համակարգ', -180], ['11:30', 'Պատվերի վճար', 'Պատվեր #R-20358 · Համակարգ', -140],
        ['10:52', 'Պատվերի վճար', 'Պատվեր #R-20331 · Համակարգ', -240], ['09:51', 'Պատվերի վճար', 'Պատվեր #R-' + ECO.RIDE.no + ' · Համակարգ', -220],
        ['Երկ.', 'Հաշվարկ', 'Անի Դավթյան · անդ. 4471', 3120, 1], ['Երկ.', 'Ճշգրտում', 'Գոհար Մինասյան · «վառելիքի փոխհատուցում»', 500]]
        .map(([t, w, s, a, rev]) => `<tr><td class="mono">${t}</td><td>${w}<small>${s}</small>${rev ? '<small><button class="btn ghost s" style="height:24px;padding:0 6px;margin-top:2px">Չեղարկել</button></small>' : ''}</td><td class="n mono">${amd(a)}</td></tr>`).join('')}
      </tbody></table></div>`)
  }

  /* ── C29 Documents (driver-documents.tsx): the list with expiry, the expired one flagged, and the add form open. ── */
  if (TAB === 'docs') {
    setTab(3)
    const blk = [...dp.querySelectorAll('.blk')].find((b) => b.querySelector('.docs'))
    clearBelow(); add(blk.outerHTML)
    const nb = dp.querySelector('.docs').closest('.blk')
    nb.querySelector('h3 .end').outerHTML = '<span class="end pill bad" style="height:20px"><i data-lucide="circle-alert"></i>Ժամկետանց՝ բժշկական</span>'
    nb.querySelector('.docs').insertAdjacentHTML('afterbegin', '<div class="doc"><span class="ic"><i data-lucide="file-text"></i></span><span class="t"><b>Բժշկական տեղեկանք</b><span>medical-2025.pdf</span></span><span class="pill bad">Ժամկետանց՝ <span class="num">01.10.2026</span></span><button class="btn ghost icon s" aria-label="Ներբեռնել"><i data-lucide="download"></i></button></div>')
    nb.querySelector('.dropz').outerHTML = `<form class="frm" onsubmit="return false" aria-label="Ավելացնել փաստաթուղթ"><div class="two"><div><label class="label">Փաստաթղթի տեսակ</label><div class="input focus"><span class="val">Բժշկական տեղեկանք</span><i data-lucide="chevron-down"></i></div></div>
      <div><label class="label">Ժամկետ</label><div class="input"><span class="val mono">01.10.2027</span></div></div></div>
      <div class="dropz"><i data-lucide="file-check"></i>medical-2026.pdf · 412 ԿԲ</div><div class="btns"><button class="btn ghost s">Չեղարկել</button><button class="btn primary s">Ավելացնել փաստաթուղթ</button></div></form>`
    nb.style.marginBottom = '12px'
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
        .map(([t, c, s, n]) => `<tr><td>${t}</td><td>${c}<small class="mono">${s}</small></td><td class="n">${n <= 2 ? `<span class="pill warn" style="height:20px">★${n}</span>` : `<span class="mono">★${n}</span>`}</td></tr>`).join('')}
      </tbody></table></div>`)
  }

  /* ── C30 actions ── */
  if (ACT === 'create') {
    /* fleet-drivers.tsx: «Նոր վարորդ» opens a one-line form above the list (phone is the login; the code goes by SMS). */
    document.querySelector('.filters').insertAdjacentHTML('afterend', `<form class="newrow" onsubmit="return false" aria-label="Նոր վարորդ">
      <div><span class="lbl">Հեռախոս</span><div class="input focus"><i data-lucide="phone"></i><span class="val mono">077 18-44-90</span></div></div>
      <div><span class="lbl">Անուն</span><div class="input"><span class="val ph">օր. Արմեն Սարգսյան</span></div></div>
      <div style="display:flex;gap:6px"><button class="btn ghost s">Չեղարկել</button><button class="btn primary s">Ավելացնել վարորդ</button></div>
      <span class="faint" style="font:var(--c-small);grid-column:1 / -1">Մուտքի կոդը՝ SMS-ով</span></form>`)
    const nb = document.querySelector('.filters .btn'); if (nb) nb.style.boxShadow = 'inset 0 0 0 2px var(--ink)'
  }
  if (ACT === 'code') {
    afterActs(`<section class="xblk" aria-label="Տրամադրել մուտքի կոդ"><h3><i data-lucide="key-round"></i>Տրամադրել մուտքի կոդ</h3>
      <p>երբ SMS-ը չի աշխատում — կարդացե՛ք այս թվերը վարորդին</p>
      <div class="code" aria-label="Կոդը՝ 4 8 2 9 1 7">482 917</div>
      <div class="row-flex" style="gap:8px;font:var(--c-small);color:var(--ink-muted)">Գործում է մինչև <span class="mono" style="color:var(--ink)">14:36</span><span style="flex:1"></span><button class="btn secondary s"><i data-lucide="copy"></i>Պատճենել</button></div>
      <p style="font:var(--c-small)">Ցուցադրվում է մեկ անգամ։ Կորցնելու դեպքում տրամադրե՛ք նորը։</p></section>`)
    dp.querySelector('.acts .btn').style.boxShadow = 'inset 0 0 0 2px var(--ink)'
  }
  if (ACT === 'offline') {
    /* driver-end-shift.tsx: «Ավարտել հերթապահությունը», armed: the second press ends it. The warning sits beside it. */
    const b = [...dp.querySelectorAll('.acts .btn')].pop()
    b.outerHTML = arm('Ավարտել հերթապահությունը', '<i data-lucide="power"></i>Հաստատե՞լ')
    afterActs(`<section class="xblk" aria-label="Ավարտել հերթապահությունը" style="box-shadow:inset 0 0 0 1px var(--line-soft),inset 3px 0 0 var(--danger-c)"><h3><i data-lucide="power"></i>Ավարտել հերթապահությունը</h3>
      <p>ավարտում է հերթապահությունը և ազատում մեքենան; ընթացիկ պատվերը կշարունակվի, կնշվի, և հերթապահությունը կփակվի դրանից հետո</p>
      <p style="font:var(--c-small)">Լռում է <span class="mono">03:40</span>-ից · վերջին դիրքը՝ Ավան</p></section>`)
  }
  if (ACT === 'shift') {
    /* Drawn ahead (driver-shift#operator is its app side): the office opens a shift for a driver with a car. */
    afterActs(`<section class="xblk" aria-label="Բացել հերթապահություն"><h3><i data-lucide="car"></i>Բացել հերթապահություն</h3>
      <p>Ընտրեք մեքենան․ վարորդը կտեսնի «Բացել է դիսպետչերը»</p>
      <div class="opts2" role="listbox" aria-label="Մեքենաներ" style="margin-top:8px">
        <div class="on" role="option" aria-selected="true"><span class="car s">${carImg('city')}</span><span><span class="plate">19 MA 190</span> <span class="s">ID.3 · ազատ</span></span><span class="s">Eco City</span></div>
        <div role="option"><span class="car s">${carImg('kids')}</span><span><span class="plate">20 SK 202</span> <span class="s">ID.3 · ազատ</span></span><span class="s">Eco Kids</span></div>
        <div class="held" role="option" aria-disabled="true"><span class="car s">${carImg('city')}</span><span><span class="plate">01 ET 001</span><span class="s" style="display:block;margin-top:2px">զբաղեցրել է՝ Արամ Պ.</span></span><span class="s">Eco City</span></div></div>
      <div class="row-flex" style="justify-content:flex-end;gap:6px;margin-top:8px"><button class="btn ghost s">Չեղարկել</button><button class="btn primary s">Բացել հերթապահություն</button></div></section>`)
  }
  if (ACT === 'deletion') {
    afterActs(`<section class="xblk" aria-label="Այս վարորդը խնդրել է ջնջել իր հաշիվը" style="box-shadow:inset 0 0 0 1px var(--line-soft),inset 3px 0 0 var(--warn)"><h3><i data-lucide="user-x"></i>Այս վարորդը խնդրել է ջնջել իր հաշիվը</h3>
      <p>անունը, համարը և սարքերը կջնջվեն; պատվերներն ու գումարը կմնան</p>
      <p style="font:var(--c-small)">Հայտը՝ հավելվածից, <span class="mono">8 հոկտ. 21:40</span> · մնացորդ՝ <span class="mono">0 ֏</span> · ընթացիկ պատվեր չկա</p>
      <div class="row-flex" style="gap:8px;margin-top:8px">${arm('Համաձայնել և ջնջել հաշիվը', 'Հաստատե՞լ', 'Երկրորդ սեղմումը ջնջում է')}</div></section>`)
  }
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
})()
