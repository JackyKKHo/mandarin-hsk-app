const SYSTEM_PROMPT = `You are Lin Wei (林威), a warm, encouraging Mandarin Chinese tutor.
You speak naturally like a real teacher — patient, positive, and clear.
You are helping a student learn HSK vocabulary.

Rules:
- Keep responses short (1-3 sentences max) — this is spoken audio, not text
- Always respond in English unless specifically demonstrating Chinese
- When correcting pronunciation, be gentle and specific
- Reference the specific word/sentence they are practicing
- Sound natural and conversational, not robotic`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  const { message, context } = req.body

  if (!message) {
    return res.status(400).send('Missing message')
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY

  const contextNote = context
    ? `The student is currently studying the word: "${context.simplified}" (${context.pinyin}) meaning "${context.english}" — HSK Level ${context.hskLevel}.`
    : ''

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 150,
      system: SYSTEM_PROMPT + (contextNote ? `\n\n${contextNote}` : ''),
      messages: [{ role: 'user', content: message }],
    }),
  })

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text()
    return res.status(500).send(`Anthropic error: ${err}`)
  }

  const data = await anthropicRes.json()
  const teacherText = data.content[0].text

  const voiceId = process.env.ELEVENLABS_VOICE_ID
  const elevenKey = process.env.ELEVENLABS_API_KEY

  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': elevenKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: teacherText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.85,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  })

  if (!ttsRes.ok) {
    return res.status(200).json({ text: teacherText })
  }

  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('X-Teacher-Text', encodeURIComponent(teacherText))

  const arrayBuffer = await ttsRes.arrayBuffer()
  res.send(Buffer.from(arrayBuffer))
}
