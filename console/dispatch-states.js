/* dispatch.html states (coverage C09, C11–C16, C51 part 1, owner decisions 2, 12–15 of 2026-10-14). Loaded in <head>
   after console.js; the page calls DX.lanes(lanes, acts) before it renders the queue and DX.after() at the end of its script.
   ?state=degraded       C14 socket down: the console polls GET /rides (REST is truth); snapshot on reconnect
   ?state=conflict       C15 claim race: another dispatcher took the row first (blue: the concurrency tone)
   ?state=problems       C13 the problem kinds beyond no-show / no drivers (low rating = 1–3 ★, 24 h follow-up)
   ?state=quiet          C16 a quiet night: empty lanes say so, nothing pretends to be busy
   ?state=expired        C51 session expired mid-call: re-login inline, the intake draft kept (drawn ahead)
   ?state=sos            owner #2: a rider pressed SOS on R-2417 at 9:47 — red strip over the whole work area, never a modal
   ?state=blacklist-info owner #12: the rider app refused a blacklisted rider — one quiet line in the queue footer
   ?intake=blacklist C09 (owner #13/#14: amber, no override) · ?intake=reused C11 · ?intake=refusal C12
   Strings: apps/operator lib/i18n.ts hy (live.*, queue.*, problem.*, intake.*, auth.login.*); new ones in cp-con-ops-copy. */
