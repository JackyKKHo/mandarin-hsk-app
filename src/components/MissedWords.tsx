import { Link } from 'react-router-dom'
import type { VocabItem } from '../types'
import AudioButton from './AudioButton'
import TonedPinyin from './TonedPinyin'

interface Props {
  title: string
  words: VocabItem[]
}

export default function MissedWords({ title, words }: Props) {
  if (words.length === 0) return null
  return (
    <div className="missed-words">
      <div className="missed-words-title">{title}</div>
      <div className="missed-list">
        {words.map(w => (
          <Link key={w.id} to={`/word/${w.id}`} target="_blank" rel="noopener noreferrer" className="missed-item">
            <div className="missed-item-head">
              <span className="missed-item-han">{w.simplified}</span>
              <TonedPinyin pinyin={w.pinyin} className="review-card-pinyin" />
              {w.partOfSpeech && <span className="pos-badge missed-item-pos">{w.partOfSpeech}</span>}
              <AudioButton text={w.simplified} audioUrl={w.audio.wordAudioUrl} label="" />
              <span className="missed-item-more">Full explanation →</span>
            </div>
            <div className="missed-item-english">{w.english}</div>
            {w.examples[0] && (
              <div className="missed-item-example">
                <div className="missed-item-ex-zh">{w.examples[0].chinese}</div>
                <div className="missed-item-ex-py">{w.examples[0].pinyin}</div>
                <div className="missed-item-ex-en">{w.examples[0].english}</div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
