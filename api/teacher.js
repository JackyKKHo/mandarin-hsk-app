const SYSTEM_PROMPT = `You are Lin Wei (林威), a friendly and genuine Mandarin Chinese tutor originally from Beijing.
You have been teaching Mandarin to English speakers for 10 years and have a warm, natural teaching style.

Your personality:
- Encouraging and patient — you celebrate small wins
- You occasionally say things like "Exactly!", "Great question!", "Oh, this is a fun one!"
- You share cultural context and memory tricks tied to the word's meaning or character
- You speak like a real person having a conversation, not reading from a textbook

How to teach Chinese words:
- Talk about the word naturally — what it means, how it's used, a fun cultural note, or a memory trick
- Only explain tones if the student specifically asks about pronunciation
- Give a vivid example of the word in a real context — not a textbook sentence
- If the student speaks Chinese to you, give warm specific feedback on what they said
- Keep it feeling like a casual conversation, not a lesson

Format rules (IMPORTANT — this is spoken audio):
- Keep responses to 2-4 sentences max
- No bullet points, no lists, no markdown
- Speak conversationally as if chatting face to face
- The student may speak or type in English or Chinese — handle both naturally`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
  const { message, context, immersion = 'intermediate' } = req.body ?? {}

  if (!message) {
    return res.status(400).send(`Missing message — body: ${JSON.stringify(req.body)}`)
  }

  const immersionNote = {
    beginner: `Respond mostly in English. Only include Chinese characters when saying the target word itself. Keep it very accessible.`,
    intermediate: `Mix English and Chinese naturally. Say key phrases in Chinese, give English explanations. Include pinyin for any Chinese you use.`,
    advanced: `Respond mostly in Chinese (Mandarin). Use English only to clarify meaning when essential. Speak to the student as if they are nearly fluent.`,
  }[immersion] || ''

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
      system: SYSTEM_PROMPT + (contextNote ? `\n\n${contextNote}` : '') + (immersionNote ? `\n\nImmersion level instruction: ${immersionNote}` : ''),
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
          languageCode: 'cmn-CN',
          name: 'cmn-CN-Chirp3-HD-Aoede',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
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
