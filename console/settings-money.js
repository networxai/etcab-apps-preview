/* Settings → Money (p1p2 pass, C45; owner decisions 3 and 11, 2026-10-14). Uses settings.html's N / SW / G row builders.
   Mirrors apps/operator components/admin/money-settings.tsx, cut to what still exists:
   - Fleet drivers have NO balance (decision 3): the per-driver-type settlement columns are gone. Partner rules (fee,
     warn, block) are per tariff and live in each tariff's «Միջնորդավճար» section (tariffs.html?sec=commission, change list 2026-10-15); this tab links there instead of repeating them.
   - No invoices (decision 11): the Invoicing tab (seller, numbering, credit notes, terms) is gone; ?tab=invoicing opens
     this tab. The corporate credit estimate for a metered company ride stays: the credit limit still exists.
   - Kept: the partner top-up SMS receipt, the top-up instructions the partner app shows, the tax lines (off until the
     accountant decides). Strings: lib/money-i18n.ts hy (moneySettings.*), shortened. */
window.drawMoneyTab = function () {
  const col = document.getElementById('col')
  const P = ECO.PARTNER
  const SEL = (l, v, hint) => `<div class="set"><span class="l">${l}${hint ? `<small>${hint}</small>` : ''}</span><span class="v"><span class="input sel"><span class="val">${v}</span><i data-lucide="chevron-down"></i></span><span class="u"></span></span></div>`
  const TXT = (l, v, hint) => `<div class="set txt"><span class="l">${l}${hint ? `<small>${hint}</small>` : ''}</span><span class="input"><span class="val">${v}</span></span></div>`
  const style = document.createElement('style')
  style.textContent = `
    .set .v .input.sel { width: 192px; } .input.sel .val { text-align: left !important; }
    .set.txt { grid-template-columns: 200px minmax(0, 1fr); }
    .set.txt .input .val { white-space: nowrap; }
    .tok { display: flex; align-items: center; gap: 6px; padding: 6px var(--inset) 10px; border-top: 1px solid var(--line-soft); font: var(--c-small); color: var(--ink-muted); }
    .tok .tag { cursor: pointer; }
    .grp .notice { margin: 0 var(--inset) 10px; }
    .link { display: flex; align-items: center; gap: 12px; padding: 12px var(--inset); border-radius: var(--r-card); background: var(--surface); box-shadow: inset 0 0 0 1px var(--line-soft); font: var(--c-body); }
    .link .grow { color: var(--ink-muted); }`
  document.head.appendChild(style)
  col.innerHTML = `
    <div class="link"><i data-lucide="handshake"></i><span class="grow"><b style="color:var(--ink);font-weight:500">Գործընկերներ</b> · միջնորդավճար և նվազագույն հաշվեկշիռ՝ ըստ սակագնի</span>
      <a class="btn secondary s" href="tariffs.html?theme=${THEME}&t=comfort&sec=commission" style="text-decoration:none">Սակագներ<i data-lucide="arrow-right"></i></a></div>
    ${G('Լիցքավորման SMS', [SW('Ուղարկել SMS գործընկերին', true),
      TXT('Լիցքավորում', 'Ստացվել է {amount}։ Հաշվեկշիռ՝ {balance}։ Կոդ՝ {reference}։'),
      TXT('Չեղարկում', 'Չեղարկվել է {amount}։ Հաշվեկշիռ՝ {balance}։'),
      `<div class="tok">Տեղադրել՝<span class="tag">{amount}</span><span class="tag">{balance}</span><span class="tag">{reference}</span></div>`])}
    ${G('Ինչպես լիցքավորել', [TXT('Գրասենյակում', `${P.office.address} · ${P.office.hours}`), TXT('Բանկային փոխանցում', `${P.bank.holder} · ${P.bank.name} · <span class="mono">${P.bank.account}</span>`)], 'Գործընկերը տեսնում է հավելվածում՝ հաշվեկշռի տակ')}
    ${G('Ընկերության հաշվին', [N('Սահմանաչափից պահվող գումար', ECO.num(3000), '֏', 'երբ գինը դեռ հայտնի չէ (հաշվիչով)')])}
    <section class="grp"><h2>Հարկեր</h2><div class="notice neutral"><i data-lucide="info"></i><span>Դրույքները որոշում է հաշվապահը․ մինչ այդ՝ անջատված</span></div>
      ${SEL('Հարկ միջնորդավճարի վրա', 'Անջատված')}${N('Դրույք', '', '%', '', '—')}${SW('Հարկի պահում', false)}${N('Դրույք՝ կանխիկ', '', '%', '', '—')}${N('Դրույք՝ անկանխիկ', '', '%', '', '—')}</section>
    <div class="foot"><button class="btn primary">Պահել</button><button class="btn secondary">Վերականգնել լռելյայնը</button><span class="rev">Տարբերակ 14</span></div>`
}
