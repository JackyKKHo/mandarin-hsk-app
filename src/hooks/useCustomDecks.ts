import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/*
  Supabase table required:
  create table custom_decks (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    deck_id text not null,
    name text not null,
    cards jsonb not null default '[]',
    created_at bigint not null,
    updated_at bigint not null,
    unique(user_id, deck_id)
  );
  alter table custom_decks enable row level security;
  create policy "Users manage own decks" on custom_decks
    for all using (auth.uid() = user_id);
*/

export interface CustomCard {
  id: string
  front: string
  back: string
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
  const { user } = useAuth()
  const [decks, setDecks] = useState<CustomDeck[]>(load)

  useEffect(() => {
    if (!user) return
    supabase
      .from('custom_decks')
      .select('deck_id, name, cards, created_at, updated_at')
      .then(({ data }) => {
        if (!data) return
        const remote: CustomDeck[] = data.map(r => ({
          id: r.deck_id as string,
          name: r.name as string,
          cards: r.cards as CustomCard[],
          createdAt: r.created_at as number,
          updatedAt: r.updated_at as number,
        }))
        const local = load()
        const remoteMap = new Map(remote.map(d => [d.id, d]))
        const localMap = new Map(local.map(d => [d.id, d]))

        const merged: CustomDeck[] = []
        const toUpsert: CustomDeck[] = []

        for (const [id, remoteDeck] of remoteMap) {
          const localDeck = localMap.get(id)
          if (!localDeck || remoteDeck.updatedAt >= localDeck.updatedAt) {
            merged.push(remoteDeck)
          } else {
            merged.push(localDeck)
            toUpsert.push(localDeck)
          }
        }
        for (const localDeck of local) {
          if (!remoteMap.has(localDeck.id)) {
            merged.push(localDeck)
            toUpsert.push(localDeck)
          }
        }

        save(merged)
        setDecks(merged)

        if (toUpsert.length > 0) {
          supabase.from('custom_decks').upsert(
            toUpsert.map(d => ({
              user_id: user.id,
              deck_id: d.id,
              name: d.name,
              cards: d.cards,
              created_at: d.createdAt,
              updated_at: d.updatedAt,
            }))
          )
        }
      })
  }, [user])

  const persist = useCallback((updated: CustomDeck[]) => {
    save(updated)
    setDecks(updated)
  }, [])

  const upsertRemote = useCallback((deck: CustomDeck) => {
    if (!user) return
    supabase.from('custom_decks').upsert({
      user_id: user.id,
      deck_id: deck.id,
      name: deck.name,
      cards: deck.cards,
      created_at: deck.createdAt,
      updated_at: deck.updatedAt,
    })
  }, [user])

  const createDeck = useCallback((name: string): CustomDeck => {
    const deck: CustomDeck = { id: uid(), name, cards: [], createdAt: Date.now(), updatedAt: Date.now() }
    const updated = [...decks, deck]
    persist(updated)
    upsertRemote(deck)
    return deck
  }, [decks, persist, upsertRemote])

  const updateDeck = useCallback((id: string, patch: Partial<Pick<CustomDeck, 'name' | 'cards'>>) => {
    const updated = decks.map(d => d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d)
    persist(updated)
    const deck = updated.find(d => d.id === id)
    if (deck) upsertRemote(deck)
  }, [decks, persist, upsertRemote])

  const deleteDeck = useCallback((id: string) => {
    persist(decks.filter(d => d.id !== id))
    if (user) supabase.from('custom_decks').delete().match({ user_id: user.id, deck_id: id })
  }, [decks, persist, user])

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
