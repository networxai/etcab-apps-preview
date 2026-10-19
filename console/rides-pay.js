/* rides.html payment states (owner decisions 2026-10-15). Loaded after rides-panels.js; reads ?pay=.
   Drawn ahead of the API: no ETAPI, card gateway or service-fee field exists yet.
   The rules these views carry:
   - Methods: cash, card (iPay / ArCa), Apple Pay, Google Pay, NFC · POS (ONE method; owner 2026-10-16: taken in ACBA
     Bank's own app on the FLEET driver's phone, never in ours, and never by a partner driver), company. The rider picks NFC
     (app, or tells the dispatcher); the dispatcher can book it too, and the order goes to fleet cars only.
   - Service fee (owner 2026-10-15, final): the fleet's own income, +2 % on top of the final fare, ONLY when the rider pays
     by bank card (card, Apple Pay, Google Pay, NFC · POS). Cash and company: no fee, no line. It is on our receipt only; the Tax
     Service (ETAPI) receipt and the driver's Idram payout carry the fare alone.
   - NFC (owner 2026-10-16): our app never sees the tap. The driver says «Վճարվեց» / «Չստացվեց»; the console shows
     «վարորդը հաստատեց» and reconciles the ride against ACBA's statement (imported, not an API). The driver's ETAPI payout waits
     for «matched». If the driver says failed the ride simply becomes cash (1 100 ֏, no fee) or another try.
   - ETAPI (Eco Taxi's Tax Service + Idram service): a completed NON-CASH, NON-COMPANY ride is filed at once: ՊԵԿ
     receipt + Idram payout to the driver (fleet drivers too). Cash: receipt after ETAPI's 24 h hold, no payout.
     Company: never sent; the ride is on the company's month. ETAPI types CASH · CASHLESS (card / Apple Pay / Google
     Pay) · CASHLESS_POS (NFC · POS). The type can change only while the ride is pending or held.
   - Method switch (owner 2026-10-16, FLEET drivers only): at Complete the driver may take a Cash order as NFC, and NFC as
     Cash when the tap fails. The ride keeps both (original, new, who, when); every report counts it under the FINAL method,
     and the list, the detail and the payouts say «Կանխիկ → NFC · վարորդը · 9:51». A switched-to-NFC ride still waits for the
     ACBA statement before its ETAPI payout (that is what stops cash being marked NFC). Partners: no switch.
   Views:
   ?pay=filter    the «Վճարում» filter open: every method with today's count
   ?pay=card      a card ride: fee line, receipt issued (number), Idram payout paid
   ?pay=cash      a cash ride: receipt waiting for the 24 h hold, no payout
   ?pay=failed    Google Pay ride whose ETAPI filing failed: red, link to Requests
   ?pay=company   company ride: «ETAPI-ին չի ուղարկվում · ընկերության հաշվետվություն»
   ?pay=nfc       NFC ride: driver confirmed, matched in ACBA's statement, ՊԵԿ issued, Idram paid
   ?pay=switched  a Cash order the fleet driver took as NFC: switch line, ACBA match pending, payout waits
   ?pay=switched-back  an NFC order the tap failed on, taken as cash: no fee, no payout
   ?pay=nfc-gap   NFC ride the bank statement does not show (yet) or shows with another amount: amber, payout held
   ?pay=declined  «Վճարումը չանցավ»: the card was declined at the end, the rider's 1-minute retry ran out, the ride turned to cash
                  automatically and is unpaid (rider debt). Amber: the bank refused, nothing in our system failed (a notice's tone is a claim).
   ?pay=declined-retry  the same ride inside the 1-minute window: still card, the rider retrying in the app, a countdown. */
