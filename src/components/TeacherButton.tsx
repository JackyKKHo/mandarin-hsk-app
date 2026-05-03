import { useState } from 'react'

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

const PROMPTS = [
  "Give me a tip for remembering this word and use it in a natural sentence.",
  "How would a native speaker use this word in everyday conversation?",
  "Give me a memory trick for this word and an example sentence.",
  "What's a common mistake learners make with this word?",
]

export default function TeacherButton({ context }: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [teacherText, setTeacherText] = useState('')
  const [promptIndex, setPromptIndex] = useState(0)

  const modeLabel: Record<Mode, string> = {
    idle: '🎙️ Ask Teacher',
    thinking: '💭 Thinking...',
    speaking: '🔊 Lin Wei is speaking...',
  }

  async function handleClick() {
    if (mode !== 'idle') return

    const message = PROMPTS[promptIndex % PROMPTS.length]
    setPromptIndex(i => i + 1)
    setMode('thinking')

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
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.onended = () => { setMode('idle'); URL.revokeObjectURL(url) }
        audio.onerror = () => { setMode('idle'); URL.revokeObjectURL(url) }
        audio.play()
      } else {
        const data = await res.json()
        setTeacherText(data.text)
        setMode('idle')
      }
    } catch {
      setMode('idle')
    }
  }

  return (
    <div className="teacher-section">
      <button
        className={`teacher-btn mode-${mode}`}
        onClick={handleClick}
        disabled={mode !== 'idle'}
      >
        {modeLabel[mode]}
      </button>
      {teacherText && (
        <p className="teacher-text">
          <span className="teacher-name">Lin Wei:</span> {teacherText}
        </p>
      )}
    </div>
  )
}
