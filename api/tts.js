export default async function handler(req, res) {
  const text = req.query.text
  const pinyin = req.query.pinyin // e.g. "ba2", "ma3", "nv4" (ü → v)

  if (!text && !pinyin) {
    return res.status(400).send('Missing text or pinyin')
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY

  // Pinyin + tone number → SSML phoneme forces the correct tone
  const input = pinyin
    ? { ssml: `<speak><phoneme alphabet="x-sampa" ph="${pinyin}">${pinyin.replace(/[0-9]/g, '')}</phoneme></speak>` }
    : { text }

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input,
        voice: {
          languageCode: 'cmn-CN',
          name: 'cmn-CN-Chirp3-HD-Aoede',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
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
