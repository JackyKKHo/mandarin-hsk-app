export interface GrammarExample {
  chinese: string
  pinyin: string
  english: string
}

/** Pick the right word for the blank (＿＿), or the one correct sentence */
export interface GrammarChoiceExercise {
  type: 'choice'
  prompt: string
  english: string
  options: string[]
  answer: string
  explain: string
}

/** Put the shuffled tiles in the right order; `alt` lists other accepted orders */
export interface GrammarOrderExercise {
  type: 'order'
  english: string
  tokens: string[]
  alt?: string[]
  explain?: string
}

export type GrammarExercise = GrammarChoiceExercise | GrammarOrderExercise

export interface GrammarPoint {
  id: string
  hskLevel: number
  title: string
  pattern: string
  explanation: string
  examples: GrammarExample[]
  notes?: string
  tags: string[]
  exercises?: GrammarExercise[]
}

export interface Example {
  chinese: string
  pinyin: string
  english: string
}

export interface Meaning {
  definition: string
  example: Example
}

export interface VocabItem {
  id: string
  hskLevel: number
  simplified: string
  traditional: string
  pinyin: string
  pinyinNumbered: string
  english: string
  partOfSpeech: string | string[]
  explanation?: string
  meanings?: Meaning[]
  examples: Example[]
  tags: string[]
  audio: {
    wordAudioUrl: string | null
    exampleAudioUrls: (string | null)[]
  }
}

export function normalizePOS(pos: string | string[]): string[] {
  return Array.isArray(pos) ? pos.filter(Boolean) : pos ? [pos] : []
}
