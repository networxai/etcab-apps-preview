/* Builds nav-data.js — every screen and state the viewer (index.html) lists — from the pages themselves:
   rider pages expose RIDER_CFG, driver pages DRIVER_STATES, the console gallery its G list. Re-run after adding a
   screen or a state:  node tools/build-nav.mjs http://localhost:8090   (serve docs/superpowers/design on that port).
   Needs @playwright/test resolvable from the working directory (run it from apps/operator). */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = (process.argv[2] || 'http://localhost:8090').replace(/\/$/, '')
const V2 = join(dirname(fileURLToPath(import.meta.url)), '..')
const CON = join(V2, '../../2026-10-11-console-v2')
const APPS = `${BASE}/2026-10-09-apps/v2`

const RIDER = [
  ['Մուտք', ['rider-opening', 'rider-login']],
  ['Պատվեր', ['rider-home', 'rider-search', 'rider-tiers', 'rider-book', 'rider-searching']],
  ['Ուղևորություն', ['rider-ride', 'trip-share', 'rider-done']],
  ['Պատմություն և հաշիվ', ['rider-history', 'rider-preorders', 'rider-account', 'rider-offline']],
]
const DRIVER = [
  ['Մուտք և հերթափոխ', ['driver-login', 'driver-ready', 'driver-shift', 'driver-home', 'driver-home-states']],
  ['Պատվերներ', ['driver-offer', 'driver-offer-states', 'driver-neworder', 'driver-preorders']],
  ['Ուղևորություն', ['driver-ride']],
  ['Վաստակ և հաշիվ', ['driver-earnings', 'driver-inbox', 'driver-account']],
  ['Գործընկեր', ['driver-types', 'driver-partner-onboarding', 'driver-partner-home', 'driver-partner-wallet', 'driver-partner-car']],
]
/* Screens with no state switcher of their own: their variants are query strings (from rider-index.html). */
const FIXED = {
  'rider-home': { title: 'Գլխավոր', states: [['', 'Գլխավոր'], ['active=1', 'Ընթացիկ ուղևորություն'], ['active=preorder', 'Նախնական պատվերը ակտիվացավ'], ['partner=lumen', 'Գործընկերոջ գովազդ'], ['ads=0', 'Առանց գովազդի'], ['new=1', 'Առաջին օր']] },
  'rider-tiers': { title: 'Սակագներ և գին', states: [['', 'Սակագներ']] },
  'trip-share': { title: 'Կիսված ուղևորություն', states: [['', 'Ընթացքում'], ['state=ended', 'Ավարտված']] },
  'driver-types': { title: 'Ավտոպարկի վարորդ և գործընկեր', device: 'desk', states: [['', 'Համեմատություն']] },
}

/* The viewer names screens in Armenian (the team's language); the page's own English title stays as the subtitle. */
const HY = {
  'rider-opening': 'Բացում', 'rider-login': 'Մուտք', 'rider-search': 'Հասցեի որոնում', 'rider-book': 'Պատվերի մանրամասներ',
  'rider-searching': 'Մեքենայի որոնում', 'rider-ride': 'Ուղևորություն', 'rider-done': 'Ավարտ և ստացական', 'rider-history': 'Պատմություն',
  'rider-preorders': 'Նախնական պատվերներ', 'rider-account': 'Հաշիվ', 'rider-offline': 'Կապ չկա և սխալներ',
  'driver-login': 'Մուտք', 'driver-ready': 'Պատրաստվածություն', 'driver-shift': 'Հերթափոխ', 'driver-home': 'Գլխավոր',
  'driver-home-states': 'Գլխավոր · վիճակներ', 'driver-offer': 'Առաջարկ', 'driver-offer-states': 'Առաջարկ · վիճակներ',
  'driver-neworder': 'Նոր պատվեր', 'driver-preorders': 'Նախնական պատվերներ', 'driver-ride': 'Ուղևորություն', 'driver-earnings': 'Վաստակ',
  'driver-inbox': 'Ծանուցումներ', 'driver-account': 'Հաշիվ', 'driver-partner-onboarding': 'Գրանցում', 'driver-partner-home': 'Գլխավոր',
  'driver-partner-wallet': 'Հաշվեկշիռ', 'driver-partner-car': 'Մեքենա',
  company: 'Ընկերության էջ', promotions: 'Ակցիաներ', dispatch: 'Դիսպետչերական', rides: 'Պատվերներ',
}

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 } })
async function app(file, kind) {
  if (FIXED[file]) return { file, title: FIXED[file].title, device: FIXED[file].device, states: FIXED[file].states.map(([q, label]) => ({ q, label })) }
  await p.goto(`${APPS}/${file}.html?theme=light${kind === 'driver' ? '&embed=1' : ''}`, { waitUntil: 'domcontentloaded' })
  await p.waitForFunction((k) => (k === 'rider' ? window.RIDER_CFG : window.DRIVER_STATES), kind, { timeout: 15000 })
  if (kind === 'rider') {
    const c = await p.evaluate(() => window.RIDER_CFG)
    return { file, title: HY[file] || c.title, en: c.title.replace(/^Rider · /, ''), sub: c.sub, states: c.states.map((s) => ({ q: `state=${s.id}`, label: s.label, group: s.group, note: s.note })) }
  }
  const [states, title] = await p.evaluate(() => [window.DRIVER_STATES, document.title])
  return { file, title: HY[file] || title, en: title.replace(/^Driver · |^ETCAB · /, ''), states: states.map(([id, label]) => ({ q: `state=${id}`, label })) }
}
/* One page, so one screen at a time. */
async function surface(id, label, kind, groups) {
  const out = []
  for (const [g, files] of groups) {
    const screens = []
    for (const f of files) screens.push(await app(f, kind))
    out.push({ label: g, screens })
  }
  return { id, label, kind, groups: out }
}

const NAV = [await surface('rider', 'Ուղևոր', 'rider', RIDER), await surface('driver', 'Վարորդ', 'driver', DRIVER)]
await b.close()

/* Console: the gallery's own list, one screen per page file, its variants as states. */
const src = readFileSync(join(CON, 'index.html'), 'utf8')
const G = new Function(`return ${src.slice(src.indexOf('const G = [') + 10, src.indexOf('\n  const T = window.THEME'))}`)()
NAV.push({ id: 'console', label: 'Վահանակ', kind: 'console', groups: G.map(([g, , items]) => {
  const by = new Map()
  for (const [f, t, te, note] of items) {
    const [fn, q = ''] = f.split('?')
    if (!by.has(fn)) by.set(fn, { file: `../../2026-10-11-console-v2/${fn}`, title: HY[fn] || t, states: [] })
    by.get(fn).states.push({ q, label: t, sub: te, note })
  }
  return { label: g, screens: [...by.values()] }
}) })
/* A console page listed under two groups keeps the first; its later variants join it. */
const seen = new Map()
for (const g of NAV[2].groups) g.screens = g.screens.filter((s) => (seen.has(s.file) ? (seen.get(s.file).states.push(...s.states), false) : (seen.set(s.file, s), true)))
NAV[2].groups = NAV[2].groups.filter((g) => g.screens.length)

const n = NAV.reduce((a, s) => a + s.groups.reduce((x, g) => x + g.screens.reduce((y, sc) => y + sc.states.length, 0), 0), 0)
writeFileSync(join(V2, 'nav-data.js'), `/* Generated by tools/build-nav.mjs — do not edit by hand. ${n} states. */\nwindow.NAV = ${JSON.stringify(NAV)}\n`)
console.log('nav-data.js:', n, 'states')
