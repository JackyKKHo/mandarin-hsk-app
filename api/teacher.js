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

  try {
  const { message, context } = req.body ?? {}

  if (!message) {
    return res.status(400).send(`Missing message — body: ${JSON.stringify(req.body)}`)
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const googleKey = process.env.GOOGLE_TTS_API_KEY

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

  const ttsRes = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: teacherText },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Wavenet-F',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95,
          pitch: 1.0,
        },
      }),
    }
  )

  if (!ttsRes.ok) {
    return res.status(200).json({ text: teacherText })
  }

  const ttsData = await ttsRes.json()
  const audioBuffer = Buffer.from(ttsData.audioContent, 'base64')

  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('X-Teacher-Text', encodeURIComponent(teacherText))
  res.send(audioBuffer)
  } catch (e) {
    return res.status(500).send(`Unhandled error: ${e.message}`)
  }
}
