// Checks a typed answer against a word. Accepts characters (simplified or traditional) or
// pinyin in any common form: tone marks (píngguǒ), tone numbers (ping2guo3), or no tones
// (pingguo, which counts as right but is flagged so the learner sees the tones).
import type { VocabItem } from '../types'

export type MatchResult = 'exact' | 'toneless' | 'wrong'

const TONE_MARKS: Record<string, [string, number]> = {
  ā: ['a', 1], á: ['a', 2], ǎ: ['a', 3], à: ['a', 4],
  ē: ['e', 1], é: ['e', 2], ě: ['e', 3], è: ['e', 4],
  ī: ['i', 1], í: ['i', 2], ǐ: ['i', 3], ì: ['i', 4],
  ō: ['o', 1], ó: ['o', 2], ǒ: ['o', 3], ò: ['o', 4],
  ū: ['u', 1], ú: ['u', 2], ǔ: ['u', 3], ù: ['u', 4],
  ǖ: ['ü', 1], ǘ: ['ü', 2], ǚ: ['ü', 3], ǜ: ['ü', 4],
}

/** Lowercase, ü spelled one way (v and u: are common keyboard stand-ins), no spaces or punctuation */
function clean(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/u:/g, 'ü')
    .replace(/v/g, 'ü')
    .replace(/[\s'’·\-.,，。!?！？]/g, '')
}

/** "píngguǒ" → { toneless: "pingguo", tones: "23" }; "ping2guo3" → same */
function splitTones(s: string): { toneless: string; tones: string } {
  let toneless = ''
  let tones = ''
  for (const ch of clean(s)) {
    const mark = TONE_MARKS[ch]
    if (mark) {
      toneless += mark[0]
      tones += mark[1]
    } else if (/[1-5]/.test(ch)) {
      if (ch !== '5') tones += ch // 5 = neutral tone, which tone marks don't write either
    } else {
      toneless += ch
    }
  }
  return { toneless, tones }
}

export function matchAnswer(input: string, word: Pick<VocabItem, 'simplified' | 'traditional' | 'pinyin' | 'pinyinNumbered'>): MatchResult {
  const typed = clean(input)
  if (!typed) return 'wrong'
  if (typed === clean(word.simplified) || (word.traditional && typed === clean(word.traditional))) return 'exact'

  const answer = splitTones(word.pinyin)
  const given = splitTones(input)
  if (given.toneless !== answer.toneless) return 'wrong'
  if (!given.tones) return 'toneless'
  return given.tones === answer.tones ? 'exact' : 'wrong'
}
