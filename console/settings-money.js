/* Settings → Money and Settings → Invoicing (p1p2 pass, C45). Uses settings.html's N / SW / G row builders.
   Money mirrors apps/operator components/admin/money-settings.tsx: the settlement policy per driver type (two columns),
   the office's top-up SMS receipt, the top-up instructions the driver app shows, and the tax lines (off until the
   accountant decides). Strings: lib/money-i18n.ts hy (moneySettings.*). Values are the ones the apps show:
   fleet −5 000 ֏ stop / −3 000 ֏ warn (driver-earnings «Սահմանաչափ՝ −5 000 ֏»), partner 0 / 3 000 ֏ (ECO.PARTNER).
   Invoicing mirrors components/settings/invoicing-settings.tsx (seller, numbering and terms, tax lines, corporate
   credit). In the real console those groups sit at the bottom of the Money tab (money-settings.tsx renders
   <InvoicingSettings/> last); here they are their own tab head — drawn ahead (NOTES). Strings: lib/invoicing-i18n.ts. */
window.drawMoneyTab = function (tab) {
  const col = document.getElementById('col')
  const P = ECO.PARTNER
  const SEL = (l, v, hint) => `<div class="set"><span class="l">${l}${hint ? `<small>${hint}</small>` : ''}</span><span class="v"><span class="input sel"><span class="val">${v}</span><i data-lucide="chevron-down"></i></span><span class="u"></span></span></div>`
  const TXT = (l, v, hint) => `<div class="set txt"><span class="l">${l}${hint ? `<small>${hint}</small>` : ''}</span><span class="input"><span class="val">${v}</span></span></div>`
  const foot = (rev) => `<div class="foot"><button class="btn primary">Պահպանել</button><button class="btn secondary">Վերականգնել լռելյայնը</button><span class="rev">Տարբերակ ${rev} · մեկ կարգավորում, մեկ պահպանում</span></div>`
  const style = document.createElement('style')
  style.textContent = `
    .col.wide { width: 1040px; }
    .types { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--line-soft); }
    .types > div + div { border-left: 1px solid var(--line-soft); }
    .types h3 { font: var(--c-label); color: var(--ink-muted); padding: 10px var(--inset) 2px; display: flex; align-items: center; gap: 6px; }
    .types .set { grid-template-columns: minmax(0, 1fr) 236px; }
    .types .set .v .input { width: 112px; }
    .set .v .input.sel { width: 192px; } .input.sel .val { text-align: left !important; }
    .set.txt { grid-template-columns: 200px minmax(0, 1fr); }
    .types .set.stack { grid-template-columns: minmax(0, 1fr) auto; } .types .set.stack .input.sel { width: 248px; }
    .set.txt .input .val { white-space: nowrap; }
    .tok { display: flex; align-items: center; gap: 6px; padding: 6px var(--inset) 10px; border-top: 1px solid var(--line-soft); font: var(--c-small); color: var(--ink-muted); }
    .tok .tag { cursor: pointer; }
    .grp .notice { margin: 0 var(--inset) 10px; }
    .apply { display: flex; gap: 12px; }
    .ex2 { font: var(--c-small); color: var(--ink-muted); } .ex2 b { font: 500 12px/16px var(--mono); color: var(--ink); }`
  document.head.appendChild(style)
  if (tab === 'money') {
    col.classList.add('wide')
    const typeCol = (title, icon, mode, block, stop, warn) => `<div><h3><i data-lucide="${icon}"></i>${title}</h3>
      <div class="set stack"><span class="l">Հաշվարկի ձև</span><span class="input sel"><span class="val">${mode}</span><i data-lucide="chevron-down"></i></span></div>${SW('Դադարեցնել կանխիկ պատվերները պարտքի դեպքում', block)}
      ${N('Դադարեցնել՝ ցածր', ECO.num(stop), '֏', 'Զրո կամ պակաս')}${N('Զգուշացնել՝ ցածր', ECO.num(warn), '֏', 'մոտ մեկ օրվա վճարներ')}</div>`
    col.innerHTML = `
      <p class="lead">Հաշվարկի կանոնները՝ ըստ վարորդի տեսակի, լիցքավորման անդորրագիրը և հրահանգները, հարկերը։ Նույն կարգավորումն է, ինչ Դիսպետչեր ներդիրում՝ մեկ պահպանում։</p>
      <section class="grp"><h2>Ըստ վարորդի տեսակի</h2>
        <div class="types">${typeCol('Ընկերության', 'car', 'Կանխիկից պահում', true, -5000, -3000)}${typeCol('Գործընկեր', 'handshake', 'Կանխավճարային դրամապանակ', true, P.blockBelow, P.warnBelow)}</div></section>
      ${G('Լիցքավորման SMS անդորրագիր', [SW('Ուղարկել անդորրագիր', true),
        TXT('Լիցքավորում', 'Ստացվել է {amount}։ Հաշվեկշիռ՝ {balance}։ Կոդ՝ {reference}։'),
        TXT('Վճարում վարորդին', 'Վճարվել է {amount}։ Հաշվեկշիռ՝ {balance}։'),
        TXT('Չեղարկում', 'Չեղարկվել է {amount}։ Հաշվեկշիռ՝ {balance}։'),
        `<div class="tok">Տեղապահներ<span class="tag">{amount}</span><span class="tag">{balance}</span><span class="tag">{reference}</span><span class="faint">· Տեղադրել՝ սեղմեք</span></div>`])}
      ${G('Լիցքավորման հրահանգներ', [TXT('Գրասենյակում', `${P.office.address} · ${P.office.hours}`), TXT('Բանկային փոխանցմամբ', `${P.bank.holder} · ${P.bank.name} · ${P.bank.account}`)], 'Ցուցադրվում է վարորդներին հավելվածում՝ դրամապանակի տակ')}
      <section class="grp"><h2>Հարկեր</h2><div class="notice neutral"><i data-lucide="info"></i><span>Դրույքաչափերը և դրանց կիրառումը որոշում է հաշվապահը։ Թողեք անջատված, մինչև որոշումը կայացվի։</span></div>
        ${SEL('Հարկ վճարների վրա', 'Անջատված')}${N('Վճարի հարկի դրույքաչափ', '', '%', '', '—')}${SW('Պահում', false)}${N('Դրույքաչափ՝ կանխիկ պատվերներ', '', '%', '', '—')}${N('Դրույքաչափ՝ անկանխիկ պատվերներ', '', '%', '', '—')}
        <div class="set"><span class="l">Կիրառվում է</span><span class="v apply"><span class="check"><i class="b"></i>Ընկերության</span><span class="check on"><i class="b"></i>Գործընկեր</span></span></div></section>
      ${foot(14)}`
  } else {
    col.innerHTML = `
      <p class="lead">Ինչ է տպվում ընկերություններին ուղարկվող հաշիվների վրա և ինչպես են դրանք համարակալվում։</p>
      ${G('Հաշվի վաճառող', [TXT('Իրավաբանական անվանում', ECO.FISCAL.seller), TXT('ՀՎՀՀ', `<span class="mono">${ECO.FISCAL.tin}</span>`), TXT('Հասցե', 'Երևան, ' + P.office.address),
        TXT('Բանկային վավերապայմաններ', `${P.bank.name} · <span class="mono">${P.bank.account}</span>`), TXT('Էլ․ փոստ', '<span class="mono">billing@ecotaxi.am</span>'), TXT('Հեռախոս', `<span class="mono">${ECO.DISPATCH.phone}</span>`)],
        'Տպվում է յուրաքանչյուր հաշվի վրա։ Թողարկումը մերժվում է, քանի դեռ իրավաբանական անվանումը, ՀՎՀՀ-ն, հասցեն և բանկային տվյալները լրացված չեն։')}
      ${G('Համարակալում և ժամկետներ', [N('Հաշիվների սերիա', 'INV', ''), N('Կրեդիտային հաշիվների սերիա', 'CRN', ''),
        `<div class="set"><span class="l">Համարի ձևաչափ<small class="ex2">Հաջորդ համարը կլինի <b>${ECO.COMPANY.invoice.replace(/\d+$/, (n) => String(+n + 1).padStart(5, '0'))}</b></small></span><span class="v"><span class="input" style="width:176px"><span class="val mono">{series}-{year}-{n}</span></span><span class="u"></span></span></div>`,
        N('Լռելյայն վճարման ժամկետ', '15', 'օր'), SEL('Փաստաթղթերի լեզու', 'Հայերեն')])}
      <section class="grp"><h2>Հարկային տողեր հաշիվներում</h2><div class="notice neutral"><i data-lucide="info"></i><span>Հաշիվներում հարկային տողեր առայժմ չկան. հարկերի հաշվառումը դեռ չի աջակցվում։ Որ դրույքներն են կիրառվում՝ որոշում է ձեր հաշվապահը։</span></div>
        <div class="set"><span class="l faint">Հարկային տողեր չկան</span><span class="v"><button class="btn secondary s" aria-disabled="true" style="opacity:.5"><i data-lucide="plus"></i>Հարկային տող</button><span class="u"></span></span></div></section>
      ${G('Կորպորատիվ վարկ', [N('Հաշվիչով ուղևորության գնահատում', ECO.num(3000), '֏')], 'Որքան է անհայտ վարձով ընկերության ուղևորությունը հաշվվում վարկային սահմանաչափից, մինչև վարձը հայտնի դառնա։')}
      ${foot(14)}`
  }
}
