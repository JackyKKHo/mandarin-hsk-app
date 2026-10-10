export interface ContourPoint { t: number; y: number }
export function classifyContour(points: ContourPoint[]): 1 | 2 | 3 | 4 | null
export function isHalfThirdContour(ys: number[], detectedTone: number | null): boolean
export function isRisingContour(ys: number[]): boolean
export function toneName(t: number | null): string
export function coachTone(expected: number, detected: number | null, ys: number[]): string
