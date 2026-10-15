// Fill the `tags` field (topic tags such as "fruit", "transport") for every word, using the
// Anthropic Message Batches API (50% cheaper, usually done within an hour).
//
//   node scripts/fill-tags.mjs             submit a batch for words with no tags yet
//   node scripts/fill-tags.mjs --all       submit a batch for every word (re-tag from scratch)
//   node scripts/fill-tags.mjs --level=1   only one level (combine with --all if you like)
//   node scripts/fill-tags.mjs --status    check progress
//   node scripts/fill-tags.mjs --apply     write results into data/hsk*.json
//
// The topic list is src/data/topics.json (shared with the app). Words that fit no topic
// (most grammar words, abstract verbs) keep `tags: []`. After --apply, run
// `node scripts/check-vocab.mjs --changed --allow=tags` before committing.
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')
const idsFile = join(__dirname, 'tags-batch-ids.txt')
const LEVELS = [1, 2, 3, 4, 5, 6, 7]
const MAX_TAGS = 3

const groups = JSON.parse(readFileSync(join(__dirname, '../src/data/topics.json'), 'utf8'))
const TOPICS = groups.flatMap(g => g.topics)
const VALID = new Set(TOPICS.map(t => t.id))

const SYSTEM = `You tag Mandarin Chinese vocabulary with topics so learners can study themed word lists (e.g. "only fruit").

Topics (id: what belongs there):
${TOPICS.map(t => `${t.id}: ${t.hint}`).join('\n')}

Rules:
- Give 0 to ${MAX_TAGS} topic ids, most fitting first. Only tag a topic if a learner studying that topic would expect to see this word.
- Be specific: 苹果 is "fruit" (not "food"); 西红柿 is "vegetables". 牛奶 is "drinks".
- Grammar words, pronouns, generic verbs/adjectives and abstract words that fit no topic get "none". Most of the vocabulary should be "none" or have one topic.
- Answer with ONLY the ids separated by commas, or the single word none. No other text.`

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const args = process.argv.slice(2)
const levelArg = args.find(a => a.startsWith('--level='))
const levels = levelArg ? [Number(levelArg.slice(8))] : LEVELS

function wordPrompt(w) {
  const meanings = (w.meanings ?? []).map(m => m.definition).filter(Boolean)
  const gloss = meanings.length > 1 ? meanings.join('; ') : w.english
  const pos = Array.isArray(w.partOfSpeech) ? w.partOfSpeech.join(', ') : w.partOfSpeech
  return `${w.simplified} (${w.pinyin}, ${pos || 'unknown'}): ${gloss}`
}

function parseTags(text) {
  const t = String(text).trim().toLowerCase()
  if (!t || t === 'none') return []
  const ids = t.split(/[,\s]+/).map(s => s.replace(/[^a-z-]/g, '')).filter(id => VALID.has(id))
  return [...new Set(ids)].slice(0, MAX_TAGS)
}

async function submit() {
  const words = []
  for (const level of levels) {
    for (const w of JSON.parse(readFileSync(join(dataDir, `hsk${level}.json`), 'utf8'))) {
      if (args.includes('--all') || !w.tags?.length) words.push(w)
    }
  }
  if (!words.length) return console.log('Nothing to tag.')

  const LIMIT = 10000
  const ids = []
  for (let i = 0; i < words.length; i += LIMIT) {
    const chunk = words.slice(i, i + LIMIT)
    const batch = await client.messages.batches.create({
      requests: chunk.map(w => ({
        custom_id: w.id,
        params: {
          model: 'claude-haiku-4-5',
          max_tokens: 30,
          system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: wordPrompt(w) }],
        },
      })),
    })
    console.log(`Submitted ${batch.id} (${chunk.length} words)`)
    ids.push(batch.id)
  }
  writeFileSync(idsFile, ids.join('\n'), 'utf8')
  console.log(`\nBatch ids saved to scripts/tags-batch-ids.txt.`)
  console.log(`Check with --status; when it says "ended", run --apply.`)
}

function readIds() {
  return readFileSync(idsFile, 'utf8').trim().split('\n').filter(Boolean)
}

async function status() {
  for (const id of readIds()) {
    const b = await client.messages.batches.retrieve(id)
    console.log(`${id}: ${b.processing_status}`, b.request_counts)
  }
}

async function apply() {
  const results = new Map()
  let failed = 0
  for (const id of readIds()) {
    const b = await client.messages.batches.retrieve(id)
    if (b.processing_status !== 'ended') {
      console.log(`${id} not finished yet (${b.processing_status}). Nothing written.`)
      return
    }
    for await (const r of await client.messages.batches.results(id)) {
      if (r.result.type === 'succeeded') results.set(r.custom_id, parseTags(r.result.message.content[0]?.text ?? ''))
      else failed++
    }
  }

  const counts = new Map()
  let tagged = 0
  for (const level of LEVELS) {
    const path = join(dataDir, `hsk${level}.json`)
    const raw = readFileSync(path, 'utf8')
    const eol = raw.includes('\r\n') ? '\r\n' : '\n'
    const words = JSON.parse(raw)
    let changed = 0
    for (const w of words) {
      if (!results.has(w.id)) continue
      const tags = results.get(w.id)
      if (JSON.stringify(tags) !== JSON.stringify(w.tags)) changed++
      w.tags = tags
      if (tags.length) tagged++
      for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    }
    // Same layout as the files already use: 2-space JSON, their own line endings, no final newline
    writeFileSync(path, JSON.stringify(words, null, 2).replace(/\n/g, eol), 'utf8')
    console.log(`HSK ${level}: ${changed} words changed`)
  }
  console.log(`\n${results.size} results, ${tagged} words now have a topic, ${failed} requests failed.`)
  console.log('Words per topic:')
  for (const t of TOPICS) console.log(`  ${t.id.padEnd(16)} ${counts.get(t.id) ?? 0}`)
}

if (args.includes('--apply')) await apply()
else if (args.includes('--status')) await status()
else await submit()
