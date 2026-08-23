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

const SYSTEM_PROMPT = `You are a rigorous Mandarin-English dictionary fact-checker, in the style of Pleco or CC-CEDICT.

Given a word's simplified characters, pinyin, and stored English gloss, independently judge whether the gloss is accurate — not just "a reasonable paraphrase," but free of wrong senses, wrong register, or misleading translation.

Respond with ONLY a single JSON object, no markdown fences, no other text:
{"pinyin":"<your own pinyin with tone marks>","english":"<your own concise gloss>","agrees":<true|false>,"note":"<short note, max 20 words, empty string if agrees is true and nothing to add>"}

Rules:
- "agrees" is true if the stored gloss captures the core meaning correctly, even if phrased differently.
- "agrees" is false only for a real error: wrong meaning, wrong tone/pinyin, missing an important sense, or a misleading translation.
- "note" should explain the discrepancy briefly when agrees is false, or add a useful nuance when true (e.g. a missing sense) — otherwise leave it empty.
- Never include commentary outside the JSON object.`

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
      max_tokens: 200,
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
      note: parsed.note ?? '',
    })
  } catch (e) {
    return res.status(500).json({ error: `Unhandled error: ${e.message}` })
  }
}
