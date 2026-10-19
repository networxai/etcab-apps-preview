/* partners.html detail tabs Car · Documents · Rides · ★ (coverage C33). Loaded after the page script; replaces the
   Overview body for ?tab=car|docs|rides|rating. Real: partner-tabs.tsx / partner-detail.tsx (Overview + Wallet are built);
   these four are drawn ahead on the same blocks as Overview. Strings: partners-i18n.ts / i18n.ts hy where they exist. */
(function () {
  const tab = new URLSearchParams(location.search).get('tab')
  if (!['car', 'docs', 'rides', 'rating'].includes(tab)) return
  document.head.insertAdjacentHTML('beforeend', `<style>
    .ph4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }
    .ph4 figure { border-radius: 8px; background: var(--surface); box-shadow: inset 0 0 0 1px var(--line-soft); height: 64px; display: flex; align-items: flex-end; justify-content: center; position: relative; overflow: hidden; }
    .ph4 figure img { max-width: 92%; max-height: 52px; }
    .ph4 figcaption { position: absolute; left: 4px; top: 2px; font: var(--c-small); color: var(--ink-muted); }
    .hist { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 6px 10px; font: var(--c-body); margin-top: 8px; }
    .hist .mono { font-size: 12px; color: var(--ink-muted); }
    .lt { width: 100%; border-collapse: collapse; font: var(--c-body); table-layout: fixed; margin-top: 6px; }
    .lt td, .lt th { padding: 6px 0; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
    .lt th { font: var(--c-label); color: var(--ink-faint); text-align: left; }
    .lt .n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .lt td small { display: block; font: var(--c-small); color: var(--ink-faint); }
    .lt col.w { width: 52px; } .lt col.a { width: 72px; } .lt col.f { width: 96px; }
    .bars { display: grid; grid-template-columns: 24px minmax(0, 1fr) 32px; gap: 4px 8px; align-items: center; font: var(--c-small); color: var(--ink-muted); margin-top: 8px; }
    .bars i { display: block; height: 6px; border-radius: 3px; background: var(--ink); }
    .bars span:last-child { text-align: right; }
  </style>`)
  const sc = document.querySelector('#dp .scroll-y')
  const tabs = sc.querySelector('.tabsl')
  let n = tabs.nextElementSibling; while (n) { const x = n.nextElementSibling; n.remove(); n = x }
  const p = PARTNERS[+(new URLSearchParams(location.search).get('p') ?? 2)], T = tierById(p.tier)
  const add = (h) => sc.insertAdjacentHTML('beforeend', h)
  const rule = ECO.PARTNER.rules[p.tier === 'partner' ? 'comfort' : p.tier]
  const blockedNote = p.bal < rule.blockBelow && p.appr !== 'suspended' ? `<div style="margin:12px var(--inset) 0"><div class="notice amber"><i data-lucide="lock"></i><span>Պատվերները կանգնած են՝ հաշվեկշիռ · մեքենան և փաստաթղթերը կարգին են</span></div></div>` : ''
  if (tab === 'car') {
    const [at, aw, ai] = APPR[p.appr]
    add(`${blockedNote}<div class="blk"><h3><i data-lucide="car"></i>Մեքենա<span class="end pill ${at}" style="height:20px"><i data-lucide="${ai}"></i>${aw}</span></h3>
      <div class="shift"><span class="car" style="width:100%;height:76px">${carImg(p.tier, T.name)}</span>
        <dl class="facts"><dt>Համարանիշ</dt><dd><span class="plate">${p.plate}</span></dd><dt>Մոդել</dt><dd>${p.model.split(' · ')[0]}</dd><dt>Տարի · գույն</dt><dd>${p.model.split(' · ').slice(1).join(' · ')}</dd><dt>Սակագին</dt><dd>${T.name}</dd></dl></div>
      <div class="ph4">${['Առջև', 'Հետև', 'Ձախ', 'Սրահ'].map((s) => `<figure><figcaption>${s}</figcaption>${carImg(p.tier)}</figure>`).join('')}</div>
      <div class="row-flex" style="gap:6px;margin-top:10px"><button class="btn secondary s">Փոխել սակագինը</button><span style="flex:1"></span><button class="btn danger s"><i data-lucide="pause"></i>Կասեցնել մեքենան</button></div></div>
    <div class="blk" style="margin-bottom:12px"><h3><i data-lucide="history"></i>Հաստատման պատմություն</h3>
      <div class="hist"><span class="mono">03.10</span><span>Ներկայացրեց հավելվածից · 4 լուսանկար, 2 փաստաթուղթ</span><span class="mono">03.10</span><span>Մերժվեց՝ «Սրահի լուսանկարը մութ է» · Սարգիս Ա.</span><span class="mono">04.10</span><span>Նորից ներկայացրեց</span><span class="mono">04.10</span><span>Հաստատվեց՝ <b>${T.name}</b> · Սարգիս Ա.</span></div></div>`)
  }
  if (tab === 'docs') {
    add(`<div class="blk" style="margin-bottom:12px"><h3><i data-lucide="file-text"></i>Փաստաթղթեր<span class="end pill warn" style="height:20px"><i data-lucide="clock"></i>1 լրանում է</span></h3>
      <div class="docs" data-truncate>
        <div class="doc"><span class="ic"><i data-lucide="file-text"></i></span><span class="t"><b>Վարորդական վկայական</b><span>Վարորդ · licence.pdf</span></span><span class="pill ok">Մինչև <span class="num">14.04.2028</span></span><button class="btn ghost icon s" aria-label="Ներբեռնել"><i data-lucide="download"></i></button></div>
        <div class="doc"><span class="ic"><i data-lucide="file-text"></i></span><span class="t"><b>Ապահովագրություն (ԱՊՊԱ)</b><span>Մեքենա · osago.pdf</span></span><span class="pill warn"><i data-lucide="clock"></i>Մինչև <span class="num">20.10.2026</span> · 6 օր</span><button class="btn ghost icon s" aria-label="Ներբեռնել"><i data-lucide="download"></i></button></div>
        <div class="doc"><span class="ic"><i data-lucide="file-text"></i></span><span class="t"><b>Տեխանձնագիր</b><span>Մեքենա · tech-passport.pdf</span></span><span class="pill">Առանց ժամկետի</span><button class="btn ghost icon s" aria-label="Ներբեռնել"><i data-lucide="download"></i></button></div>
        <div class="doc"><span class="ic"><i data-lucide="file-text"></i></span><span class="t"><b>Գործընկերոջ պայմաններ · տարբերակ 2</b><span>Ընդունել է հավելվածում · 02.10.2026</span></span><span class="pill ok">Ընդունված է</span><span></span></div>
      </div>
      <p class="faint" style="font:var(--c-small);margin-top:8px;display:flex;gap:6px;align-items:center"><i data-lucide="lock" style="width:16px;height:16px;flex:none"></i>Ժամկետանց ապահովագրություն՝ պատվերները կանգնում են մինչև նորի հաստատումը · ծանուցում 14 և 3 օր առաջ</p>
      <div class="dropz"><i data-lucide="upload"></i>Քաշեք ֆայլն այստեղ կամ <u>ընտրեք</u></div></div>`)
  }
  if (tab === 'rides') {
    add(`${blockedNote}<div class="blk" style="margin-bottom:12px"><h3 style="flex-wrap:wrap"><i data-lucide="list"></i>Պատվերներ<span class="end faint num" style="font-weight:400">10.10 · 3 պատվեր · միջնորդավճար 1 110 ֏</span></h3>
      <table class="lt"><colgroup><col class="w"><col><col class="a"><col class="f"></colgroup><thead><tr><th>Ժամը</th><th>Երթուղի</th><th class="n">Գին</th><th class="n">Միջնորդավճար</th></tr></thead><tbody>
      ${[['19:02', 'Աբովյան 12 → Երևան Մոլ', '#R-20288 · Կանխիկ', 2400, -360], ['18:40', 'Պուշկինի 15 → Նալբանդյան 50', '#R-20281 · Կանխիկ · հաշվեկշիռը 0-ից ցածր', 1900, -285], ['17:55', 'Կոմիտաս 49 → Զվարթնոց', '#R-20270 · ' + ECO.COMPANY.short, 3100, -465], ['13:58', 'Աբովյան 12 → Երևան Մոլ', '#R-20409 · Կանխիկ', 1900, -285]]
        .map(([t, r, s, f, fee]) => `<tr><td class="mono">${t}</td><td>${r}<small class="mono">${s}</small></td><td class="n mono">${amd(f)}</td><td class="n mono">${amd(fee)}</td></tr>`).join('')}
      </tbody></table></div>`)
  }
  if (tab === 'rating') {
    const bar = (s, k, w) => `<span class="mono">${s}★</span><span><i style="width:${w}%"></i></span><span class="mono">${k}</span>`
    add(`<div class="blk"><h3><i data-lucide="star"></i>Գնահատական<span class="end faint" style="font-weight:400">վերջին 30 օր</span></h3>
      <div class="bigbal" style="margin-top:4px">4,8 <small class="faint" style="font:var(--c-small)">/ 5 · 96 գնահատված</small></div>
      <div class="bars">${bar(5, 82, 85)}${bar(4, 9, 9)}${bar(3, 3, 3)}${bar(2, 1, 1)}${bar(1, 1, 1)}</div></div>
    <div class="blk" style="margin-bottom:12px"><h3><i data-lucide="message-square"></i>Մեկնաբանություններ</h3>
      <table class="lt"><colgroup><col class="w"><col><col class="a"></colgroup><tbody>
      ${[['10.10', '«Հաճելի երաժշտություն, մաքուր»', '#R-20270', 5], ['08.10', '«Ուշացավ 10 րոպե»', '#R-20190 · դիտված է՝ Սարգիս Ա.', 2]]
        .map(([t, c, s, k]) => `<tr><td class="mono">${t}</td><td>${c}<small class="mono">${s}</small></td><td class="n">${k <= ECO.DISPATCH.lowRating.max ? `<span class="pill warn" style="height:20px">★${k}</span>` : `<span class="mono">★${k}</span>`}</td></tr>`).join('')}
      </tbody></table></div>`)
  }
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
})()
