// Find an openly licensed photo for concrete words (fruit, animals, transport, ...) and save it
// to data/images.json for the picture quiz. Uses Wikidata + Wikimedia Commons (no API key).
//
//   node scripts/fill-images.mjs                 words in picture topics (needs tags, see fill-tags.mjs)
//   node scripts/fill-images.mjs --nouns         every noun, whether tagged or not
//   node scripts/fill-images.mjs --level=1       one level only
//   node scripts/fill-images.mjs --word=苹果      one word, prints what it picked (for testing)
//   node scripts/fill-images.mjs --limit=200     stop after 200 words (it resumes where it left off)
//   node scripts/fill-images.mjs --redo          look again at words already decided
//
// Every run also writes scripts/images-review.html: open it, scan the pictures, and for any
// that are wrong set that word's entry in data/images.json to null. null means "no picture,
// don't look again", so a later run won't bring it back.
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pickEntity, imageEntry } from './_imagePick.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const imagesPath = join(root, 'data/images.json')
const reviewPath = join(__dirname, 'images-review.html')
const LEVELS = [1, 2, 3, 4, 5, 6, 7]
const THUMB_WIDTH = 640
const CONCURRENCY = 4
// Wikimedia asks every client to identify itself: https://meta.wikimedia.org/wiki/User-Agent_policy
const HEADERS = { 'User-Agent': 'MandarinDaily-image-picker/1.0 (https://www.mandarindaily.app)' }

const args = process.argv.slice(2)
const arg = name => args.find(a => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const levels = arg('level') ? [Number(arg('level'))] : LEVELS
const limit = arg('limit') ? Number(arg('limit')) : Infinity
const onlyWord = arg('word')

const groups = JSON.parse(readFileSync(join(root, 'src/data/topics.json'), 'utf8'))
const PICTURE_TOPICS = new Set(groups.flatMap(g => g.topics).filter(t => t.pictures).map(t => t.id))

const isNoun = w => [].concat(w.partOfSpeech ?? []).some(p => /noun/.test(p))

function loadImages() {
  return existsSync(imagesPath) ? JSON.parse(readFileSync(imagesPath, 'utf8')) : {}
}
function saveImages(images) {
  const sorted = Object.fromEntries(Object.keys(images).sort().map(k => [k, images[k]]))
  writeFileSync(imagesPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8')
}

async function getJson(url, tries = 3) {
  for (let i = 1; ; i++) {
    const res = await fetch(url, { headers: HEADERS })
    if (res.ok) return res.json()
    if (i >= tries || (res.status !== 429 && res.status < 500)) throw new Error(`${res.status} ${url}`)
    await new Promise(r => setTimeout(r, 2000 * i))
  }
}

async function findImage(word) {
  const search = await getJson(`https://www.wikidata.org/w/api.php?${new URLSearchParams({
    action: 'wbsearchentities', search: word.simplified, language: 'zh', uselang: 'zh', type: 'item', limit: '10', format: 'json',
  })}`)
  const ids = (search.search ?? []).filter(s => s.match?.text === word.simplified).map(s => s.id)
  if (!ids.length) return { reason: 'no Wikidata item with this exact Chinese name' }

  const data = await getJson(`https://www.wikidata.org/w/api.php?${new URLSearchParams({
    action: 'wbgetentities', ids: ids.join('|'), props: 'claims|labels|aliases', languages: 'en|zh|zh-hans|zh-cn|zh-sg|zh-my', format: 'json',
  })}`)
  const pick = pickEntity(word, Object.values(data.entities ?? {}))
  if (!pick.file) return pick

  const info = await getJson(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    action: 'query', titles: `File:${pick.file}`, prop: 'imageinfo', iiprop: 'url|mime|extmetadata',
    iiurlwidth: String(THUMB_WIDTH), format: 'json', formatversion: '2',
  })}`)
  return imageEntry(pick.id, info.query?.pages?.[0]?.imageinfo?.[0])
}

function candidates(images) {
  const words = []
  for (const level of levels) {
    for (const w of JSON.parse(readFileSync(join(root, `data/hsk${level}.json`), 'utf8'))) {
      if (onlyWord) { if (w.simplified === onlyWord) words.push(w); continue }
      if (!isNoun(w)) continue
      if (!args.includes('--nouns') && !(w.tags ?? []).some(t => PICTURE_TOPICS.has(t))) continue
      if (!args.includes('--redo') && w.id in images) continue
      words.push(w)
    }
  }
  return words
}

function writeReview(images, words) {
  const byId = new Map(words.map(w => [w.id, w]))
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
  const cards = Object.entries(images).filter(([, v]) => v).map(([id, v]) => {
    const w = byId.get(id)
    return `<figure><img loading="lazy" src="${esc(v.src)}" alt=""><figcaption><b>${esc(w?.simplified)}</b> ${esc(w?.english)}<br><code>${id}</code> · <a href="https://www.wikidata.org/wiki/${v.wikidata}">${v.wikidata}</a></figcaption></figure>`
  })
  writeFileSync(reviewPath, `<!doctype html><meta charset="utf-8"><title>Picture review</title>
<style>body{font:14px system-ui;margin:16px}div{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
figure{margin:0}img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;background:#eee}figcaption{font-size:12px}</style>
<h1>${cards.length} pictures</h1><p>Wrong picture? Set that id to <code>null</code> in data/images.json.</p><div>${cards.join('')}</div>`, 'utf8')
}

const images = loadImages()
const todo = candidates(images).slice(0, limit)
if (!todo.length) {
  console.log(onlyWord ? `No word "${onlyWord}" found.` : 'Nothing to do. (No tagged nouns? Run fill-tags.mjs first, or use --nouns.)')
} else {
  console.log(`Looking up ${todo.length} words…`)
}

let found = 0
let done = 0
const skipped = []
let next = 0
async function worker() {
  while (next < todo.length) {
    const w = todo[next++]
    try {
      const result = await findImage(w)
      if (result.src) { images[w.id] = result; found++ }
      else { images[w.id] = null; skipped.push(`${w.simplified} (${w.english}): ${result.reason}`) }
      if (onlyWord) console.log(result)
    } catch (e) {
      skipped.push(`${w.simplified}: request failed, will retry next run (${e.message})`)
    }
    if (++done % 50 === 0) { saveImages(images); console.log(`  ${done}/${todo.length}, ${found} pictures`) }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

if (todo.length) {
  saveImages(images)
  const all = []
  for (const level of LEVELS) all.push(...JSON.parse(readFileSync(join(root, `data/hsk${level}.json`), 'utf8')))
  writeReview(images, all)
  console.log(`\nDone: ${found} new pictures, ${skipped.length} words without one.`)
  console.log(`Total in data/images.json: ${Object.values(images).filter(Boolean).length}.`)
  console.log(`Check them: open scripts/images-review.html`)
  if (skipped.length) {
    console.log('\nNo picture for (first 30):')
    for (const s of skipped.slice(0, 30)) console.log(`  ${s}`)
  }
}
