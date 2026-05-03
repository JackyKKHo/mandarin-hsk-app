import { useState } from 'react'

interface Props {
  text: string
  audioUrl?: string | null
  label?: string
}

function speakWithVoices(text: string, onEnd: () => void) {
  const synth = window.speechSynthesis
  synth.cancel()

  function doSpeak() {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.85

    const voices = synth.getVoices()
    const chinese = voices.find(v => v.lang.startsWith('zh'))
    if (chinese) utterance.voice = chinese

    utterance.onend = onEnd
    utterance.onerror = onEnd
    synth.speak(utterance)
  }

  const voices = synth.getVoices()
  if (voices.length > 0) {
    doSpeak()
  } else {
    synth.onvoiceschanged = () => {
      synth.onvoiceschanged = null
      doSpeak()
    }
    // iOS fallback: voices may never fire the event, try after short delay
    setTimeout(() => {
      if (synth.getVoices().length > 0) doSpeak()
    }, 250)
  }
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
    setPlaying(true)
    speakWithVoices(text, () => setPlaying(false))
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
