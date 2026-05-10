import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCustomDecks, type CustomDeck, type CustomCard } from '../hooks/useCustomDecks'
import TonedPinyin from '../components/TonedPinyin'

type View = 'list' | 'editor' | 'study'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Card editor row ────────────────────────────────────────────────────────────
function CardRow({
  card, deckId, onUpdate, onDelete,
}: {
  card: CustomCard
  deckId: string
  onUpdate: (id: string, patch: Partial<Omit<CustomCard, 'id'>>) => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [front, setFront] = useState(card.front)
  const [pinyin, setPinyin] = useState(card.pinyin)
  const [back, setBack] = useState(card.back)

  function save() {
    if (!front.trim() || !back.trim()) return
    onUpdate(card.id, { front: front.trim(), pinyin: pinyin.trim(), back: back.trim() })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="fc-card-row fc-card-editing">
        <input className="fc-input" placeholder="Chinese / term" value={front} onChange={e => setFront(e.target.value)} autoFocus />
        <input className="fc-input" placeholder="Pinyin (optional)" value={pinyin} onChange={e => setPinyin(e.target.value)} />
        <input className="fc-input" placeholder="English / definition" value={back} onChange={e => setBack(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} />
        <div className="fc-card-row-actions">
          <button className="fc-btn-save" onClick={save}>Save</button>
          <button className="fc-btn-cancel" onClick={() => { setFront(card.front); setPinyin(card.pinyin); setBack(card.back); setEditing(false) }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fc-card-row">
      <div className="fc-card-row-content">
        <span className="fc-card-front">{card.front}</span>
        {card.pinyin && <span className="fc-card-pinyin">{card.pinyin}</span>}
        <span className="fc-card-back">{card.back}</span>
      </div>
      <div className="fc-card-row-actions">
        <button className="fc-btn-icon" onClick={() => setEditing(true)} title="Edit">✏️</button>
        <button className="fc-btn-icon fc-btn-delete" onClick={() => onDelete(card.id)} title="Delete">🗑</button>
      </div>
    </div>
  )
}

// ── Deck editor ───────────────────────────────────────────────────────────────
function DeckEditor({
  deck, onBack, onStudy,
  updateDeck, addCard, updateCard, deleteCard,
}: {
  deck: CustomDeck
  onBack: () => void
  onStudy: () => void
  updateDeck: (id: string, patch: Partial<Pick<CustomDeck, 'name' | 'cards'>>) => void
  addCard: (deckId: string, card: Omit<CustomCard, 'id'>) => CustomCard
  updateCard: (deckId: string, cardId: string, patch: Partial<Omit<CustomCard, 'id'>>) => void
  deleteCard: (deckId: string, cardId: string) => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(deck.name)
  const [newFront, setNewFront] = useState('')
  const [newPinyin, setNewPinyin] = useState('')
  const [newBack, setNewBack] = useState('')
  const frontRef = useRef<HTMLInputElement>(null)

  function saveName() {
    if (name.trim()) updateDeck(deck.id, { name: name.trim() })
    setEditingName(false)
  }

  function handleAdd() {
    if (!newFront.trim() || !newBack.trim()) return
    addCard(deck.id, { front: newFront.trim(), pinyin: newPinyin.trim(), back: newBack.trim() })
    setNewFront('')
    setNewPinyin('')
    setNewBack('')
    frontRef.current?.focus()
  }

  return (
    <div className="practice-page">
      <div className="fc-editor-topbar">
        <button className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onBack}>
          ← My Decks
        </button>
        <button className="btn-primary" onClick={onStudy} disabled={deck.cards.length < 2}>
          Study →
        </button>
      </div>

      {/* Deck name */}
      <div className="fc-deck-name-row">
        {editingName ? (
          <>
            <input
              className="fc-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              autoFocus
            />
            <button className="fc-btn-save" onClick={saveName}>Save</button>
          </>
        ) : (
          <>
            <h2 className="fc-deck-title">{deck.name}</h2>
            <button className="fc-btn-icon" onClick={() => setEditingName(true)}>✏️</button>
          </>
        )}
      </div>
      <p className="fc-card-count">{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}</p>

      {/* Add card form */}
      <div className="fc-add-form">
        <div className="fc-add-form-title">Add a card</div>
        <div className="fc-add-inputs">
          <input
            ref={frontRef}
            className="fc-input"
            placeholder="Chinese / term"
            value={newFront}
            onChange={e => setNewFront(e.target.value)}
          />
          <input
            className="fc-input"
            placeholder="Pinyin (optional)"
            value={newPinyin}
            onChange={e => setNewPinyin(e.target.value)}
          />
          <input
            className="fc-input"
            placeholder="English / definition"
            value={newBack}
            onChange={e => setNewBack(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <button
          className="btn-primary"
          onClick={handleAdd}
          disabled={!newFront.trim() || !newBack.trim()}
        >
          + Add card
        </button>
      </div>

      {/* Card list */}
      {deck.cards.length > 0 ? (
        <div className="fc-card-list">
          {deck.cards.map(card => (
            <CardRow
              key={card.id}
              card={card}
              deckId={deck.id}
              onUpdate={(cardId, patch) => updateCard(deck.id, cardId, patch)}
              onDelete={cardId => deleteCard(deck.id, cardId)}
            />
          ))}
        </div>
      ) : (
        <p className="empty-state" style={{ marginTop: '1.5rem' }}>Add your first card above.</p>
      )}
    </div>
  )
}

// ── Study mode ────────────────────────────────────────────────────────────────
function StudyMode({ deck, onBack }: { deck: CustomDeck; onBack: () => void }) {
  const [queue] = useState<CustomCard[]>(() => shuffle(deck.cards))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [wrongCards, setWrongCards] = useState<CustomCard[]>([])
  const [done, setDone] = useState(false)

  const card = queue[index]
  const progressPct = (index / queue.length) * 100

  function mark(correct: boolean) {
    const newScore = correct
      ? { ...score, correct: score.correct + 1 }
      : { ...score, wrong: score.wrong + 1 }
    setScore(newScore)
    if (!correct) setWrongCards(w => [...w, card])

    const next = index + 1
    if (next >= queue.length) {
      setDone(true)
    } else {
      setIndex(next)
      setFlipped(false)
    }
  }

  if (done) {
    const total = score.correct + score.wrong
    const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0
    return (
      <div className="practice-page">
        <div className="practice-complete-card">
          <div className={`complete-score ${pct >= 80 ? 'score-good' : pct >= 50 ? 'score-ok' : 'score-low'}`}>
            {pct}%
          </div>
          <h2>Complete!</h2>
          <div className="srs-result-row">
            <span className="got-count">✓ {score.correct} correct</span>
            <span className="missed-count">✗ {score.wrong} wrong</span>
          </div>
          <div className="complete-actions">
            <button className="btn-primary" onClick={() => { setIndex(0); setFlipped(false); setScore({ correct: 0, wrong: 0 }); setWrongCards([]); setDone(false) }}>
              Study again
            </button>
            <button className="btn-secondary" onClick={onBack}>Back to deck</button>
          </div>
          {wrongCards.length > 0 && (
            <div className="missed-words">
              <div className="missed-words-title">Review these</div>
              <div className="missed-words-grid">
                {wrongCards.map(c => (
                  <div key={c.id} className="missed-word-card">
                    <span className="mw-chinese">{c.front}</span>
                    {c.pinyin && <span className="mw-pinyin">{c.pinyin}</span>}
                    <span className="mw-english">{c.back}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="practice-page">
      <div className="practice-topbar">
        <button className="back-link" style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: 0 }} onClick={onBack}>
          ← {deck.name}
        </button>
        <span className="practice-counter">{index + 1} / {queue.length}</span>
        <span className="practice-score-inline">
          <span className="got-count">✓{score.correct}</span>{' '}
          <span className="missed-count">✗{score.wrong}</span>
        </span>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Flashcard */}
      <div className={`fc-study-card${flipped ? ' fc-flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
        <div className="fc-study-inner">
          <div className="fc-study-front">
            <div className="fc-study-term">{card.front}</div>
            {card.pinyin && <div className="fc-study-pinyin">{card.pinyin}</div>}
            <div className="fc-study-tap">Tap to reveal</div>
          </div>
          <div className="fc-study-back">
            <div className="fc-study-term">{card.front}</div>
            {card.pinyin && <div className="fc-study-pinyin">{card.pinyin}</div>}
            <div className="fc-study-divider" />
            <div className="fc-study-definition">{card.back}</div>
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="fc-mark-row">
          <button className="fc-mark-wrong" onClick={() => mark(false)}>✗ Missed</button>
          <button className="fc-mark-correct" onClick={() => mark(true)}>✓ Got it</button>
        </div>
      ) : (
        <p className="fc-flip-hint">Tap the card to flip</p>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FlashcardsPage() {
  const { decks, createDeck, updateDeck, deleteDeck, addCard, updateCard, deleteCard } = useCustomDecks()
  const [view, setView] = useState<View>('list')
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null)
  const [newDeckName, setNewDeckName] = useState('')
  const [creating, setCreating] = useState(false)

  const activeDeck = decks.find(d => d.id === activeDeckId) ?? null

  function handleCreateDeck() {
    if (!newDeckName.trim()) return
    const deck = createDeck(newDeckName.trim())
    setNewDeckName('')
    setCreating(false)
    setActiveDeckId(deck.id)
    setView('editor')
  }

  if (view === 'editor' && activeDeck) {
    return (
      <DeckEditor
        deck={activeDeck}
        onBack={() => setView('list')}
        onStudy={() => setView('study')}
        updateDeck={updateDeck}
        addCard={addCard}
        updateCard={updateCard}
        deleteCard={deleteCard}
      />
    )
  }

  if (view === 'study' && activeDeck) {
    return <StudyMode deck={activeDeck} onBack={() => setView('editor')} />
  }

  // Deck list
  return (
    <div className="practice-page">
      <Link to="/hsk/1" className="back-link">← Browse</Link>

      <div className="fc-page-header">
        <h1 className="fc-page-title">My Flashcards</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>+ New deck</button>
      </div>

      {creating && (
        <div className="fc-new-deck-form">
          <input
            className="fc-input"
            placeholder="Deck name (e.g. HSK 2 vocab)"
            value={newDeckName}
            onChange={e => setNewDeckName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateDeck()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handleCreateDeck} disabled={!newDeckName.trim()}>Create</button>
            <button className="btn-secondary" onClick={() => { setCreating(false); setNewDeckName('') }}>Cancel</button>
          </div>
        </div>
      )}

      {decks.length === 0 && !creating ? (
        <div className="fc-empty">
          <div className="fc-empty-icon">🗂</div>
          <p>No decks yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="fc-deck-list">
          {decks.map(deck => (
            <div key={deck.id} className="fc-deck-card">
              <button
                className="fc-deck-main"
                onClick={() => { setActiveDeckId(deck.id); setView('editor') }}
              >
                <span className="fc-deck-card-name">{deck.name}</span>
                <span className="fc-deck-card-count">{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}</span>
              </button>
              <button
                className="fc-deck-study-btn"
                disabled={deck.cards.length < 2}
                onClick={() => { setActiveDeckId(deck.id); setView('study') }}
              >
                Study →
              </button>
              <button
                className="fc-btn-icon fc-btn-delete"
                onClick={() => {
                  if (confirm(`Delete "${deck.name}"?`)) deleteDeck(deck.id)
                }}
                title="Delete deck"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
