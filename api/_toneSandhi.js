// Third-tone sandhi for scoring spoken Mandarin.
//
// pinyin-pro already applies the 一 and 不 tone changes, but it returns dictionary
// tones for runs of 3rd tones. In speech, the last 3rd tone in a run keeps tone 3
// and the one before it is said as tone 2 (你好 ní hǎo, 我有 wó yǒu). For runs of
// three or more, the earlier syllables depend on how the words group (展览馆
// zhán lán guǎn, but 我很好 wǒ hén hǎo), so either tone is accepted for those.
// Runs never cross punctuation.
//
// Two more cases the pitch scorer can't judge by dictionary tone alone:
// - Neutral tone (的, 们, 吧, 妈妈's second 妈) has no contour of its own; its pitch
//   depends on the syllable before it, so any detected tone is accepted. The second
//   syllable of a reduplication (谢谢, 看看, 想想) is usually neutral in speech even when
//   the dictionary gives a full tone, so it gets the same treatment.
// - A 3rd tone that isn't phrase-final and isn't followed by another 3rd tone is a
//   'half-third': low and falling, without the rise (我们, 好吃). `halfThird` tells the
//   scorer to accept a low contour even if it reads as a fall.

/**
 * @param {number[]} tones  dictionary tones, one per Han character
 * @param {number[]} [phraseIds]  same length; characters in different phrases never form a run
 * @param {string[]} [chars]  the characters, used to spot reduplications like 谢谢
 * @returns {{ tone: number, accept: number[], sandhi: boolean, neutral?: boolean, halfThird?: boolean }[]}
 *   tone = the tone to teach, accept = tones scored as correct, sandhi = tone was changed
 */
export function applyThirdToneSandhi(tones, phraseIds = tones.map(() => 0), chars = []) {
  const ANY = [0, 1, 2, 3, 4]
  const out = tones.map((t, i) => {
    const redup = i > 0 && chars[i] && chars[i] === chars[i - 1] && phraseIds[i] === phraseIds[i - 1]
    return t === 0 || redup
      ? { tone: t, accept: ANY, sandhi: false, neutral: true }
      : { tone: t, accept: [t], sandhi: false }
  })
  let i = 0
  while (i < tones.length) {
    if (tones[i] !== 3) { i++; continue }
    let j = i
    while (j + 1 < tones.length && tones[j + 1] === 3 && phraseIds[j + 1] === phraseIds[i]) j++
    for (let k = i; k < j; k++) {
      out[k] = k === j - 1
        ? { tone: 2, accept: [2], sandhi: true }
        : { tone: 2, accept: [2, 3], sandhi: true }
    }
    i = j + 1
  }
  // Half-third: a 3rd tone (still 3 after sandhi) with more of the phrase after it
  out.forEach((o, k) => {
    const phraseFinal = k === tones.length - 1 || phraseIds[k + 1] !== phraseIds[k]
    if (o.tone === 3 && !o.neutral && !phraseFinal) o.halfThird = true
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
