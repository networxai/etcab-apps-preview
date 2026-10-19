/* dispatch.html states (coverage C09, C11–C16, C51 part 1, owner decisions 2, 12–15 of 2026-10-14). Loaded in <head>
   after console.js; the page calls DX.lanes(lanes, acts) before it renders the queue and DX.after() at the end of its script.
   ?state=degraded       C14 socket down: the console polls GET /rides (REST is truth); snapshot on reconnect
   ?state=conflict       C15 claim race: another dispatcher took the row first (blue: the concurrency tone)
   ?state=problems       C13 the problem kinds beyond no-show / no drivers (low rating = 1–3 ★, 24 h follow-up)
   ?state=claiming       C15 before the answer: T pressed, the row reads «Դուք» with a pending dot until 200 («Իմը») or 409 (the conflict line)
   ?state=quiet          C16 a quiet night: empty lanes say so, nothing pretends to be busy
   ?state=expired        C51 session expired mid-call: re-login inline, the intake draft kept (drawn ahead)
   ?state=sos            owner #2: a rider pressed SOS on R-2417 at 9:47 — red strip over the whole work area, never a modal
   ?state=blacklist-info owner #12: the rider app refused a blacklisted rider — one quiet line in the queue footer
   Team review 2026-10-16 (C1–C7, D1, D3): ?intake=booking (a pre-order is New order with a future «Երբ»; &picker=1 opens the calendar)
   ?intake=pay (Cash · NFC · Company, no card) · ?intake=airport (Cash · NFC · Company allowed to the dispatcher) · ?intake=driver / driver-set (C4 driver picker)
   ?panel=edit|driver|changed|card|pay (C5 edit side panel over the map column, never a modal; D3 «Կանխիկ → NFC» record) · ?free=search|none (C6) · ?map=hover (C7; real hover / focus on every car)
   ?intake=blacklist C09 (owner #13/#14: amber, no override) · ?intake=reused C11 · ?intake=refusal C12 · ?intake=phone Postel: a pasted +374 number read back normalised
   Strings: apps/operator lib/i18n.ts hy (live.*, queue.*, problem.*, intake.*, auth.login.*); new ones in cp-con-ops-copy. */
