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

type Mode = 'idle' | 'listening' | 'thinking' | 'speaking'

export default function TeacherButton({ context }: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [teacherText, setTeacherText] = useState('')
  const [input, setInput] = useState('')
  const recognitionRef = useRef<any>(null)

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

  function startListening() {
    const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SpeechRecognitionAPI) {
      alert('Voice input is not supported in this browser. Try Chrome.')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => setMode('listening')

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('')
      setInput(transcript)
    }

    recognition.onend = () => {
      const finalInput = recognitionRef.current?.lastTranscript
      if (finalInput) {
        askTeacher(finalInput)
      } else {
        setMode('idle')
      }
    }

    recognition.onerror = () => setMode('idle')

    recognition.addEventListener('result', (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('')
      if (recognitionRef.current) {
        recognitionRef.current.lastTranscript = transcript
      }
    })

    recognitionRef.current = recognition
    recognitionRef.current.lastTranscript = ''
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') askTeacher(input)
  }

  const isDisabled = mode === 'thinking' || mode === 'speaking'
  const placeholder = mode === 'thinking'
    ? 'Lin Wei is thinking...'
    : mode === 'speaking'
    ? 'Lin Wei is speaking...'
    : mode === 'listening'
    ? 'Listening...'
    : `Ask Lin Wei about "${context.simplified}"...`

  return (
    <div className="teacher-section">
      <div className="teacher-input-row">
        <input
          className="teacher-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
        />
        <button
          className={`teacher-mic-btn${mode === 'listening' ? ' listening' : ''}`}
          onClick={mode === 'listening' ? stopListening : startListening}
          disabled={isDisabled}
          title={mode === 'listening' ? 'Stop recording' : 'Speak your question'}
        >
          {mode === 'listening' ? '⏹' : '🎙️'}
        </button>
        <button
          className={`teacher-send-btn mode-${mode}`}
          onClick={() => askTeacher(input || `Give me a tip for remembering "${context.simplified}" and use it in a natural sentence.`)}
          disabled={isDisabled || mode === 'listening'}
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
