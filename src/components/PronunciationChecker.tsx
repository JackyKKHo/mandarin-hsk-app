import { useState, useRef } from 'react'
import { pinyin } from 'pinyin-pro'
import { getSpeechRecognition, type SpeechRecognitionLike, type SpeechRecognitionEventLike } from '../types/speech'

interface Props {
  target: string   // simplified Chinese characters
  expectedPinyin?: string  // optional pinyin from data (with tone marks)
}

type Status = 'idle' | 'listening' | 'result'

interface SyllableFeedback {
  char: string
  expectedPinyin: string   // e.g. "ni3"
  heardPinyin: string | null
  toneExpected: number
  toneHeard: number | null
  baseMatch: boolean
  correct: boolean
}

const TONE_TIPS: Record<number, { mark: string; tip: string; shape: string }> = {
  1: { mark: 'ā', tip: 'flat and high — hold steady', shape: '‾' },
  2: { mark: 'á', tip: 'rising — like asking a question', shape: '/' },
  3: { mark: 'ǎ', tip: 'dip then rise — like saying "huh?"', shape: 'v' },
  4: { mark: 'à', tip: 'sharp fall — like saying "no!"', shape: '\\' },
  0: { mark: 'a', tip: 'neutral, light and short', shape: '·' },
}

function toPinyinArr(text: string): string[] {
  return pinyin(text, { toneType: 'num', type: 'array', nonZh: 'consecutive' }) as string[]
}

function splitPinyin(p: string): { base: string; tone: number } {
  const match = p.match(/^([a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)(\d)$/i)
  if (match) return { base: match[1].toLowerCase(), tone: Number(match[2]) }
  return { base: p.toLowerCase(), tone: 0 }
}

function analyseAlternatives(
  alts: string[],
  targetChars: string
): SyllableFeedback[] {
  const targetArr = [...targetChars]
  const expectedPinyins = toPinyinArr(targetChars)

  return targetArr.map((char, i) => {
    const expRaw = expectedPinyins[i] ?? ''
    const { base: expBase, tone: expTone } = splitPinyin(expRaw)

    let heardPinyin: string | null = null
    let toneHeard: number | null = null
    let baseMatch = false

    // Try each STT alternative to find one matching this syllable position
    for (const alt of alts) {
      const altArr = [...alt]
      if (altArr.length !== targetArr.length) continue
      const altPinyins = toPinyinArr(alt)
      const altRaw = altPinyins[i] ?? ''
      const { base: altBase, tone: altTone } = splitPinyin(altRaw)

      if (altBase === expBase) {
        // Same base syllable — this alternative tells us the heard tone
        heardPinyin = altRaw
        toneHeard = altTone
        baseMatch = true
        break
      }
    }

    // If first alternative matches the char exactly, treat as correct
    const firstAltPinyins = toPinyinArr(alts[0] ?? '')
    const firstRaw = firstAltPinyins[i] ?? ''
    const { base: firstBase, tone: firstTone } = splitPinyin(firstRaw)
    if (!baseMatch && firstBase) {
      heardPinyin = firstRaw
      toneHeard = firstTone
      baseMatch = firstBase === expBase
    }

    const correct = baseMatch && (toneHeard === expTone || toneHeard === null)

    return {
      char,
      expectedPinyin: expRaw,
      heardPinyin,
      toneExpected: expTone,
      toneHeard,
      baseMatch,
      correct,
    }
  })
}

function overallGrade(syllables: SyllableFeedback[]): 'perfect' | 'tones' | 'sounds' | 'miss' {
  if (syllables.every(s => s.correct)) return 'perfect'
  if (syllables.every(s => s.baseMatch)) return 'tones'
  if (syllables.some(s => s.baseMatch)) return 'sounds'
  return 'miss'
}

const SpeechRecognition = getSpeechRecognition()

export default function PronunciationChecker({ target }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [syllables, setSyllables] = useState<SyllableFeedback[]>([])
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  if (!SpeechRecognition) return null

  function start() {
    setStatus('listening')
    setSyllables([])

    const rec = new SpeechRecognition!()
    recRef.current = rec
    rec.lang = 'zh-CN'
    rec.continuous = false
    rec.interimResults = false
    rec.maxAlternatives = 5

    rec.onresult = (e: SpeechRecognitionEventLike) => {
      const first = e.results[0] as SpeechRecognitionEventLike['results'][number] & { [index: number]: { transcript: string } }
      const alts: string[] = []
      for (let i = 0; i < first.length; i++) {
        alts.push(first[i].transcript.trim())
      }
      setSyllables(analyseAlternatives(alts, target))
      setStatus('result')
    }

    rec.onerror = () => setStatus('idle')
    rec.onend = () => { if (status === 'listening') setStatus('idle') }
    rec.start()
  }

  function reset() {
    setStatus('idle')
    setSyllables([])
  }

  if (status === 'result' && syllables.length > 0) {
    const grade = overallGrade(syllables)
    const allCorrect = grade === 'perfect'

    return (
      <div className="pronun-result-wrap">
        <div className={`pronun-grade pronun-grade-${grade}`}>
          {grade === 'perfect' && '🎉 完美！Perfect!'}
          {grade === 'tones'   && '🎵 Right sounds — check your tones'}
          {grade === 'sounds'  && '💪 Almost — some sounds need work'}
          {grade === 'miss'    && '🔄 Try again — could not recognise'}
        </div>

        {!allCorrect && (
          <div className="pronun-breakdown">
            {syllables.map((s, i) => (
              <div key={i} className={`pronun-syllable${s.correct ? ' syl-ok' : s.baseMatch ? ' syl-tone' : ' syl-wrong'}`}>
                <span className="syl-char">{s.char}</span>
                <span className="syl-expected">{s.expectedPinyin}</span>
                {!s.correct && (
                  <div className="syl-feedback">
                    {s.baseMatch && s.toneHeard !== null && s.toneHeard !== s.toneExpected ? (
                      <>
                        <span className="syl-heard">heard tone {s.toneHeard}</span>
                        <span className="syl-tip">
                          Tone {s.toneExpected} ({TONE_TIPS[s.toneExpected]?.mark ?? ''}):{' '}
                          {TONE_TIPS[s.toneExpected]?.tip ?? ''}
                          <span className="syl-shape"> {TONE_TIPS[s.toneExpected]?.shape}</span>
                        </span>
                      </>
                    ) : (
                      <span className="syl-heard">
                        {s.heardPinyin ? `heard: ${s.heardPinyin}` : 'not recognised'}
                      </span>
                    )}
                  </div>
                )}
                {s.correct && <span className="syl-check">✓</span>}
              </div>
            ))}
          </div>
        )}

        <button className="pronun-retry" onClick={reset}>Try again</button>
      </div>
    )
  }

  return (
    <button
      className={`pronun-btn${status === 'listening' ? ' listening' : ''}`}
      onClick={status === 'idle' ? start : () => { recRef.current?.stop(); setStatus('idle') }}
      title="Check your pronunciation"
    >
      {status === 'listening' ? (
        <><span className="pronun-pulse" /><span>Listening…</span></>
      ) : (
        <>🎙️ Check pronunciation</>
      )}
    </button>
  )
}