(function () {
  const QS = new URLSearchParams(location.search)
  const ST = QS.get('state'), IN = QS.get('intake'), PN = QS.get('panel')
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
    .pdot { width: 8px; height: 8px; border-radius: 50%; background: var(--ink-muted); animation: pdot 1s ease-in-out infinite alternate; flex: none; }
    @keyframes pdot { from { opacity: .25 } to { opacity: 1 } }
    .sos .rid { color: inherit; font: 500 14px/20px var(--mono); text-decoration: underline; text-underline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .pdot { animation: none; } }
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
    /* section.sos, not .sos: the row carries .sos too, and the strip's white ink made its address and age vanish. */
    section.sos { margin: 0 var(--gap) var(--gap) 0; display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 8px 8px 8px 12px; border-radius: var(--r-card); background: var(--danger-c); color: var(--danger-ink); }
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
    .sos .snd { display: inline-flex; align-items: center; gap: 4px; font: var(--c-small); } /* full ink: 12px at .85 was 6.73:1 in dark */
    .sos .acts { display: flex; gap: 6px; }
    .sos .btn { height: var(--h-m); color: var(--danger-ink); background: transparent; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--danger-ink) 60%, transparent); }
    .sos .btn.go { background: var(--danger-ink); color: var(--danger-c); box-shadow: none; font-weight: 600; }
    .r.sos { --lane: var(--danger-c); background: var(--lane-problems-soft); }
    .r.sos .sostag { display: inline-flex; align-items: center; height: 20px; padding: 0 6px; border-radius: var(--r-tag); background: var(--danger-c); color: var(--danger-ink); font: 600 12px/16px var(--font); flex: none; }
    @keyframes rowflash { 0% { background: var(--danger-soft) } 100% { background: var(--lane-problems-soft) } }
    .r.sos { animation: rowflash 1.4s ease-out 1; }
    .mk-sos { position: relative; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--danger-c); color: var(--danger-ink); box-shadow: 0 0 0 3px var(--surface), var(--e2); font: 700 10px/1 var(--font); }
    .mk-sos::after { content: ''; position: absolute; inset: 0; border-radius: 50%; animation: sospulse 1.4s ease-out 1; }
    @media (prefers-reduced-motion: reduce) { .r.lost, .r.sos, .sos .ic::after, .mk-sos::after { animation: none; } }
    @media (max-width: 1400px) { .sos .l2 .near, .sos .snd { display: none; } }`
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`)

  window.DX = {
    lanes(lanes, acts) {
      const L = (k) => lanes.find((l) => l.k === k)
      if (ST === 'problems') {
        /* C13: §9.2's problem kinds. Real kinds: ack_window_lapsed, passenger_not_found. Drawn ahead: a driver's cancel
           with its reason, a low rating (1–LOW.max ★, follow-up within LOW.followUpH h; owner #15, threshold in
           Settings → Dispatch), and no «Չեմ հասցնի» kind: a driver cannot refuse a pre-order, the dispatcher handles it (team review 2026-10-16, D1).
           Վահե Ս. is blocked since 05.10 (ECO.DOCS.blocked), so the cancelling driver here is Էդգար Պ. */
        L('problems').rows = [
          { a: 'Պուշկինի 15', ph: '093 60-12-48', why: 'Վարորդը չեղարկեց · «Մեքենան անսարք է» · Էդգար Պ.', age: '01:18', late: 1, acts: 'dcancel', sel: 1 },
          { a: 'Հյուսիսային պող. 1', ph: '055 20-44-19', why: 'Վարորդը չհաստատեց · Գագիկ Ա. · 30 վրկ', age: '00:47', late: 1, acts: 'ack' },
          { a: 'Արշակունյաց 2', ph: '096 14-02-71', why: `Ցածր գնահատական · «Կոպիտ էր» · Տիգրան Ա.`, pre: '★ 2', age: '2 ժ', acts: 'rating' },
        ]
        Object.assign(acts, {
          dcancel: '<button class="btn secondary xs">Նշանակել <span class="kbd">A</span></button><button class="btn secondary xs">Ուղարկել որոնման</button><button class="btn ghost xs icon" aria-label="Զանգել ուղևորին"><i data-lucide="phone"></i></button>',
          ack: '<button class="btn secondary xs">Նշանակել ուրիշին <span class="kbd">A</span></button><button class="btn secondary xs">Փոխել վիճակը…</button><button class="btn ghost xs icon" aria-label="Զանգել վարորդին"><i data-lucide="phone"></i></button>',
          rating: `<button class="btn secondary xs">Բացել պատվերը</button><button class="btn ghost xs">Լուծված է</button><button class="btn ghost xs icon" aria-label="Զանգել ուղևորին"><i data-lucide="phone"></i></button><span class="due" title="Ցածր գնահատականին պատասխանել ${LOW.followUpH} ժամվա ընթացքում"><i data-lucide="clock"></i>պատասխանել <span class="mono">${LOW.followUpH - 2}</span> ժ-ում</span>`,
        })
      }
      if (ST === 'conflict') {
        /* C15: this operator pressed T on Կոմիտաս 12 a beat after Սոնա Ա. — the row now shows her claim, outlined in
           blue for a moment; the sentence takes the legend's place (no row moves, no modal). */
        const u = L('unassigned').rows[0]
        delete u.acts; u.claimed = 'Սոնա Ա.'; u.lost = 1
      }
      if (ST === 'claiming') {
        /* Doherty: the claim is optimistic. «Դուք» + a pending dot for the round-trip; «Իմը» replaces it on 200, the
           blue conflict line (state=conflict) on 409. */
        const u = L('unassigned').rows[0]
        delete u.acts; u.claimed = 'Դուք'; u.claiming = 1
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
      if (PN) {
        /* The ride the edit panel is open on is the selected row; the problem row that is selected by default lets go. */
        L('problems').rows.forEach((r) => delete r.sel)
        if (PN === 'card') L('searching').rows[1].sel = 1
        if (PN === 'pay') {
          /* D3: a fleet driver switched the ride Cash → NFC at Complete (§10.2 end step), so the row is on its last step. */
          const r = L('active').rows[2]; r.sel = 1; r.st = 'Ավարտման քայլում'; r.sw = '→ NFC · 9:38'
        }
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
        legend.innerHTML = '<i data-lucide="refresh-cw"></i><span class="grow" data-truncate>Սոնա Ա.-ն արդեն վերցրել է այս պատվերը</span><span class="kbd">Esc</span>'
      }
      if (ST === 'claiming') {
        const r = [...document.querySelectorAll('#queue .r')].find((x) => x.textContent.includes('Կոմիտաս 12'))
        const c = r && r.querySelector('.claimed')
        if (c) { c.setAttribute('aria-busy', 'true'); c.querySelector('svg, i').outerHTML = '<span class="pdot" aria-hidden="true"></span>' }
      }
      if (ST === 'problems') {
        const p = q('.bar .live .pill.bad'); if (p) { p.setAttribute('aria-label', '3 խնդիր հերթում'); p.querySelector('.num').textContent = '3' }
        document.getElementById('qtabs').querySelector('.c').textContent = '14'
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
            <span class="l2"><a class="rid" href="#" id="sos-open">#R-${SOS.ride}</a>·<i data-lucide="car"></i>${SOS.driver}<span class="plate">${SOS.plate}</span>·<i data-lucide="map-pin"></i><b>${SOS.where}</b><span class="near" data-truncate>· ${SOS.near} · ուղիղ</span></span></div>
          <div class="acts"><button class="btn s"><i data-lucide="phone"></i>Զանգել ուղևորին</button><button class="btn s"><i data-lucide="phone"></i>Զանգել վարորդին</button><button class="btn s go"><i data-lucide="check"></i>Լուծված է</button></div></section>`)
        const r = [...document.querySelectorAll('#queue .r')].find((x) => x.textContent.includes(SOS.plate))
        document.getElementById('sos-open').addEventListener('click', (e) => { e.preventDefault(); if (r) { r.scrollIntoView({ block: 'nearest' }); r.focus() } })
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
        legend.innerHTML = `<i data-lucide="octagon-alert"></i><span class="grow" data-truncate>Սև ցուցակ · <span class="mono">${B.phone}</span> · մերժվեց <span class="mono">${B.refusedAt}</span></span>
          <a href="customer.html?theme=${THEME}&state=blacklisted" aria-label="${B.name}-ի քարտը">Քարտ</a><button class="btn ghost icon s" aria-label="Փակել"><i data-lucide="x"></i></button>`
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
        bar.querySelector('.sum').innerHTML = '<b style="color:var(--warning);font:var(--c-strong)">Պատվեր չի ստեղծվի</b><span>Ավարտեք զանգը</span>'
      }
      if (IN === 'reused') {
        /* C11: Enter pressed again on a call whose order already went out (same idempotency key). Blue, at the head of
           the form, with both ways forward. */
        intake.insertAdjacentHTML('afterbegin', `<div class="notice blue" role="status"><i data-lucide="copy-check"></i><div class="grow">Այս զանգի պատվերն արդեն ստեղծված է · <span class="mono">4</span> վրկ առաջ
          <div style="margin-top:6px;display:flex;gap:6px"><a class="btn secondary s" href="rides.html?theme=${THEME}" style="text-decoration:none">Բացել պատվերը</a><button class="btn ghost s">Ստեղծել նորը</button></div></div></div>`)
      }
      if (IN === 'phone') {
        /* Postel: +374 / 374 / 8 digits / spaces are all accepted; the field reads back what it will store. */
        const ph = intake.querySelector('.input.l')
        ph.setAttribute('aria-describedby', 'h-phone')
        ph.querySelector('.val').innerHTML = '+374 93 15 62 40'
        ph.insertAdjacentHTML('afterend', '<p class="fhint" id="h-phone" role="status" style="color:var(--ink-muted)"><i data-lucide="check" style="color:var(--ok)"></i>Ընդունվեց՝ <span class="mono">093 15-62-40</span></p>')
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
      /* ── Team review 2026-10-16 ─────────────────────────────────────────────────────────────────────────────────── */
      const short = (d) => { const p = d.name.split(' '); return `${p[0]} ${p[1][0]}.` }
      const idleOf = { 0: '14 ր', 1: '9 ր', 11: '1 ր' }
      const onShift = ['2 ժ 05 ր', '4 ժ 40 ր', '1 ժ 12 ր', '5 ժ 02 ր', '3 ժ 18 ր', '', '2 ժ 51 ր', '6 ժ 10 ր', '0 ժ 48 ր', '3 ժ 36 ր', '1 ժ 30 ր', '4 ժ 02 ր']
      const pickTier = (d) => tierById(d.tier)
      /* C4 — the driver picker. Search by name or plate; only drivers who fit: on shift, the order's tariff, and fleet-only
         when the payment is NFC · POS (partners have no ACBA app). A driver who does not fit stays listed, off, with the
         reason, so "why isn't X here" is answered on the spot. The chosen driver gets the offer first (the normal offer,
         20 s); if he declines or lets it lapse, dispatch searches automatically among the tariff's drivers (owner Q1). */
      const dpick = ({ nfc, tier, cur, q }) => {
        const rows = DRIVERS.filter((d) => d.tier === tier && (d.state === 'free' || d.state === 'ride')).map((d) => {
          const why = d.state === 'ride' ? 'Պատվերով' : nfc && d.type !== 'fleet' ? 'գործընկեր · առանց NFC' : ''
          return { d, why }
        }).sort((a, b) => !a.why - !b.why)
        return `<div class="dpick" role="listbox" aria-label="Վարորդ" data-overlay data-truncate>
          <div class="input focus" role="search"><i data-lucide="search"></i><span class="val${q ? '' : ' ph'}">${q || 'Անուն կամ համար'}</span><span class="kbd">↑↓</span></div>
          ${rows.map(({ d, why }) => `<div role="option" aria-selected="${cur === d.plate}"${why ? ' aria-disabled="true"' : ''} class="${why ? 'off' : cur === d.plate ? 'on' : ''}"><span class="nm">${short(d)}</span><span class="plate">${d.plate}</span><span class="end">${why || `ազատ ${idleOf[DRIVERS.indexOf(d)] || '3 ր'}`}</span></div>`).join('')}
          <p><i data-lucide="info"></i>Միայն հերթափոխում, ${tierById(tier).name}${nfc ? ' · NFC-ի համար՝ ավտոպարկի մեքենա' : ''}</p></div>`
      }
      const setPay = (html) => { const two = intake.querySelector('.two'); if (two) two.children[1].querySelector('.input').innerHTML = html }
      const NFC_IN = '<i data-lucide="smartphone-nfc"></i><span class="val">NFC · POS</span><i data-lucide="chevron-down"></i>'
      const drvf = document.getElementById('drvf')
      /* NFC carries the 2 % fee (owner 2026-10-15), so the read-back is fare + fee, as in ?intake=pay. */
      const nfcSum = () => {
        const f0 = +q('#sumfare').textContent.replace(/\D/g, ''), fee = Math.round(f0 * 0.02), nf2 = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
        q('#sumfare').textContent = nf2(f0 + fee) + '\u00a0֏'
        q('.actbar .sum span').textContent = 'NFC · 2 % · +' + nf2(fee)
      }
      if (IN === 'driver' && drvf) {
        setPay(NFC_IN)
        drvf.parentElement.insertAdjacentHTML('beforeend', dpick({ nfc: 1, tier: 'city' }))
        drvf.outerHTML = ''
        nfcSum()
      }
      if (IN === 'driver-set' && drvf) {
        setPay(NFC_IN)
        const d = DRIVERS[0]
        drvf.innerHTML = `<i data-lucide="user-check"></i><span class="val">${short(d)} <span class="plate">${d.plate}</span></span><button class="btn ghost xs" aria-label="Հանել վարորդին">Հանել</button>`
        drvf.insertAdjacentHTML('afterend', `<p class="zline" style="margin:6px 0 0" role="status"><i data-lucide="info"></i>Առաջարկը նախ ${short(d)}-ին · եթե մերժի՝ ավտոմատ որոնում</p>`)
        nfcSum()
      }
      /* C1 — a pre-order is New order with a future «Երբ» (the lane no longer carries a form of its own). */
      if (IN === 'booking') {
        const two = intake.querySelector('.two'), w = two.children[0].querySelector('.input')
        w.classList.add('focus'); w.innerHTML = '<i data-lucide="calendar"></i><span class="val mono">10.10 08:30</span><button class="btn ghost icon s" aria-label="Մաքրել"><i data-lucide="x"></i></button>'
        let h = '<p class="zline" style="margin:6px 0 0" role="status"><i data-lucide="calendar-clock"></i>Նստեցում՝ <span class="mono">Շբթ, 10 հոկտ., 08:30</span> · կհայտնվի «Նախնական» ներդիրում</p>'
        if (QS.get('picker')) {
          let g = ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ', 'Կիր'].map((x) => `<span class="wd">${x}</span>`).join('') + '<span></span><span></span><span></span>'
          for (let n = 1; n <= 31; n++) g += `<span class="d${n < 9 ? ' past' : ''}${n === 9 ? ' today' : ''}${n === 10 ? ' on' : ''}">${n}</span>`
          h = `<div class="dtp flow" data-overlay role="dialog" aria-label="Օրացույց"><div class="mh"><button class="btn ghost icon s" aria-label="Նախորդ ամիս"><i data-lucide="chevron-left"></i></button><span>Հոկտեմբեր 2026</span><button class="btn ghost icon s" aria-label="Հաջորդ ամիս"><i data-lucide="chevron-right"></i></button></div>
            <div class="grid7">${g}</div><div class="quick"><span class="chip">+30 ր</span><span class="chip">Մեկ ժամից</span><span class="chip">Վաղն առավոտյան</span></div><div class="ft">⏎ հաստատել · Esc փակել</div></div>`
        }
        two.insertAdjacentHTML('afterend', h)
        q('#sumtxt').textContent = 'Eco City · 10.10 08:30'
      }
      /* D3 — a fleet driver's Cash → NFC switch, on the row where dispatch shows payment. */
      const swRow = [...document.querySelectorAll('#queue .r')].find((x) => x.textContent.includes('Ավարտման քայլում'))
      if (swRow) swRow.querySelector('.m').insertAdjacentHTML('beforeend', '<span class="tag sw" title="Կանխիկ → NFC · վարորդը · 9:38" aria-label="Կանխիկ → NFC · վարորդը · 9:38"><i data-lucide="smartphone-nfc"></i>→ NFC · <span class="mono">9:38</span></span>')

      /* C5 — edit a ride from Dispatch: a side panel over the map column (the intake keeps its draft and focus), never a
         modal. A concurrent change shows the blue «this changed, reload» line (409 is not an error). Pickup is locked once a
         driver is under way; the app-booked payment (card) is shown read-only — the dispatcher can't change what the rider paid with. */
      if (PN) {
        const B = ECO.BOOKINGS.air, mapCard = document.getElementById('map').closest('.card')
        const inp = (ic, v, o = {}) => `<div class="input${o.ro ? ' ro' : ''}"${o.ro ? ' aria-readonly="true"' : ''}>${ic ? `<i data-lucide="${ic}"></i>` : ''}<span class="val${o.mono ? ' mono' : ''}">${v}</span>${o.ro ? '<i data-lucide="lock"></i>' : o.dd ? '<i data-lucide="chevron-down"></i>' : ''}</div>`
        const fld = (l, h) => `<div><label class="label">${l}</label>${h}</div>`
        const seg = (on) => `<div class="seg" role="radiogroup" aria-label="Վճարում">${['Կանխիկ', 'NFC · +2 %', 'Ընկերություն'].map((t, i) => `<button role="radio" aria-checked="${i === on}"${i === on ? ' class="on"' : ''}>${t}</button>`).join('')}</div>`
        const cur = DRIVERS[1]
        const P = {
          edit: { id: 'B-0912', body: [fld('Հեռախոս', inp('phone', B.phone, { mono: 1, ro: 1 })), fld('Որտեղից', inp('', B.pickup)), fld('Ուր', inp('', B.drop)),
            `<div class="two">${fld('Երբ', inp('calendar', 'Շբթ 10.10 ' + B.time, { mono: 1 }))}${fld('Սակագին', inp('', B.tier, { dd: 1 }))}</div>`,
            fld('Վճարում', seg(0)),
            PN === 'driver' ? fld('Վարորդ', dpick({ tier: 'city', cur: cur.plate })) : fld('Վարորդ', `<div class="input"><i data-lucide="user-check"></i><span class="val">${short(cur)} <span class="plate">${cur.plate}</span></span><button class="btn secondary xs">Փոխել</button></div>`),
            fld('Նշում', '<div class="input"><span class="val ph">օր. Զանգել հասնելիս</span></div>')], ft: ['Պահպանել', 'Չեղարկել'] },
          card: { id: 'R-2431', body: [fld('Հեռախոս', inp('phone', '094 77-31-08', { mono: 1, ro: 1 })), fld('Որտեղից', inp('', 'Սայաթ-Նովա 19')), fld('Ուր', inp('', 'Կասկադ')),
            fld('Սակագին', inp('', 'Eco City', { dd: 1 })),
            fld('Վճարում', inp('credit-card', 'Քարտ <span class="mono faint">·· 4242</span>', { ro: 1 }) + '<p class="zline" style="margin:6px 0 0"><i data-lucide="smartphone"></i>Ամրագրված է հավելվածում · քարտը փոխվում է միայն ուղևորի կողմից</p>'),
            fld('Վարորդ', `<div class="input"><i data-lucide="search"></i><span class="val">Ավտոմատ որոնում · ալիք 1</span><button class="btn secondary xs">Նշանակել</button></div>`)], ft: ['Պահպանել', 'Չեղարկել'] },
          pay: { id: 'R-2409', body: [fld('Հեռախոս', inp('phone', '091 08-76-30', { mono: 1, ro: 1 })), fld('Որտեղից → Ուր', inp('', 'Վազգեն Սարգսյան 10 → Կենտրոն', { ro: 1 })),
            fld('Վարորդ', inp('user-check', `${short(DRIVERS[7])} · <span class="mono">${DRIVERS[7].plate}</span>`, { ro: 1 })),
            fld('Վճարում', inp('smartphone-nfc', 'NFC · POS', { ro: 1 }) + `<p class="payrec"><i data-lucide="repeat"></i><span>Կանխիկ → NFC · վարորդը · <span class="mono">9:38</span></span></p><p class="zline" style="margin:4px 0 0"><i data-lucide="info"></i>Վճարումը ETAPI կգնա ACBA քաղվածքի համընկնումից հետո</p>`)], ft: ['Փակել'] },
        }
        P.driver = P.changed = P.edit
        const p = P[PN]
        if (p && mapCard) {
          const notice = PN === 'changed' ? '<div class="notice blue" role="status"><i data-lucide="refresh-cw"></i><div class="grow">Այս պատվերը փոխվել է · Սոնա Ա., <span class="mono">9:43</span><div style="margin-top:6px"><button class="btn secondary s">Թարմացնել</button></div></div></div>' : ''
          mapCard.insertAdjacentHTML('beforeend', `<aside class="epanel" aria-label="Պատվերի փոփոխություն" data-overlay>
            <div class="eh"><h2>${PN === 'pay' ? 'Պատվեր' : 'Փոխել պատվերը'}</h2><span class="mono faint">#${p.id}</span><button class="btn ghost icon s end" aria-label="Փակել (Esc)"><i data-lucide="x"></i></button></div>
            <div class="eb scroll-y grow">${notice}${p.body.join('')}</div>
            <div class="ef">${p.ft.length > 1 ? `<button class="btn primary"${PN === 'changed' ? ' disabled style="opacity:.55"' : ''}>${p.ft[0]} <span class="kbd">↵</span></button><button class="btn secondary">${p.ft[1]}</button>` : `<button class="btn secondary">${p.ft[0]} <span class="kbd">Esc</span></button>`}</div></aside>`)
        }
      }

      if (PN === 'pay') { /* the Active lane to the top of the list, so its header and the selected row sit clear of the sticky Problems header */
        const Q = document.getElementById('queue'), ln = Q.querySelector('.l-active')
        if (ln) Q.scrollTop += ln.getBoundingClientRect().top - Q.getBoundingClientRect().top
        Q.querySelectorAll('.lane-h').forEach((h) => h.setAttribute('data-overlay', '')) /* a sticky lane header deliberately rides over the rows scrolled under it */
      }

      /* C6 — «Հերթափոխում»: the count stays, the chips go; a search field (car plate or driver name) shows matching cars. */
      const list = document.getElementById('strip')
      if (list) {
        const FR = QS.get('free'), term = FR === 'search' ? 'Ար' : FR === 'none' ? '77 XX' : ''
        const hits = term === 'Ար' ? DRIVERS.filter((d) => d.name.startsWith(term)) : []
        list.setAttribute('data-truncate', ''); list.removeAttribute('data-peek'); list.classList.add('fs')
        list.innerHTML = `<div class="fsearch" role="search"><div class="input${term ? ' focus' : ''}"><i data-lucide="search"></i><span class="val${term ? '' : ' ph'}">${term || 'Մեքենայի համար կամ վարորդի անուն'}</span>${term ? '<button class="btn ghost icon s" aria-label="Մաքրել"><i data-lucide="x"></i></button>' : '<span class="kbd">S</span>'}</div>
          <p class="faint" role="status">${!term ? 'Գրեք համարը կամ անունը՝ կերևան մեքենաները' : hits.length ? `Գտնվեց՝ <span class="num">${hits.length}</span>` : 'Նման մեքենա հերթափոխում չկա'}</p></div>
          ${hits.map((d) => { const [tone, word] = DSTATE[d.state]; return `<div class="dc"><span class="car s">${carImg(d.tier)}</span><span class="nm">${short(d)}</span><span class="pl"><span class="plate">${d.plate}</span></span>
            <span class="st"><span class="pill ${tone}" style="height:20px"><i class="d"></i>${word}</span><span class="trunc">${d.state === 'ride' ? '→ Կոմիտաս 12' : 'ազատ ' + (idleOf[DRIVERS.indexOf(d)] || '3 ր')}</span></span></div>` }).join('')}`
      }

      /* C7 — hovering (and keyboard focus on) a car on the map shows its card: plate, model, tariff, driver, phone, status,
         time on shift. Real listeners (delegated: MapGL creates the markers late); ?map=hover pins it on one car. */
      const host = q('.maphost')
      if (host) {
        host.insertAdjacentHTML('beforeend', '<div class="carcard" id="carcard" role="tooltip" data-overlay hidden></div>')
        const cc = document.getElementById('carcard')
        let shown = null
        const place = (el) => {
          const r = el.getBoundingClientRect(), h = host.getBoundingClientRect(), w = cc.offsetWidth || 236, ht = cc.offsetHeight || 150
          let x = r.right - h.left + 6, y = r.top - h.top - 8
          if (x + w > h.width - 8) x = r.left - h.left - w - 6
          y = Math.max(8, Math.min(y, h.height - ht - 8))
          cc.style.left = Math.max(8, x) + 'px'; cc.style.top = y + 'px'
        }
        const show = (el) => {
          const i = +el.dataset.car, d = DRIVERS[i], t = pickTier(d), [tone, word] = DSTATE[d.state]
          cc.innerHTML = `<div class="ch"><span class="plate">${d.plate}</span><span class="pill ${tone}"><i class="d"></i>${word}</span></div>
            <div class="cn">${d.name}</div>
            <dl><dt>Մեքենա</dt><dd>${t.car}</dd><dt>Սակագին</dt><dd>${t.name} · ${DTYPE[d.type][0].toLowerCase()}</dd><dt>Հեռախոս</dt><dd class="mono">${d.phone}</dd><dt>Հերթափոխում</dt><dd class="mono">${onShift[i] || '—'}</dd></dl>`
          cc.hidden = false; shown = el; place(el)
        }
        const hide = () => { cc.hidden = true; shown = null }
        document.addEventListener('mouseover', (e) => { const el = e.target.closest && e.target.closest('[data-car]'); if (el) show(el); else if (shown && !e.target.closest('#carcard')) hide() })
        document.addEventListener('focusin', (e) => { const el = e.target.closest && e.target.closest('[data-car]'); if (el) show(el) })
        document.addEventListener('focusout', (e) => { if (e.target.closest && e.target.closest('[data-car]')) hide() })
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide() })
        if (QS.get('map') === 'hover') {
          /* Wait for MapGL's markers and its settling re-fit, then keep the card on the car it was opened for. */
          const t0 = Date.now(), iv = setInterval(() => {
            const el = document.querySelector('[data-car="0"]')
            if (el && el.getBoundingClientRect().width) { show(el); el.classList.add('hov') }
            if (Date.now() - t0 > 12000) clearInterval(iv)
          }, 400)
        }
      }
      if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
    },
  }
})()
