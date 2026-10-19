/* rides.html docked-panel states (coverage C20–C26, owner ruling (a)). Loaded after the page's own script; it re-renders
   the panel for one state, read from ?panel= (or ?ride=booking-now). Every control sits in the panel, opened in place
   from the panel's action row: one click deep (§9.4), never a modal (§9.8).
   Real sources: components/ride/ride-actions.tsx (assign + force cards, no-show), ride-editor.tsx (details, last-write 409),
   decision-log.tsx + ride-tabs.tsx (Map · Timeline · Decisions), ride-billing.tsx (payer, reference, month — no invoice: owner #11).
   Strings: apps/operator lib/i18n.ts hy (ride.actions.*, ride.edit.*, ride.decisions.*, offer.*, party.*, state.*),
   corporate-i18n / companies-i18n (intake.billing.*, ride.billing.*). New strings are listed in scratchpad c-ops-notes. */
(function () {
  const QS = new URLSearchParams(location.search)
  const P = QS.get('panel') || (QS.get('ride') === 'booking-now' ? 'booking-now' : null)
  if (!P) return
  document.head.insertAdjacentHTML('beforeend', `<style>
    .xsec { margin: 0; padding: 12px var(--inset); border-bottom: 1px solid var(--line-soft); background: var(--surface); box-shadow: inset 3px 0 0 var(--ink); display: flex; flex-direction: column; gap: 10px; }
    .xsec > h3 { font: var(--c-head); color: var(--ink); display: flex; align-items: center; gap: 6px; }
    .xsec > h3 svg { width: 16px; height: 16px; }
    .xsec > h3 .end { margin-left: auto; font: var(--c-small); color: var(--ink-faint); font-weight: 400; }
    .two2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .ta { min-height: 56px; height: auto; align-items: flex-start; padding-top: 8px; }
    .btns { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
    .hint { display: flex; gap: 6px; align-items: flex-start; font: var(--c-small); color: var(--ink-muted); }
    .hint svg { width: 14px; height: 14px; flex: none; margin-top: 1px; }
    .opts { border-radius: var(--r-ctl); background: var(--surface); box-shadow: var(--e2), 0 0 0 1px var(--line-soft); padding: 4px; }
    .opts div { display: flex; align-items: center; gap: 8px; min-height: 32px; padding: 0 8px; border-radius: 6px; font: var(--c-body); white-space: nowrap; }
    .opts div.on { background: var(--surface-alt); }
    .opts div .end { margin-left: auto; font: var(--c-small); color: var(--ink-faint); }
    .opts div.busy { color: var(--ink-muted); }
    .opts .sep { height: 1px; min-height: 0; padding: 0; margin: 4px 0; background: var(--line-soft); }
    .act-on { box-shadow: inset 0 0 0 2px var(--ink) !important; }
    .rtabs { display: flex; gap: 12px; border-bottom: 1px solid var(--line-soft); padding: 0 var(--inset); }
    .rtabs button { height: 36px; font: var(--c-strong); color: var(--ink-muted); white-space: nowrap; box-shadow: inset 0 -2px 0 transparent; }
    .rtabs button[aria-selected="true"] { color: var(--ink); box-shadow: inset 0 -2px 0 var(--ink); }
    .wave { display: flex; align-items: center; gap: 8px; font: var(--c-label); color: var(--ink-muted); margin: 4px 0 2px; }
    .wave .mono { color: var(--ink-faint); }
    .dl { width: 100%; border-collapse: collapse; font: var(--c-body); table-layout: fixed; }
    .dl col.s { width: 64px; } .dl col.k { width: 64px; } .dl col.o { width: 120px; }
    .dl td.o, .dl th.o { text-align: right; padding-left: 8px; }
    .dl th { font: var(--c-label); color: var(--ink-faint); text-align: left; padding: 4px 0; border-bottom: 1px solid var(--line-soft); }
    .dl td { padding: 6px 0; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
    .dl td.n, .dl th.n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; padding-left: 8px; }
    .dl td .sub { display: block; font: var(--c-small); color: var(--ink-faint); }
    .dl tr.notasked td { color: var(--ink-muted); }
    .why2 { display: inline-flex; height: 20px; align-items: center; padding: 0 6px; margin-left: 4px; border-radius: var(--r-tag); background: var(--surface-alt); box-shadow: inset 0 0 0 1px var(--line-soft); font: var(--c-label); color: var(--ink); white-space: nowrap; }
    .timer { display: flex; align-items: baseline; gap: 8px; }
    .timer b { font: 600 28px/32px var(--mono); font-variant-numeric: tabular-nums; }
    .timer span { font: var(--c-small); color: var(--ink-muted); }
    .tbar { height: 4px; border-radius: 2px; background: var(--surface-alt); position: relative; overflow: hidden; }
    .tbar i { position: absolute; left: 0; top: 0; bottom: 0; background: var(--warn); }
    .tbar em { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--ink); }
    .theirs { border-radius: var(--r-ctl); background: var(--surface-alt); padding: 8px 10px; font: var(--c-body); display: flex; flex-direction: column; gap: 6px; }
    .theirs q { color: var(--ink); quotes: '«' '»'; }
    .stars { display: inline-flex; gap: 1px; color: var(--ink); }
    .stars svg { width: 14px; height: 14px; fill: currentColor; }
    .steps { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; gap: 8px 10px; align-items: center; font: var(--c-body); }
    .steps .no { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font: 600 12px/1 var(--mono); background: var(--surface-alt); color: var(--ink-muted); box-shadow: inset 0 0 0 1px var(--line-soft); }
    .steps .no.now { background: var(--ink); color: var(--surface); box-shadow: none; }
    .steps small { display: block; font: var(--c-small); color: var(--ink-muted); }
    .ring { font: 600 13px/18px var(--mono); color: var(--ink); white-space: nowrap; display: inline-flex; align-items: center; gap: 4px; }
    @keyframes ringpulse { 0%, 100% { opacity: 1 } 50% { opacity: .45 } }
    .ring svg { width: 14px; height: 14px; animation: ringpulse 1.2s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) { .ring svg { animation: none; } }
  </style>`)
  const dp = document.getElementById('dp')
  const rows = [...document.querySelectorAll('#rows tr')]
  const rowById = (id) => rows.find((r) => r.textContent.includes(id))
  const select = (id) => { rows.forEach((r) => r.classList.remove('on')); const r = rowById(id); if (r) r.classList.add('on') }
  const statePill = (row, lane, word, ic) => { const c = row && row.querySelector('td:nth-child(5)'); if (c) c.innerHTML = `<span class="pill ${lane}" style="${lane ? 'color:var(--lane)' : ''}">${ic ? `<i data-lucide="${ic}"></i>` : '<i class="d"></i>'}${word}</span>` }
  const top = dp.querySelector('.top')
  const actsEl = top && top.querySelector('.acts')
  const after = (html) => top.insertAdjacentHTML('afterend', html)
  /* The opened control sits directly under the panel head, so the ride's identity and its action row stay in view (no scroll). */
  const scrollTo = () => {}
  /* The panel's action row (rides.html): Reassign · Change state… · Cancel, plus the details editor. The open one is outlined. */
  const ACTS = (on) => `<button class="btn secondary s${on === 'reassign' ? ' act-on' : ''}" aria-expanded="${on === 'reassign'}">Վերանշանակել <span class="kbd">A</span></button>
    <button class="btn secondary s${on === 'force' ? ' act-on' : ''}" aria-expanded="${on === 'force'}">Փոխել վիճակը…</button>
    <button class="btn secondary s icon${on === 'edit' ? ' act-on' : ''}" aria-label="Մանրամասներ" aria-expanded="${on === 'edit'}"><i data-lucide="pencil"></i></button>
    <span style="flex:1"></span><button class="btn danger s">Չեղարկել</button>`
  const reason = (txt) => `<div><label class="label">Պատճառ</label><div class="input ta${txt ? ' focus' : ''}"><span class="val${txt ? '' : ' ph'}">${txt || 'օր. Ուղևորը զանգեց և հրաժարվեց'}</span></div></div>`
  const hint = (id, txt, ic = 'info') => `<p class="hint" id="${id}"><i data-lucide="${ic}"></i>${txt}</p>`
  const head = (id, lane, word, ic) => { const s = top.querySelector('.id'); s.querySelector('.mono').textContent = '#R-' + id; const p = s.querySelector('.pill'); p.className = 'pill ' + lane; p.style.color = lane ? 'var(--lane)' : ''; p.innerHTML = (ic ? `<i data-lucide="${ic}"></i>` : '<i class="d"></i>') + word; dp.setAttribute('aria-label', 'Պատվեր #R-' + id) }

  /* ── C21 force-transition (ride-actions.tsx Force card). A ride WITH a driver: target «Չեղարկված» chosen, so the
     party select appears (operator default; no «չներկայացավ» — no-show has its own button), a reason typed, so
     «Կիրառել» is live; «Չներկայացավ» stays off with its reason beside it (the ride is in progress, not arrived). ── */
  if (P === 'force') {
    actsEl.innerHTML = ACTS('force')
    after(`<section class="xsec" aria-label="Փոխել վիճակը ձեռքով"><h3><i data-lucide="triangle-alert"></i>Փոխել վիճակը ձեռքով<span class="end">կգրանցվի՝ Անի Դ.</span></h3>
      <div class="two2"><div><label class="label">Փոխել վիճակը</label><div class="input"><span class="val">Չեղարկված</span><i data-lucide="chevron-down"></i></div></div>
        <div><label class="label">Ով չեղարկեց</label><div class="input" aria-describedby="h-party"><span class="val">ուղևոր</span><i data-lucide="chevron-down"></i></div></div></div>
      ${reason('Ուղևորը զանգեց և հրաժարվեց, վարորդը տեղյակ է')}
      <div class="btns" style="justify-content:space-between"><button class="btn danger s" disabled aria-describedby="h-ns" style="opacity:.55">Ուղևորը չեկավ</button><button class="btn danger-fill s">Կիրառել</button></div>
      <div>${hint('h-ns', '«Ուղևորը չեկավ»՝ միայն երբ վարորդը տեղում է')}${hint('h-party', 'Կգրանցվի, թե ով չեղարկեց')}</div></section>`)
    scrollTo()
  }

  /* ── C21, a ride WITHOUT a driver (#R-20431, «Վարորդ չկա»): the state list offers no state asserting a driver
     (assigned, en route, arrived, in progress, completed — §21, M8); assign is the one path that sets one. The select
     starts empty, so a stray Enter chooses nothing; both buttons say why they are off. ── */
  if (P === 'force-nodriver') {
    select('20431')
    head('20431', 'l-problems', 'Վարորդ չկա', 'circle-alert')
    top.querySelector('h2').textContent = 'Տիգրան Մեծի 67'
    top.querySelectorAll('.dest')[0].innerHTML = '<i data-lucide="arrow-right"></i><span>Կենտրոն</span>'
    top.querySelectorAll('.dest')[1].innerHTML = '<span class="mono">14:26</span>·<span class="mono">099 11-22-33</span>·<span>Հեռախոսով</span>·<span>Մարիամ Հ.</span>'
    actsEl.innerHTML = ACTS('force')
    after(`<section class="xsec" aria-label="Փոխել վիճակը ձեռքով"><h3><i data-lucide="triangle-alert"></i>Փոխել վիճակը ձեռքով<span class="end">վարորդ չկա</span></h3>
      <div style="position:relative"><label class="label">Փոխել վիճակը</label><div class="input focus" aria-describedby="h-st"><span class="val ph">Ընտրել վիճակը</span><i data-lucide="chevron-up"></i></div>
        <div class="opts" role="listbox" aria-label="Վիճակներ" style="margin-top:4px"><div class="on" role="option">Ընդունված</div><div role="option">Որոնում</div><div role="option">Վարորդ չկա<span class="end">հիմա</span></div><div role="option">Չեղարկված</div></div></div>
      ${hint('h-nodrv', 'Վարորդով վիճակները՝ նշանակելուց հետո', 'user-x')}
      ${reason('')}
      <div class="btns" style="justify-content:space-between"><button class="btn danger s" disabled style="opacity:.55" aria-describedby="h-ns h-rs">Ուղևորը չեկավ</button><button class="btn danger-fill s" disabled style="opacity:.55" aria-describedby="h-st h-rs">Կիրառել</button></div>
      <div>${hint('h-ns', '«Ուղևորը չեկավ»՝ միայն երբ վարորդը տեղում է')}${hint('h-rs', 'Գրեք պատճառը, և կոճակները կմիանան')}${hint('h-st', 'Ընտրեք նոր վիճակը')}</div></section>`)
    dp.querySelector('.drv').closest('.sec').innerHTML = '<h3>Վարորդ</h3><p class="faint" style="font:var(--c-body)">Դեռ նշանակված չէ · 2 ալիք, 7 հարցված</p>'
    scrollTo()
  }

  /* ── C22 reassign (ride-actions.tsx Assign card): a searchable picker, because the dispatcher already knows who.
     Typed «Սու», free drivers first; a busy driver stays pickable with «պատվերի մեջ» (§6: manual always wins). ── */
  if (P === 'reassign') {
    actsEl.innerHTML = ACTS('reassign')
    after(`<section class="xsec" aria-label="Նշանակել վարորդ"><h3><i data-lucide="user-round-check"></i>Նշանակել վարորդ<span class="end">հիմա՝ Արամ Պ.</span></h3>
      <div><label class="label">Վարորդ</label><div class="input focus"><i data-lucide="search"></i><span class="val">Ս<span style="border-left:1.5px solid var(--ink);margin-left:1px"></span></span><span class="kbd">↑↓</span></div>
        <div class="opts" role="listbox" aria-label="Վարորդներ" style="margin-top:4px">
          <div class="on" role="option" aria-selected="true"><i data-lucide="circle" style="width:8px;height:8px;fill:var(--ok-dot);color:var(--ok-dot)"></i>Սուրեն Մկրտչյան<span class="plate" style="height:20px">22 OU 447</span><span class="end">ազատ · 1,1 կմ</span></div>
          <div role="option"><i data-lucide="circle" style="width:8px;height:8px;fill:var(--ok-dot);color:var(--ok-dot)"></i>Սոնա Խաչատրյան<span class="plate" style="height:20px">20 SK 202</span><span class="end">ազատ · 3,8 կմ</span></div>
          <div class="sep" aria-hidden="true"></div>
          <div class="busy" role="option"><i data-lucide="circle" style="width:8px;height:8px;fill:var(--ink);color:var(--ink)"></i>Լիլիթ Մանուկյան<span class="plate" style="height:20px">18 OL 220</span><span class="end">պատվերով</span></div>
          <div class="busy" role="option"><i data-lucide="circle" style="width:8px;height:8px;fill:var(--ink);color:var(--ink)"></i>Սամվել Հարությունյան<span class="plate" style="height:20px">11 SH 511</span><span class="end">պատվերով</span></div>
        </div></div>
      <div class="btns"><button class="btn secondary s"><i data-lucide="search"></i>Ուղարկել որոնման</button><button class="btn primary s"><i data-lucide="user-round-check"></i>Նշանակել</button></div>
      ${hint('h-ep', 'Արամ Պ.-ի հավելվածում պատվերը կփակվի «Պատվերը փոխվել է» նշումով', 'smartphone')}</section>`)
    scrollTo()
  }

  /* ── C23 decision log (ride-tabs.tsx: Քարտեզ · Ժամանակագրություն · Դիսպետչերի որոշումներ; decision-log.tsx).
     Per wave: ranked drivers with score and distance, who was asked and how it ended. Wave 1's decline carries the
     driver's reason (owner decision 2026-10-12: decline requires a reason; drawn ahead — offer.declined has no reason). ── */
  if (P === 'decisions') {
    const tl = dp.querySelector('#tl').closest('.sec')
    const W = (n, rev, at, rs) => `<div class="wave"><b>Ալիք ${n}</b><span class="mono">${at}</span></div>
      <table class="dl"><colgroup><col><col class="s"><col class="k"><col class="o"></colgroup><thead><tr><th>Վարորդ</th><th class="n">Միավոր</th><th class="n" title="Հեռավորություն">Հեռ.</th><th class="o">Արդյունք</th></tr></thead><tbody>
      ${rs.map(([d, s, km, o, why, na]) => `<tr class="${na ? 'notasked' : ''}"><td>${d}</td><td class="n mono">${s}</td><td class="n mono">${km}</td><td class="o">${o}${why ? `<span class="sub"><span class="why2">${why}</span></span>` : ''}</td></tr>`).join('')}</tbody></table>`
    tl.remove()
    after(`<div class="rtabs" role="tablist" aria-label="Պատվեր"><button role="tab" aria-selected="false" tabindex="-1">Քարտեզ</button><button role="tab" aria-selected="false" tabindex="-1">Ժամանակագրություն</button><button role="tab" aria-selected="true">Որոնում</button></div>
      <section class="xsec" style="box-shadow:none" aria-label="Որոնում">
        <p class="hint"><i data-lucide="info"></i>Միայն հերթափոխում եղած վարորդները · անցանց և բացակա վարորդները չեն դիտարկվել</p>
        ${W(1, 14, '14:07:12', [['Էդգար Պողոսյան', '0,86', '1,2 կմ', 'մերժեց', 'Հեռու է'], ['Արամ Պետրոսյան', '0,79', '1,9 կմ', 'չհարցվեց', '', 1], ['Լիլիթ Մանուկյան', '0,61', '3,4 կմ', 'չհարցվեց', '', 1]])}
        ${W(2, 14, '14:08:31', [['Արամ Պետրոսյան', '0,79', '1,9 կմ', 'ընդունեց'], ['Լիլիթ Մանուկյան', '0,61', '3,4 կմ', 'չհարցվեց', '', 1]])}
      </section>`)
    dp.querySelector('.mini').remove()
    document.documentElement.dataset.mapReady = 'none'
    scrollTo()
  }

  /* ── C24 details editor (ride-editor.tsx): destination, agreed price, notes; Save only when dirty. ?panel=conflict is
     the last-write 409: a colleague saved notes first. Blue (the concurrency tone), their value shown, «Վերցնել նրանցը»,
     and «Թարմացնել և կրկին վերցնել»; what this operator typed is kept, never discarded. ── */
  if (P === 'edit' || P === 'conflict') {
    const cf = P === 'conflict'
    actsEl.innerHTML = ACTS('edit')
    after(`<section class="xsec" aria-label="Մանրամասներ"><h3><i data-lucide="pencil"></i>Մանրամասներ<span class="end"><span class="pill warn" style="height:20px" title="Կան չպահված փոփոխություններ">Չպահված</span></span></h3>
      <div><label class="label">Ուր</label><div class="pinrow" style="display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px;align-items:center"><span class="mk-ab b" style="width:20px;height:20px;font-size:11px;box-shadow:inset 0 0 0 1.5px var(--ink)">Բ</span><div class="input"><span class="val">Կասկադ, Թամանյան փ.</span><i data-lucide="circle-check" style="color:var(--ok)"></i></div></div></div>
      <div class="two2"><div><label class="label">Ֆիքսված գին</label><div class="input"><span class="val mono">1 000</span><span class="faint">֏</span></div></div><div><label class="label">Սակագնով</label><div class="input" style="box-shadow:none;background:var(--surface-alt)"><span class="val mono">800 ֏</span></div></div></div>
      <div><label class="label">Նշումներ</label><div class="input ta focus"><span class="val">Ուղևորը սայլակով է, զանգել հասնելիս<span style="border-left:1.5px solid var(--ink);margin-left:1px"></span></span></div></div>
      ${cf ? `<div class="notice blue" role="status"><i data-lucide="refresh-cw"></i><div class="grow" style="display:flex;flex-direction:column;gap:6px"><span>Մինչ խմբագրում էիք, Մարիամ Հ.-ն փոխեց նշումները</span>
          <div class="theirs"><span><q>Զանգել հասնելիս, մուտքը բակից</q></span><span class="faint" style="font:var(--c-small)">Մարիամ Հ. · 14:21</span></div>
          <div class="btns" style="justify-content:flex-start"><button class="btn secondary s">Վերցնել իրենը</button><button class="btn ghost s">Թարմացնել</button></div></div></div>` : ''}
      <div class="btns"><button class="btn ghost s">Փակել</button><button class="btn primary s">Պահել</button></div></section>`)
    scrollTo()
  }

  /* ── C25 no-show (ride-actions.tsx «Չներկայացավ», its own route: arrived only, against this screen's epoch).
     #R-20424 is at the pickup; the wait timer runs from arrival, past the free wait (5:00) the driver app also uses,
     and the driver has raised no-show from the app (driver-ride#noshowsent). Reason typed, so the button is live. ── */
  if (P === 'noshow') {
    select('20424'); statePill(rowById('20424'), 'l-active', 'Տեղում')
    head('20424', 'l-active', 'Տեղում')
    top.querySelector('h2').textContent = 'Թումանյան 21'
    top.querySelectorAll('.dest')[0].innerHTML = '<i data-lucide="arrow-right"></i><span>Երևան Մոլ</span>'
    top.querySelectorAll('.dest')[1].innerHTML = '<span class="mono">14:12</span>·<span class="mono">098 23-55-90</span>·<span>Հավելվածից</span>'
    actsEl.innerHTML = ACTS('force')
    const d = dp.querySelector('.drv'); d.querySelector('.nm').textContent = 'Սուրեն Մկրտչյան'; d.querySelector('.plate').textContent = '22 OU 447'; d.querySelector('.meta.mono').textContent = '094 12-40-77'
    after(`<section class="xsec" aria-label="Ուղևորը չեկավ"><h3><i data-lucide="user-x"></i>Ուղևորը չեկավ<span class="end">վարորդը տեղում է <span class="mono">14:16</span>-ից</span></h3>
      <div class="timer" role="timer" aria-label="Սպասում է 6 րոպե 12 վայրկյան"><b>6:12</b><span>սպասում · անվճար՝ <span class="mono">5:00</span></span></div>
      <div class="tbar" aria-hidden="true"><i style="width:100%"></i><em style="left:80.6%"></em></div>
      <div class="notice amber" role="status"><i data-lucide="hand"></i><span class="grow">Վարորդը նշեց «Ուղևորը չեկավ» · <span class="mono">14:21</span></span><button class="btn ghost s icon" aria-label="Զանգել ուղևորին"><i data-lucide="phone"></i></button></div>
      ${reason('Երկու զանգ, չպատասխանեց')}
      <div class="btns" style="justify-content:space-between"><button class="btn danger s">Ուղևորը չեկավ</button><button class="btn danger-fill s" disabled style="opacity:.55" aria-describedby="h-st">Կիրառել</button></div>
      ${hint('h-st', 'Ընտրեք նոր վիճակը')}</section>`)
    scrollTo()
  }

  /* ── C26 billing (ride-billing.tsx) on a company ride, plus what the panel must also say about a finished ride:
     rating and comment, demo flag (console-gaps #22/#24, drawn ahead). ── */
  if (P === 'billing') {
    const r = rowById('20398')
    r.innerHTML = `<td class="mono">13:20</td><td><div class="route"><span class="l1">${ECO.BOOKINGS.co.pickup}<span class="arr">→</span>${ECO.BOOKINGS.co.drop}</span><span class="l2"><span class="mono">${ECO.CUSTOMER.phone}</span> · <span class="mono">#R-20398</span> · <i data-lucide="building-2" style="width:12px;height:12px;vertical-align:-2px"></i> ${ECO.COMPANY.short}</span></div></td>
      <td><span class="tiercell"><span class="car xs">${carImg('city')}</span><span class="trunc">City</span></span></td><td><span class="drvcell"><span class="nm"><span>Նարեկ Հ.</span><span>07 AB 913</span></span></span></td><td><span class="pill"><i class="d"></i>Ավարտված</span></td><td class="r mono">${amd(1100)}</td>`
    select('20398')
    head('20398', '', 'Ավարտված')
    top.querySelector('h2').textContent = ECO.BOOKINGS.co.pickup
    top.querySelectorAll('.dest')[0].innerHTML = `<i data-lucide="arrow-right"></i><span>${ECO.BOOKINGS.co.drop}</span>`
    top.querySelectorAll('.dest')[1].innerHTML = `<span class="mono">13:20</span>·<span class="mono">${ECO.CUSTOMER.phone}</span>·<span>Հավելվածից</span>`
    actsEl.innerHTML = '<button class="btn secondary s icon act-on" aria-label="Մանրամասներ" aria-expanded="true"><i data-lucide="pencil"></i></button><span style="flex:1"></span><span class="faint" style="font:var(--c-small)">Ավարտված պատվերը չի փոխվում</span>'
    const d = dp.querySelector('.drv'); d.querySelector('.nm').textContent = 'Նարեկ Հովհաննիսյան'; d.querySelector('.plate').textContent = '07 AB 913'; d.querySelector('.meta.mono').textContent = '098 23-55-90'
    after(`<section class="xsec" aria-label="Ընկերության ամիս"><h3><i data-lucide="building-2"></i>Ընկերության ամիս</h3>
      <dl class="kv"><dt>Ամիս</dt><dd><a href="company.html?theme=${THEME}&tab=statement" style="color:var(--brand-text)">Հոկտեմբեր 2026</a> · <span class="faint">ընթացիկ</span></dd><dt>Ուղևոր</dt><dd><a href="customer.html?theme=${THEME}" style="color:var(--brand-text)">${ECO.COMPANY.rider}</a></dd></dl>
      <h3 style="margin-top:4px"><i data-lucide="star"></i>Գնահատական</h3>
      <dl class="kv"><dt>Ուղևորից</dt><dd><span class="stars" aria-label="5 աստղ">${'<i data-lucide="star"></i>'.repeat(5)}</span></dd><dt>Մեկնաբանություն</dt><dd>«Մաքուր մեքենա, ճշտապահ»</dd><dt>Վարորդից</dt><dd><span class="stars" aria-label="5 աստղ">${'<i data-lucide="star"></i>'.repeat(5)}</span></dd>
        <dt>Փորձնական պատվեր</dt><dd>Ոչ</dd></dl></section>`)
    const kv = dp.querySelector('.kv:not(.xsec .kv)')
    if (kv) kv.innerHTML = '<dt>Eco City · նստեցում</dt><dd>600 ֏</dd><dt>4,1 կմ × 90 ֏</dt><dd>369 ֏</dd><dt>11 ր × 12 ֏</dt><dd>132 ֏</dd><dt>Կլորացում (100 ֏)</dt><dd>−1 ֏</dd><dt>Վճարող</dt><dd>Ընկերություն · ' + ECO.COMPANY.name + '</dd><dt class="tot">Ընդամենը · Ընկերության հաշվին</dt><dd class="tot">1 100 ֏</dd>'
    scrollTo()
  }

  /* ── C26 a cancelled ride: who cancelled (party, §5) and why, from the rider app's reason sheet or the operator's
     force (drawn ahead: the panel has a slot, the wire carries the party; the reason text is the forced event's). ── */
  if (P === 'cancelled') {
    select('20391')
    head('20391', '', 'Չեղարկված')
    top.querySelector('h2').textContent = 'Չարենցի 1'
    top.querySelectorAll('.dest')[0].innerHTML = '<i data-lucide="arrow-right"></i><span>Գայի պող. 16</span>'
    top.querySelectorAll('.dest')[1].innerHTML = '<span class="mono">12:57</span>·<span class="mono">044 71-03-82</span>·<span>Հեռախոսով</span>·<span>Սոնա Ա.</span>'
    actsEl.innerHTML = '<span class="faint" style="font:var(--c-small)">Ավարտված պատվերը չի փոխվում</span>'
    after(`<section class="xsec" aria-label="Չեղարկում"><h3><i data-lucide="ban"></i>Չեղարկում</h3>
      <dl class="kv"><dt>Ով չեղարկեց</dt><dd>ուղևոր</dd><dt>Պատճառ</dt><dd>«Պլանները փոխվեցին»</dd><dt>Երբ</dt><dd class="mono">13:02 · նշանակումից 3 ր հետո</dd><dt>Միջնորդավճար</dt><dd>Չի գանձվել</dd><dt>Փորձնական պատվեր</dt><dd>Ոչ</dd></dl></section>`)
    dp.querySelector('.drv').closest('.sec').innerHTML = '<h3>Վարորդ</h3><div class="drv"><span class="car m">' + carImg('city') + '</span><div style="min-width:0"><div class="nm">Էդգար Պողոսյան</div><div class="meta"><span class="plate">27 EP 336</span><span class="pill"><i data-lucide="handshake"></i>Գործընկեր</span></div></div><span></span></div>'
    document.getElementById('tl').innerHTML = [['12:57', 'l-unassigned', 'Ընդունված', 'Սոնա Ա.'], ['12:58', 'l-active', 'Նշանակված', 'Էդգար Պ. · ալիք 1'], ['12:59', 'l-active', 'Ճանապարհին', 'Էդգար Պ.'], ['13:02', '', 'Չեղարկված <span class="why">ուղևոր</span>', 'ուղևոր · հավելված']]
      .map(([t, l, w, who]) => `<span class="t">${t}</span><i class="d ${l}"></i><span>${w}</span><span class="who">${who}</span>`).join('')
    scrollTo()
  }

  /* ── Owner ruling (a), console side: the rider pressed «Սկսել հիմա» on B-0912. The booking becomes a ride; the
     FIRST offer goes to the pre-assigned driver (Սուրեն Մ., the normal 20 s offer); if he declines or lets it lapse,
     the ride falls to normal dispatch (Searching, waves). Drawn ahead: no start-now endpoint yet. ── */
  if (P === 'booking-now') {
    const A = ECO.BOOKINGS.air, S = A.startNow
    const bk = rowById(A.id)
    if (bk) { bk.classList.add('on'); statePill(bk, 'l-searching', 'Առաջարկ', 'bell-ring'); bk.querySelector('td').innerHTML = `<span class="when2"><span class="dd">հիմա</span><span class="mono">${S.at}</span></span>` }
    const pill = top.querySelector('.id .pill'); pill.className = 'pill l-searching'; pill.innerHTML = '<i data-lucide="bell-ring"></i>Սկսվեց հիմա'
    actsEl.innerHTML = '<button class="btn secondary s">Վերանշանակել <span class="kbd">A</span></button><button class="btn secondary s">Ուղարկել որոնման</button><span style="flex:1"></span><button class="btn danger s">Չեղարկել</button>'
    after(`<section class="xsec" aria-label="Սկսել հիմա"><h3><i data-lucide="zap"></i>Ուղևորը սկսեց հիմա<span class="end mono">${S.at}</span></h3>
      <div class="steps">
        <span class="no now">1</span><span>Առաջարկ նախապես նշանակված վարորդին՝ <b>${S.first}</b><small>${A.driver.plate} · 2,3 կմ · սովորական առաջարկ, ${S.offerSec} վրկ</small></span><span class="ring" role="timer" aria-label="Մնաց 14 վայրկյան"><i data-lucide="bell-ring"></i>0:14</span>
        <span class="no">2</span><span>Եթե մերժի կամ չպատասխանի՝ ավտոմատ որոնում · ${A.tier}<small>միայն ${A.tier} սակագնի վարորդները · ${S.first}-ն ազատվում է</small></span><span class="faint" style="font:var(--c-small)">հետո</span>
      </div></section>`)
    document.getElementById('tl').innerHTML = [['9:38', 'l-scheduled', 'Ստեղծվեց', 'ուղևոր · հավելված'], ['9:40', 'l-scheduled', 'Նախապես նշանակվեց Սուրեն Մ.', 'Անի Դ.'], [S.at, 'l-searching', 'Սկսվեց հիմա', 'ուղևոր · հավելված'], [S.at, 'l-searching', 'Առաջարկ · սպասում է պատասխանի', 'Սուրեն Մ. · առաջինը']]
      .map(([t, l, w, who]) => `<span class="t">${t}</span><i class="d ${l}"></i><span>${w}</span><span class="who">${who}</span>`).join('')
    scrollTo()
  }
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
})()
