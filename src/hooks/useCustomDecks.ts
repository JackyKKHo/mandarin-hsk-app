import { useState, useCallback } from 'react'

export interface CustomCard {
  id: string
  front: string   // Chinese / term
  back: string    // English / definition
  pinyin: string
}

export interface CustomDeck {
  id: string
  name: string
  cards: CustomCard[]
  createdAt: number
  updatedAt: number
}

const KEY = 'hsk-custom-decks'

function load(): CustomDeck[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function save(decks: CustomDeck[]) {
  localStorage.setItem(KEY, JSON.stringify(decks))
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function useCustomDecks() {
  const [decks, setDecks] = useState<CustomDeck[]>(load)

  const persist = useCallback((updated: CustomDeck[]) => {
    save(updated)
    setDecks(updated)
  }, [])

  const createDeck = useCallback((name: string): CustomDeck => {
    const deck: CustomDeck = { id: uid(), name, cards: [], createdAt: Date.now(), updatedAt: Date.now() }
    persist([...decks, deck])
    return deck
  }, [decks, persist])

  const updateDeck = useCallback((id: string, patch: Partial<Pick<CustomDeck, 'name' | 'cards'>>) => {
    persist(decks.map(d => d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d))
  }, [decks, persist])

  const deleteDeck = useCallback((id: string) => {
    persist(decks.filter(d => d.id !== id))
  }, [decks, persist])

  const addCard = useCallback((deckId: string, card: Omit<CustomCard, 'id'>): CustomCard => {
    const newCard: CustomCard = { ...card, id: uid() }
    const deck = decks.find(d => d.id === deckId)
    if (!deck) return newCard
    updateDeck(deckId, { cards: [...deck.cards, newCard] })
    return newCard
  }, [decks, updateDeck])

  const updateCard = useCallback((deckId: string, cardId: string, patch: Partial<Omit<CustomCard, 'id'>>) => {
    const deck = decks.find(d => d.id === deckId)
    if (!deck) return
    updateDeck(deckId, { cards: deck.cards.map(c => c.id === cardId ? { ...c, ...patch } : c) })
  }, [decks, updateDeck])

  const deleteCard = useCallback((deckId: string, cardId: string) => {
    const deck = decks.find(d => d.id === deckId)
    if (!deck) return
    updateDeck(deckId, { cards: deck.cards.filter(c => c.id !== cardId) })
  }, [decks, updateDeck])

  return { decks, createDeck, updateDeck, deleteDeck, addCard, updateCard, deleteCard }
}
