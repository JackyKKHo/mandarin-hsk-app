import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { stopAudio } from '../audio'

export default function StopAudioOnNavigate() {
  const location = useLocation()
  useEffect(() => { stopAudio() }, [location.pathname])
  return null
}
