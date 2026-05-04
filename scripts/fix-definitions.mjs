import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

const client = new Anthropic()

const LEVEL_CONTEXT = {
  1: 'absolute beginner (HSK1). Use only the simplest everyday English. Give 1 meaning unless the word is clearly used in 2 very different ways.',
  2: 'beginner (HSK2). Use simple everyday English. Give 1–2 meanings.',
  3: 'elementary (HSK3). Clear everyday English. Up to 2 meanings if the word has genuinely distinct uses.',
  4: 'intermediate (HSK4). Up to 3 meanings including common verb/noun distinctions.',
  5: 'upper-intermediate (HSK5). Up to 3 meanings including formal/informal distinctions.',
  6: 'advanced (HSK6). Up to 3 meanings, including idiomatic or formal uses.',
  7: 'near-native (HSK7). Up to 3 precise meanings including classical or specialised uses.',
  8: 'near-native (HSK8). Up to 3 precise meanings including classical or specialised uses.',
  9: 'near-native (HSK9). Up to 3 precise meanings including classical or specialised uses.',
}

const BATCH_SIZE = 25
const DELAY_MS = 600

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fixLevel(level) {
  const path = join(DATA_DIR, `hsk${level}.json`)
  const words = JSON.parse(readFileSync(path, 'utf8'))
  console.log(`\nHSK${level}: ${words.length} words`)

  const results = [...words]

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(words.length / BATCH_SIZE)
    process.stdout.write(`  Batch ${batchNum}/${totalBatches}...`)

    const wordList = batch.map((w, j) =>
      `${j + 1}. ${w.simplified} (${w.pinyin}) [${w.partOfSpeech}]`
    ).join('\n')

    const prompt = `You are writing dictionary definitions for a ${LEVEL_CONTEXT[level]} Mandarin learner.

For each word, produce up to 3 meanings. Each meaning needs:
- A concise English definition using standard dictionary wording (1–4 words)
- A natural Chinese example sentence using that meaning
- Pinyin for the example (with tone marks)
- English translation of the example

CRITICAL rules for definitions:
- Use standard English dictionary words, NOT descriptions or paraphrases
- Good: "book", "television", "movie", "teacher", "big", "not"
- Bad: "written work to read", "programs you watch on TV", "story with moving pictures"
- If the English word IS the definition (book=book, teacher=teacher), just use that word
- Only give multiple meanings for words with genuinely distinct uses
- Example sentences should feel natural, not textbook-stiff
- Example vocabulary should suit HSK${level} level

Words:
${wordList}

Return ONLY a JSON array with one object per word (${batch.length} total), in order:
[
  {
    "meanings": [
      {
        "def": "concise dictionary definition",
        "ex_zh": "Chinese example sentence",
        "ex_py": "Pinyin with tone marks",
        "ex_en": "English translation"
      }
    ]
  }
]`

    try {
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = msg.content[0].text.trim()
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('No JSON array in response:\n' + text.slice(0, 200))
      const parsed = JSON.parse(jsonMatch[0])

      if (parsed.length !== batch.length) {
        throw new Error(`Expected ${batch.length} items, got ${parsed.length}`)
      }

      for (let j = 0; j < batch.length; j++) {
        const globalIdx = i + j
        const { meanings } = parsed[j]
        if (!meanings?.length) continue
        results[globalIdx] = {
          ...results[globalIdx],
          english: meanings[0].def,
          meanings: meanings.map(m => ({
            definition: m.def,
            example: { chinese: m.ex_zh, pinyin: m.ex_py, english: m.ex_en },
          })),
        }
      }

      console.log(' ✓')
    } catch (err) {
      console.log(` ✗ ${err.message}`)
    }

    if (i + BATCH_SIZE < words.length) await sleep(DELAY_MS)
  }

  writeFileSync(path, JSON.stringify(results, null, 2))
  console.log(`  Saved ${path}`)
}

const levels = process.argv[2]
  ? [parseInt(process.argv[2])]
  : [1, 2, 3, 4, 5, 6, 7, 8, 9]

for (const level of levels) {
  await fixLevel(level)
}

console.log('\nDone.')
