import { useState } from 'react'

interface WordContext {
  simplified: string
  pinyin: string
  english: string
  hskLevel: number
}

interface Props {
  word: WordContext
}

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function SentencePractice({ word }: Props) {
  const [sentence, setSentence] = useState('')
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState<Status>('idle')

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
          placeholder={`e.g. 我很${word.simplified}…`}
          disabled={status === 'loading'}
        />
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
