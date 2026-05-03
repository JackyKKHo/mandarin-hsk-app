import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'

interface Props {
  characters: string  // one or more Chinese characters
}

interface CharWriter {
  char: string
  writer: HanziWriter | null
  el: HTMLDivElement | null
}

const SIZE = 120

export default function StrokeOrder({ characters }: Props) {
  const chars = [...characters].filter(c => /\p{Script=Han}/u.test(c))
  const containerRef = useRef<HTMLDivElement>(null)
  const writersRef = useRef<CharWriter[]>([])
  const [animating, setAnimating] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current || chars.length === 0) return

    writersRef.current = []
    setReady(false)
    setFailed(false)

    const container = containerRef.current
    container.innerHTML = ''

    let loadedCount = 0
    let failedCount = 0

    chars.forEach(char => {
      const div = document.createElement('div')
      div.className = 'stroke-char-wrap'
      container.appendChild(div)

      try {
        const writer = HanziWriter.create(div, char, {
          width: SIZE,
          height: SIZE,
          padding: 10,
          strokeColor: '#c0392b',
          radicalColor: '#e74c3c',
          outlineColor: '#e0e0e0',
          drawingColor: '#2471a3',
          showCharacter: true,
          showOutline: true,
          strokeAnimationSpeed: 1,
          delayBetweenStrokes: 200,
          charDataLoader: (char, onLoad, onError) => {
            fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
              .then(r => {
                if (!r.ok) throw new Error('not found')
                return r.json()
              })
              .then(data => {
                onLoad(data)
                loadedCount++
                if (loadedCount + failedCount === chars.length) {
                  setReady(loadedCount > 0)
                  if (loadedCount === 0) setFailed(true)
                }
              })
              .catch(() => {
                onError?.()
                failedCount++
                if (loadedCount + failedCount === chars.length) {
                  setReady(loadedCount > 0)
                  if (loadedCount === 0) setFailed(true)
                }
              })
          },
        })
        writersRef.current.push({ char, writer, el: div })
      } catch {
        failedCount++
      }
    })
  }, [characters])

  function animate() {
    if (animating) return
    setAnimating(true)
    const writers = writersRef.current.filter(w => w.writer)
    function animateOne(idx: number) {
      if (idx >= writers.length) { setAnimating(false); return }
      writers[idx].writer!.animateCharacter({
        onComplete: () => animateOne(idx + 1),
      })
    }
    animateOne(0)
  }

  function reset() {
    writersRef.current.forEach(w => w.writer?.showCharacter())
    setAnimating(false)
  }

  if (chars.length === 0) return null

  return (
    <div className="stroke-order-section">
      <div className="stroke-order-header">
        <span className="stroke-order-label">Stroke order</span>
        <div className="stroke-order-actions">
          <button
            className="stroke-btn"
            onClick={animate}
            disabled={!ready || animating}
          >
            {animating ? '▶ Playing…' : '▶ Animate'}
          </button>
          <button className="stroke-btn" onClick={reset} disabled={!ready}>
            ↺ Reset
          </button>
        </div>
      </div>
      {failed && <p className="stroke-missing">Stroke data not available for this character.</p>}
      <div className="stroke-chars" ref={containerRef} />
    </div>
  )
}