(function () {
  const QS = new URLSearchParams(location.search)
  const V = QS.get('pay')
  if (!V) return
  document.head.insertAdjacentHTML('beforeend', `<style>
    .pm { display: inline-flex; align-items: center; gap: 4px; font: var(--c-small); color: var(--ink-muted); white-space: nowrap; justify-content: flex-end; }
    .pm.sw { color: var(--ink); font-weight: 500; }
    .pm svg { width: 12px; height: 12px; }
    .rt td.r .amt { display: flex; flex-direction: column; align-items: flex-end; line-height: 18px; }
    .fdrop { position: absolute; z-index: 20; top: 44px; width: 248px; background: var(--surface); border-radius: var(--r-ctl); box-shadow: var(--e2), 0 0 0 1px var(--line-soft); padding: 4px; }
    .fdrop .o { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 8px; border-radius: 6px; font: var(--c-body); white-space: nowrap; }
    .fdrop .o:hover { background: var(--surface-alt); }
    .fdrop .o svg { width: 14px; height: 14px; color: var(--ink-faint); }
    .fdrop .o .c { margin-left: auto; font: 400 12px/16px var(--mono); color: var(--ink-faint); }
    .fdrop .g { font: var(--c-label); color: var(--ink-faint); padding: 6px 8px 2px; }
    .fdrop .sep { height: 1px; background: var(--line-soft); margin: 4px 0; }
    .kv dt small { display: block; font: var(--c-small); color: var(--ink-faint); }
    .paym { display: flex; align-items: center; gap: 6px; }
    .paym svg { width: 14px; height: 14px; color: var(--ink-muted); }
    .et { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; column-gap: 10px; row-gap: 2px; align-items: center; padding: 8px 0; border-top: 1px solid var(--line-soft); }
    .et:first-of-type { border-top: 0; }
    .et .ic { grid-row: 1 / span 2; align-self: start; width: 28px; height: 28px; border-radius: 6px; display: grid; place-items: center; background: var(--surface-alt); color: var(--ink-muted); }
    .et b { font: var(--c-strong); white-space: nowrap; }
    .et .s { grid-column: 2 / 4; font: var(--c-small); color: var(--ink-muted); min-width: 0; }
    .et .s a { color: var(--brand-text); text-decoration: none; font-weight: 500; }
    .et .pill { justify-self: end; }
    .sub { font: var(--c-label); color: var(--ink-faint); margin: 2px 0 4px; }
    .sub + .et { border-top: 0; }
    .etype { display: flex; align-items: center; gap: 6px; font: var(--c-small); color: var(--ink-faint); margin-bottom: 4px; }
    .xsec { margin: 0; padding: 12px var(--inset); border-bottom: 1px solid var(--line-soft); background: var(--surface); box-shadow: inset 3px 0 0 var(--ink); display: flex; flex-direction: column; gap: 10px; }
    .xsec > h3 { font: var(--c-head); color: var(--ink); display: flex; align-items: center; gap: 6px; }
    .xsec > h3 svg { width: 16px; height: 16px; }
    .xsec > h3 .end { margin-left: auto; font: var(--c-small); color: var(--ink-faint); font-weight: 400; }
    .btns { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
  </style>`)

  const PAY = {
    cash: ['banknote', 'Կանխիկ', 'CASH'], card: ['credit-card', 'Քարտ', 'CASHLESS'], applepay: ['smartphone', 'Apple Pay', 'CASHLESS'],
    googlepay: ['smartphone', 'Google Pay', 'CASHLESS'], nfc: ['smartphone-nfc', 'NFC · POS', 'CASHLESS_POS'],
    company: ['building-2', 'Ընկերություն', null],
  }
  /* One method per ride of rides.html's list (id → method); cancelled and driverless rides carry none. */
  const BY = { 20430: 'card', 20428: 'applepay', 20424: 'cash', 20417: 'cash', 20409: 'googlepay', 20402: 'nfc', 20398: 'company', 20385: 'card',
    20377: 'nfc', 20369: 'cash', 20361: 'cash', 20352: 'card', 20344: 'applepay', [ECO.RIDE.no]: 'cash' }
  /* Rides whose method the driver changed at Complete (id → original method); the list shows the FINAL method first. */
  const SW = { 20377: 'cash', 20361: 'nfc' }
  const rows = [...document.querySelectorAll('#rows tr')]
  document.querySelector('.rt col:last-child').style.width = '136px' /* amount over the method word */
  const idOf = (r) => ((r.textContent.match(/#R-(\d+)/) || [])[1])
  rows.forEach((r) => {
    const m = PAY[BY[idOf(r)]], c = r.querySelector('td:last-child')
    const sw = SW[idOf(r)] && PAY[SW[idOf(r)]]
    if (m && c) c.innerHTML = `<span class="amt"><span>${c.innerHTML}</span><span class="pm${sw ? ' sw' : ''}"${sw ? ` title="${sw[1].replace(' · POS', '')} → ${m[1].replace(' · POS', '')} · վարորդը"` : ''}><i data-lucide="${sw ? 'repeat' : m[0]}"></i>${sw ? `${sw[1].replace(' · POS', '')} → ${m[1].replace(' · POS', '')}` : m[1]}</span></span>`
  })
  const rowById = (id) => rows.find((r) => idOf(r) === String(id))
  const select = (id) => { rows.forEach((r) => r.classList.remove('on')); const r = rowById(id); if (r) r.classList.add('on') }

  if (V === 'filter') {
    /* Counts are today's 104 completed + 9 current rides by method. Apple Pay and Google Pay are chosen by the rider in the
       app; NFC · POS by the rider or told to the dispatcher (fleet cars only); a dispatcher can take cash, a saved card, NFC or company by phone. */
    const chip = [...document.querySelectorAll('.filters .chip')].find((c) => c.textContent.includes('Վճարում'))
    chip.classList.add('on'); chip.setAttribute('aria-expanded', 'true')
    chip.innerHTML = 'Վճարում <i data-lucide="chevron-up"></i>'
    const f = chip.closest('.filters'); f.style.overflow = 'visible'; f.style.position = 'relative'
    const o = (ic, l, n) => `<div class="o" role="option" aria-selected="false"><span class="check"><i class="b"></i></span><i data-lucide="${ic}"></i>${l}<span class="c">${n}</span></div>`
    f.insertAdjacentHTML('beforeend', `<div class="fdrop" role="listbox" aria-multiselectable="true" aria-label="Վճարում" data-overlay style="right:56px">
      <div class="g">Կանխիկ</div>${o('banknote', 'Կանխիկ', 51)}
      <div class="g">Հավելվածով</div>${o('credit-card', 'Քարտ', 22)}${o('smartphone', 'Apple Pay', 14)}${o('smartphone', 'Google Pay', 9)}
      <div class="g">Վարորդի մոտ</div>${o('smartphone-nfc', 'NFC · POS', 10)}
      <div class="sep"></div>${o('building-2', 'Ընկերություն', 7)}
      <div class="sep"></div><div class="o" style="color:var(--ink-muted)"><i data-lucide="layers"></i>Ամբողջ անկանխիկը<span class="c">55</span></div>
      <div class="sep"></div>${o('repeat', 'Փոխված եղանակ', 6)}</div>`)
    document.querySelectorAll('.fdrop .o').forEach((x, i) => { if (i === 1 || i === 2 || i === 3) { x.setAttribute('aria-selected', 'true'); x.querySelector('.check')?.classList.add('on') } })
  }

  /* ── Panel builder for a finished ride ── */
  const dp = document.getElementById('dp')
  const top = dp.querySelector('.top')
  const setHead = (r) => {
    const s = top.querySelector('.id'); s.querySelector('.mono').textContent = '#R-' + r.id
    const p = s.querySelector('.pill'); p.className = 'pill'; p.style.color = ''; p.innerHTML = '<i class="d"></i>Ավարտված'
    top.querySelector('h2').textContent = r.a
    top.querySelectorAll('.dest')[0].innerHTML = `<i data-lucide="arrow-right"></i><span>${r.b}</span>`
    top.querySelectorAll('.dest')[1].innerHTML = `<span class="mono">${r.t}</span>·<span class="mono">${r.ph}</span>·<span>${r.src}</span>`
    dp.setAttribute('aria-label', 'Պատվեր #R-' + r.id)
    const d = dp.querySelector('.drv')
    d.querySelector('.car').innerHTML = carImg(r.tier)
    d.querySelector('.nm').textContent = r.drv
    d.querySelector('.plate').textContent = r.pl
    d.querySelector('.meta .pill').innerHTML = r.partner ? '<i data-lucide="handshake"></i>Գործընկեր' : '<i data-lucide="car"></i>Ավտոպարկի'
    d.querySelector('.meta.mono').textContent = r.dph
    dp.querySelector('.mini')?.remove()
    document.documentElement.dataset.mapReady = 'none'
  }
  const priceSec = dp.querySelector('.kv').closest('.sec')
  /* The fee line exists only for a bank-card payment (card, Apple Pay, Google Pay, NFC · POS: 2 % of the fare); otherwise
     the total is the fare. */
  const price = (r) => {
    priceSec.querySelector('h3').textContent = r.fixed ? 'Գին · ֆիքսված' : 'Գին · նախապես հաշվարկված'
    priceSec.querySelector('.kv').innerHTML = `<dt>${r.tierName} · ուղեվարձ</dt><dd>${amd(r.fare)}</dd>
      ${r.fee ? `<dt>Սպասարկման վճար · ${r.pay === 'nfc' ? 'NFC · POS' : 'քարտ'} 2 %<small>մեր կտրոնում · ՊԵԿ կտրոնում՝ միայն ուղեվարձը</small></dt><dd>${amd(r.fee)}</dd>` : ''}
      <dt class="tot">${r.payer || 'Ուղևորը վճարեց'}</dt><dd class="tot">${amd(r.fare + r.fee)}</dd>`
  }
  const et = (ic, title, pill, sub) => `${title.startsWith('Idram') ? '<div class="sub">Վարորդին</div>' : ''}<div class="et"><span class="ic"><i data-lucide="${ic}"></i></span><b>${title}</b>${pill}<span class="s">${sub}</span></div>`
  const P = (tone, ic, w) => `<span class="pill ${tone}">${ic ? `<i data-lucide="${ic}"></i>` : '<i class="d"></i>'}${w}</span>`
  const paySec = (r, body) => {
    const m = PAY[r.pay], f = r.from && PAY[r.from]
    priceSec.insertAdjacentHTML('afterend', `<div class="sec" id="paysec"><h3>Վճարում</h3>
      <div class="sub">Ուղևորը</div>
      <dl class="kv" style="margin-bottom:8px"><dt>Եղանակ</dt><dd class="paym" style="justify-content:flex-end"><i data-lucide="${m[0]}"></i>${f ? `<span class="faint">${f[1]} →</span> ` : ''}${m[1]}${r.last4 ? ` <span class="mono faint">·· ${r.last4}</span>` : ''}</dd>
        ${f ? `<dt>Փոխվել է</dt><dd>${f[1]} → ${m[1].replace(' · POS', '')} · վարորդը · <span class="mono">${r.swAt}</span></dd><dd class="faint" style="grid-column:1 / -1;font:var(--c-small)">հաշվետվություններում և վճարումներում՝ վերջնական եղանակով</dd>` : ''}
        ${m[2] ? `<dt>ETAPI տեսակ</dt><dd><span class="tag">${m[2]}</span></dd>` : ''}</dl>${body}</div>`)
  }
  const tl = (items) => { document.getElementById('tl').innerHTML = items.map(([t, l, w, who]) => `<span class="t">${t}</span><i class="d ${l}"></i><span>${w}</span><span class="who">${who}</span>`).join('') }
  const doneActs = (extra) => { top.querySelector('.acts').innerHTML = extra || '<span class="faint" style="font:var(--c-small)">Ավարտված պատվերը չի փոխվում</span>' }

  /* Card ride, fleet driver: ETAPI filed at once (CASHLESS) — receipt issued and the fare paid out to the driver's Idram. */
  const CARD = { id: '20352', a: 'Ծովակալ Իսակովի պող. 24', b: 'Նոր Նորք, Գայի 7', t: '11:02', ph: '011 00-08-02', src: 'Հավելվածից', tier: 'city', tierName: 'Eco City',
    drv: 'Տիգրան Աբրահամյան', pl: '12 TT 304', dph: '093 60-12-48', fare: 1800, fee: 36, pay: 'card', last4: '7731' }
  if (V === 'card') {
    select(CARD.id); setHead(CARD); price(CARD)
    paySec(CARD, et('scroll-text', 'ՊԵԿ կտրոն', P('ok', 'check', 'Թողարկված'), `<span class="mono">RI-8D2M41C</span> · <span class="mono">11:19</span> · ${amd(CARD.fare)} · <a href="#">taxservice.am</a>`)
      + et('wallet', 'Idram՝ վարորդին', P('ok', 'check', 'Վճարված'), `${amd(CARD.fare)} · Idram ID <span class="mono">0412 6146</span> · <span class="mono">11:19</span>`))
    doneActs()
    tl([['11:02', 'l-unassigned', 'Ընդունված', 'ուղևոր · հավելված'], ['11:03', 'l-active', 'Նշանակված', 'Տիգրան Ա. · ալիք 1'], ['11:08', 'l-active', 'Ուղևորի հետ', 'Տիգրան Ա.'],
      ['11:19', '', 'Ավարտված · քարտով', 'համակարգ'], ['11:19', '', 'ETAPI · կտրոն և Idram', 'համակարգ']])
  }

  /* Cash ride: ETAPI holds a cash filing for 24 h (the ride can still change type), then issues the receipt. No payout. */
  if (V === 'cash') {
    const R = { id: '20369', a: 'Արշակունյաց 2', b: 'Մալաթիա, Սեբաստիա 80', t: '11:48', ph: '096 14-02-71', src: 'Հեռախոսով · Անի Դ.', tier: 'city', tierName: 'Eco City',
      drv: 'Էդգար Պողոսյան', pl: '27 EP 336', dph: '095 14-28-63', partner: 1, fare: 1600, fee: 0, pay: 'cash' }
    select(R.id); setHead(R); price(R)
    paySec(R, et('scroll-text', 'ՊԵԿ կտրոն', P('', 'clock', 'Սպասում է'), `ETAPI-ի 24 ժ պահում · կտրոնը՝ վաղը <span class="mono">12:06</span>-ից հետո · մինչ այդ եղանակը կարելի է փոխել`)
      + et('wallet', 'Idram՝ վարորդին', '<span class="faint" style="font:var(--c-small)">—</span>', 'Կանխիկ · վարորդը գումարը ստացել է ուղևորից'))
    doneActs('<button class="btn secondary s"><i data-lucide="repeat"></i>Փոխել եղանակը</button>')
    tl([['11:48', 'l-unassigned', 'Ընդունված', 'Անի Դ.'], ['11:49', 'l-active', 'Նշանակված', 'Էդգար Պ. · ալիք 1'], ['12:06', '', 'Ավարտված · կանխիկ', 'Էդգար Պ.'], ['12:06', '', 'ETAPI · պահված 24 ժ', 'համակարգ']])
  }

  /* Filing failed: red, because something actually failed — the Tax Service did not answer ETAPI three times.
     The fix lives in Requests → ՊԵԿ կտրոններ (retry / mark issued by hand); the panel links there. */
  if (V === 'failed') {
    const R = { id: '20409', a: 'Աբովյան 12', b: 'Երևան Մոլ', t: '13:58', ph: '093 55-18-44', src: 'Հավելվածից', tier: 'partner', tierName: 'Eco Comfort',
      drv: 'Կարեն Մելքոնյան', pl: '44 KM 771', dph: '077 50-12-12', partner: 1, fare: 1900, fee: 38, pay: 'googlepay' }
    select(R.id); setHead(R); price(R)
    paySec(R, et('scroll-text', 'ՊԵԿ կտրոն', P('bad', 'circle-alert', 'Չթողարկվեց'), `ՊԵԿ-ը չպատասխանեց ETAPI-ին · 3 փորձ · վերջինը՝ <span class="mono">14:21</span> · <a href="requests.html?theme=${THEME}&tab=fiscal">Հարցումներ →</a>`)
      + et('wallet', 'Idram՝ վարորդին', P('', 'clock', 'Սպասում է'), `${amd(R.fare)} · նույն ETAPI հարցումով՝ կտրոնի հետ`))
    doneActs()
    tl([['13:58', 'l-unassigned', 'Ընդունված', 'ուղևոր · հավելված'], ['14:15', '', 'Ավարտված · Google Pay', 'համակարգ'], ['14:15', 'l-problems', 'ETAPI · ՊԵԿ-ը չպատասխանեց', 'համակարգ'], ['14:21', 'l-problems', 'ETAPI · 3-րդ փորձ · չստացվեց', 'համակարգ']])
  }

  /* Company ride: never sent to ETAPI. It counts in the company's month; the report is the company's document. */
  if (V === 'company') {
    const r = rowById('20398')
    r.querySelector('td:nth-child(2) .l1').innerHTML = `${ECO.BOOKINGS.co.pickup}<span class="arr">→</span>${ECO.BOOKINGS.co.drop}`
    r.querySelector('td:last-child .amt > span').textContent = amd(1100)
    const R = { id: '20398', a: ECO.BOOKINGS.co.pickup, b: ECO.BOOKINGS.co.drop, t: '13:20', ph: ECO.CUSTOMER.phone, src: 'Հավելվածից', tier: 'city', tierName: 'Eco City',
      drv: 'Նարեկ Հովհաննիսյան', pl: '07 AB 913', dph: '098 23-55-90', partner: 1, fare: 1100, fee: 0, pay: 'company', payer: 'Ընկերության հաշվին' }
    select(R.id); setHead(R); price(R)
    paySec(R, `<div class="notice neutral"><i data-lucide="building-2"></i><span class="grow">ETAPI-ին չի ուղարկվում · ընկերության հաշվետվություն<br><a href="company.html?theme=${THEME}&tab=report" style="color:var(--brand-text);font-weight:500;text-decoration:none">${ECO.COMPANY.short} · Հոկտեմբեր 2026 →</a></span></div>`)
    doneActs()
    tl([['13:20', 'l-unassigned', 'Ընդունված', 'ուղևոր · հավելված'], ['13:21', 'l-active', 'Նշանակված', 'Նարեկ Հ. · ալիք 1'], ['13:41', '', 'Ավարտված · ընկերության հաշվին', 'համակարգ']])
  }

  /* NFC ride (fleet car only): ACBA's own app on the driver's phone took the tap, so the only evidence is the driver's word
     and, later, the bank's statement. Matched → ETAPI filed at once (CASHLESS_POS), the fare paid out to the driver's Idram. */
  const NFC = { id: '20377', a: 'Բաղրամյան 24', b: 'Զվարթնոց օդանավակայան', t: '12:10', ph: '077 41-22-08', src: 'Հավելվածից', tier: 'van', tierName: 'Eco Van',
    drv: 'Արմեն Գրիգորյան', pl: '35 OS 512', dph: '099 11-22-33', fare: 5200, fee: 104, pay: 'nfc', from: 'cash', swAt: '12:49' }
  const nfcLine = (ok, w, sub) => `<div class="et"><span class="ic"><i data-lucide="landmark"></i></span><b>ACBA քաղվածք</b>${w}<span class="s">${sub}</span></div>`
  if (V === 'nfc') {
    select(NFC.id); setHead(NFC); price(NFC)
    paySec(NFC, `<dl class="kv" style="margin-bottom:8px"><dt>Վարորդը հաստատեց</dt><dd><span class="mono">12:58</span> · «Վճարվեց»</dd></dl>`
      + nfcLine(1, P('ok', 'check', 'Համընկավ'), `<span class="mono">${amd(NFC.fare + NFC.fee)}</span> · <span class="mono">12:58</span> · ACBA քաղվածք`)
      + et('scroll-text', 'ՊԵԿ կտրոն', P('ok', 'check', 'Թողարկված'), `<span class="mono">RI-8D2M5Q7</span> · <span class="mono">12:52</span> · ${amd(NFC.fare)} · <a href="#">taxservice.am</a>`)
      + et('wallet', 'Idram՝ վարորդին', P('ok', 'check', 'Վճարված'), `${amd(NFC.fare)} · Idram ID <span class="mono">0412 9120</span> · <span class="mono">12:52</span>`))
    doneActs()
    tl([['12:10', 'l-unassigned', 'Ընդունված', 'ուղևոր · հավելված'], ['12:11', 'l-active', 'Նշանակված', 'Արմեն Գ. · ալիք 1'], ['12:49', '', 'Եղանակը փոխվեց · Կանխիկ → NFC', 'Արմեն Գ.'], ['12:49', '', 'Ավարտված · NFC', 'Արմեն Գ.'], ['12:49', '', 'Վարորդը հաստատեց՝ վճարվեց', 'Արմեն Գ.'], ['12:52', '', 'ACBA քաղվածքում համընկավ', 'համակարգ'], ['12:52', '', 'ETAPI · կտրոն և Idram', 'համակարգ']])
  }

  /* Switched Cash → NFC at Complete (fleet driver). Same evidence chain as any NFC ride: the statement has not shown it yet, so
     the payout waits (amber: a domain hold, nothing failed). The ride is already counted as NFC everywhere. */
  if (V === 'switched') {
    const R = { id: '20377', a: 'Բաղրամյան 24', b: 'Զվարթնոց օդանավակայան', t: '12:10', ph: '077 41-22-08', src: 'Հավելվածից', tier: 'van', tierName: 'Eco Van',
      drv: 'Արմեն Գրիգորյան', pl: '35 OS 512', dph: '099 11-22-33', fare: 5200, fee: 104, pay: 'nfc', from: 'cash', swAt: '12:49' }
    select(R.id); setHead(R); price(R)
    paySec(R, `<dl class="kv" style="margin-bottom:8px"><dt>Վարորդը հաստատեց</dt><dd><span class="mono">12:49</span> · «Վճարվեց»</dd></dl>`
      + nfcLine(0, P('warn', 'triangle-alert', 'Չկա'), 'վերջին քաղվածք՝ <span class="mono">14:30</span> · կստուգվի ամեն քաղվածքի հետ · Idram-ը սպասում է')
      + et('scroll-text', 'ՊԵԿ կտրոն', P('', 'clock', 'Սպասում է'), 'կթողարկվի քաղվածքում համընկնելուց հետո')
      + et('wallet', 'Idram՝ վարորդին', P('', 'clock', 'Սպասում է'), `${amd(R.fare)} · քաղվածքում համընկնելուց հետո`))
    doneActs()
    tl([['12:10', 'l-unassigned', 'Ընդունված', 'ուղևոր · հավելված'], ['12:11', 'l-active', 'Նշանակված', 'Արմեն Գ. · ալիք 1'], ['12:49', '', 'Եղանակը փոխվեց · Կանխիկ → NFC', 'Արմեն Գ.'], ['12:49', '', 'Ավարտված · NFC', 'Արմեն Գ.'], ['12:49', '', 'Վարորդը հաստատեց՝ վճարվեց', 'Արմեն Գ.']])
  }

  /* Switched NFC → Cash (the tap failed, the rider paid in cash). Counted as cash: no fee line, no payout, ETAPI's 24 h hold. */
  if (V === 'switched-back') {
    const R = { id: '20361', a: 'Հալաբյան 41', b: 'Ամիրյան 9', t: '11:30', ph: '041 33-21-90', src: 'Հավելվածից', tier: 'business', tierName: 'Eco Business',
      drv: 'Նարեկ Հովհաննիսյան', pl: '07 AB 913', dph: '094 22-10-35', fare: 2400, fee: 0, pay: 'cash', from: 'nfc', swAt: '11:52' }
    select(R.id); setHead(R); price(R)
    paySec(R, `<dl class="kv" style="margin-bottom:8px"><dt>Պատճառ</dt><dd>NFC-ն չստացվեց · վարորդը վերցրեց կանխիկ</dd></dl>`
      + et('scroll-text', 'ՊԵԿ կտրոն', P('', 'clock', 'Սպասում է'), 'ETAPI-ի 24 ժ պահում · կանխիկի պես')
      + et('wallet', 'Idram՝ վարորդին', '<span class="faint" style="font:var(--c-small)">—</span>', 'Կանխիկ · վարորդը գումարը ստացել է ուղևորից'))
    doneActs()
    tl([['11:30', 'l-unassigned', 'Ընդունված', 'ուղևոր · հավելված'], ['11:31', 'l-active', 'Նշանակված', 'Նարեկ Հ. · ալիք 1'], ['11:52', '', 'Եղանակը փոխվեց · NFC → Կանխիկ', 'Նարեկ Հ.'], ['11:52', '', 'Ավարտված · կանխիկ', 'Նարեկ Հ.']])
  }

  /* NFC not (yet) in the bank's statement, or in it with another amount. Amber: a domain refusal (the payout is held on
     purpose), nothing in our system failed. ETAPI and Idram wait for a match; the dispatcher can call the driver or match by hand. */
  if (V === 'nfc-gap') {
    const R = { ...NFC, id: '20402', a: 'Մաշտոցի պող. 37', b: 'Դավթաշեն 4-րդ թաղ.', t: '13:41', ph: '091 08-76-30', tier: 'kids', tierName: 'Eco Kids', drv: 'Լիլիթ Մանուկյան', pl: '18 OL 220', dph: '077 18-30-22', fare: 2100, fee: 42 }
    const r = rowById(R.id); r.querySelector('.pm').innerHTML = '<i data-lucide="smartphone-nfc"></i>NFC · POS'
    select(R.id); setHead(R); price(R)
    paySec(R, `<dl class="kv" style="margin-bottom:8px"><dt>Վարորդը հաստատեց</dt><dd><span class="mono">14:04</span> · «Վճարվեց»</dd></dl>
      <div class="notice amber" role="status"><i data-lucide="triangle-alert"></i><span class="grow">ACBA քաղվածքում չկա <span class="mono">${amd(R.fare + R.fee)}</span> · վճարումը պահված է՝ մինչև համընկնի</span></div>`
      + nfcLine(0, P('warn', 'triangle-alert', 'Չկա'), 'վերջին քաղվածք՝ <span class="mono">14:30</span> · կստուգվի ամեն քաղվածքի հետ')
      + et('scroll-text', 'ՊԵԿ կտրոն', P('', 'pause', 'Պահված'), 'ETAPI-ին չի ուղարկվել · կուղարկվի համընկնելուց հետո')
      + et('wallet', 'Idram՝ վարորդին', P('', 'pause', 'Պահված'), `${amd(R.fare)} · համընկնելուց հետո`)
      + `<div class="btns" style="justify-content:flex-start;margin-top:8px"><button class="btn secondary s"><i data-lucide="phone"></i>Զանգել վարորդին</button><button class="btn secondary s"><i data-lucide="check-check"></i>Համընկեցնել ձեռքով</button></div>`)
    doneActs()
    tl([['13:41', 'l-unassigned', 'Ընդունված', 'ուղևոր · հավելված'], ['13:42', 'l-active', 'Նշանակված', 'Լիլիթ Մ. · ալիք 1'], ['14:04', '', 'Ավարտված · NFC', 'Լիլիթ Մ.'], ['14:04', '', 'Վարորդը հաստատեց՝ վճարվեց', 'Լիլիթ Մ.'], ['14:30', 'l-problems', 'ACBA քաղվածքում չկա', 'համակարգ']])
  }

  /* Card declined at the end (owner 2026-10-19, Edgar): the bank refuses, the RIDER retries for up to 1 minute in the app (a timer; not a step
     for the driver); when it runs out the ride turns into cash automatically. If the rider left without paying it stays unpaid and becomes the
     rider's debt (customer.html?state=debt). Amber, not red: a refusal from outside, nothing in our system failed.
     ?pay=declined-retry the 1-minute window is open (the timer runs, the method is still card) · ?pay=declined the window has closed: cash, unpaid, debt. */
  if (V === 'declined' || V === 'declined-retry') {
    const retry = V === 'declined-retry'
    const R = { id: '20344', a: 'Պուշկինի 15', b: 'Նալբանդյան 50', t: '10:44', ph: '093 60-12-48', src: 'Հավելվածից', tier: 'partner', tierName: 'Eco Comfort',
      drv: 'Գագիկ Ավետիսյան', pl: '34 LS 108', dph: '055 20-44-19', partner: 1, fare: 1000, fee: retry ? 20 : 0, pay: retry ? 'card' : 'cash', last4: '0918', payer: 'Ուղևորը պարտք է' }
    const r = rowById(R.id)
    r.querySelector('td:nth-child(5)').innerHTML = '<span class="pill warn"><i data-lucide="credit-card"></i>Չվճարված</span>'
    r.querySelector('.pm').innerHTML = retry ? '<i data-lucide="credit-card"></i>Քարտ' : '<i data-lucide="banknote"></i>Կանխիկ'
    select(R.id); setHead(R); price(R)
    const p = top.querySelector('.id .pill'); p.className = 'pill warn'; p.innerHTML = '<i data-lucide="credit-card"></i>Չվճարված'
    top.insertAdjacentHTML('afterend', `<section class="xsec" style="box-shadow:inset 3px 0 0 var(--warning)" aria-label="Վճարումը չանցավ"><h3><i data-lucide="credit-card"></i>${retry ? 'Քարտը մերժվեց' : 'Վճարումը չանցավ'}<span class="end mono">10:58</span></h3>
      <div class="notice amber" role="status"><i data-lucide="${retry ? 'timer' : 'triangle-alert'}"></i><span class="grow">${retry
        ? `Բանկը մերժեց քարտը <span class="mono">·· 0918</span> · ուղևորը կրկին փորձում է հավելվածում · <b class="mono">0:41</b> մնաց, հետո՝ կանխիկ`
        : `Բանկը մերժեց քարտը <span class="mono">·· 0918</span> · 1 րոպեն լրացավ · պատվերը դարձավ կանխիկ և մնաց չվճարված`}</span></div>
      ${retry ? '' : `<dl class="kv"><dt>Ուղևորի պարտքը</dt><dd><b>${amd(R.fare)}</b></dd><dt>Եղանակը</dt><dd>Քարտ → Կանխիկ · ավտոմատ · <span class="mono">10:59</span></dd></dl>
      <p class="faint" style="font:var(--c-small);margin-top:-4px">Ուղևորը տեսնում է պարտքը հավելվածում։ Եթե վճարի քարտով՝ պատվերի եղանակը կդառնա «Քարտ» հաշվետվություններում, կտրոնում և վարորդի վճարումներում</p>`}
      <div class="btns" style="justify-content:flex-start">${retry ? '' : `<button class="btn secondary s"><i data-lucide="banknote"></i>Նշել՝ վճարված կանխիկ</button><a class="btn secondary s" href="customer.html?theme=${THEME}&state=debt" style="text-decoration:none"><i data-lucide="user"></i>Ուղևորի քարտ</a>`}<button class="btn ghost s icon" aria-label="Զանգել ուղևորին"><i data-lucide="phone"></i></button></div></section>`)
    paySec(R, et('scroll-text', 'ՊԵԿ կտրոն', P('', 'pause', 'Պահված'), 'ETAPI-ին չի ուղարկվել · կուղարկվի վճարվելուց հետո՝ այն եղանակով, որով վճարվի')
      + et('wallet', 'Idram՝ վարորդին', P('', 'pause', 'Պահված'), retry ? `${amd(R.fare)} · վճարվելուց հետո` : `${amd(R.fare)} · կանխիկ է՝ վճարում չկա · պարտքը քարտով վճարվելու դեպքում կվճարվի`))
    doneActs()
    tl(retry ? [['10:44', 'l-unassigned', 'Ընդունված', 'ուղևոր · հավելված'], ['10:58', '', 'Ավարտված', 'Գագիկ Ա.'], ['10:58', 'l-problems', 'Քարտը մերժվեց · բանկ', 'համակարգ'], ['10:58', '', 'Ուղևորը կրկին փորձում է · 1 ր', 'ուղևոր']]
      : [['10:44', 'l-unassigned', 'Ընդունված', 'ուղևոր · հավելված'], ['10:58', '', 'Ավարտված', 'Գագիկ Ա.'], ['10:58', 'l-problems', 'Քարտը մերժվեց · բանկ', 'համակարգ'], ['10:58', '', 'Ուղևորը կրկին փորձում է · 1 ր', 'ուղևոր'],
        ['10:59', 'l-problems', 'Ժամանակը լրացավ · եղանակը՝ կանխիկ', 'համակարգ'], ['10:59', 'l-problems', 'Պարտք ' + amd(R.fare) + ' ուղևորին', 'համակարգ']])
  }
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
})()
