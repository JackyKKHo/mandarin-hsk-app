// Tone-marked pinyin → numbered, syllable by syllable ("Běijīng" → "bei3 jing1").
// Same format as data/hsk*.json (and TonePage): one syllable per character, neutral tone as 0,
// ü written as ü, and the erhua 儿 as its own "er2" ("miàntiáor" → "mian4 tiao2 er2").

const V = 'aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜ'
// A final n/ng belongs to the next syllable when a vowel follows: niúnǎi = niú nǎi, not niún ǎi
const SYL = new RegExp(`(zh|ch|sh|[bpmfdtnlgkhjqxzcsryw])?[${V}]+(?:ng(?![${V}])|n(?![${V}]))?(?:r(?![${V}]))?`, 'gi')
const TONES = [/[āēīōūǖ]/i, /[áéíóúǘ]/i, /[ǎěǐǒǔǚ]/i, /[àèìòùǜ]/i]

// Strips tone marks but keeps ü (NFD splits ǚ into u + diaeresis + caron)
const bare = s => s.normalize('NFD').replace(/ü/gi, 'ü').replace(/\p{M}/gu, '').normalize('NFC').toLowerCase()

export function numbered(pinyin) {
  return (pinyin.split('/')[0].match(SYL) ?? []).flatMap(s => {
    const t = TONES.findIndex(re => re.test(s)) + 1
    let syl = bare(s)
    const erhua = syl.endsWith('r') && syl !== 'er'
    if (erhua) syl = syl.slice(0, -1)
    return erhua ? [`${syl}${t}`, 'er2'] : [`${syl}${t}`]
  }).join(' ')
}
