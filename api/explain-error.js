import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LIMIT = 60
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

const TONE_NAME = { 1: 'high level (ā)', 2: 'rising (á)', 3: 'low dipping (ǎ)', 4: 'falling (à)', 0: 'neutral' }

const SYSTEM = `You are a Mandarin pronunciation coach with the precision of a linguist. The student just recorded a phrase and one character was flagged for a specific pronunciation error.

Your task: explain in 2-3 sentences exactly what went wrong and how to fix it. Be concrete and physical — what the tongue, lips, or pitch should do.

Rules:
- Max 3 sentences. No filler.
- Cite the character with its pinyin (with tone marks).
- If a tone is wrong, name both the expected tone (with the tone-1/2/3/4 label and shape) AND what the student likely produced, then give one actionable cue (e.g. "lift your voice sharply at the end" or "dip down then rise like asking 'huh?'").
- If initial (consonant) or final (vowel/ending) is wrong, name the specific sound difference (e.g. "zh is retroflex — curl the tongue tip back" or "ü requires rounded lips while saying ee").
- No markdown, no bullets, no headers. Plain prose.
- Respond in English unless the request says otherwise.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket?.remoteAddress ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests — please wait an hour.' })
  }

  try {
    const { char, expected, heard, scores, detectedTone } = req.body ?? {}
    if (!char || !expected) return res.status(400).json({ error: 'Missing required fields' })

    const expectedToneName = TONE_NAME[expected.tone] ?? 'unknown'
    const detectedToneName = detectedTone == null ? 'unclear' : (TONE_NAME[detectedTone] ?? 'unknown')

    const issues = []
    if (scores?.initial === 'miss') issues.push(`Initial wrong: expected "${expected.initial}", student produced "${heard?.initial ?? '?'}".`)
    if (scores?.final === 'miss') issues.push(`Final wrong: expected "${expected.final}", student produced "${heard?.final ?? '?'}".`)
    if (scores?.tone === 'miss') issues.push(`Tone wrong: expected tone ${expected.tone} (${expectedToneName}); detected tone ${detectedTone} (${detectedToneName}).`)
    if (!issues.length) issues.push('Character was close but flagged for review.')

    const userMessage = `Character: ${char}\nExpected pinyin: ${expected.pinyin}\nHeard character: ${heard?.char ?? 'not transcribed'}\n\n${issues.join('\n')}\n\nGive a concrete coaching note in 2-3 sentences.`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 180,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userMessage }],
    })

    res.status(200).json({ explanation: response.content[0].text })
  } catch (e) {
    console.error('explain-error error:', e)
    res.status(500).json({ error: e.message ?? 'Internal server error' })
  }
}
