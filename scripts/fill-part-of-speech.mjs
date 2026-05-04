import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const VALID_POS = [
  'noun', 'verb', 'adjective', 'adverb', 'pronoun', 'measure word',
  'conjunction', 'preposition', 'particle', 'interjection', 'numeral',
  'phrase', 'auxiliary verb', 'onomatopoeia', 'proper noun',
]

const SYSTEM = `You are a Chinese linguistics expert. Given a Mandarin Chinese word, return its part of speech as a single lowercase English term.

Only return one of: ${VALID_POS.join(', ')}.
Return ONLY the term, nothing else.`

async function loadAllWords() {
  const all = []
  for (let level = 1; level <= 9; level++) {
    const words = JSON.parse(readFileSync(join(dataDir, `hsk${level}.json`), 'utf8'))
    for (const w of words) {
      if (!w.partOfSpeech) all.push(w)
    }
  }
  return all
}

const BATCH_LIMIT = 10000

async function submitBatch(words) {
  console.log(`Submitting ${words.length} words in ${Math.ceil(words.length / BATCH_LIMIT)} batch(es)...`)

  const chunks = []
  for (let i = 0; i < words.length; i += BATCH_LIMIT) {
    chunks.push(words.slice(i, i + BATCH_LIMIT))
  }

  const batchIds = []
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const requests = chunk.map(w => ({
      custom_id: w.id,
      params: {
        model: 'claude-haiku-4-5',
        max_tokens: 10,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `${w.simplified} (${w.pinyin}): ${w.english}` }],
      },
    }))

    const batch = await client.messages.batches.create({ requests })
    console.log(`Batch ${i + 1}/${chunks.length} submitted: ${batch.id} (${chunk.length} words)`)
    batchIds.push(batch.id)
  }

  writeFileSync(join(__dirname, 'batch-ids.txt'), batchIds.join('\n'), 'utf8')
  console.log(`\nBatch IDs saved to scripts/batch-ids.txt`)
  console.log(`Run 'node scripts/fill-part-of-speech.mjs --apply' once batches complete.`)
  return batchIds
}

async function applyBatches(batchIds) {
  const results = {}

  for (const batchId of batchIds) {
    console.log(`Fetching results for batch ${batchId}...`)
    const batch = await client.messages.batches.retrieve(batchId)
    if (batch.processing_status !== 'ended') {
      console.log(`Batch ${batchId} not ready — status: ${batch.processing_status}`)
      console.log(`Counts:`, batch.request_counts)
      continue
    }

    for await (const result of await client.messages.batches.results(batchId)) {
      if (result.result.type === 'succeeded') {
        const pos = result.result.message.content[0].text.trim().toLowerCase()
        results[result.custom_id] = VALID_POS.includes(pos) ? pos : 'noun'
      }
    }
    console.log(`Collected ${Object.keys(results).length} results so far`)
  }

  // Apply to data files
  let totalUpdated = 0
  for (let level = 1; level <= 9; level++) {
    const filePath = join(dataDir, `hsk${level}.json`)
    const words = JSON.parse(readFileSync(filePath, 'utf8'))
    let updated = 0
    for (const w of words) {
      if (results[w.id]) {
        w.partOfSpeech = results[w.id]
        updated++
      }
    }
    writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8')
    console.log(`HSK ${level}: updated ${updated} partOfSpeech fields`)
    totalUpdated += updated
  }

  console.log(`\nDone — ${totalUpdated} words updated.`)
}

const args = process.argv.slice(2)

function readBatchIds() {
  return readFileSync(join(__dirname, 'batch-ids.txt'), 'utf8').trim().split('\n').filter(Boolean)
}

if (args.includes('--apply')) {
  const batchIds = args[1] ? [args[1]] : readBatchIds()
  await applyBatches(batchIds)
} else if (args.includes('--status')) {
  const batchIds = args[1] ? [args[1]] : readBatchIds()
  for (const batchId of batchIds) {
    const batch = await client.messages.batches.retrieve(batchId)
    console.log(`${batchId}: ${batch.processing_status}`, batch.request_counts)
  }
} else {
  const words = await loadAllWords()
  await submitBatch(words)
}
