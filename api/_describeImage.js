// Describe It handler, served by api/teacher.js as /api/teacher?action=describe-image,
// because the Hobby plan allows at most 12 functions per deployment; files starting with _ aren't functions.
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, OUTPUT_SCHEMA, imageBlock, sanitiseLadder } from './_pictureLadder.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-opus-5-5'

// Rate limit: 10 photos per IP per hour (each one is a vision call writing seven rungs)
const LIMIT = 10
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

export async function describeImage(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket?.remoteAddress ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "You've described 10 photos this hour — please try again later." })
  }

  const { block, error } = imageBlock(req.body)
  if (error) return res.status(400).json({ error })

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // Server-side fallback: if a safety classifier declines, the API retries on Anthropic's recommended model
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{
        role: 'user',
        content: [block, { type: 'text', text: 'Describe this photo as a seven-rung ladder.' }],
      }],
    })

    if (response.stop_reason === 'refusal') {
      return res.status(422).json({ error: "Sorry, this photo can't be described. Try a different one." })
    }
    if (response.stop_reason === 'max_tokens') {
      return res.status(502).json({ error: 'The description was cut short — please try again.' })
    }

    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    let parsed = null
    try { parsed = JSON.parse(text) } catch { /* handled below */ }
    const ladder = sanitiseLadder(parsed)
    if (!ladder) return res.status(502).json({ error: 'Something went wrong writing the descriptions — please try again.' })

    res.status(200).json(ladder)
  } catch (e) {
    if (e instanceof Anthropic.BadRequestError) {
      return res.status(400).json({ error: "That image couldn't be read — try a JPEG or PNG photo." })
    }
    if (e instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Lots of people are using this right now — try again in a minute.' })
    }
    res.status(500).json({ error: `Error: ${e.message}` })
  }
}
