import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { VocabItem } from '../types'
import { normalizePOS } from '../types'
import TonedPinyin from './TonedPinyin'
import { segment } from '../lib/segment'

interface Props {
  text: string
  lookup: Map<string, VocabItem>
}

export default function ClickableText({ text, lookup }: Props) {
  const [active, setActive] = useState<VocabItem | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const tokens = lookup.size > 0 ? segment(text, lookup) : [{ text }]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActive(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <span>
        {tokens.map((tok, i) =>
          tok.vocab ? (
            <button
              key={i}
              className={`ct-word${active?.id === tok.vocab.id ? ' ct-word-active' : ''}`}
              onClick={() => setActive(a => a?.id === tok.vocab!.id ? null : tok.vocab!)}
            >
              {tok.text}
            </button>
          ) : (
            <span key={i}>{tok.text}</span>
          )
        )}
      </span>

      {active && (
        <div className="ct-popup" ref={popupRef}>
          <div className="ct-popup-header">
            <div className="ct-popup-char">{active.simplified}</div>
            <div className="ct-popup-meta">
              <TonedPinyin pinyin={active.pinyin} className="ct-popup-pinyin" />
              <div className="ct-popup-pos">{normalizePOS(active.partOfSpeech).join(' · ')}</div>
            </div>
            <button className="ct-popup-close" onClick={() => setActive(null)}>✕</button>
          </div>
          <div className="ct-popup-english">{active.english}</div>
          {active.explanation && (
            <div className="ct-popup-note">{active.explanation}</div>
          )}
          <Link
            to={`/word/${active.id}`}
            className="ct-popup-link"
            onClick={() => setActive(null)}
          >
            View full details →
          </Link>
        </div>
      )}
    </>
  )
}
