/* Company reports (owner decision 11 + clarification Q11, 2026-10-14): NO invoices. Per company and period — rides with
   date/time, employee, route, tariff and price (owner 2026-10-14: no cost-centre code); totals; Excel / CSV / PDF; «Ուղարկել ընկերությանը» to the
   company's contact email; credit limit; an optional «Վճարված» mark per month (who and when). One data set for
   companies.html, company.html (?tab=statement, ?tab=months), monthly.html and reports.html?company=1. */
(function () {
  const C = ECO.COMPANY, amd = ECO.amd
  /* Months for ECO.COMPANY; ECO.COMPANY.months is the shared source once kit.js carries it. */
  const MONTHS = C.months || [
    { key: '2026-09', label: 'Սեպտեմբեր 2026', rides: 214, amount: 268400, paid: true, paidOn: '6 հոկտ.' },
    { key: '2026-10', label: 'Հոկտեմբեր 2026', rides: 131, amount: 184600, paid: false, open: true },
  ]
  const OLDER = [
    { key: '2026-08', label: 'Օգոստոս 2026', rides: 198, amount: 247300, paid: true, paidOn: '4 սեպտ.' },
    { key: '2026-07', label: 'Հուլիս 2026', rides: 176, amount: 219800, paid: true, paidOn: '5 օգոստ.' },
  ]
  const PAID_BY = 'Գոհար Մ.'
  window.CO = { C, MONTHS, ALL_MONTHS: [...MONTHS].reverse().concat(OLDER), PAID_BY, EMAIL: 'finance@araratsoft.am' }

  /* Every company, two months: [name, mode, employees, limit|null, September [rides, amount, paidOn|null], October [rides, amount], closed].
     Credit used = unpaid closed months + the open month (Արարատ Սոֆթ: 184 600 ֏ = ECO.COMPANY.used). */
  const sep = MONTHS[0], oct = MONTHS[1]
  CO.LIST = [
    [C.name, 'postpaid', 14, C.limit, [sep.rides, sep.amount, sep.paid ? sep.paidOn : null], [oct.rides, oct.amount], false],
    ['Գլոբալ Լոջիսթիքս ՍՊԸ', 'postpaid', 22, 400000, [291, 412300, null], [188, 241700], false],
    ['Երևան Մեդիքալ Սենթր ՓԲԸ', 'postpaid', 9, 200000, [96, 121800, '2 հոկտ.'], [58, 74300], false],
    ['Սիթի Բանկ ՓԲԸ', 'prepaid', 31, null, [402, 402800, '1 հոկտ.'], [251, 263900], false],
    ['Արմենիա Հոթել Գրուպ ՍՊԸ', 'postpaid', 6, 150000, [64, 88500, null], [41, 52600], false],
    ['Նոր Դիզայն Ստուդիո ՍՊԸ', 'postpaid', 4, 50000, [18, 23900, '7 հոկտ.'], [9, 11800], false],
    ['ԹեքՀաբ Արմենիա ՍՊԸ', 'postpaid', 11, 250000, [121, 152000, '5 հոկտ.'], [77, 98400], false],
    ['Վերնատուն Ռեստորան ՍՊԸ', 'prepaid', 5, null, [41, 51300, '3 հոկտ.'], [22, 27100], false],
    ['Սևան Ագրո ՍՊԸ', 'postpaid', 3, 100000, [0, 0, null], [4, 5200], false],
    ['Կասկադ Կոնսալթինգ ՍՊԸ', 'postpaid', 0, null, [0, 0, null], [0, 0], true],
  ].map(([name, mode, emp, limit, s, o, closed]) => ({ name, mode, emp, limit, sep: { rides: s[0], amount: s[1], paidOn: s[2] }, oct: { rides: o[0], amount: o[1] }, closed,
    used: (s[2] || !s[1] ? 0 : s[1]) + o[1] }))
  CO.MODE = { postpaid: 'Հետվճար', prepaid: 'Կանխավճար' }

  /* Credit cell: share of the limit in use, a 48px bar, amber + triangle above 90 % (never colour alone). */
  CO.limitCell = (used, limit) => {
    if (!limit) return '<span class="dash">—</span>'
    const p = Math.round(used / limit * 100), near = p >= 90
    return `<span class="lim${near ? ' near' : ''}" title="${amd(used)} / ${amd(limit)}"><span class="bar3" aria-hidden="true"><i style="width:${Math.min(p, 100)}%"></i></span>`
      + (near ? `<span class="pill warn"><i data-lucide="triangle-alert"></i><span class="mono">${p} %</span></span>` : `<span class="mono">${p} %</span>`) + '</span>'
  }
  /* «Վճարված» mark: a checkbox the accountant ticks; who and when sit under it. An open month cannot be marked. */
  CO.paidCell = (paidOn, opts = {}) => {
    if (opts.empty) return '<span class="dash">—</span>'
    if (opts.open) return '<span class="check" aria-disabled="true" style="color:var(--ink-faint)"><i class="b" style="opacity:.5"></i>Բաց ամիս</span>'
    return paidOn
      ? `<span class="paid"><span class="check on" role="checkbox" aria-checked="true"><i class="b"></i>Վճարված</span><small>${opts.by || PAID_BY} · ${paidOn}</small></span>`
      : '<span class="check" role="checkbox" aria-checked="false"><i class="b"></i>Վճարված</span>'
  }
  /* Export + send, as one fixed group so rows line up. */
  CO.exportBtns = (who, s) => `<span class="xp">
      <button class="btn ghost ${s ? 's' : ''}" aria-label="Ներբեռնել Excel — ${who}" title="Excel"><i data-lucide="file-spreadsheet"></i>Excel</button>
      <button class="btn ghost ${s ? 's' : ''}" aria-label="Ներբեռնել CSV — ${who}" title="CSV">CSV</button>
      <button class="btn ghost ${s ? 's' : ''}" aria-label="Ներբեռնել PDF — ${who}" title="PDF">PDF</button></span>`

  /* «Ուղարկել ընկերությանը», inline under the report head (never a modal): the company's report address, the files, Send. */
  CO.sendPanel = (label) => `<div class="panel sendp" aria-label="Ուղարկել ընկերությանը">
      <h4><i data-lucide="mail"></i>Ուղարկել ընկերությանը<span class="faint" style="font:var(--c-small);font-weight:400">${label}</span></h4>
      <div class="sgrid">
        <div><label class="label">Ում</label><div class="input focus"><i data-lucide="at-sign"></i><span class="val mono">${CO.EMAIL}</span></div><p class="hint">Ընկերության էջից՝ Կարգավորումներ</p></div>
        <div><span class="label">Ֆայլեր</span><div class="row-flex" style="gap:12px;height:var(--h-m)"><span class="check on"><i class="b"></i>Excel</span><span class="check on"><i class="b"></i>PDF</span><span class="check"><i class="b"></i>CSV</span></div><p class="hint">&nbsp;</p></div>
        <div style="display:flex;gap:6px;padding-bottom:20px"><button class="btn ghost">Չեղարկել</button><button class="btn primary"><i data-lucide="send"></i>Ուղարկել</button></div>
      </div></div>`
  CO.sentNote = () => `<div class="notice neutral" role="status"><i data-lucide="check"></i><span>Ուղարկվեց՝ <span class="mono">${CO.EMAIL}</span> · Excel, PDF · 9:52</span></div>`

  /* The rides of a month for ECO.COMPANY: deterministic, newest first. Personal rides and rides of an unlinked employee
     are not company rides and never appear here. Owner 2026-10-14: no cost-centre code column. */
  const EMP = [[C.rider], ['Տիգրան Մանուկյան'], ['Լիանա Գրիգորյան'], ['Արսեն Սահակյան'], ['Նունե Պետրոսյան']]
  const ROUTES = [
    ['Վազգեն Սարգսյանի 26/1', 'Զվարթնոց օդանավակայան', 'Eco Comfort', 4300],
    ['Դավթաշեն 3-րդ թղմ.', 'Վազգեն Սարգսյանի 26/1', 'Eco City', 1600],
    ['Վազգեն Սարգսյանի 26/1', 'Կասկադ', 'Eco City', 1200],
    ['Կոմիտասի պող. 5', 'Վազգեն Սարգսյանի 26/1', 'Eco City', 1000],
    ['Արաբկիր 31', 'Վազգեն Սարգսյանի 26/1', 'Eco City', 1500],
    ['Վազգեն Սարգսյանի 26/1', 'Արշակունյաց 34', 'Eco City', 1100],
    ['Վազգեն Սարգսյանի 26/1', 'Թումանյան 12', 'Eco Business', 2100],
  ]
  CO.rides = (key, n) => {
    const days = key === '2026-10' ? 9 : key === '2026-09' ? 30 : 31, mm = key.slice(5)
    const out = []
    for (let i = 0; i < n; i++) {
      const d = days - Math.floor(i * days / n), h = 8 + (i * 5) % 12, m = (i * 17) % 60
      const [who] = EMP[(i * 3) % EMP.length], [a, b, tier, price] = ROUTES[(i * 5 + 1) % ROUTES.length]
      out.push({ at: `${String(d).padStart(2, '0')}.${mm} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, who, a, b, tier, price })
    }
    return out
  }
  /* The report table: bounded (the files carry every ride), a total row that is the month's own figure. */
  CO.table = (month, drawn = 18) => {
    const L = CO.rides(month.key, drawn)
    return `<table class="tbl rep" aria-label="Ուղևորություններ · ${month.label}"><colgroup><col style="width:124px"><col style="width:180px"><col><col style="width:140px"><col style="width:120px"></colgroup>
      <thead><tr><th>Ամսաթիվ</th><th>Աշխատակից</th><th>Երթուղի</th><th>Սակագին</th><th class="m">Գին</th></tr></thead>
      <tbody>${L.map((r) => `<tr><td class="mono">${r.at}</td><td class="trunc">${r.who}</td><td class="trunc">${r.a} → ${r.b}</td><td>${r.tier}</td><td class="m">${amd(r.price)}</td></tr>`).join('')}
        <tr class="cut"><td colspan="5">Ցուցադրված է ${drawn}-ը ${month.rides}-ից · ֆայլերում բոլորն են</td></tr></tbody>
      <tfoot><tr><td colspan="2">Ընդամենը</td><td class="c">${month.rides} ուղևորություն</td><td></td><td class="m">${amd(month.amount)}</td></tr></tfoot></table>`
  }
})()
