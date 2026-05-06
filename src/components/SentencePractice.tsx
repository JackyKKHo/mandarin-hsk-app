import { useState, useRef, useEffect } from 'react'

interface WordContext {
  simplified: string
  pinyin: string
  english: string
  hskLevel: number
  partOfSpeech?: string
}

interface Props {
  word: WordContext
}

type Status = 'idle' | 'listening' | 'loading' | 'done' | 'error'

function getPlaceholder(word: WordContext) {
  const pos = (word.partOfSpeech || '').toLowerCase()
  if (pos.startsWith('n') || pos === 'pron' || pos === 'mw') return `这是${word.simplified}…`
  if (pos.startsWith('v')) return `我想${word.simplified}…`
  if (pos === 'adj') return `这很${word.simplified}…`
  return `请用${word.simplified}造一个句子…`
}

export default function SentencePractice({ word }: Props) {
  const [sentence, setSentence] = useState('')
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setSentence('')
    setFeedback('')
    setStatus('idle')
    recognitionRef.current?.stop()
  }, [word.simplified])

  function startListening() {
    const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SpeechRecognitionAPI) return
    const rec = new SpeechRecognitionAPI()
    rec.lang = 'zh-CN'
    rec.continuous = true
    rec.interimResults = true
    let silenceTimer: ReturnType<typeof setTimeout> | null = null

    rec.onstart = () => setStatus('listening')
    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setSentence(t)
      if (rec._lastTranscript !== undefined) rec._lastTranscript = t
      if (silenceTimer) clearTimeout(silenceTimer)
      silenceTimer = setTimeout(() => rec.stop(), 2000)
    }
    rec.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer)
      setStatus('idle')
    }
    rec.onerror = () => setStatus('idle')
    rec._lastTranscript = ''
    recognitionRef.current = rec
    rec.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
  }

  async function submit() {
    const trimmed = sentence.trim()
    if (!trimmed || status === 'loading') return
    setStatus('loading')
    setFeedback('')

    try {
      const res = await fetch('/api/sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: trimmed, word }),
      })
      if (res.status === 429) throw new Error('rate_limit')
      if (!res.ok) throw new Error('api_error')
      const data = await res.json()
      setFeedback(data.feedback)
      setStatus('done')
    } catch (e: any) {
      setFeedback(
        e?.message === 'rate_limit'
          ? "You've reached the hourly limit. Try again in a bit!"
          : 'Could not get feedback — please try again.'
      )
      setStatus('error')
    }
  }

  const isCorrect = feedback.startsWith('✓')

  return (
    <div className="sentence-practice">
      <h3 className="sentence-practice-title">Make a sentence</h3>
      <p className="sentence-practice-hint">
        Write a sentence using <strong>{word.simplified}</strong>
      </p>
      <div className="sentence-practice-input-row">
        <input
          className="sentence-practice-input"
          type="text"
          value={sentence}
          onChange={e => { setSentence(e.target.value); if (status !== 'idle') setStatus('idle') }}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          placeholder={status === 'listening' ? 'Listening…' : `e.g. ${getPlaceholder(word)}`}
          disabled={status === 'loading'}
        />
        <button
          className={`sentence-mic-btn${status === 'listening' ? ' listening' : ''}`}
          onClick={status === 'listening' ? stopListening : startListening}
          disabled={status === 'loading'}
          title={status === 'listening' ? 'Stop recording' : 'Speak your sentence'}
        >
          {status === 'listening' ? '⏹' : '🎙️'}
        </button>
        <button
          className="sentence-practice-btn"
          onClick={submit}
          disabled={!sentence.trim() || status === 'loading'}
        >
          {status === 'loading' ? '…' : 'Check'}
        </button>
      </div>

      {feedback && (
        <div className={`sentence-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
          {feedback}
        </div>
      )}
    </div>
  )
}