(function () {
  const QS = new URLSearchParams(location.search)
  const ST = QS.get('state'), IN = QS.get('intake')
  /* Shared facts the coordinator is adding to kit.js; the fallbacks keep the page drawable until they land. */
  const SOS = ECO.SOS || { ride: '2417', at: '9:47', from: 'rider', name: 'Աննա', phone: '091 23-45-67', driver: 'Արամ Պ.', plate: '01 ET 001', where: 'Մաշտոցի պող. 18', near: 'Մատենադարանից 300 մ' }
  const LOW = (ECO.DISPATCH && ECO.DISPATCH.lowRating) || { max: 3, followUpH: 24 }
  const css = `
    .qstat { display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 8px; border-radius: var(--r-pill); font: var(--c-label); white-space: nowrap; }
    .qstat svg { width: 14px; height: 14px; }
    .qstat.amber { background: var(--warning-surface); color: var(--warning); }
    .legend.msg { gap: 8px; color: var(--ink); background: var(--info-soft); font: var(--c-body); }
    .legend.msg svg { color: var(--info); width: 14px; height: 14px; flex: none; }
    .legend.msg .grow, .legend.note .grow { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
    .legend.note { gap: 8px; color: var(--ink); font: var(--c-body); }
    .legend.note svg { width: 16px; height: 16px; flex: none; color: var(--warning); }
    .legend.note a { color: var(--brand-text); font: var(--c-strong); text-decoration: none; }
    .legend.note .btn svg { color: var(--ink-faint); }
    .r.lost::after { content: ''; position: absolute; inset: 0; box-shadow: inset 0 0 0 1px var(--info); pointer-events: none; }
    @keyframes flash { 0% { background: var(--info-soft) } 100% { background: transparent } }
    .r.lost { animation: flash 1.6s ease-out 1; }
    .r .claimed.info { color: var(--info); font-weight: 500; }
    .r .due { margin-left: auto; display: inline-flex; align-items: center; gap: 4px; font: var(--c-small); color: var(--ink-muted); white-space: nowrap; }
    .r .due svg { width: 12px; height: 12px; }
    .emptyl { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 12px 0 16px; border-bottom: 1px solid var(--line-soft); font: var(--c-small); color: var(--ink-faint); }
    .quiet { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 28px 16px; text-align: center; font: var(--c-body); color: var(--ink-muted); }
    .quiet b { font: var(--c-head); color: var(--ink); }
    /* Blacklist (owner #13): amber and an octagon — a refusal, not a failure. */
    .bl { border-radius: var(--r-ctl); background: var(--warning-surface); color: var(--ink); padding: 8px 10px; display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 2px 8px; font: var(--c-body); box-shadow: inset 3px 0 0 var(--warning); }
    .bl svg { width: 16px; height: 16px; color: var(--warning); margin-top: 1px; }
    .bl b { font: var(--c-strong); color: var(--warning); }
    .bl span, .bl small { grid-column: 2; }
    .bl small { font: var(--c-small); color: var(--ink-muted); }
    .bl a { color: var(--brand-text); }
    .ferr { display: flex; gap: 6px; align-items: flex-start; font: var(--c-small); color: var(--danger-c); margin-top: 4px; }
    .ferr svg, .fhint svg { width: 14px; height: 14px; flex: none; margin-top: 1px; }
    .fhint { display: flex; gap: 6px; align-items: flex-start; font: var(--c-small); color: var(--warning); margin-top: 4px; }
    .reauth { display: flex; flex-direction: column; gap: 8px; padding: 10px var(--inset); border-top: 1px solid var(--line-soft); background: var(--warning-surface); flex: none; }
    .reauth .t { display: flex; align-items: center; gap: 6px; font: var(--c-strong); color: var(--warning); }
    .reauth .t svg { width: 16px; height: 16px; }
    .reauth .f { display: grid; grid-template-columns: minmax(0, 1fr) 88px auto; gap: 8px; align-items: center; }
    .reauth .sub { font: var(--c-small); color: var(--ink-muted); }
    /* SOS (owner #2). A full-width strip between the top bar and the work area: above every lane, beside nothing,
       covering nothing — the intake under it keeps its focus (§9.8: no modal steals focus mid-call). Red is right here:
       it is an emergency, not a refusal. Colour + one pulse on arrival + the SOS sound (repeats until resolved). */
    .main.has-sos { grid-template-rows: var(--h-bar) auto minmax(0, 1fr); }
    .sos { margin: 0 var(--gap) var(--gap) 0; display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 8px 8px 8px 12px; border-radius: var(--r-card); background: var(--danger-c); color: var(--danger-ink); }
    .sos .ic { position: relative; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--danger-ink); color: var(--danger-c); }
    .sos .ic svg { width: 18px; height: 18px; }
    .sos .ic::after { content: ''; position: absolute; inset: 0; border-radius: 50%; box-shadow: 0 0 0 0 var(--danger-ink); animation: sospulse 1.4s ease-out 1; }
    @keyframes sospulse { 0% { box-shadow: 0 0 0 0 var(--danger-ink); opacity: .9 } 100% { box-shadow: 0 0 0 14px var(--danger-ink); opacity: 0 } }
    .sos .t { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .sos .l1 { display: flex; align-items: center; gap: 8px; white-space: nowrap; font: var(--c-body); }
    .sos .l1 b { font: 600 15px/20px var(--font); }
    .sos .l2 { display: flex; align-items: center; gap: 6px; white-space: nowrap; font: var(--c-body); min-width: 0; overflow: hidden; }
    .sos .l2 svg, .sos .snd svg { width: 14px; height: 14px; flex: none; }
    .sos .l2 .plate { height: 20px; }
    .sos .l2 .near { opacity: .85; overflow: hidden; text-overflow: ellipsis; }
    .sos .snd { display: inline-flex; align-items: center; gap: 4px; font: var(--c-small); opacity: .85; }
    .sos .acts { display: flex; gap: 6px; }
    .sos .btn { height: var(--h-m); color: var(--danger-ink); background: transparent; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--danger-ink) 60%, transparent); }
    .sos .btn.go { background: var(--danger-ink); color: var(--danger-c); box-shadow: none; font-weight: 600; }
    .r.sos { --lane: var(--danger-c); background: var(--lane-problems-soft); }
    .r.sos .sostag { display: inline-flex; align-items: center; height: 20px; padding: 0 6px; border-radius: var(--r-tag); background: var(--danger-c); color: var(--danger-ink); font: 600 12px/16px var(--font); flex: none; }
    @keyframes rowflash { 0% { background: var(--danger-soft) } 100% { background: var(--lane-problems-soft) } }
    .r.sos { animation: rowflash 1.4s ease-out 1; }
    .mk-sos { position: relative; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--danger-c); color: var(--danger-ink); box-shadow: 0 0 0 3px var(--surface), var(--e2); font: 700 10px/1 var(--font); }
    .mk-sos::after { content: ''; position: absolute; inset: -3px; border-radius: 50%; animation: sospulse 1.4s ease-out 1; }
    @media (prefers-reduced-motion: reduce) { .r.lost, .r.sos, .sos .ic::after, .mk-sos::after { animation: none; } }
    @media (max-width: 1400px) { .sos .l2 .near, .sos .snd { display: none; } }`
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`)

  window.DX = {
    lanes(lanes, acts) {
      const L = (k) => lanes.find((l) => l.k === k)
      if (ST === 'problems') {
        /* C13: §9.2's problem kinds. Real kinds: ack_window_lapsed, passenger_not_found. Drawn ahead: a driver's cancel
           with its reason, a low rating (1–LOW.max ★, follow-up within LOW.followUpH h; owner #15, threshold in
           Settings → Dispatch), and the driver's «Չեմ հասցնի» request surfacing in the Now tab when its booking is today.
           Վահե Ս. is blocked since 05.10 (ECO.DOCS.blocked), so the cancelling driver here is Էդգար Պ. */
        L('problems').rows = [
          { a: 'Պուշկինի 15', ph: '093 60-12-48', why: 'Վարորդը չեղարկեց · «Մեքենան անսարք է» · Էդգար Պ.', age: '01:18', late: 1, acts: 'dcancel', sel: 1 },
          { a: 'Հյուսիսային պող. 1', ph: '055 20-44-19', why: 'Վարորդը չհաստատեց · Գագիկ Ա. · 30 վրկ', age: '00:47', late: 1, acts: 'ack' },
          { a: ECO.BOOKINGS.kom.pickup, ph: ECO.BOOKINGS.kom.phone, why: `Վարորդը չի հասցնի · ${ECO.BOOKINGS.kom.driver.short} · նախնական ${ECO.BOOKINGS.kom.time}`, age: '00:22', acts: 'cant' },
          { a: 'Արշակունյաց 2', ph: '096 14-02-71', why: `Ցածր գնահատական (1–${LOW.max} ★) · «Կոպիտ էր» · Տիգրան Ա.`, pre: '★ 2', age: '2 ժ', acts: 'rating' },
        ]
        Object.assign(acts, {
          dcancel: '<button class="btn secondary xs">Նշանակել <span class="kbd">A</span></button><button class="btn secondary xs">Ուղարկել որոնման</button><button class="btn ghost xs icon" aria-label="Զանգել ուղևորին"><i data-lucide="phone"></i></button>',
          ack: '<button class="btn secondary xs">Նշանակել ուրիշին <span class="kbd">A</span></button><button class="btn secondary xs">Փոխել վիճակը…</button><button class="btn ghost xs icon" aria-label="Զանգել վարորդին"><i data-lucide="phone"></i></button>',
          cant: '<button class="btn secondary xs">Ազատել</button><button class="btn secondary xs">Վերանշանակել <span class="kbd">A</span></button><button class="btn ghost xs icon" aria-label="Զանգել վարորդին"><i data-lucide="phone"></i></button>',
          rating: `<button class="btn secondary xs">Բացել պատվերը</button><button class="btn ghost xs">Լուծված է</button><button class="btn ghost xs icon" aria-label="Զանգել ուղևորին"><i data-lucide="phone"></i></button><span class="due" title="Ցածր գնահատականին պատասխանել ${LOW.followUpH} ժամվա ընթացքում"><i data-lucide="clock"></i>պատասխանել <span class="mono">${LOW.followUpH - 2}</span> ժ-ում</span>`,
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
      if (ST === 'sos') {
        /* 9:47: R-2417 is under way (picked up 9:45), so it has left Searching for Active, at the top, red-spined. */
        L('searching').rows = L('searching').rows.filter((r) => !r.walk)
        L('problems').rows.forEach((r) => delete r.sel)
        L('active').rows.unshift({ a: ECO.RIDE.pickup, ph: ECO.RIDE.rider.phone, st: 'Ուղևորի հետ', drv: SOS.driver, pl: SOS.plate, age: '02:04', sos: 1 })
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
        legend.innerHTML = '<i data-lucide="refresh-cw"></i><span class="grow">Սոնա Ա.-ն արդեն վերցրել է այս պատվերը</span><span class="kbd">Esc</span>'
      }
      if (ST === 'problems') {
        const p = q('.bar .live .pill.bad'); if (p) { p.setAttribute('aria-label', '4 խնդիր հերթում'); p.querySelector('.num').textContent = '4' }
        document.getElementById('qtabs').querySelector('.c').textContent = '15'
        const r = [...document.querySelectorAll('#queue .r')].find((x) => x.textContent.includes('Արշակունյաց 2'))
        const tag = r && r.querySelector('.tag'); if (tag) tag.setAttribute('aria-label', 'Գնահատական՝ 2 աստղ')
      }
      if (ST === 'degraded') {
        /* C14: the socket is down. Nothing turns red and nothing stops: the queue keeps coming from GET /rides every 5 s,
           and says how fresh it is. The top-bar pill changes word and colour (never colour alone). */
        if (live) { live.className = 'pill warn'; live.title = 'Ուղիղ կապ չկա · հերթը թարմացվում է 5 վրկ-ը մեկ'; live.innerHTML = '<i data-lucide="refresh-cw"></i>Կապ չկա · 5 վրկ' }
        swapChip('<span class="qstat amber" role="status"><i data-lucide="history"></i>թարմացվեց <span class="num">3</span> վրկ առաջ</span>')
        const mk = q('.mapkey'); if (mk) mk.insertAdjacentHTML('beforeend', '<span style="color:var(--warning)"><i style="background:var(--warn)"></i><b class="num">5</b> վրկ առաջ</span>')
      }
      if (ST === 'expired') {
        /* C51 part 1 (drawn ahead: today the 401 signs out and resets the intake draft). The sign-in lapsed while Անի was
           on a call. No modal and no focus change: the queue freezes at its last read (queue.stale), the typed order
           stays, and a re-sign-in strip sits above the action bar. «Ստեղծել պատվեր» waits for it. */
        if (live) { live.className = 'pill warn'; live.title = ''; live.innerHTML = '<i data-lucide="lock"></i>Մուտքը լրացել է' }
        swapChip('<span class="qstat amber" role="status" aria-label="Հերթը չի թարմանում · վերջին տվյալները՝ 9:38"><i data-lucide="history"></i>վերջինը՝ <span class="num">9:38</span></span>')
        const bar = q('.actbar')
        bar.querySelector('.btn.primary').setAttribute('disabled', '')
        bar.querySelector('.btn.primary').style.opacity = '.55'
        bar.insertAdjacentHTML('beforebegin', `<div class="reauth" role="status" aria-label="Կրկին մուտք գործել">
          <span class="t"><i data-lucide="lock"></i>Մուտքը լրացել է · պատվերը պահված է</span>
          <div class="f"><div class="input"><span class="val ph">Գաղտնաբառ</span></div><div class="input" aria-label="Հաստատման կոդ"><span class="val ph mono">6 նիշ</span></div><button class="btn primary s">Մուտք գործել</button></div>
          <span class="sub">${ECO.OPERATORS[0].email} · մուտքից հետո՝ ⏎ ստեղծել պատվերը</span></div>`)
      }
      if (ST === 'quiet') {
        document.getElementById('clock').textContent = '03:12'
        document.getElementById('today').textContent = 'Շաբաթ'
        const Q = document.getElementById('queue')
        Q.querySelectorAll('.lane-h').forEach((h) => { const n = h.querySelector('.c'); if (n && n.textContent === '0') h.insertAdjacentHTML('afterend', '<div class="emptyl">Դատարկ է</div>') })
        Q.insertAdjacentHTML('beforeend', '<div class="quiet"><i data-lucide="moon" style="width:20px;height:20px;color:var(--ink-faint)"></i><b>Հերթը հանգիստ է</b><span>Վերջին պատվերը՝ <span class="mono">02:47</span> · հերթափոխում՝ 3 վարորդ</span><span class="faint">Նոր պատվերը կհնչի իր ձայնով</span></div>')
        document.getElementById('qtabs').querySelector('.c').textContent = '2'
        const p = q('.bar .live .pill.bad'); if (p) p.remove()
      }
      if (ST === 'sos') {
        /* Owner #2. The strip spans the work area under the top bar; the dispatcher must press «Լուծված է» (it does not
           time out). Location is live from the driver's phone (the ride's track). */
        document.getElementById('clock').textContent = SOS.at
        const main = q('.main'); main.classList.add('has-sos')
        q('.bar').insertAdjacentHTML('afterend', `<section class="sos" role="alert" aria-label="SOS · ${SOS.name}">
          <span class="ic" aria-hidden="true"><i data-lucide="siren"></i></span>
          <div class="t"><span class="l1"><b>SOS · ${SOS.name}</b><span>ուղևորը սեղմեց SOS · <span class="mono">${SOS.at}</span></span><span class="snd" title="SOS ձայնը կրկնվում է մինչև «Լուծված է»"><i data-lucide="volume-2"></i>ձայնը կրկնվում է</span></span>
            <span class="l2"><span class="mono">#R-${SOS.ride}</span>·<i data-lucide="car"></i>${SOS.driver}<span class="plate">${SOS.plate}</span>·<i data-lucide="map-pin"></i><b>${SOS.where}</b><span class="near">· ${SOS.near} · ուղիղ</span></span></div>
          <div class="acts"><button class="btn s"><i data-lucide="phone"></i>Զանգել ուղևորին</button><button class="btn s"><i data-lucide="phone"></i>Զանգել վարորդին</button><button class="btn s go"><i data-lucide="check"></i>Լուծված է</button></div></section>`)
        const r = [...document.querySelectorAll('#queue .r')].find((x) => x.textContent.includes(SOS.plate))
        if (r) { r.classList.add('sos', 'sel'); r.querySelector('.m .trunc').insertAdjacentHTML('beforebegin', '<span class="sostag">SOS</span>') }
        const p = q('.bar .live .pill.bad'); if (p) { p.innerHTML = '<i data-lucide="siren"></i>SOS · <span class="num">1</span>'; p.setAttribute('aria-label', 'SOS · 1') }
        /* The pin: the car on its route, a third of the way to Կոմիտասի պող. 22 at 9:47. */
        if (window.htmlMarker && typeof map !== 'undefined') {
          const P = ROUTES.pickupToDrop.pts, at = P[Math.round(P.length * 0.33)]
          htmlMarker(map, at, '<div class="mk-sos" role="img" aria-label="SOS · ' + SOS.where + '">SOS</div>', [28, 28])
        }
      }
      if (ST === 'blacklist-info') {
        /* Owner #12: information, not a decision — no badge, no ring. One line in the queue's footer slot (it costs no
           row), amber octagon (owner #13), dismissible; the same item stays in Requests → «Տեղեկություն». */
        const B = ECO.BLACKLIST
        legend.classList.add('note'); legend.setAttribute('role', 'status')
        legend.innerHTML = `<i data-lucide="octagon-alert"></i><span class="grow">Սև ցուցակ · <b>${B.name}</b> <span class="mono">${B.phone}</span> · հավելվածը մերժեց <span class="mono">${B.refusedAt}</span></span>
          <a href="customer.html?theme=${THEME}&state=blacklisted">Քարտ</a><button class="btn ghost icon s" aria-label="Փակել"><i data-lucide="x"></i></button>`
      }
      if (IN === 'blacklist') {
        /* C09 (owner #13/#14): customer-card.tsx flags it first, before any field (§9.1: the operator is already speaking).
           Amber, octagon. No override: «Ստեղծել պատվեր» is off and says why; the way forward is ending the call. */
        const B = ECO.BLACKLIST
        intake.querySelector('.input.l .val.mono').textContent = B.phone
        intake.querySelector('.cust').outerHTML = `<div class="bl" role="alert" id="bl-note"><i data-lucide="octagon-alert"></i><b>Սև ցուցակ · պատվերը չի ընդունվի</b>
          <span>${B.reason}</span><small>${B.name} · ավելացրել է ${B.by}, ${B.since} · <a href="customer.html?theme=${THEME}&state=blacklisted">Ուղևորի քարտ</a></small></div>`
        const bar = q('.actbar'), go = bar.querySelector('.btn.primary')
        go.setAttribute('disabled', ''); go.setAttribute('aria-describedby', 'bl-note'); go.style.opacity = '.55'
        bar.querySelector('.sum').innerHTML = '<b style="color:var(--warning)">Պատվեր չի ստեղծվի</b><span>Ավարտեք զանգը</span>'
      }
      if (IN === 'reused') {
        /* C11: Enter pressed again on a call whose order already went out (same idempotency key). Blue, at the head of
           the form, with both ways forward. */
        intake.insertAdjacentHTML('afterbegin', `<div class="notice blue" role="status"><i data-lucide="copy-check"></i><div class="grow">Այս զանգի պատվերն արդեն ստեղծված է · <span class="mono">4</span> վրկ առաջ
          <div style="margin-top:6px;display:flex;gap:6px"><a class="btn secondary s" href="rides.html?theme=${THEME}" style="text-decoration:none">Բացել պատվերը</a><button class="btn ghost s">Ստեղծել նորը</button></div></div></div>`)
      }
      if (IN === 'refusal') {
        /* C12: Enter with a short phone. The field takes focus and reads its message through aria-describedby (R17/R25);
           no alert. The pickup is free text that matched no place: allowed (§5.2, a §9.8 merge blocker otherwise),
           said in amber beside it — the ride is taken but nothing searches until it is placed. */
        const ph = intake.querySelector('.input.l')
        ph.classList.add('err', 'focus'); ph.setAttribute('aria-describedby', 'e-phone'); ph.setAttribute('aria-invalid', 'true')
        ph.querySelector('.val').innerHTML = '093 15-6<span style="border-left:1.5px solid var(--ink);margin-left:1px"></span>'
        ph.insertAdjacentHTML('afterend', '<p class="ferr" id="e-phone"><i data-lucide="circle-alert"></i>Համարը կարճ է · օր. 091 23 45 67</p>')
        const pk = intake.querySelectorAll('.pinrow')[0]
        pk.querySelector('.input .val').textContent = 'Կոմիտասի վերջը, դեղատան դիմաց'
        const ok = pk.querySelector('.input [data-lucide="circle-check"], .input svg'); if (ok) ok.remove()
        pk.querySelector('.input').setAttribute('aria-describedby', 'h-pick')
        pk.insertAdjacentHTML('afterend', '<p class="fhint" id="h-pick" role="status"><i data-lucide="map-pin-off"></i>Հասցեն քարտեզում չգտնվեց · պատվերը կընդունվի, վարորդին նշանակեք ձեռքով</p>')
        const c = intake.querySelector('.cust'); if (c) c.remove()
      }
      if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
    },
  }
})()
