import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')

function parseTsv(filePath, level) {
  const text = readFileSync(filePath, 'utf-8')
  const lines = text.split('\n').filter(l => l.trim())
  const results = []
  let index = 1

  for (const line of lines) {
    const parts = line.split('\t')
    if (parts.length < 4) continue

    const [traditional, simplified, pinyin, englishRaw] = parts
    const english = englishRaw.split(',')[0].trim()

    results.push({
      id: `hsk${level}_${String(index).padStart(4, '0')}`,
      hskLevel: level,
      simplified: simplified.trim(),
      traditional: traditional.trim(),
      pinyin: pinyin.trim(),
      pinyinNumbered: '',
      english,
      partOfSpeech: '',
      examples: [],
      tags: [],
      audio: { wordAudioUrl: null, exampleAudioUrls: [] }
    })
    index++
  }

  return results
}

// HSK 1-6
for (let level = 1; level <= 6; level++) {
  const src = join(dataDir, `source_hsk${level}.tsv`)
  const words = parseTsv(src, level)
  writeFileSync(join(dataDir, `hsk${level}.json`), JSON.stringify(words, null, 2))
  console.log(`HSK ${level}: ${words.length} words`)
}

// HSK 7-9: split by checking existing level buckets
// The 7-9 file doesn't indicate which sub-level each word belongs to,
// so we assign all to level 7 (combined) and use hsk7/8/9 equally split
const src79 = join(dataDir, 'source_hsk7-9.tsv')
const text = readFileSync(src79, 'utf-8')
const lines = text.split('\n').filter(l => l.trim())
const all79 = []
let index = 1

for (const line of lines) {
  const parts = line.split('\t')
  if (parts.length < 4) continue
  const [traditional, simplified, pinyin, englishRaw] = parts
  const english = englishRaw.split(',')[0].trim()
  all79.push({ traditional: traditional.trim(), simplified: simplified.trim(), pinyin: pinyin.trim(), english })
  index++
}

const chunkSize = Math.ceil(all79.length / 3)
const chunks = [all79.slice(0, chunkSize), all79.slice(chunkSize, chunkSize * 2), all79.slice(chunkSize * 2)]

for (let i = 0; i < 3; i++) {
  const level = 7 + i
  const words = chunks[i].map((w, j) => ({
    id: `hsk${level}_${String(j + 1).padStart(4, '0')}`,
    hskLevel: level,
    simplified: w.simplified,
    traditional: w.traditional,
    pinyin: w.pinyin,
    pinyinNumbered: '',
    english: w.english,
    partOfSpeech: '',
    examples: [],
    tags: [],
    audio: { wordAudioUrl: null, exampleAudioUrls: [] }
  }))
  writeFileSync(join(dataDir, `hsk${level}.json`), JSON.stringify(words, null, 2))
  console.log(`HSK ${level}: ${words.length} words`)
}
