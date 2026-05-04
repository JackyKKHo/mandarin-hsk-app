export interface GrammarExample {
  chinese: string
  pinyin: string
  english: string
}

export interface GrammarPoint {
  id: string
  hskLevel: number
  title: string
  pattern: string
  explanation: string
  examples: GrammarExample[]
  notes?: string
  tags: string[]
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
  partOfSpeech: string
  meanings?: Meaning[]
  examples: Example[]
  tags: string[]
  audio: {
    wordAudioUrl: string | null
    exampleAudioUrls: (string | null)[]
  }
}
