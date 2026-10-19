async (page) => {
  /* Audits every state of the listed rider-/driver- pages in day and night (driver also in sun).
     Returns failures only. Generated from auditall.tpl.js by mk-audit.sh. */
  const BASE = 'http://localhost:8090/2026-10-09-apps/v2/'
  const files = '__FILES__'.split(' ')
  const ctx = await page.context().browser().newContext({ viewport: { width: 390, height: 844 } })
  const out = {}; let runs = 0
  const one = async (url) => {
    const p = await ctx.newPage(); const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    p.on('console', (m) => { if (m.type() === 'error' && !/mapgl\.local\.js|404/.test(m.text())) errs.push(m.text().slice(0, 120)) })
    try {
      await p.goto(BASE + url, { waitUntil: 'load', timeout: 30000 })
      await p.waitForFunction(() => document.documentElement.dataset.mapReady, null, { timeout: 25000 }).catch(() => errs.push('mapReady timeout'))
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400)
      const a = await p.evaluate(() => window.audit ? window.audit() : { missing: true })
      runs++
      const bad = a.missing ? ['no audit.js'] : [...a.overlaps, ...a.clips, ...a.contrast]
      if (bad.length || errs.length) out[url] = { bad, errs }
    } catch (e) { out[url] = { fatal: String(e).slice(0, 160) } }
    await p.close()
  }
  for (const f of files) {
    const p = await ctx.newPage()
    await p.goto(BASE + f + '.html?state=__probe__', { waitUntil: 'domcontentloaded' })
    await p.waitForTimeout(800)
    let states = await p.evaluate(() => window.RIDER_STATES || [...document.querySelectorAll('.dswitch a[href*="state="]')].map((a) => new URL(a.href).searchParams.get('state')))
    if (f.startsWith('rider-') && !(await p.evaluate(() => !!window.RIDER_STATES))) {
      await p.goto(BASE + f + '.html', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(500)
      states = (await p.evaluate(() => window.RIDER_STATES)) || []
    }
    await p.close()
    states = [...new Set(states)]
    const themes = f.startsWith('driver-') ? ['theme=light', 'theme=dark', 'theme=light&sun=1'] : ['theme=light', 'theme=dark']
    for (const st of (states.length ? states : [null])) for (const th of themes) await one(`${f}.html?${st ? 'state=' + st + '&' : ''}${th}`)
  }
  await ctx.close()
  return JSON.stringify({ runs, failures: out })
}
