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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket?.remoteAddress ?? 'unknown'
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests' })

  const { grammarTitle, pattern, explanation, english, reference, attempt } = req.body ?? {}
  if (!attempt || !english) return res.status(400).json({ error: 'Missing fields' })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 250,
      system: [{ type: 'text', text: `You are a friendly Mandarin grammar coach. Give concise, encouraging feedback on a student's translation attempt. 2-3 sentences max. No markdown, no lists — speak naturally like a tutor. Point out what's correct, gently fix mistakes, explain why using the target grammar pattern. If perfect, celebrate and reinforce why it works.`, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: `Grammar point: "${grammarTitle}" — Pattern: ${pattern}\nExplanation: ${explanation}\n\nTranslate into Chinese: "${english}"\nReference answer: ${reference}\nStudent's attempt: ${attempt}\n\nGive feedback on their attempt.`
      }]
    })

    res.json({ feedback: response.content[0].text })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
