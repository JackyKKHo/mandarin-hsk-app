import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useVocab } from '../hooks/useVocab'
import TonedPinyin from './TonedPinyin'
import AudioButton from './AudioButton'

function dateSeed(s: string): number {
  let h = 0
  for (const c of s) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0
  return h
}

export default function WordOfTheDay() {
  const { words } = useVocab()

  const word = useMemo(() => {
    if (words.length === 0) return null
    const today = new Date().toISOString().slice(0, 10)
    const seed = dateSeed(today)
    return words[seed % words.length]
  }, [words])

  if (!word) return null

  return (
    <div className="wotd-wrap">
      <div className="wotd-label">Word of the Day</div>
      <Link to={`/word/${word.id}`} className="wotd-card">
        <div className="wotd-chinese">{word.simplified}</div>
        <div className="wotd-middle">
          <TonedPinyin pinyin={word.pinyin} className="wotd-pinyin" />
          <span className="wotd-pos">{word.partOfSpeech}</span>
        </div>
        <div className="wotd-english">{word.english}</div>
        {word.examples[0] && (
          <div className="wotd-example">{word.examples[0].chinese}</div>
        )}
        <div className="wotd-footer">
          <span className="badge badge-level" style={{ fontSize: '0.72rem' }}>HSK {word.hskLevel}</span>
          <AudioButton text={word.simplified} audioUrl={word.audio.wordAudioUrl} label={`Play ${word.simplified}`} />
        </div>
      </Link>
    </div>
  )
}
