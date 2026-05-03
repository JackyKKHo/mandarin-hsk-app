import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function generateExample(word) {
  const prompt = `Generate one natural example sentence in Mandarin Chinese for the word "${word.simplified}" (${word.pinyin}, meaning: "${word.english}"), HSK level ${word.hskLevel}.

Return ONLY a JSON object with this exact structure, no other text:
{
  "chinese": "the example sentence in Chinese characters",
  "pinyin": "the pinyin with tone marks",
  "english": "the English translation"
}

Requirements:
- Sentence difficulty should match HSK ${word.hskLevel} level
- Sentence should feel natural, not textbook
- The word ${word.simplified} must appear in the sentence`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].text.trim()
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  if (!json) throw new Error(`No JSON in response: ${text}`)
  return JSON.parse(json)
}

async function processLevel(level) {
  const filePath = join(dataDir, `hsk${level}.json`)
  const words = JSON.parse(readFileSync(filePath, 'utf-8'))

  let updated = 0
  let skipped = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i]

    if (word.examples && word.examples.length > 0) {
      skipped++
      continue
    }

    try {
      const example = await generateExample(word)
      words[i].examples = [example]
      updated++

      if (updated % 10 === 0) {
        writeFileSync(filePath, JSON.stringify(words, null, 2))
        console.log(`HSK ${level}: ${updated} done, ${i + 1}/${words.length} processed`)
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 150))
    } catch (e) {
      console.error(`Failed for ${word.simplified}: ${e.message}`)
    }
  }

  writeFileSync(filePath, JSON.stringify(words, null, 2))
  console.log(`HSK ${level} complete: ${updated} generated, ${skipped} already had examples`)
}

const levels = process.argv[2] ? [parseInt(process.argv[2])] : [1, 2, 3, 4, 5, 6, 7, 8, 9]

for (const level of levels) {
  console.log(`\nStarting HSK ${level}...`)
  await processLevel(level)
}

console.log('\nAll done!')
