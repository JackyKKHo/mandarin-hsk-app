let current: HTMLAudioElement | null = null

const SPEED_KEY = 'hsk-audio-speed'
export const AUDIO_SPEEDS = [1, 0.75, 0.5] as const

/** Playback rate for all TTS audio, chosen by the learner (slower helps hear tones) */
export function getAudioSpeed(): number {
  try {
    const v = Number(localStorage.getItem(SPEED_KEY))
    return (AUDIO_SPEEDS as readonly number[]).includes(v) ? v : 1
  } catch {
    return 1
  }
}

export function setAudioSpeed(speed: number) {
  try { localStorage.setItem(SPEED_KEY, String(speed)) } catch { /* private mode */ }
  if (current) current.playbackRate = speed
}

export function playAudio(blob: Blob): HTMLAudioElement {
  if (current) {
    current.pause()
    current.src = ''
  }
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  current = audio
  audio.playbackRate = getAudioSpeed()
  audio.onended = () => URL.revokeObjectURL(url)
  audio.onerror = () => URL.revokeObjectURL(url)
  audio.play()
  return audio
}

export function stopAudio() {
  if (current) {
    current.pause()
    current.src = ''
    current = null
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAudio()
})
