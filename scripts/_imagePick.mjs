// Pure helpers for scripts/fill-images.mjs (kept separate so they can be unit tested).
//
// How a word gets its picture: search Wikidata for items whose Chinese label is exactly the
// word (苹果 → Q89 "apple", Q312 "Apple Inc."), drop things that aren't the everyday concept
// (companies, films, people, ...), keep the one whose English label best matches our English
// gloss, and use its main image (property P18) from Wikimedia Commons, if openly licensed.

// "instance of" values that mean the item is a named thing, not the everyday concept
export const BLOCKED_INSTANCE_OF = new Set([
  'Q5', // human
  'Q4830453', 'Q783794', 'Q891723', 'Q6881511', 'Q431289', 'Q167270', // business, company, brand, trademark
  'Q11424', 'Q5398426', 'Q482994', 'Q134556', 'Q7366', 'Q215380', 'Q7889', // film, TV series, album, single, song, band, video game
  'Q571', 'Q47461344', 'Q7725634', 'Q1002697', 'Q41298', 'Q11032', 'Q13442814', // books, periodicals, articles
  'Q4167410', 'Q101352', 'Q202444', 'Q12308941', 'Q11879590', // disambiguation page, family/given names
  'Q14350', 'Q1616075', 'Q15416', // radio/TV station, TV programme
  'Q515', 'Q486972', 'Q1549591', 'Q3957', 'Q532', // specific city, settlement, town, village
])

const STOP = new Set(['a', 'an', 'the', 'of', 'to', 'or', 'and', 'for', 'in', 'on', 'be', 'sb', 'sth', 'something', 'someone', 'kind', 'type', 'measure', 'word'])

/** Crude English singular: buses → bus, berries → berry, cats → cat (bus, glass unchanged) */
function stem(t) {
  if (/ies$/.test(t)) return t.slice(0, -3) + 'y'
  if (/(s|x|ch|sh)es$/.test(t)) return t.slice(0, -2)
  if (/[^su]s$/.test(t)) return t.slice(0, -1)
  return t
}

/** "apple; apple tree (fruit)" → { phrases: ["apple", "apple tree"], tokens: Set{apple, tree, fruit} } */
export function glossTerms(texts) {
  const phrases = new Set()
  const tokens = new Set()
  for (const text of texts) {
    for (const raw of String(text ?? '').toLowerCase().split(/[;,/]|\bor\b/)) {
      const phrase = raw.replace(/\([^)]*\)/g, '').replace(/[^a-z\s-]/g, ' ').replace(/\s+/g, ' ').trim()
      if (phrase) phrases.add(phrase.replace(/^(a|an|the|to) /, ''))
      for (const t of raw.replace(/[^a-z\s-]/g, ' ').split(/[\s-]+/)) {
        if (t.length > 1 && !STOP.has(t)) tokens.add(stem(t))
      }
    }
  }
  return { phrases, tokens }
}

const ZH_LANGS = ['zh-hans', 'zh-cn', 'zh', 'zh-sg', 'zh-my']

function claimIds(entity, prop) {
  return (entity.claims?.[prop] ?? [])
    .map(c => c.mainsnak?.datavalue?.value)
    .filter(Boolean)
    .map(v => (typeof v === 'object' ? v.id : v))
}

/**
 * Score Wikidata entities (wbgetentities format) for a word. Returns the best
 * { id, file, score } or { reason } when nothing fits.
 */
export function pickEntity(word, entities) {
  const gloss = glossTerms([word.english, ...(word.meanings ?? []).map(m => m.definition)])
  const scored = []
  const reasons = new Set()
  for (const e of entities) {
    const file = claimIds(e, 'P18')[0]
    if (!file) { reasons.add('no image'); continue }
    if (claimIds(e, 'P31').some(id => BLOCKED_INSTANCE_OF.has(id))) { reasons.add('named thing'); continue }

    const zhLabels = ZH_LANGS.map(l => e.labels?.[l]?.value).filter(Boolean)
    const zhAliases = ZH_LANGS.flatMap(l => (e.aliases?.[l] ?? []).map(a => a.value))
    const zhScore = zhLabels.includes(word.simplified) ? 3 : zhAliases.includes(word.simplified) ? 1 : 0
    if (!zhScore) { reasons.add('Chinese label differs'); continue }

    // English must agree: a name equal to one of our glosses ("apple"), or a name made only of
    // gloss words ("bus" for "public bus"). "Apple Records" shares a word but isn't a match.
    const enNames = [e.labels?.en?.value, ...(e.aliases?.en ?? []).map(a => a.value)].filter(Boolean).map(s => s.toLowerCase())
    let enScore = 0
    for (const name of enNames) {
      if (gloss.phrases.has(name)) { enScore = Math.max(enScore, 5); continue }
      const tokens = [...glossTerms([name]).tokens]
      if (tokens.length && tokens.every(t => gloss.tokens.has(t))) enScore = Math.max(enScore, 2 + tokens.length)
    }
    if (!enScore) { reasons.add(`English "${enNames[0] ?? '?'}" doesn't match gloss`); continue }

    scored.push({ id: e.id, file, score: zhScore + enScore, q: Number(e.id.slice(1)) })
  }
  // Best score first; on a tie the lower Q number, which is usually the general concept
  scored.sort((a, b) => b.score - a.score || a.q - b.q)
  if (scored.length) return { id: scored[0].id, file: scored[0].file, score: scored[0].score }
  return { reason: reasons.size ? [...reasons].join('; ') : 'no Wikidata match' }
}

/** Licences we can show with attribution: public domain, CC0, CC BY, CC BY-SA */
export function isOpenLicence(shortName) {
  return /^(cc0|public domain|pd\b|pd-|cc[ -]by(-sa)?([ -]\d(\.\d)?( [a-z]{2,3})?)?$)/i.test(String(shortName ?? '').trim())
}

/** Commons "Artist" metadata is HTML; keep a short plain-text credit */
export function plainCredit(html) {
  const text = String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return 'Wikimedia Commons contributor'
  return text.length > 80 ? text.slice(0, 77).trimEnd() + '…' : text
}

const OK_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/tiff'])

/** Commons imageinfo (prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=…) → our entry, or { reason } */
export function imageEntry(entityId, info) {
  if (!info) return { reason: 'file missing on Commons' }
  if (!OK_MIME.has(info.mime)) return { reason: `skipped ${info.mime} (drawings/diagrams)` }
  const meta = info.extmetadata ?? {}
  const licence = meta.LicenseShortName?.value
  if (!isOpenLicence(licence)) return { reason: `licence "${licence ?? 'unknown'}" not allowed` }
  return {
    src: info.thumburl ?? info.url,
    page: info.descriptionurl,
    author: plainCredit(meta.Artist?.value),
    license: String(licence).trim(),
    wikidata: entityId,
  }
}
