import { useEffect } from 'react'

const DEFAULT_TITLE = 'Mandarin Daily — Learn Chinese with Flashcards, Quizzes & Pronunciation'
const DEFAULT_DESC = 'Master Mandarin Chinese with spaced repetition flashcards, multiple choice quizzes, listening practice, and a full pronunciation guide. Free for all HSK levels 1–9.'
const BASE_URL = 'https://www.mandarindaily.app'

interface SEOProps {
  title: string
  description?: string
  path?: string   // e.g. '/word/hsk1_0001' — used for canonical & og:url
}

function setMeta(selector: string, attr: string, value: string) {
  const el = document.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

export function useSEO({ title, description, path }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes('Mandarin Daily') ? title : `${title} | Mandarin Daily`
    const desc = description ?? DEFAULT_DESC
    const url = path ? `${BASE_URL}${path}` : BASE_URL

    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', desc)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[property="og:url"]', 'content', url)
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', desc)
    setMeta('link[rel="canonical"]', 'href', url)

    return () => {
      document.title = DEFAULT_TITLE
      setMeta('meta[name="description"]', 'content', DEFAULT_DESC)
      setMeta('meta[property="og:title"]', 'content', 'Mandarin Daily — Learn Chinese')
      setMeta('meta[property="og:description"]', 'content', DEFAULT_DESC)
      setMeta('meta[property="og:url"]', 'content', BASE_URL)
      setMeta('meta[name="twitter:title"]', 'content', 'Mandarin Daily — Learn Chinese')
      setMeta('meta[name="twitter:description"]', 'content', DEFAULT_DESC)
      setMeta('link[rel="canonical"]', 'href', BASE_URL)
    }
  }, [title, description, path])
}
