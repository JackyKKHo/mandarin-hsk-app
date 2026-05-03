export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are Lin Wei (林威), a warm, encouraging Mandarin Chinese tutor.
You speak naturally like a real teacher — patient, positive, and clear.
You are helping a student learn HSK vocabulary.

Rules:
- Keep responses short (1-3 sentences max) — this is spoken audio, not text
- Always respond in English unless specifically demonstrating Chinese
- When correcting pronunciation, be gentle and specific
- Use the student's name occasionally to feel personal
- Reference the specific word/sentence they are practicing
- Sound natural and conversational, not robotic`

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const { message, context } = await req.json()

  if (!message) {
    return new Response('Missing message', { status: 400 })
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY

  const contextNote = context
    ? `The student is currently studying the word: "${context.simplified}" (${context.pinyin}) meaning "${context.english}" — HSK Level ${context.hskLevel}.`
    : ''

  const res = await fetch('https://api.anthropic.com/v1/messages', {
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

  if (!res.ok) {
    const err = await res.text()
    return new Response(`Anthropic error: ${err}`, { status: res.status })
  }

  const data = await res.json()
  const teacherText = data.content[0].text

  // Now convert to speech via ElevenLabs
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
    // Fall back to returning just the text if TTS fails
    return new Response(JSON.stringify({ text: teacherText }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Return audio with the teacher text in a header so the UI can display it
  return new Response(ttsRes.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'X-Teacher-Text': encodeURIComponent(teacherText),
    },
  })
}
