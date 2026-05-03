import { useState } from 'react'
import { playAudio } from '../audio'

interface Props {
  text: string
  audioUrl?: string | null
  label?: string
}

export default function AudioButton({ text, audioUrl, label }: Props) {
  const [playing, setPlaying] = useState(false)

  async function play(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (playing) return
    setPlaying(true)

    try {
      const src = audioUrl ?? `/api/tts?text=${encodeURIComponent(text)}`
      const res = await fetch(src)
      if (!res.ok) throw new Error('TTS failed')
      const blob = await res.blob()
      const audio = playAudio(blob)
      audio.onended = () => setPlaying(false)
      audio.onerror = () => setPlaying(false)
    } catch {
      setPlaying(false)
    }
  }

  return (
    <button
      className={`audio-btn${playing ? ' playing' : ''}`}
      onClick={(e) => play(e)}
      aria-label={label ?? `Play audio for ${text}`}
      title="Play pronunciation"
    >
      {playing ? '🔊' : '🔈'}
    </button>
  )
}
