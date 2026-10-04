// One-time move of saved progress from the old word list to the official 2026 HSK list.
// Word ids changed (e.g. the old hsk1_0012 may now be hsk1_0005), so ids saved on this device
// are translated with src/data/idMap2026.json, made by scripts/migrate-hsk-2026.mjs.
// Words that are no longer in the syllabus are dropped. Runs once per device.

const VERSION_KEY = 'hsk-vocab-version'
const VERSION = '2026'

const ARRAY_KEYS = ['hsk-learned', 'hsk-favourites', 'hsk-dismissed-words']
const OBJECT_KEYS = ['hsk-srs']
const SENTENCES_KEY = 'hsk-mined-sentences'
const RESET_KEYS = ['hsk-today-plan']

function read<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : null
}

export async function migrateVocab2026(): Promise<void> {
  try {
    if (localStorage.getItem(VERSION_KEY) === VERSION) return
    const hasOldData = [...ARRAY_KEYS, ...OBJECT_KEYS, SENTENCES_KEY].some(k => localStorage.getItem(k))
    if (hasOldData) {
      // Only devices with saved progress download the map
      const map = (await import('../data/idMap2026.json')).default as Record<string, string>

      for (const key of ARRAY_KEYS) {
        const ids = read<string[]>(key)
        if (ids) localStorage.setItem(key, JSON.stringify([...new Set(ids.map(id => map[id]).filter(Boolean))]))
      }
      for (const key of OBJECT_KEYS) {
        const obj = read<Record<string, unknown>>(key)
        if (!obj) continue
        const next: Record<string, unknown> = {}
        for (const [id, value] of Object.entries(obj)) if (map[id] && !(map[id] in next)) next[map[id]] = value
        localStorage.setItem(key, JSON.stringify(next))
      }
      const sentences = read<{ wordId: string }[]>(SENTENCES_KEY)
      if (sentences) {
        localStorage.setItem(SENTENCES_KEY, JSON.stringify(sentences.map(s => ({ ...s, wordId: map[s.wordId] ?? s.wordId }))))
      }
    }
    for (const key of RESET_KEYS) localStorage.removeItem(key)
    localStorage.setItem(VERSION_KEY, VERSION)
  } catch {
    // Storage unavailable or corrupt: carry on with whatever is there rather than block the app
  }
}
