import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LIMIT = 30
const WINDOW_MS = 60 * 60 * 1000
const ipMap = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const entry = ipMap.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS }
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW_MS }
  entry.count++
  ipMap.set(ip, entry)
  return entry.count > LIMIT
}

const SYSTEM = `You are a Mandarin Chinese teacher giving quick, encouraging feedback on a student's sentence.

Rules:
- Start with "✓ " if the sentence is correct and natural, or "✗ " if there is a grammar or usage issue
- Keep feedback to 2–3 sentences max
- If correct: briefly say what they did well, then optionally note a natural variation
- If incorrect: clearly explain the specific issue and give the corrected sentence
- No markdown, no bullet points — write conversationally
- Always acknowledge the effort positively even when correcting`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket?.remoteAddress ?? 'unknown'
  if (isRateLimited(ip)) return res.status(429).send('Too many requests')

  try {
    const { sentence, word } = req.body ?? {}
    if (!sentence || !word) return res.status(400).send('Missing sentence or word')

    const prompt = `The student is practicing the word: ${word.simplified} (${word.pinyin}) — "${word.english}" [HSK ${word.hskLevel}]

Their sentence: ${sentence}

Give feedback on whether this sentence is grammatically correct, natural-sounding Mandarin, and uses the target word correctly.`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 180,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    })

    res.status(200).json({ feedback: response.content[0].text.trim() })
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`)
  }
}
