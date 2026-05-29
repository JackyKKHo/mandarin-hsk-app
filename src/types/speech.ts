// Minimal Web Speech API types — the DOM lib only ships partial coverage.

export interface SpeechRecognitionResultLike {
  0: { transcript: string; confidence: number }
  readonly length: number
  readonly isFinal: boolean
}

export interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>
  resultIndex: number
}

export interface SpeechRecognitionErrorEventLike extends Event {
  error: string
  message?: string
}

export interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives?: number
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
  addEventListener(type: 'result', listener: (e: SpeechRecognitionEventLike) => void): void
  addEventListener(type: 'error', listener: (e: SpeechRecognitionErrorEventLike) => void): void
  addEventListener(type: 'end' | 'start', listener: () => void): void
}

export interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike
}

export function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
