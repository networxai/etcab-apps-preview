/* dispatch.html states (coverage C09, C11–C16, C51 part 1). Loaded in <head> after console.js; the page calls
   DX.lanes(lanes, acts) before it renders the queue and DX.after() at the end of its script.
   ?state=degraded   C14 socket down: the console polls GET /rides (REST is truth); snapshot on reconnect
   ?state=conflict   C15 claim race: another dispatcher took the row first (blue: the concurrency tone)
   ?state=problems   C13 the problem kinds beyond no-show / no drivers
   ?state=quiet      C16 a quiet night: empty lanes say so, nothing pretends to be busy
   ?state=expired    C51 session expired mid-call: re-login inline, the intake draft kept (drawn ahead)
   ?intake=blacklist C09 · ?intake=reused C11 · ?intake=refusal C12
   Strings: apps/operator lib/i18n.ts hy (live.*, queue.*, problem.*, intake.*, auth.login.*). New ones: c-ops-notes. */
(function () {
  const QS = new URLSearchParams(location.search)
  const ST = QS.get('state'), IN = QS.get('intake')
  const css = `
    .qstat { display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 8px; border-radius: var(--r-pill); font: var(--c-label); white-space: nowrap; }
    .qstat svg { width: 14px; height: 14px; }
    .qstat.amber { background: var(--warning-surface); color: var(--warning); }
    .qstat.blue { background: var(--info-soft); color: var(--info); }
    .legend.msg { gap: 8px; color: var(--ink); background: var(--info-soft); font: var(--c-body); }
    .legend.msg svg { color: var(--info); }
    .legend.msg svg { width: 14px; height: 14px; flex: none; }
    .legend.msg .grow { min-width: 0; }
    .r.lost::after { content: ''; position: absolute; inset: 0; box-shadow: inset 0 0 0 1px var(--info); pointer-events: none; }
    @keyframes flash { 0% { background: var(--info-soft) } 100% { background: transparent } }
    .r.lost { animation: flash 1.6s ease-out 1; }
    @media (prefers-reduced-motion: reduce) { .r.lost { animation: none; } }
    .r .claimed.info { color: var(--info); font-weight: 500; }
    .emptyl { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 12px 0 16px; border-bottom: 1px solid var(--line-soft); font: var(--c-small); color: var(--ink-faint); }
    .quiet { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 28px 16px; text-align: center; font: var(--c-body); color: var(--ink-muted); }
    .quiet b { font: var(--c-head); color: var(--ink); }
    .bl { border-radius: var(--r-ctl); background: var(--danger-soft); color: var(--danger-c); padding: 8px 10px; display: flex; gap: 8px; align-items: flex-start; font: var(--c-body); box-shadow: inset 3px 0 0 var(--danger-c); }
    .bl svg { width: 16px; height: 16px; flex: none; margin-top: 2px; }
    .bl small { display: block; font: var(--c-small); color: var(--ink-muted); margin-top: 2px; }
    .ferr { display: flex; gap: 6px; align-items: flex-start; font: var(--c-small); color: var(--danger-c); margin-top: 4px; }
    .ferr svg, .fhint svg { width: 14px; height: 14px; flex: none; margin-top: 1px; }
    .fhint { display: flex; gap: 6px; align-items: flex-start; font: var(--c-small); color: var(--warning); margin-top: 4px; }
    .reauth { display: flex; flex-direction: column; gap: 8px; padding: 10px var(--inset); border-top: 1px solid var(--line-soft); background: var(--warning-surface); flex: none; }
    .reauth .t { display: flex; align-items: center; gap: 6px; font: var(--c-strong); color: var(--warning); }
    .reauth .t svg { width: 16px; height: 16px; }
    .reauth .f { display: grid; grid-template-columns: minmax(0, 1fr) 88px auto; gap: 8px; align-items: center; }
    .reauth .sub { font: var(--c-small); color: var(--ink-muted); }`
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`)

  window.DX = {
    lanes(lanes, acts) {
      const L = (k) => lanes.find((l) => l.k === k)
      if (ST === 'problems') {
        /* C13: §9.2's problem kinds. Real kinds: ack_window_lapsed («Չհաստատված նշանակում»), passenger_not_found.
           Drawn ahead: a driver's cancel with its reason, a low rating (24 h SLA), and the driver's «Չեմ հասցնի»
           request surfacing in the Now tab when its booking is today. */
        L('problems').rows = [
          { a: 'Պուշկինի 15', ph: '093 60-12-48', why: 'Վարորդը չեղարկեց · «Մեքենան անսարք է» · Վահե Ս.', age: '01:18', late: 1, acts: 'dcancel', sel: 1 },
          { a: 'Հյուսիսային պող. 1', ph: '055 20-44-19', why: 'Չհաստատված նշանակում · Գագիկ Ա. · 30 վրկ', age: '00:47', late: 1, acts: 'ack' },
          { a: ECO.BOOKINGS.kom.pickup, ph: ECO.BOOKINGS.kom.phone, why: `Չեմ հասցնի · ${ECO.BOOKINGS.kom.driver.short} · ամրագրում ${ECO.BOOKINGS.kom.time}`, age: '00:22', acts: 'cant' },
          { a: 'Արշակունյաց 2', ph: '096 14-02-71', why: 'Ցածր գնահատական ★2 · «Կոպիտ էր» · Տիգրան Ա.', age: '2 ժ', acts: 'rating' },
        ]
        Object.assign(acts, {
          dcancel: '<button class="btn secondary xs">Նշանակել <span class="kbd">A</span></button><button class="btn secondary xs">Ուղարկել որոնման</button><button class="btn ghost xs icon" aria-label="Զանգել ուղևորին"><i data-lucide="phone"></i></button>',
          ack: '<button class="btn secondary xs">Նշանակել այլ <span class="kbd">A</span></button><button class="btn secondary xs">Փոխել վիճակը…</button><button class="btn ghost xs icon" aria-label="Զանգել վարորդին"><i data-lucide="phone"></i></button>',
          cant: '<button class="btn secondary xs">Ազատել</button><button class="btn secondary xs">Վերանշանակել <span class="kbd">A</span></button><button class="btn ghost xs icon" aria-label="Զանգել վարորդին"><i data-lucide="phone"></i></button>',
          rating: '<button class="btn secondary xs">Բացել պատվերը</button><button class="btn ghost xs">Դիտված է</button><button class="btn ghost xs icon" aria-label="Զանգել ուղևորին"><i data-lucide="phone"></i></button>',
        })
      }
      if (ST === 'conflict') {
        /* C15: this operator pressed T on Կոմիտաս 12 a beat after Սոնա Ա. — the row now shows her claim, outlined in
           blue for a moment; the sentence takes the legend's place (no row moves, no modal). */
        const u = L('unassigned').rows[0]
        delete u.acts; u.claimed = 'Սոնա Ա.'; u.lost = 1
      }
      if (ST === 'quiet') {
        L('problems').rows = []; L('unassigned').rows = []; L('searching').rows = []
        L('active').rows = L('active').rows.slice(2, 4)
      }
      if (IN === 'reused') {
        /* C11: the order this call already made sits at the top of Unassigned, four seconds old. */
        L('unassigned').rows.unshift({ a: 'Կոմիտաս պողոտա 12, Արաբկիր', ph: '093 15-62-40', d: 'Հալաբյան 41', age: '00:04', sla: .02, acts: 'take', sel: 1 })
        L('problems').rows.forEach((r) => delete r.sel)
      }
    },
    after() {
      const q = (s) => document.querySelector(s)
      const head = q('.q .card-h .end')
      const legend = q('.legend')
      const live = q('.bar .live .pill.ok')
      const intake = document.getElementById('intake')
      const swapChip = (html) => { const c = head.querySelector('.chip'); if (c) c.outerHTML = html }
      if (ST === 'conflict') {
        const r = [...document.querySelectorAll('#queue .r')].find((x) => x.textContent.includes('Կոմիտաս 12'))
        if (r) { r.classList.add('lost'); r.querySelector('.claimed').classList.add('info') }
        legend.classList.add('msg'); legend.setAttribute('role', 'status')
        legend.innerHTML = '<i data-lucide="refresh-cw"></i><span class="grow">Մեկ ուրիշ դիսպետչեր առաջինը վերցրեց</span><span class="kbd">Esc</span>'
      }
      if (ST === 'problems') {
        const p = q('.bar .live .pill.bad'); if (p) { p.setAttribute('aria-label', '4 խնդիր հերթում'); p.querySelector('.num').textContent = '4' }
        document.getElementById('qtabs').querySelector('.c').textContent = '15'
      }
      if (ST === 'degraded') {
        /* C14: the socket is down. Nothing turns red and nothing stops: the queue keeps coming from GET /rides every 5 s,
           and says how fresh it is. The top-bar pill changes word and colour (never colour alone). */
        if (live) { live.className = 'pill warn'; live.title = 'WebSocket անջատված է, հարցում ամեն 5 վրկ'; live.innerHTML = '<i data-lucide="refresh-cw"></i>Ուղիղ կապ չկա — հարցում' }
        swapChip('<span class="qstat amber" role="status"><i data-lucide="history"></i>թարմացվեց <span class="num">3</span> վրկ առաջ</span>')
        const mk = q('.mapkey'); if (mk) mk.insertAdjacentHTML('beforeend', '<span style="color:var(--warning)"><i style="background:var(--warn)"></i><b class="num">5</b> վրկ առաջ</span>')
      }
      if (ST === 'expired') {
        /* C51 part 1 (drawn ahead: today the 401 signs out and resets the intake draft). The session lapsed while
           Անի was on a call. No modal and no focus change: the queue freezes at its last read (queue.stale), the
           typed order stays, and the action bar becomes a re-sign-in strip. «Ստեղծել» waits for it. */
        if (live) { live.className = 'pill warn'; live.title = ''; live.innerHTML = '<i data-lucide="lock"></i>Սեսիան ավարտվեց' }
        swapChip('<span class="qstat amber" role="status" aria-label="Հերթը չթարմացվեց — ցույց է տրված վերջին տարբերակը"><i data-lucide="history"></i>չթարմացվեց · <span class="num">9:38</span></span>')
        const bar = q('.actbar')
        bar.outerHTML = `<div class="reauth" role="status" aria-label="Մուտք գործել կրկին">
          <span class="t"><i data-lucide="lock"></i>Սեսիան ավարտվեց · պատվերը պահված է</span>
          <div class="f"><div class="input"><span class="val ph">Գաղտնաբառ</span></div><div class="input"><span class="val ph mono">6 նիշ</span></div><button class="btn primary s">Մուտք գործել</button></div>
          <span class="sub">ani.davtyan@eco · մուտքից հետո «Ստեղծել պատվեր» ⏎</span></div>`
      }
      if (ST === 'quiet') {
        L('problems').rows = []; L('unassigned').rows = []; L('searching').rows = []
        L('active').rows = L('active').rows.slice(2, 4)
      }
      if (IN === 'reused') {
        /* C11: the order this call already made sits at the top of Unassigned, four seconds old. */
        L('unassigned').rows.unshift({ a: 'Կոմիտաս պողոտա 12, Արաբկիր', ph: '093 15-62-40', d: 'Հալաբյան 41', age: '00:04', sla: .02, acts: 'take', sel: 1 })
        L('problems').rows.forEach((r) => delete r.sel)
      }
    },
    after() {
      const q = (s) => document.querySelector(s)
      const head = q('.q .card-h .end')
      const legend = q('.legend')
      const live = q('.bar .live .pill.ok')
      const intake = document.getElementById('intake')
      const swapChip = (html) => { const c = head.querySelector('.chip'); if (c) c.outerHTML = html }
      if (ST === 'conflict') {
        const r = [...document.querySelectorAll('#queue .r')].find((x) => x.textContent.includes('Կոմիտաս 12'))
        if (r) { r.classList.add('lost'); r.querySelector('.claimed').classList.add('info') }
        legend.classList.add('msg'); legend.setAttribute('role', 'status')
        legend.innerHTML = '<i data-lucide="refresh-cw"></i><span class="grow">Մեկ ուրիշ դիսպետչեր առաջինը վերցրեց</span><span class="kbd">Esc</span>'
      }
      if (ST === 'problems') {
        const p = q('.bar .live .pill.bad'); if (p) { p.setAttribute('aria-label', '4 խնդիր հերթում'); p.querySelector('.num').textContent = '4' }
        document.getElementById('qtabs').querySelector('.c').textContent = '15'
      }
      if (ST === 'degraded') {
        /* C14: the socket is down. Nothing turns red and nothing stops: the queue keeps coming from GET /rides every 5 s,
           and says how fresh it is. The top-bar pill changes word and colour (never colour alone). */
        if (live) { live.className = 'pill warn'; live.title = 'WebSocket անջատված է, հարցում ամեն 5 վրկ'; live.innerHTML = '<i data-lucide="refresh-cw"></i>Ուղիղ կապ չկա — հարցում' }
        swapChip('<span class="qstat amber" role="status"><i data-lucide="history"></i>թարմացվեց <span class="num">3</span> վրկ առաջ</span>')
        const mk = q('.mapkey'); if (mk) mk.insertAdjacentHTML('beforeend', '<span style="color:var(--warning)"><i style="background:var(--warn)"></i><b class="num">5</b> վրկ առաջ</span>')
      }
      if (ST === 'expired') {
        /* C51 part 1 (drawn ahead: today the 401 signs out and resets the intake draft). The session lapsed while
           Անի was on a call. No modal and no focus change: the queue freezes at its last read (queue.stale), the
           typed order stays, and the action bar becomes a re-sign-in strip. «Ստեղծել» waits for it. */
        if (live) { live.className = 'pill warn'; live.title = ''; live.innerHTML = '<i data-lucide="lock"></i>Սեսիան ավարտվեց' }
        swapChip('<span class="qstat amber" role="status" aria-label="Հերթը չթարմացվեց — ցույց է տրված վերջին տարբերակը"><i data-lucide="history"></i>չթարմացվեց · <span class="num">9:38</span></span>')
        const bar = q('.actbar')
        bar.querySelector('.btn.primary').setAttribute('disabled', '')
        bar.querySelector('.btn.primary').style.opacity = '.55'
        bar.insertAdjacentHTML('beforebegin', `<div class="reauth" role="status" aria-label="Մուտք գործել կրկին">
          <span class="t"><i data-lucide="lock"></i>Սեսիան ավարտվեց · պատվերը պահված է</span>
          <div class="f"><div class="input"><span class="val ph">Գաղտնաբառ</span></div><div class="input"><span class="val ph mono">6 նիշ</span></div><button class="btn primary s">Մուտք գործել</button></div>
          <span class="sub">ani.davtyan@eco · մուտքից հետո պատվերը կստեղծվի ⏎-ով, ինչպես միշտ</span></div>`)
      }
      if (ST === 'quiet') {
        document.getElementById('clock').textContent = '03:12'
        document.getElementById('today').textContent = 'Շաբաթ'
        const Q = document.getElementById('queue')
        Q.querySelectorAll('.lane-h').forEach((h) => { const n = h.querySelector('.c'); if (n && n.textContent === '0') h.insertAdjacentHTML('afterend', '<div class="emptyl">Դատարկ է</div>') })
        Q.insertAdjacentHTML('beforeend', '<div class="quiet"><i data-lucide="moon" style="width:20px;height:20px;color:var(--ink-faint)"></i><b>Հերթը հանգիստ է</b><span>Վերջին պատվերը՝ <span class="mono">02:47</span> · հերթափոխում՝ 3 վարորդ</span><span class="faint">Նոր պատվերը կզանգի իր ձայնով</span></div>')
        document.getElementById('qtabs').querySelector('.c').textContent = '2'
        const p = q('.bar .live .pill.bad'); if (p) p.remove()
      }
      if (IN === 'blacklist') {
        /* C09: customer-card.tsx flags it first, as an alert, before any field (§9.1: the operator is already
           speaking). The ride can still be typed; the API refuses it at create with BlacklistNotice. Red: the real
           Notice tone is error (see c-ops-notes for the tone question). */
        const B = ECO.BLACKLIST
        intake.querySelector('.input.l .val.mono').textContent = B.phone
        intake.querySelector('.cust').outerHTML = `<div class="bl" role="alert"><i data-lucide="octagon-alert"></i><div>Այս հաճախորդը սև ցուցակում է: ${B.reason}
          <small>${B.name} · ավելացրել է ${B.by}, ${B.since} · <a href="customer.html?theme=${THEME}&state=blacklisted" style="color:var(--brand-text)">Հաճախորդի քարտ</a></small></div></div>`
      }
      if (IN === 'reused') {
        /* C11: Enter pressed again on a call whose order already went out (same idempotency key). Blue, at the head of
           the form, with both ways forward. */
        intake.insertAdjacentHTML('afterbegin', `<div class="notice blue" role="status"><i data-lucide="copy-check"></i><div class="grow">Այս զանգի պատվերը հավանաբար արդեն ստեղծվել է — ստուգեք հերթը <a href="rides.html?theme=${THEME}" style="color:inherit;font-weight:600">Բացել պատվերը</a>
          <div style="margin-top:6px"><button class="btn secondary s">Ստեղծել որպես նոր պատվեր</button></div></div></div>`)
      }
      if (IN === 'refusal') {
        /* C12: Enter with a short phone. The field takes focus and reads its message through aria-describedby (R17/R25);
           no alert. The pickup is free text that matched no place: allowed (§5.2, a §9.8 merge blocker otherwise),
           said in amber beside it — the ride is taken but nothing searches until it is placed. */
        const ph = intake.querySelector('.input.l')
        ph.classList.add('err', 'focus'); ph.setAttribute('aria-describedby', 'e-phone'); ph.setAttribute('aria-invalid', 'true')
        ph.querySelector('.val').innerHTML = '093 15-6<span style="border-left:1.5px solid var(--ink);margin-left:1px"></span>'
        ph.insertAdjacentHTML('afterend', '<p class="ferr" id="e-phone"><i data-lucide="circle-alert"></i>Մուտքագրեք զանգողի համարը, օր.՝ 091 23 45 67</p>')
        const pk = intake.querySelectorAll('.pinrow')[0]
        pk.querySelector('.input .val').textContent = 'Կոմիտասի վերջը, դեղատան դիմաց'
        const ok = pk.querySelector('.input [data-lucide="circle-check"], .input svg'); if (ok) ok.remove()
        pk.querySelector('.input').setAttribute('aria-describedby', 'h-pick')
        pk.insertAdjacentHTML('afterend', '<p class="fhint" id="h-pick" role="status"><i data-lucide="map-pin-off"></i>Վերցնելու հասցեն քարտեզի վրա չէ · պատվերը կընդունվի, ավտոմատ որոնում չի լինի</p>')
        const c = intake.querySelector('.cust'); if (c) c.remove()
      }
      if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
    },
  }
})()
