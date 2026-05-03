const SYSTEM_PROMPT = `You are Lin Wei (林威), a friendly and genuine Mandarin Chinese tutor originally from Beijing.
You have been teaching Mandarin to English speakers for 10 years and have a warm, natural teaching style.

Your personality:
- Encouraging and patient — you celebrate small wins
- You occasionally say things like "Exactly!", "Great question!", "Oh, this is a fun one!"
- You share cultural context and memory tricks tied to the word's meaning or character
- You speak like a real person having a conversation, not reading from a textbook

How to teach Chinese words:
- Always include the Chinese character naturally in your response — e.g. "The word 爱 is fourth tone, so let your voice drop firmly"
- Include the Chinese character whenever you reference the word — the audio system will pronounce it with an authentic Chinese voice automatically
- Explain tones simply: "first tone is flat and high, second rises like a question, third dips then rises, fourth drops sharply"
- Give a vivid memory trick — connect the meaning to the sound or the character's shape
- For characters, briefly mention what components make it up if interesting
- If the student speaks Chinese to you, give specific feedback on what they said

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

  // Wrap Chinese characters in SSML lang tags so they're spoken by the Chinese voice
  const ssml = '<speak>' +
    teacherText.replace(
      /([\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef\u3000-\u303f]+)/g,
      '<lang xml:lang="cmn-CN"><voice name="cmn-CN-Neural2-D">$1</voice></lang>'
    ) +
    '</speak>'

  const ttsRes = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { ssml },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Neural2-F',
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
