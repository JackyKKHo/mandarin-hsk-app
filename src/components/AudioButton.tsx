import { useState } from 'react'

interface Props {
  text: string
  audioUrl?: string | null
  label?: string
}

export default function AudioButton({ text, audioUrl, label }: Props) {
  const [playing, setPlaying] = useState(false)

  async function play() {
    if (playing) return
    setPlaying(true)

    try {
      const src = audioUrl ?? `/api/tts?text=${encodeURIComponent(text)}`
      const res = await fetch(src)
      if (!res.ok) throw new Error('TTS failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => {
        setPlaying(false)
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        setPlaying(false)
        URL.revokeObjectURL(url)
      }
      audio.play()
    } catch {
      setPlaying(false)
    }
  }

  return (
    <button
      className={`audio-btn${playing ? ' playing' : ''}`}
      onClick={play}
      aria-label={label ?? `Play audio for ${text}`}
      title="Play pronunciation"
    >
      {playing ? '🔊' : '🔈'}
    </button>
  )
}
