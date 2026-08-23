import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Rate limit: 100 requests per IP per hour
const LIMIT = 100
const WINDOW_MS = 60 * 60 * 1000
const ipMap = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const entry = ipMap.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + WINDOW_MS
  }
  entry.count++
  ipMap.set(ip, entry)
  return entry.count > LIMIT
}

const SYSTEM_PROMPT = `You are a rigorous Mandarin-English dictionary fact-checker and reference assistant, in the style of Pleco or CC-CEDICT combined with a thorough tutor.

Given a word's simplified characters, pinyin, and stored English gloss, independently judge whether the gloss is accurate — not just "a reasonable paraphrase," but free of wrong senses, wrong register, or misleading translation. Then explain what the word actually means in detail.

Respond with ONLY a single JSON object, no markdown fences, no other text:
{"pinyin":"<your own pinyin with tone marks>","english":"<your own concise gloss>","agrees":<true|false>,"explanation":"<detailed explanation, 3-6 sentences>"}

Rules for "agrees": true if the stored gloss captures the core meaning correctly, even if phrased differently; false only for a real error — wrong meaning, wrong tone/pinyin, missing an important sense, or a misleading translation.

Rules for "explanation" — write it like a full dictionary entry, covering whichever of these carry the most information value:
- Core meaning and, if the word has distinct senses (verb vs noun, literal vs idiomatic), distinguish them.
- Measure word for nouns, stated plainly (e.g. "Measure word is 本 — 一本书").
- The 2-3 fixed collocations natives actually use, with pinyin.
- Disambiguation from the word most often confused with it, if relevant.
- Register (formal/written/colloquial) if it matters.
- If the stored gloss is wrong, say specifically what's wrong and why.
Write in plain prose, no bullet points or markdown inside the string. Never include commentary outside the JSON object.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket?.remoteAddress ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests — please wait an hour before trying again.' })
  }

  try {
    const { simplified, pinyin, english } = req.body ?? {}

    if (!simplified || !english) {
      return res.status(400).json({ error: `Missing simplified/english — body: ${JSON.stringify(req.body)}` })
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Word: ${simplified}\nStored pinyin: ${pinyin ?? '(none)'}\nStored English gloss: ${english}`,
        },
      ],
    })

    const raw = response.content[0].text.trim()
    const jsonStr = raw.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '')

    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      return res.status(502).json({ error: 'Could not parse AI response', raw })
    }

    return res.status(200).json({
      pinyin: parsed.pinyin ?? '',
      english: parsed.english ?? '',
      agrees: Boolean(parsed.agrees),
      explanation: parsed.explanation ?? '',
    })
  } catch (e) {
    return res.status(500).json({ error: `Unhandled error: ${e.message}` })
  }
}
