export default async function handler(req, res) {
  const text = req.query.text

  if (!text) {
    return res.status(400).send('Missing text')
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'cmn-CN',
          name: 'cmn-CN-Chirp3-HD-Aoede',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
          pitch: 1.0,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    return res.status(500).send(`Google TTS error (${response.status}): ${err}`)
  }

  const data = await response.json()
  const audioBuffer = Buffer.from(data.audioContent, 'base64')

  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.send(audioBuffer)
}
