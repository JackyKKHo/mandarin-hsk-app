import { useState, useRef, useEffect } from 'react'
import { playAudio } from '../audio'

interface WordContext {
  simplified: string
  pinyin: string
  english: string
  hskLevel: number
  partOfSpeech?: string | string[]
  explanation?: string
}

interface Props {
  context: WordContext
}

interface Message {
  role: 'user' | 'teacher'
  text: string
  audioBlob?: Blob
}

type Status = 'idle' | 'listening' | 'thinking' | 'speaking'
type ImmersionLevel = 'beginner' | 'intermediate' | 'advanced'

const IMMERSION_LABELS: Record<ImmersionLevel, string> = {
  beginner:     '🇬🇧 Beginner',
  intermediate: '🌏 Intermediate',
  advanced:     '🇨🇳 Advanced',
}

function getImmersion(): ImmersionLevel {
  return (localStorage.getItem('immersionLevel') as ImmersionLevel) || 'intermediate'
}

export default function TeacherButton({ context }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [immersion, setImmersion] = useState<ImmersionLevel>(getImmersion)
  const [showImmersionMenu, setShowImmersionMenu] = useState(false)

  const recognitionRef = useRef<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  function setImmersionLevel(level: ImmersionLevel) {
    localStorage.setItem('immersionLevel', level)
    setImmersion(level)
    setShowImmersionMenu(false)
  }

  async function send(message: string) {
    if (!message.trim() || status !== 'idle') return
    const userMsg: Message = { role: 'user', text: message }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStatus('thinking')

    // Only send last 10 messages to keep context manageable
    const history = newMessages.slice(-10)

    try {
      const res = await fetch('/api/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          immersion,
          history: history.slice(0, -1), // exclude the message we're sending
        }),
      })

      if (res.status === 429) throw new Error('rate_limit')
      if (!res.ok) throw new Error('api_error')

      const contentType = res.headers.get('Content-Type') ?? ''
      const teacherText = decodeURIComponent(res.headers.get('X-Teacher-Text') ?? '')

      if (contentType.includes('audio')) {
        const blob = await res.blob()
        setMessages(prev => [...prev, { role: 'teacher', text: teacherText, audioBlob: blob }])
        setStatus('speaking')
        const audio = playAudio(blob)
        audio.onended = () => setStatus('idle')
        audio.onerror = () => setStatus('idle')
      } else {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'teacher', text: data.text }])
        setStatus('idle')
      }
    } catch (e: any) {
      const msg = e?.message === 'rate_limit'
        ? "You've reached the hourly limit for Lin Wei. Try again in a bit!"
        : 'Sorry, I had trouble connecting. Please try again.'
      setMessages(prev => [...prev, { role: 'teacher', text: msg }])
      setStatus('idle')
    }
  }

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
      setInput(t)
      if (silenceTimer) clearTimeout(silenceTimer)
      silenceTimer = setTimeout(() => rec.stop(), 2500)
    }
    rec.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer)
      const final = recognitionRef.current?.lastTranscript
      if (final) send(final)
      else setStatus('idle')
    }
    rec.onerror = () => setStatus('idle')
    rec.addEventListener('result', (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      if (recognitionRef.current) recognitionRef.current.lastTranscript = t
    })
    recognitionRef.current = rec
    recognitionRef.current.lastTranscript = ''
    rec.start()
  }

  function replayAudio(blob: Blob) {
    setStatus('speaking')
    const audio = playAudio(blob)
    audio.onended = () => setStatus('idle')
  }

  const busy = status !== 'idle'

  return (
    <div className="teacher-wrap">
      {!open ? (
        <button className="teacher-open-btn" onClick={() => setOpen(true)}>
          <img src="/lin-wei.svg" alt="Lin Wei" className="teacher-avatar" />
          <span>Ask Lin Wei 老师</span>
          {messages.length > 0 && <span className="teacher-badge">{messages.length}</span>}
        </button>
      ) : (
        <div className="teacher-chat">
          {/* Header */}
          <div className="teacher-chat-header">
            <img src="/lin-wei.svg" alt="Lin Wei" className="teacher-avatar-sm" />
            <span className="teacher-chat-name">Lin Wei 老师</span>
            <div className="immersion-picker" style={{ marginLeft: 'auto' }}>
              <button
                className="immersion-trigger"
                onClick={() => setShowImmersionMenu(m => !m)}
                disabled={busy}
              >
                {IMMERSION_LABELS[immersion]} ▾
              </button>
              {showImmersionMenu && (
                <div className="immersion-menu">
                  {(Object.keys(IMMERSION_LABELS) as ImmersionLevel[]).map(level => (
                    <button
                      key={level}
                      className={`immersion-option${immersion === level ? ' active' : ''}`}
                      onClick={() => setImmersionLevel(level)}
                    >
                      {IMMERSION_LABELS[level]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="teacher-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="teacher-messages">
            {messages.length === 0 && (
              <div className="teacher-welcome">
                <p>你好！I'm Lin Wei. Ask me anything about <strong>{context.simplified}</strong> — pronunciation, usage, cultural notes, memory tricks…</p>
                <div className="teacher-suggestions">
                  {[
                    `How do I remember ${context.simplified}?`,
                    `Give me a natural example sentence`,
                    `What's the cultural context?`,
                  ].map(s => (
                    <button key={s} className="teacher-suggestion" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble-row ${m.role === 'user' ? 'cb-user' : 'cb-teacher'}`}>
                {m.role === 'teacher' && <img src="/lin-wei.svg" alt="Lin Wei" className="chat-avatar" />}
                <div className={`chat-bubble ${m.role === 'user' ? 'bubble-user' : 'bubble-teacher'}`}>
                  <span>{m.text}</span>
                  {m.role === 'teacher' && m.audioBlob && (
                    <button
                      className="chat-replay-btn"
                      onClick={() => replayAudio(m.audioBlob!)}
                      title="Replay audio"
                    >🔊</button>
                  )}
                </div>
              </div>
            ))}

            {status === 'thinking' && (
              <div className="chat-bubble-row cb-teacher">
                <img src="/lin-wei.svg" alt="Lin Wei" className="chat-avatar" />
                <div className="chat-bubble bubble-teacher chat-typing">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="teacher-input-row">
            <input
              ref={inputRef}
              className="teacher-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(input) }}
              placeholder={
                status === 'listening' ? 'Listening…' :
                status === 'thinking' ? 'Lin Wei is thinking…' :
                'Ask something…'
              }
              disabled={busy}
            />
            <button
              className={`teacher-mic-btn${status === 'listening' ? ' listening' : ''}`}
              onClick={status === 'listening' ? () => recognitionRef.current?.stop() : startListening}
              disabled={status === 'thinking' || status === 'speaking'}
              title="Voice input"
            >
              {status === 'listening' ? '⏹' : '🎙️'}
            </button>
            <button
              className={`teacher-send-btn mode-${status}`}
              onClick={() => send(input || `Tell me something interesting about "${context.simplified}"`)}
              disabled={busy}
            >
              {status === 'thinking' ? '💭' : status === 'speaking' ? '🔊' : '➤'}
            </button>
          </div>

          {messages.length > 0 && (
            <button className="teacher-clear-btn" onClick={() => setMessages([])}>Clear conversation</button>
          )}
        </div>
      )}
    </div>
  )
}
