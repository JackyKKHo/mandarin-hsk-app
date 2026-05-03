let current: HTMLAudioElement | null = null

export function playAudio(blob: Blob): HTMLAudioElement {
  if (current) {
    current.pause()
    current.src = ''
  }
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  current = audio
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
