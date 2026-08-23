import { useState } from 'react'

interface Props {
  simplified: string
  pinyin: string
  english: string
}

interface VerifyResult {
  pinyin: string
  english: string
  agrees: boolean
  note: string
}

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function VerifyTranslation({ simplified, pinyin, english }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function verify() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simplified, pinyin, english }),
      })

      if (res.status === 429) throw new Error('You’ve reached the hourly verification limit — try again later.')
      if (!res.ok) throw new Error('Could not verify right now.')

      const data: VerifyResult = await res.json()
      setResult(data)
      setStatus('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Could not verify right now.')
      setStatus('error')
    }
  }

  if (status === 'idle') {
    return (
      <button className="verify-btn" onClick={verify}>
        🔍 Verify translation with AI
      </button>
    )
  }

  if (status === 'loading') {
    return <div className="verify-loading">Checking with Claude…</div>
  }

  if (status === 'error') {
    return (
      <div className="verify-result verify-error">
        <span>{errorMsg}</span>
        <button className="verify-retry-btn" onClick={verify}>Retry</button>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className={`verify-result ${result.agrees ? 'verify-agree' : 'verify-disagree'}`}>
      <div className="verify-result-header">
        {result.agrees ? '✓ Claude agrees with this translation' : '⚠ Claude suggests a different translation'}
      </div>
      {!result.agrees && (
        <div className="verify-alt">
          <span className="verify-alt-pinyin">{result.pinyin}</span>
          <span className="verify-alt-english">{result.english}</span>
        </div>
      )}
      {result.note && <div className="verify-note">{result.note}</div>}
    </div>
  )
}
