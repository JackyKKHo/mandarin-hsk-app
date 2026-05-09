const RESEND_API_KEY = process.env.RESEND_API_KEY
const TO_EMAIL = 'jacky6556@gmail.com'

const ipMap = new Map()
const LIMIT = 5
const WINDOW_MS = 60 * 60 * 1000

function isRateLimited(ip) {
  const now = Date.now()
  const entry = ipMap.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS }
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW_MS }
  entry.count++
  ipMap.set(ip, entry)
  return entry.count > LIMIT
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = req.headers['x-forwarded-for']?.split(',')[0] ?? 'unknown'
  if (isRateLimited(ip)) return res.status(429).json({ error: 'Too many requests' })

  const { message, email, name } = req.body ?? {}
  if (!message?.trim()) return res.status(400).json({ error: 'Message required' })
  if (message.length > 2000) return res.status(400).json({ error: 'Message too long' })

  const from = name?.trim() ? `${name.trim()} via Mandarin Daily` : 'Someone via Mandarin Daily'
  const replyTo = email?.trim() || 'noreply@mandarindaily.app'

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@mandarindaily.app',
        to: TO_EMAIL,
        reply_to: replyTo,
        subject: `Feedback from ${from}`,
        text: `From: ${from}\nEmail: ${replyTo}\n\n${message.trim()}`,
      }),
    })
    if (!r.ok) throw new Error(await r.text())
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Feedback send error:', err)
    res.status(500).json({ error: 'Failed to send feedback' })
  }
}
