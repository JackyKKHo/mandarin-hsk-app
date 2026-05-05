import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')
const BATCH_FILE = join(__dirname, 'example-batch-ids.txt')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a Mandarin Chinese teacher generating example sentences for vocabulary learners.
Return ONLY a JSON object — no prose, no markdown, no code fences:
{"chinese":"...","pinyin":"...","english":"..."}`

async function loadWordsMissingExamples(levels) {
  const all = []
  for (const level of levels) {
    const words = JSON.parse(readFileSync(join(dataDir, `hsk${level}.json`), 'utf8'))
    for (const w of words) {
      if (!w.examples || w.examples.length === 0) all.push(w)
    }
  }
  return all
}

async function submitBatch(words) {
  console.log(`Submitting ${words.length} words for example generation...`)
  const CHUNK = 10000
  const chunks = []
  for (let i = 0; i < words.length; i += CHUNK) chunks.push(words.slice(i, i + CHUNK))

  const batchIds = []
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const requests = chunk.map(w => ({
      custom_id: w.id,
      params: {
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{
          role: 'user',
          content: `Word: ${w.simplified} (${w.pinyin}) — "${w.english}", ${w.partOfSpeech}, HSK ${w.hskLevel}\nWrite one natural example sentence using this word.`,
        }],
      },
    }))
    const batch = await client.messages.batches.create({ requests })
    console.log(`Batch ${i + 1}/${chunks.length} submitted: ${batch.id} (${chunk.length} words)`)
    batchIds.push(batch.id)
  }

  writeFileSync(BATCH_FILE, batchIds.join('\n'), 'utf8')
  console.log(`\nBatch IDs saved to scripts/example-batch-ids.txt`)
  console.log(`Run with --apply once complete.`)
}

async function applyBatches(batchIds) {
  const results = {}
  for (const batchId of batchIds) {
    const batch = await client.messages.batches.retrieve(batchId)
    if (batch.processing_status !== 'ended') {
      console.log(`Batch ${batchId} not ready — status: ${batch.processing_status}`, batch.request_counts)
      continue
    }
    for await (const result of await client.messages.batches.results(batchId)) {
      if (result.result.type !== 'succeeded') continue
      const text = result.result.message.content[0].text.trim()
      try {
        const json = text.match(/\{[\s\S]*\}/)?.[0]
        if (json) results[result.custom_id] = JSON.parse(json)
      } catch { /* skip malformed */ }
    }
    console.log(`Collected ${Object.keys(results).length} results so far`)
  }

  const levels = [...new Set(Object.keys(results).map(id => parseInt(id.replace('hsk', '').split('_')[0])))]
  let totalUpdated = 0
  for (const level of levels.sort((a, b) => a - b)) {
    const filePath = join(dataDir, `hsk${level}.json`)
    const words = JSON.parse(readFileSync(filePath, 'utf8'))
    let updated = 0
    for (const w of words) {
      if (results[w.id]) {
        w.examples = [results[w.id]]
        updated++
      }
    }
    writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8')
    console.log(`HSK ${level}: added examples for ${updated} words`)
    totalUpdated += updated
  }
  console.log(`\nDone — ${totalUpdated} words updated.`)
}

function readBatchIds() {
  return readFileSync(BATCH_FILE, 'utf8').trim().split('\n').filter(Boolean)
}

const args = process.argv.slice(2)
const levelArgs = args.filter(a => /^\d+$/.test(a)).map(Number)
const levels = levelArgs.length ? levelArgs : [1, 2, 3, 4, 5, 6, 7, 8, 9]

if (args.includes('--apply')) {
  const ids = readBatchIds()
  await applyBatches(ids)
} else if (args.includes('--status')) {
  const ids = readBatchIds()
  for (const id of ids) {
    const batch = await client.messages.batches.retrieve(id)
    console.log(`${id}: ${batch.processing_status}`, batch.request_counts)
  }
} else {
  const words = await loadWordsMissingExamples(levels)
  await submitBatch(words)
}
