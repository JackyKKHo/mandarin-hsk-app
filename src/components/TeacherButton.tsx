import { useState, useRef } from 'react'

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const modeLabel: Record<Mode, string> = {
    idle: '🎙️ Ask Teacher',
    listening: '⏹️ Stop',
    thinking: '💭 Thinking...',
    speaking: '🔊 Speaking...',
  }

  async function handleClick() {
    if (mode === 'listening') {
      mediaRecorderRef.current?.stop()
      return
    }
    if (mode !== 'idle') return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setMode('thinking')

        // Use Web Speech API to transcribe locally (free)
        const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = SpeechRecognitionAPI ? new SpeechRecognitionAPI() : null

        if (!recognition) {
          await askTeacher("Can you introduce yourself and give me a tip for this word?")
          return
        }

        recognition.lang = 'en-US'
        recognition.onresult = async (e: any) => {
          const transcript = e.results[0][0].transcript
          await askTeacher(transcript)
        }
        recognition.onerror = async () => {
          await askTeacher("Can you give me a tip for remembering this word?")
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        recognition.start()
        audio.play()
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setMode('listening')
    } catch {
      // Microphone denied — fall back to a default prompt
      await askTeacher("Can you give me a tip for remembering this word?")
    }
  }

  async function askTeacher(message: string) {
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
        audio.onended = () => {
          setMode('idle')
          URL.revokeObjectURL(url)
        }
        audio.onerror = () => {
          setMode('idle')
          URL.revokeObjectURL(url)
        }
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
        disabled={mode === 'thinking' || mode === 'speaking'}
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
