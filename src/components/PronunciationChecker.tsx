import { useState, useRef } from 'react'

interface Props {
  target: string  // simplified Chinese characters expected
}

type Status = 'idle' | 'listening' | 'result'
type Grade = 'perfect' | 'good' | 'close' | 'miss'

function gradeResult(heard: string, target: string): Grade {
  const h = heard.trim()
  if (!h) return 'miss'
  if (h === target || h.includes(target)) return 'perfect'

  // count matching characters
  const targetChars = [...target]
  const heardChars = [...h]
  let matches = 0
  for (const ch of targetChars) {
    if (heardChars.includes(ch)) matches++
  }
  const ratio = matches / targetChars.length
  if (ratio >= 0.8) return 'good'
  if (ratio >= 0.4) return 'close'
  return 'miss'
}

const MESSAGES: Record<Grade, { emoji: string; en: string; zh: string }> = {
  perfect: { emoji: '🎉', en: 'Perfect!',         zh: '完美！' },
  good:    { emoji: '👍', en: 'Very good!',        zh: '很好！' },
  close:   { emoji: '💪', en: 'Almost there!',     zh: '差不多！' },
  miss:    { emoji: '🔄', en: 'Try again',         zh: '再试试！' },
}

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export default function PronunciationChecker({ target }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [grade, setGrade] = useState<Grade | null>(null)
  const [heard, setHeard] = useState('')
  const recRef = useRef<any>(null)

  if (!SpeechRecognition) return null

  function start() {
    setStatus('listening')
    setGrade(null)
    setHeard('')

    const rec = new SpeechRecognition()
    recRef.current = rec
    rec.lang = 'zh-CN'
    rec.continuous = false
    rec.interimResults = false
    rec.maxAlternatives = 3

    rec.onresult = (e: any) => {
      // pick the best alternative that most closely matches target
      const alts: string[] = []
      for (let i = 0; i < e.results[0].length; i++) {
        alts.push(e.results[0][i].transcript)
      }
      // score each alternative, pick best
      const scored = alts.map(a => ({ text: a, grade: gradeResult(a, target) }))
      const order: Grade[] = ['perfect', 'good', 'close', 'miss']
      scored.sort((a, b) => order.indexOf(a.grade) - order.indexOf(b.grade))
      const best = scored[0]
      setHeard(best.text)
      setGrade(best.grade)
      setStatus('result')
    }

    rec.onerror = () => {
      setStatus('idle')
    }

    rec.onend = () => {
      if (status === 'listening') setStatus('idle')
    }

    rec.start()
  }

  function stop() {
    recRef.current?.stop()
    setStatus('idle')
  }

  function reset() {
    setStatus('idle')
    setGrade(null)
    setHeard('')
  }

  if (status === 'result' && grade) {
    const msg = MESSAGES[grade]
    return (
      <div className={`pronun-result pronun-${grade}`}>
        <span className="pronun-emoji">{msg.emoji}</span>
        <div className="pronun-text">
          <span className="pronun-en">{msg.en}</span>
          <span className="pronun-zh">{msg.zh}</span>
        </div>
        {heard && <span className="pronun-heard">"{heard}"</span>}
        <button className="pronun-retry" onClick={reset}>Try again</button>
      </div>
    )
  }

  return (
    <button
      className={`pronun-btn${status === 'listening' ? ' listening' : ''}`}
      onClick={status === 'idle' ? start : stop}
      title="Check your pronunciation"
    >
      {status === 'listening' ? (
        <>
          <span className="pronun-pulse" />
          <span>Listening…</span>
        </>
      ) : (
        <>🎙️ Check pronunciation</>
      )}
    </button>
  )
}
