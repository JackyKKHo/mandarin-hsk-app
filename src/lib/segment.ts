import type { VocabItem } from '../types'

export interface Token {
  text: string
  vocab?: VocabItem
}

const CJK = /[一-鿿㐀-䶿豈-﫿]/

export function isHan(ch: string): boolean {
  return CJK.test(ch)
}

/** Greedy longest-match split of Chinese text into HSK words; non-Han runs stay as plain tokens */
export function segment(text: string, lookup: Map<string, VocabItem>, maxLen = 4): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (!CJK.test(ch)) {
      const last = tokens[tokens.length - 1]
      if (last && !last.vocab && !CJK.test(last.text[last.text.length - 1])) {
        last.text += ch
      } else {
        tokens.push({ text: ch })
      }
      i++
      continue
    }
    let matched = false
    for (let len = maxLen; len >= 2; len--) {
      if (i + len > text.length) continue
      const candidate = text.slice(i, i + len)
      if (lookup.has(candidate)) {
        tokens.push({ text: candidate, vocab: lookup.get(candidate)! })
        i += len
        matched = true
        break
      }
    }
    if (!matched) {
      tokens.push({ text: ch, vocab: lookup.get(ch) })
      i++
    }
  }
  return tokens
}

/** Split text into pieces short enough for one TTS request, breaking after sentence punctuation */
export function chunkForSpeech(text: string, maxLen = 120): string[] {
  const sentences = text.match(/[^。！？!?；;\n]+[。！？!?；;]*/g) ?? []
  const chunks: string[] = []
  let cur = ''
  for (const raw of sentences) {
    const s = raw.trim()
    if (!s) continue
    if (cur && cur.length + s.length > maxLen) {
      chunks.push(cur)
      cur = ''
    }
    if (s.length > maxLen) {
      // One very long sentence: cut at commas, then hard-cut
      for (const part of s.match(new RegExp(`[^，,、]{1,${maxLen}}[，,、]?`, 'g')) ?? []) {
        if (cur && cur.length + part.length > maxLen) {
          chunks.push(cur)
          cur = ''
        }
        cur += part
      }
    } else {
      cur += s
    }
  }
  if (cur) chunks.push(cur)
  return chunks
}
