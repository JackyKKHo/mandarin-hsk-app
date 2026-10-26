import { useState } from 'react'
import { AUDIO_SPEEDS, getAudioSpeed, setAudioSpeed } from '../audio'

/** Cycles audio playback 1× → 0.75× → 0.5×; the choice is remembered on this device */
export default function SpeedToggle() {
  const [speed, setSpeed] = useState(getAudioSpeed)

  function cycle() {
    const i = AUDIO_SPEEDS.indexOf(speed as typeof AUDIO_SPEEDS[number])
    const next = AUDIO_SPEEDS[(i + 1) % AUDIO_SPEEDS.length]
    setAudioSpeed(next)
    setSpeed(next)
  }

  return (
    <button
      className={`speed-toggle${speed < 1 ? ' speed-toggle-slow' : ''}`}
      onClick={cycle}
      aria-label={`Audio speed ${speed}×, tap to change`}
      title="Audio speed"
    >
      {speed}×
    </button>
  )
}
