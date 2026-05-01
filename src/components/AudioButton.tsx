import { useState } from 'react'

interface Props {
  text: string
  audioUrl?: string | null
  label?: string
}

export default function AudioButton({ text, audioUrl, label }: Props) {
  const [playing, setPlaying] = useState(false)

  function play() {
    if (playing) return

    if (audioUrl) {
      const audio = new Audio(audioUrl)
      setPlaying(true)
      audio.onended = () => setPlaying(false)
      audio.onerror = () => setPlaying(false)
      audio.play()
      return
    }

    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.85
    setPlaying(true)
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)
    window.speechSynthesis.speak(utterance)
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
