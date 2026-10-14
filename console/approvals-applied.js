/* approvals.html?tab=applied (coverage C34): partner self-applications (ADR-V2 approval_status = applied). Drawn ahead:
   the real partner-approvals.tsx lists cars only. The applicant is the person the partner app shows in
   driver-partner-onboarding (applied); his car follows the existing car approval once he is accepted. Same layout as the
   car tab: oldest first on the left, everything needed to decide on the right, Reject needs a reason (vehicles.approval.*). */
(function () {
  if (new URLSearchParams(location.search).get('tab') !== 'applied') return
  const segs = document.querySelectorAll('.card-h .seg button')
  segs.forEach((b, i) => b.classList.toggle('on', i === 1))
  const A = [['Հովհաննես Գալստյան', 'ՀԳ', '099 31-75-02', 'այսօր, 08:55', 'Hyundai Ioniq 5 · 2023', 'business', 3, '19 HG 519', 'A-0007'], ['Նելլի Հովակիմյան', 'ՆՀ', '077 90-14-36', 'երեկ, 19:12', 'VW ID.3 · 2021', 'city', 2, '23 NH 230', 'A-0006']]
  document.getElementById('queue2').innerHTML = A.map(([n, ini, ph, when, car, tier, d, pl, id], i) => `<div class="qi${i === 0 ? ' on' : ''}" tabindex="0">
      <span class="car" style="display:grid;place-items:center"><span class="av">${ini}</span></span><b>${n}</b><span class="s"><span class="plate" style="height:20px">${pl}</span><span class="trunc mono">#${id}</span></span>
      <span class="r2"><span>${when}</span><span class="pill ${d < 3 ? 'warn' : 'ok'}" style="height:20px">${d < 3 ? '<i data-lucide="clock"></i>' : '<i data-lucide="circle-check"></i>'}${d}/3 փաստաթուղթ</span></span></div>`).join('')
  const [n, ini, ph, when, car, , , pl, id] = A[0]
  const docs = [['paper', 'Անձնագիր', 'passport.jpg'], ['paper', 'Վարորդական վկայական · B, 2015', 'licence.jpg'], ['face', 'Լուսանկար (սելֆի)', 'selfie.jpg']]
  document.getElementById('detail').innerHTML = `
    <div class="ah"><span class="car" style="display:grid;place-items:center"><span class="av l">${ini}</span></span>
      <div style="min-width:0"><h2>${n}</h2>
        <div class="meta"><span class="pill warn"><i data-lucide="clock"></i>Սպասում է հաստատման</span><span class="typ partner"><i data-lucide="handshake"></i>Գործընկերոջ հայտ</span><span class="faint" style="font:var(--c-small)">հավելվածից, ${when}</span></div>
        <dl><dt>Հեռախոս</dt><dd class="mono">${ph}</dd><dt>Մեքենա</dt><dd>${car} · <span class="plate" style="height:20px">${pl}</span></dd><dt>Հայտ</dt><dd class="mono">#${id}</dd><dt>Պայմաններ</dt><dd>տարբերակ 2 · ընդունել է</dd><dt>Ծննդյան տարի</dt><dd class="mono">1991</dd></dl></div></div>
    <div class="scroll-y grow">
      <div class="sect"><h3>Փաստաթղթեր <span class="sub">3 / 3 · սեղմեք՝ մեծացնելու համար</span></h3>
        <div class="docgrid">${docs.map(([k, t]) => `<div class="dt"><div class="pv">${k === 'paper' ? '<span class="paper"><i style="width:60%"></i><i></i><i></i><i style="width:80%"></i><i></i><i style="width:40%"></i></span>' : '<i data-lucide="user-round" style="color:var(--ink-faint);width:32px;height:32px"></i>'}</div>
          <div class="cap"><b>${t}</b><span class="check on" style="font-size:12px"><i class="b"></i>Ստուգված</span></div></div>`).join('')}</div></div>
      <div class="sect" style="border:0"><h3>Հաստատելուց հետո</h3>
        <div class="result" style="gap:8px;flex-wrap:wrap"><span class="pill ok"><i data-lucide="user-check"></i>1 · Գործընկեր</span><i data-lucide="chevron-right" style="width:16px;height:16px"></i><span class="pill"><i data-lucide="car"></i>2 · Մեքենան՝ հավելվածից</span><i data-lucide="chevron-right" style="width:16px;height:16px"></i><span class="pill"><i data-lucide="badge-check"></i>3 · Մեքենայի հաստատում</span><i data-lucide="chevron-right" style="width:16px;height:16px"></i><span class="pill"><i data-lucide="tag"></i>4 · Սակագին · միջնորդավճար</span></div></div>
    </div>
    <div class="decide">
      <div><label class="label">Մերժման պատճառ <span class="faint" style="font-weight:400">· պարտադիր, դիմողը կտեսնի</span></label>
        <div class="input"><span class="val ph">Ինչ պետք է ուղղի գործընկերը</span></div></div>
      <div class="acts"><button class="btn danger" aria-disabled="true" title="Նախ գրեք պատճառը" style="opacity:.55">Մերժել</button><button class="btn secondary">Խնդրել լրացնել</button><button class="btn primary">Հաստատել <span class="kbd">↵</span></button></div>
    </div>`
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
})()
