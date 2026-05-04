import { pinyin } from 'pinyin-pro'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../data')

for (let level = 1; level <= 9; level++) {
  const filePath = join(dataDir, `hsk${level}.json`)
  const words = JSON.parse(readFileSync(filePath, 'utf8'))

  let updated = 0
  for (const word of words) {
    if (!word.pinyinNumbered) {
      word.pinyinNumbered = pinyin(word.simplified, { toneType: 'num', type: 'string' })
      updated++
    }
  }

  writeFileSync(filePath, JSON.stringify(words, null, 2), 'utf8')
  console.log(`HSK ${level}: filled ${updated} pinyinNumbered fields`)
}
