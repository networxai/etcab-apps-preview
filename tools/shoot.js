async (page) => {
  const V = '/home/vardan/projects/ETCAB/.claude/worktrees/console-linear-pass/docs/superpowers/design/2026-10-09-apps/v2/'
  const want = 'rider-home rider-home?preorder=1 rider-tiers driver-home driver-offer'.split(' ')
  const ctx = await page.context().browser().newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  const out = {}
  for (const spec of want) {
    const [screen, q] = spec.split('?')
    for (const theme of ['light', 'dark']) {
      const p = await ctx.newPage()
      const errs = []
      p.on('pageerror', (e) => errs.push(e.message))
      p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
      await p.goto(`http://localhost:8090/2026-10-09-apps/v2/${screen}.html?theme=${theme}${q ? '&' + q : ''}`, { waitUntil: 'load' })
      await p.waitForFunction(() => document.documentElement.dataset.mapReady, null, { timeout: 30000 })
      const provider = await p.evaluate(() => document.documentElement.dataset.mapReady)
      await p.evaluate(() => document.fonts.ready)
      await p.waitForTimeout(1500)
      const tag = q ? '-' + q.replace(/=1$/, '').replace(/[^a-z]/g, '') : ''
      await p.screenshot({ path: `${V}shots/${screen}${tag}-${theme}.png` })
      const a = await p.evaluate(() => window.audit())
      out[`${screen}${tag}-${theme}`] = { provider, errs, overlaps: a.overlaps, excepted: a.excepted, clips: a.clips, contrast: a.contrast, worstMargin: a.worstMargin, checked: a.checked }
      await p.close()
    }
  }
  await ctx.close()
  return JSON.stringify(out)
}
