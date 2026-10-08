// Tone changes (sandhi) for scoring spoken Mandarin.
//
// Third-tone sandhi: in a run of 3rd tones, the last keeps tone 3 and the one before it
// is said as tone 2 (你好 ní hǎo, 我有 wó yǒu). For runs of three or more, the earlier
// syllables depend on how the words group (展览馆 zhán lán guǎn, but 我很好 wǒ hén hǎo),
// so either tone is accepted for those. Runs never cross punctuation.
//
// 一 and 不: pinyin-pro already applies the 一 changes (一个 yí gè, 一起 yì qǐ, but 第一 dì yī,
// 一月 yī yuè), so its tone for 一 is kept. 不 is decided here, because pinyin-pro misses
// two cases:
// - 不 is 2nd tone before a 4th tone (不是 bú shì, 说一不二 shuō yī bú èr), else 4th.
// - 不 is light (neutral) in the middle of A不A questions (是不是) and potential
//   complements (看不见, 听不懂, 对不起, 来不及). pinyin-pro gives these a full tone.
// Either change is marked `sandhi` with the dictionary tone in `citationTone`, so the
// learner sees why the tone differs from the dictionary.
//
// Two more cases the pitch scorer can't judge by dictionary tone alone:
// - Neutral tone (的, 们, 吧, 妈妈's second 妈) has no contour of its own; its pitch
//   depends on the syllable before it, so any detected tone is accepted. The second
//   syllable of a reduplication (谢谢, 看看, 想想) is usually neutral in speech even when
//   the dictionary gives a full tone, so it gets the same treatment.
// - A 3rd tone that isn't phrase-final and isn't followed by another 3rd tone is a
//   'half-third': low and falling, without the rise (我们, 好吃). `halfThird` tells the
//   scorer to accept a low contour even if it reads as a fall.

const ANY = [0, 1, 2, 3, 4]

// Characters that, after 不, make a potential complement (看不见 'can't see')
const BU_COMPLEMENTS = new Set('起见懂及完动住清到')
// Set phrases where 不 is light but the rule above can't tell (人不多 is plain bù duō)
const LIGHT_BU_WORDS = ['差不多', '受不了', '免不了', '少不了', '舍不得', '恨不得', '怪不得', '说不定']
// Characters before 不 that mean it's plain negation, not a complement (我不懂 'I don't understand')
const NOT_VERBS = new Set('我你他她它您们也都还就很又再才可并决绝从千万且而')

const ORDINAL = ['neutral', '1st', '2nd', '3rd', '4th']

/**
 * @param {number[]} tones  tones from pinyin-pro (一 changes applied), one per Han character
 * @param {number[]} [phraseIds]  same length; characters in different phrases never interact
 * @param {string[]} [chars]  the characters, used for 一/不 and reduplications like 谢谢
 * @param {number[]} [citation]  dictionary tones before any change (defaults to `tones`)
 * @returns {{ tone: number, accept: number[], sandhi: boolean, citationTone?: number, rule?: 'third' | 'yi' | 'bu', note?: string, neutral?: boolean, halfThird?: boolean }[]}
 *   tone = the tone to teach, accept = tones scored as correct, sandhi = tone was changed
 */
export function applyThirdToneSandhi(tones, phraseIds = tones.map(() => 0), chars = [], citation = tones) {
  const same = (a, b) => b >= 0 && b < tones.length && phraseIds[a] === phraseIds[b]
  const spoken = [...tones]
  const lightBu = new Set()
  chars.forEach((c, i) => {
    if (c !== '不') return
    const prev = same(i, i - 1) ? chars[i - 1] : null
    const next = same(i, i + 1) ? chars[i + 1] : null
    const word = (prev ?? '') + c + (next ?? '')
    if (prev && next && (prev === next || LIGHT_BU_WORDS.includes(word) || (BU_COMPLEMENTS.has(next) && !NOT_VERBS.has(prev)))) {
      lightBu.add(i)
      spoken[i] = 0
    } else {
      spoken[i] = next && citation[i + 1] === 4 ? 2 : 4
    }
  })

  const out = spoken.map((t, i) => {
    const redup = i > 0 && chars[i] && chars[i] === chars[i - 1] && same(i, i - 1)
    if (t === 0 || redup) {
      return lightBu.has(i)
        ? { tone: 0, accept: ANY, sandhi: true, citationTone: 4, rule: 'bu', note: 'light in the middle', neutral: true }
        : { tone: t, accept: ANY, sandhi: false, neutral: true }
    }
    if ((chars[i] === '一' || chars[i] === '不') && t !== citation[i]) {
      const nextTone = citation[i + 1]
      return {
        tone: t, accept: [t], sandhi: true, citationTone: citation[i], rule: chars[i] === '一' ? 'yi' : 'bu',
        note: same(i, i + 1) && nextTone ? `${citation[i]} → ${t} before ${ORDINAL[nextTone]} tone` : `${citation[i]} → ${t}`,
      }
    }
    return { tone: t, accept: [t], sandhi: false }
  })

  let i = 0
  while (i < spoken.length) {
    if (spoken[i] !== 3) { i++; continue }
    let j = i
    while (j + 1 < spoken.length && spoken[j + 1] === 3 && same(i, j + 1)) j++
    for (let k = i; k < j; k++) {
      out[k] = {
        tone: 2, accept: k === j - 1 ? [2] : [2, 3], sandhi: true,
        citationTone: 3, rule: 'third', note: '3 → 2 before 3rd tone',
      }
    }
    i = j + 1
  }
  // Half-third: a 3rd tone (still 3 after sandhi) with more of the phrase after it
  out.forEach((o, k) => {
    if (o.tone === 3 && !o.neutral && same(k, k + 1)) o.halfThird = true
  })
  return out
}

/** Phrase index for each Han character in `text`; any non-Han character starts a new phrase. */
export function hanPhraseIds(text) {
  const ids = []
  let phrase = 0
  let sawBreak = false
  for (const ch of text) {
    if (/\p{Script=Han}/u.test(ch)) {
      if (sawBreak && ids.length) phrase++
      sawBreak = false
      ids.push(phrase)
    } else {
      sawBreak = true
    }
  }
  return ids
}
