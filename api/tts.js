export default async function handler(req, res) {
  const text = req.query.text

  if (!text) {
    return res.status(400).send('Missing text')
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID
  const apiKey = process.env.ELEVENLABS_API_KEY

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.85,
        style: 0.3,
        use_speaker_boost: true,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return res.status(500).send(`ElevenLabs error (${response.status}): ${err}`)
  }

  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Cache-Control', 'public, max-age=86400')

  const arrayBuffer = await response.arrayBuffer()
  res.send(Buffer.from(arrayBuffer))
}
