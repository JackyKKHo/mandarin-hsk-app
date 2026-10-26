import { useState, useRef, useEffect } from 'react'
import { playAudio, stopAudio } from '../audio'
import { chunkForSpeech } from '../lib/segment'
import Icon from './Icon'

/** Reads a whole text aloud, one sentence group per TTS request, at the learner's chosen speed */
export default function ReadAloud({ text, label = 'Listen' }: { text: string; label?: string }) {
  const [playing, setPlaying] = useState(false)
  const run = useRef(0)

  useEffect(() => () => { run.current++ }, [])

  function stop() {
    run.current++
    stopAudio()
    setPlaying(false)
  }

  async function start() {
    const id = ++run.current
    setPlaying(true)
    const chunks = chunkForSpeech(text)
    // Fetch the next chunk while the current one plays
    let next = chunks.length ? fetchChunk(chunks[0]) : null
    for (let i = 0; i < chunks.length; i++) {
      const blob = await next
      next = i + 1 < chunks.length ? fetchChunk(chunks[i + 1]) : null
      if (run.current !== id) return
      if (!blob) break
      const audio = playAudio(blob)
      const finished = await new Promise<boolean>(resolve => {
        audio.addEventListener('ended', () => resolve(true))
        audio.addEventListener('error', () => resolve(false))
        // 'pause' also fires just before 'ended'; only a real stop counts
        audio.addEventListener('pause', () => resolve(audio.ended))
      })
      if (!finished || run.current !== id) break
    }
    if (run.current === id) setPlaying(false)
  }

  return (
    <button
      className={`read-aloud-btn${playing ? ' playing' : ''}`}
      onClick={playing ? stop : start}
      disabled={!text.trim()}
    >
      <Icon name={playing ? 'volumeHigh' : 'volume'} size={16} />
      {playing ? 'Stop' : label}
    </button>
  )
}

async function fetchChunk(text: string): Promise<Blob | null> {
  try {
    const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}`)
    return res.ok ? await res.blob() : null
  } catch {
    return null
  }
}
