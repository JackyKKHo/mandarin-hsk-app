// Pictures for the picture quiz: data/images.json, filled by scripts/fill-images.mjs.
// Keyed by word id. null means "checked, no good picture", so it is never shown.
// Loaded on demand so other pages don't pay for it.
import { useEffect, useState } from 'react'

export interface WordImage {
  /** Commons thumbnail URL */
  src: string
  /** Commons file page: full credit and licence */
  page: string
  author: string
  license: string
  wikidata: string
}

export type ImageMap = Record<string, WordImage | null>

let pending: Promise<ImageMap> | null = null

export function loadImages(): Promise<ImageMap> {
  pending ??= import('../../data/images.json').then(m => m.default as unknown as ImageMap)
  return pending
}

export function useWordImages(): { images: ImageMap; loading: boolean } {
  const [images, setImages] = useState<ImageMap>({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let live = true
    loadImages().then(m => { if (live) { setImages(m); setLoading(false) } })
    return () => { live = false }
  }, [])
  return { images, loading }
}
