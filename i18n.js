/* Mockup translation: the mockups are written in Armenian; ?lang=ru|en shows them in Russian or English.
   kit.js loads this file only when ?lang= asks for it; the viewer (index.html) loads it for its own chrome.
   i18n/<lang>.js sets window.I18N_DICT = { "<Armenian, numbers as {#}>": "<translation, same {#}>" }.
   A text is looked up whole; failing that, split at « · », « — », « → » and looked up piece by piece. Numbers are
   lifted out first, so «4 րոպե» and «12 րոպե» are one entry «{#} րոպե». Misses collect in I18N.miss (tools/i18n-
   extract.mjs reads them to build the dictionaries). Text the dictionary lacks stays Armenian rather than guessed. */
;(() => {
  const HY = /[Ա-և]/
  const NUM = /\d+(?:[   .,:]\d+)*/g
  const SEP = /( · | — | → |\n)/
  const ATTRS = ['aria-label', 'title', 'placeholder', 'alt']
  const done = new WeakMap()
  const miss = new Set()
  let dict = null

  function one(s) {
    const nums = []
    const key = s.replace(NUM, (m) => { nums.push(m); return '{#}' })
    const t = dict[key]
    if (t == null) return null
    let i = 0
    return t.replace(/\{#\}/g, () => nums[i++] ?? '')
  }
  function tr(text) {
    if (!dict || !text || !HY.test(text)) return text
    const lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0], core = text.trim()
    let out = one(core)
    if (out == null) {
      const parts = core.split(SEP)
      out = parts.map((p, i) => {
        if (i % 2 || !HY.test(p)) return p
        const t = one(p.trim())
        if (t == null) { miss.add(p.trim().replace(NUM, '{#}')); return p }
        return p.replace(p.trim(), t)
      }).join('')
      if (parts.length === 1 && out === core) miss.add(core.replace(NUM, '{#}'))
    }
    return lead + out + tail
  }
  function node(n) {
    if (n.nodeType === 3) {
      if (done.get(n) === n.data) return
      const p = n.parentNode
      if (!p || p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE' || (p.closest && p.closest('[translate="no"]'))) return
      const t = tr(n.data)
      if (t !== n.data) n.data = t
      done.set(n, n.data)
    } else if (n.nodeType === 1) {
      /* The drawn Armenian keyboard and anything else marked translate="no" stays as drawn. */
      if (n.getAttribute('translate') === 'no') return
      for (const a of ATTRS) {
        const v = n.getAttribute(a)
        if (v && HY.test(v)) { const t = tr(v); if (t !== v) n.setAttribute(a, t) }
      }
      if (n.nodeName === 'INPUT' && n.value && HY.test(n.value)) n.value = tr(n.value)
      for (let c = n.firstChild; c; c = c.nextSibling) node(c)
    }
  }
  function apply(root) {
    if (!dict) return
    node(root || document.documentElement)
    if (HY.test(document.title)) document.title = tr(document.title)
  }
  let queued = false
  const pending = new Set()
  const mo = new MutationObserver((rs) => {
    for (const r of rs) {
      if (r.type === 'characterData') pending.add(r.target)
      else if (r.type === 'attributes') pending.add(r.target)
      else r.addedNodes.forEach((n) => pending.add(n))
    }
    if (!queued) { queued = true; queueMicrotask(() => { queued = false; const l = [...pending]; pending.clear(); l.forEach(node) }) }
  })
  window.I18N = {
    tr, apply, miss,
    use(d, lang) {
      dict = d
      document.documentElement.lang = lang
      apply()
      mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS })
    },
  }
})()
