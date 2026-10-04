// Compares the pinyin of example sentences added since origin/main with pinyin-pro, character
// by character, and lists every difference for a human (or agent) to review.
//
//   node scripts/compare-pinyin.mjs [--base=origin/main]
//
// pinyin-pro is often wrong on neutral tones (时候 shíhou, 里 li) and on characters with
// several readings (我得 děi, 只剩 zhǐ, 倒计时 dào), so a difference is a prompt to double-check,
// not proof of a mistake. A SOUND difference (not just tone) deserves the closest look.
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { pinyin } from 'pinyin-pro'

const base = process.argv.find(a => a.startsWith('--base='))?.slice(7) ?? 'origin/main'
const strip = s => s.normalize('NFC').toLowerCase().replace(/[^a-zāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ]/g, '')
const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'v')

let checked = 0
let diffs = 0
for (let level = 1; level <= 9; level++) {
  const path = `data/hsk${level}.json`
  const now = JSON.parse(readFileSync(path, 'utf8'))
  const before = new Map(JSON.parse(execFileSync('git', ['show', `${base}:${path}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })).map(w => [w.id, w.examples ?? []]))
  for (const w of now) {
    const old = before.get(w.id) ?? []
    for (const ex of w.examples.slice(old.length)) {
      checked++
      const han = [...ex.chinese].filter(c => /\p{Script=Han}/u.test(c))
      const lib = pinyin(han.join(''), { type: 'array', toneSandhi: false })
      const mine = strip(ex.pinyin)
      // Erhua: 儿 after another character is usually written as a final -r
      const libStr = strip(lib.map((p, i) => (han[i] === '儿' && i > 0 && mine.includes(strip(lib[i - 1]) + 'r') ? 'r' : p)).join(''))
      if (libStr === mine) continue
      diffs++
      const kind = plain(libStr) === plain(mine) ? 'TONE ' : 'SOUND'
      console.log(`${kind} ${w.id} ${w.simplified}: ${ex.chinese}\n   example:    ${ex.pinyin}\n   pinyin-pro: ${lib.join(' ')}`)
    }
  }
}
console.log(`\n${checked} new examples checked, ${diffs} differ from pinyin-pro. Review each one.`)
