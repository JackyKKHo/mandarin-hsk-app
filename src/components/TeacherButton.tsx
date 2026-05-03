import { useState, useRef } from 'react'
import { playAudio } from '../audio'

interface WordContext {
  simplified: string
  pinyin: string
  english: string
  hskLevel: number
}

interface Props {
  context: WordContext
}

type Mode = 'idle' | 'thinking' | 'speaking'

export default function TeacherButton({ context }: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [teacherText, setTeacherText] = useState('')
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function askTeacher(message: string) {
    if (!message.trim()) return
    setMode('thinking')
    setInput('')

    try {
      const res = await fetch('/api/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      })

      if (!res.ok) throw new Error('Teacher API failed')

      const contentType = res.headers.get('Content-Type') ?? ''
      const text = decodeURIComponent(res.headers.get('X-Teacher-Text') ?? '')
      setTeacherText(text)

      if (contentType.includes('audio')) {
        setMode('speaking')
        const blob = await res.blob()
        const audio = playAudio(blob)
        audio.onended = () => setMode('idle')
        audio.onerror = () => setMode('idle')
      } else {
        const data = await res.json()
        setTeacherText(data.text)
        setMode('idle')
      }
    } catch {
      setMode('idle')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') askTeacher(input)
  }

  const placeholder = mode === 'thinking'
    ? 'Lin Wei is thinking...'
    : mode === 'speaking'
    ? 'Lin Wei is speaking...'
    : `Ask Lin Wei about "${context.simplified}"...`

  return (
    <div className="teacher-section">
      <div className="teacher-input-row">
        <input
          ref={inputRef}
          className="teacher-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={mode !== 'idle'}
        />
        <button
          className={`teacher-send-btn mode-${mode}`}
          onClick={() => askTeacher(input || `Give me a tip for remembering "${context.simplified}" and use it in a natural sentence.`)}
          disabled={mode !== 'idle'}
          title="Ask teacher"
        >
          {mode === 'thinking' ? '💭' : mode === 'speaking' ? '🔊' : '➤'}
        </button>
      </div>
      {teacherText && (
        <p className="teacher-text">
          <span className="teacher-name">Lin Wei:</span> {teacherText}
        </p>
      )}
    </div>
  )
}
