import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')
const BATCH_FILE = join(__dirname, 'explanation-batch-ids.txt')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a concise Mandarin Chinese dictionary writer. Given a word, write a 2–3 sentence explanation for English-speaking learners.

Rules:
- Cover the most common meaning(s) first — especially if the word has multiple distinct meanings
- Mention key usage patterns or grammar notes if relevant (e.g. "used as a suffix", "typically follows a verb")
- If the given English translation is incomplete or only one of several meanings, cover the others
- Write in plain English — no markdown, no bullet points
- Do NOT start with "This word" or the word's pinyin — just explain directly
- Max 3 sentences`

async function loadWordsNeedingExplanations() {
  const all = []
  for (let level = 1; level <= 9; level++) {
    const words = JSON.parse(readFileSync(join(dataDir, `hsk${level}.json`), 'utf8'))
    for (const w of words) {
      if (!w.explanation) all.push(w)
    }
  }
  return all
}

async function submitBatch(words) {
  console.log(`Submitting ${words.length} words...`)

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
        max_tokens: 150,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{
          role: 'user',
          content: `Word: ${w.simplified} (${w.pinyin})\nEnglish: ${w.english}\nPart of speech: ${w.partOfSpeech}\nHSK level: ${w.hskLevel}`,
        }],
      },
    }))
    const batch = await client.messages.batches.create({ requests })
    console.log(`Batch ${i + 1}/${chunks.length} submitted: ${batch.id} (${chunk.length} words)`)
    batchIds.push(batch.id)
  }

  writeFileSync(BATCH_FILE, batchIds.join('\n'), 'utf8')
  console.log(`\nBatch IDs saved to scripts/explanation-batch-ids.txt`)
  console.log(`Run with --apply once batches complete.`)
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
      if (result.result.type === 'succeeded') {
        results[result.custom_id] = result.result.message.content[0].text.trim()
      }
    }
    console.log(`Collected ${Object.keys(results).length} results so far`)
  }

  let totalUpdated = 0
  for (let level = 1; level <= 9; level++) {
    const filePath = join(dataDir, `hsk${level}.json`)
    const words = JSON.parse(readFileSync(filePath, 'utf8'))
    let updated = 0
    for (const w of words) {
      if (results[w.id]) {
        w.explanation = results[w.id]
        updated++
      }
    }
    writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8')
    console.log(`HSK ${level}: updated ${updated} explanation fields`)
    totalUpdated += updated
  }
  console.log(`\nDone — ${totalUpdated} words updated.`)
}

function readBatchIds() {
  return readFileSync(BATCH_FILE, 'utf8').trim().split('\n').filter(Boolean)
}

const args = process.argv.slice(2)
if (args.includes('--apply')) {
  const ids = args[1] ? [args[1]] : readBatchIds()
  await applyBatches(ids)
} else if (args.includes('--status')) {
  const ids = args[1] ? [args[1]] : readBatchIds()
  for (const id of ids) {
    const batch = await client.messages.batches.retrieve(id)
    console.log(`${id}: ${batch.processing_status}`, batch.request_counts)
  }
} else {
  const words = await loadWordsNeedingExplanations()
  await submitBatch(words)
}
