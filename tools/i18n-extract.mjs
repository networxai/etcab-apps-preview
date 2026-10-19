/* Finds every Armenian text the ru / en dictionaries still lack, the way i18n.js will look it up:
   opens every state in nav-data.js with ?lang=<lang>, lets the page settle, and reads I18N.miss. Also lists the
   viewer's own strings and the English app-state labels i18n/labels.js maps to hy / ru.
     node tools/i18n-extract.mjs <V2 dir> en http://localhost:8090   → tools/i18n-src/miss-en.json, labels-miss.json
   Run from apps/operator (where @playwright/test resolves). Pages run 4 at a time. */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const [V2, LANG = 'en', BASE = 'http://localhost:8090'] = process.argv.slice(2)
const OUT = join(V2, 'tools/i18n-src'); mkdirSync(OUT, { recursive: true })
const src = readFileSync(join(V2, 'nav-data.js'), 'utf8')
const NAV = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1))
const HY = /[Ա-և]/, NUM = /\d+(?:[   .,:]\d+)*/g

const jobs = []
for (const sf of NAV) for (const g of sf.groups) for (const sc of g.screens) for (const st of sc.states) {
  const p = sc.file.startsWith('../../') ? sc.file.replace('../../', '') : `2026-10-09-apps/v2/${sc.file}`
  jobs.push({ url: `${BASE}/${p}.html?theme=light&embed=1&lang=${LANG}${st.q ? '&' + st.q : ''}`, where: `${sc.file.split('/').pop()}?${st.q}` })
}
const miss = new Map()
const add = (k, where) => { if (!miss.has(k)) miss.set(k, new Set()); if (miss.get(k).size < 3) miss.get(k).add(where) }

/* Strings the viewer itself shows (titles, groups, Armenian console labels). */
for (const sf of NAV) {
  add(sf.label, 'viewer')
  for (const g of sf.groups) { add(g.label, 'viewer'); for (const sc of g.screens) { add(sc.title, 'viewer'); for (const st of sc.states) if (HY.test(st.label)) add(st.label.replace(NUM, '{#}'), 'viewer') } }
}
const vsrc = readFileSync(join(V2, 'index.html'), 'utf8') + readFileSync(join(V2, 'viewer.js'), 'utf8') + readFileSync(join(V2, 'kit.js'), 'utf8').split('«Բոլոր էկրանները»')[1]
for (const m of vsrc.matchAll(/[>'"`]([^<>'"`$]*[Ա-և][^<>'"`$]*)[<'"`]/g)) for (const part of m[1].trim().split(/ · | — | → /)) if (HY.test(part)) add(part.trim().replace(NUM, '{#}'), 'viewer')

const b = await chromium.launch()
let i = 0
async function worker() {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  p.on('pageerror', (e) => console.warn('pageerror', e.message))
  while (i < jobs.length) {
    const j = jobs[i++]
    try {
      await p.goto(j.url, { waitUntil: 'load', timeout: 30000 })
      await p.waitForFunction(() => window.I18N && window.I18N.miss, null, { timeout: 15000 })
      await p.waitForTimeout(1200)
      for (const k of await p.evaluate(() => [...window.I18N.miss])) add(k, j.where)
    } catch (e) { console.warn('skip', j.where, e.message.split('\n')[0]) }
  }
  await p.close()
}
await Promise.all([worker(), worker(), worker(), worker()])
await b.close()

const dictPath = join(V2, 'i18n', LANG + '.js')
const have = existsSync(dictPath) ? JSON.parse((s => s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1))(readFileSync(dictPath, 'utf8')) || '{}') : {}
const out = Object.fromEntries([...miss].filter(([k]) => HY.test(k) && !(k in have)).sort().map(([k, w]) => [k, [...w]]))
writeFileSync(join(OUT, `miss-${LANG}.json`), JSON.stringify(out, null, 1))

/* English labels the viewer shows for app states (i18n/labels.js maps them to hy and ru). */
const lp = join(V2, 'i18n', 'labels.js')
const lhave = existsSync(lp) ? JSON.parse((s => s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1))(readFileSync(lp, 'utf8')) || '{}') : {}
const labels = new Set()
for (const sf of NAV) for (const g of sf.groups) for (const sc of g.screens) for (const st of sc.states) for (const s of [st.label, st.group]) if (s && !HY.test(s) && !(s in lhave)) labels.add(s)
writeFileSync(join(OUT, 'labels-miss.json'), JSON.stringify([...labels].sort(), null, 1))
console.log(`${LANG}: ${Object.keys(out).length} missing strings over ${jobs.length} states; ${labels.size} labels`)
