import { useState, useRef, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { DIALOGUES } from '../data/dialogues'
import { playAudio, stopAudio } from '../audio'
import RecordButton from '../components/RecordButton'

type PlayState = 'idle' | 'playing' | 'done'

function useTTS() {
  const [playing, setPlaying] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  async function playLine(index: number, text: string) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setPlaying(index)
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const audio = playAudio(blob)
      audioRef.current = audio
      audio.onended = () => { setPlaying(null); audioRef.current = null }
      audio.onerror = () => { setPlaying(null); audioRef.current = null }
    } catch {
      setPlaying(null)
    }
  }

  return { playing, playLine }
}

export default function DialoguePage() {
  const { id } = useParams<{ id: string }>()
  const dialogue = DIALOGUES.find(d => d.id === id)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [allRevealed, setAllRevealed] = useState(false)
  const [playState, setPlayState] = useState<PlayState>('idle')
  const { playing, playLine } = useTTS()
  const cancelRef = useRef(false)

  useEffect(() => () => { cancelRef.current = true; stopAudio() }, [])

  if (!dialogue) {
    return (
      <div className="browser-page">
        <AppHeader />
        <p className="empty-state">Dialogue not found.</p>
      </div>
    )
  }

  function toggleReveal(i: number) {
    setRevealed(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function revealAll() {
    setAllRevealed(true)
    setRevealed(new Set(dialogue!.lines.map((_, i) => i)))
  }

  async function playAll() {
    cancelRef.current = false
    setPlayState('playing')
    for (let i = 0; i < dialogue!.lines.length; i++) {
      if (cancelRef.current) break
      await new Promise<void>(resolve => {
        playLine(i, dialogue!.lines[i].chinese)
        const check = setInterval(() => {
          // wait until this line finishes (playing becomes null or changes)
        }, 100)
        // simple approach: just wait fixed time proportional to length
        const duration = dialogue!.lines[i].chinese.length * 350 + 600
        setTimeout(() => { clearInterval(check); resolve() }, duration)
      })
      if (cancelRef.current) break
    }
    setPlayState('done')
  }

  function stopAll() {
    cancelRef.current = true
    setPlayState('idle')
  }

  const isWechat = dialogue.id === 'wechat'

  return (
    <div className="browser-page">
      <AppHeader />

      <div className="dialogue-header">
        <Link to="/dialogues" className="back-link">← Dialogues</Link>
        <div className="dialogue-header-inner">
          <span className="dialogue-header-emoji">{dialogue.emoji}</span>
          <div>
            <div className="dialogue-header-level">HSK {dialogue.hskLevel}</div>
            <h2 className="dialogue-header-title">
              {dialogue.title} <span className="dialogue-header-zh">{dialogue.titleZh}</span>
            </h2>
            <p className="dialogue-header-situation">{dialogue.situation}</p>
          </div>
        </div>
        <div className="dialogue-controls">
          {playState === 'playing' ? (
            <button className="btn-secondary dialogue-ctrl-btn" onClick={stopAll}>⏹ Stop</button>
          ) : (
            <button className="btn-primary dialogue-ctrl-btn" onClick={playAll}>
              ▶ Play all
            </button>
          )}
          {!allRevealed && (
            <button className="btn-secondary dialogue-ctrl-btn" onClick={revealAll}>
              Show all translations
            </button>
          )}
        </div>
      </div>

      <div className={`dialogue-chat${isWechat ? ' dialogue-wechat' : ''}`}>
        {isWechat && (
          <div className="wechat-bar">
            <span className="wechat-name">小明</span>
            <span className="wechat-status">● Online</span>
          </div>
        )}
        {dialogue.lines.map((line, i) => {
          const isMe = line.speaker === 'B'
          const isRevealed = revealed.has(i) || allRevealed
          const isPlaying = playing === i

          return (
            <div
              key={i}
              className={`chat-line${isMe ? ' chat-line-me' : ' chat-line-them'}`}
              onClick={() => toggleReveal(i)}
            >
              {!isMe && !isWechat && (
                <div className="chat-avatar chat-avatar-them">店</div>
              )}
              {isWechat && !isMe && (
                <div className="chat-avatar chat-avatar-them">明</div>
              )}
              <div className="chat-bubble-wrap">
                <div className={`chat-bubble${isMe ? ' bubble-me' : ' bubble-them'}${isPlaying ? ' bubble-playing' : ''}`}>
                  <div className="chat-chinese">{line.chinese}</div>
                  {isRevealed && (
                    <div className="chat-reveal">
                      <div className="chat-pinyin">{line.pinyin}</div>
                      <div className="chat-english">{line.english}</div>
                    </div>
                  )}
                  {!isRevealed && (
                    <div className="chat-tap-hint">tap for translation</div>
                  )}
                </div>
                <button
                  className={`chat-play-btn${isPlaying ? ' chat-play-btn-active' : ''}`}
                  onClick={e => { e.stopPropagation(); playLine(i, line.chinese) }}
                  title="Play audio"
                >
                  {isPlaying ? '🔊' : '🔈'}
                </button>
                <RecordButton zh={line.chinese} pinyin={line.pinyin} en={line.english} />
              </div>
              {isMe && (
                <div className="chat-avatar chat-avatar-me">你</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="dialogue-vocab-hint">
        <span>💡 Tap any bubble to reveal pinyin and translation</span>
      </div>

      <DialogueNav current={dialogue.id} />
    </div>
  )
}

function DialogueNav({ current }: { current: string }) {
  const idx = DIALOGUES.findIndex(d => d.id === current)
  const prev = idx > 0 ? DIALOGUES[idx - 1] : null
  const next = idx < DIALOGUES.length - 1 ? DIALOGUES[idx + 1] : null

  return (
    <div className="dialogue-footer-nav">
      {prev ? (
        <Link to={`/dialogue/${prev.id}`} className="btn-secondary dialogue-nav-btn">
          ← {prev.emoji} {prev.title}
        </Link>
      ) : <span />}
      {next ? (
        <Link to={`/dialogue/${next.id}`} className="btn-primary dialogue-nav-btn">
          {next.emoji} {next.title} →
        </Link>
      ) : (
        <Link to="/dialogues" className="btn-primary dialogue-nav-btn">
          Back to all →
        </Link>
      )}
    </div>
  )
}
