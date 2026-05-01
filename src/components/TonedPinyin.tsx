// Tone colours: 1=red 2=orange 3=green 4=blue 0=neutral
const TONE_CLASS: Record<number, string> = {
  1: 'tone-1',
  2: 'tone-2',
  3: 'tone-3',
  4: 'tone-4',
  0: 'tone-0',
}

// Matches one pinyin syllable (initial? + vowels + coda?)
const SYLLABLE_RE = /(zh|ch|sh|[bpmfdtnlgkhjqxzcsr])?[aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜ]+(?:ng?|r)?/gi

function tone(syllable: string): number {
  if (/[āēīōūǖĀĒĪŌŪǕ]/.test(syllable)) return 1
  if (/[áéíóúǘÁÉÍÓÚǗ]/.test(syllable)) return 2
  if (/[ǎěǐǒǔǚǍĚǏǑǓǙ]/.test(syllable)) return 3
  if (/[àèìòùǜÀÈÌÒÙǛ]/.test(syllable)) return 4
  return 0
}

interface Part {
  text: string
  toneClass: string | null
}

function parse(pinyin: string): Part[] {
  const parts: Part[] = []
  const re = new RegExp(SYLLABLE_RE.source, 'gi')
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(pinyin)) !== null) {
    if (match.index > last) {
      parts.push({ text: pinyin.slice(last, match.index), toneClass: null })
    }
    parts.push({ text: match[0], toneClass: TONE_CLASS[tone(match[0])] })
    last = match.index + match[0].length
  }
  if (last < pinyin.length) {
    parts.push({ text: pinyin.slice(last), toneClass: null })
  }
  return parts
}

interface Props {
  pinyin: string
  className?: string
}

export default function TonedPinyin({ pinyin, className }: Props) {
  const parts = parse(pinyin)
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.toneClass ? (
          <span key={i} className={p.toneClass}>{p.text}</span>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </span>
  )
}
