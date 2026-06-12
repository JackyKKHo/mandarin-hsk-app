import { YIN } from 'pitchfinder'
import { pinyin } from 'pinyin-pro'

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } }

const LIMIT = 30
const WINDOW_MS = 60 * 60 * 1000
const ipMap = new Map()

function isRateLimited(ip) {
  const now = Date.now()
  const entry = ipMap.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS }
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW_MS }
  entry.count++
  ipMap.set(ip, entry)
  return entry.count > LIMIT
}

const INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w']

function splitInitialFinal(syllable) {
  const s = (syllable || '').toLowerCase().replace(/\d+$/, '').replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, m => {
    const map = { ā: 'a', á: 'a', ǎ: 'a', à: 'a', ē: 'e', é: 'e', ě: 'e', è: 'e', ī: 'i', í: 'i', ǐ: 'i', ì: 'i', ō: 'o', ó: 'o', ǒ: 'o', ò: 'o', ū: 'u', ú: 'u', ǔ: 'u', ù: 'u', ǖ: 'v', ǘ: 'v', ǚ: 'v', ǜ: 'v' }
    return map[m] ?? m
  })
  for (const init of INITIALS) {
    if (s.startsWith(init)) return { initial: init, final: s.slice(init.length) }
  }
  return { initial: '', final: s }
}

function toPinyinArr(text) {
  return pinyin(text, { toneType: 'num', type: 'array', nonZh: 'consecutive' })
}

function splitTonedSyllable(p) {
  const m = String(p).match(/^([a-zü]+)(\d)$/i)
  if (m) return { base: m[1].toLowerCase(), tone: Number(m[2]) }
  return { base: String(p).toLowerCase(), tone: 0 }
}

function decodeWav(buf) {
  if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF') throw new Error('Invalid WAV')
  const sampleRate = buf.readUInt32LE(24)
  const bitsPerSample = buf.readUInt16LE(34)
  const numChannels = buf.readUInt16LE(22)
  if (bitsPerSample !== 16) throw new Error('Expected 16-bit PCM')
  let dataOffset = 12
  while (dataOffset < buf.length - 8) {
    const chunkId = buf.toString('ascii', dataOffset, dataOffset + 4)
    const chunkSize = buf.readUInt32LE(dataOffset + 4)
    if (chunkId === 'data') { dataOffset += 8; break }
    dataOffset += 8 + chunkSize
  }
  const nSamples = Math.floor((buf.length - dataOffset) / 2 / numChannels)
  const samples = new Float32Array(nSamples)
  for (let i = 0; i < nSamples; i++) {
    let sum = 0
    for (let c = 0; c < numChannels; c++) {
      sum += buf.readInt16LE(dataOffset + (i * numChannels + c) * 2)
    }
    samples[i] = (sum / numChannels) / 32768
  }
  return { samples, sampleRate }
}

function extractF0(samples, sampleRate) {
  const detect = YIN({ sampleRate, threshold: 0.15 })
  const windowSize = 1024
  const hop = 256
  const frames = []
  for (let start = 0; start + windowSize <= samples.length; start += hop) {
    const frame = samples.slice(start, start + windowSize)
    let rms = 0
    for (let i = 0; i < frame.length; i++) rms += frame[i] * frame[i]
    rms = Math.sqrt(rms / frame.length)
    if (rms < 0.01) { frames.push({ t: start / sampleRate, f: null }); continue }
    const f = detect(frame)
    const ok = f && f > 70 && f < 500 ? f : null
    frames.push({ t: start / sampleRate, f: ok })
  }
  return frames
}

function speakerMedian(frames) {
  const voiced = frames.map(f => f.f).filter(f => f != null).sort((a, b) => a - b)
  if (voiced.length < 5) return null
  return voiced[Math.floor(voiced.length / 2)]
}

function voicedSpan(frames) {
  let startIdx = -1, endIdx = -1
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].f != null) { if (startIdx === -1) startIdx = i; endIdx = i }
  }
  if (startIdx === -1) return null
  return { tStart: frames[startIdx].t, tEnd: frames[endIdx].t }
}

function classifyTone(slice, median) {
  const voiced = slice.filter(s => s.f != null)
  if (voiced.length < 4 || !median) return null

  const semis = voiced.map(s => ({ t: s.t, y: 12 * Math.log2(s.f / median) }))
  const tMin = semis[0].t
  const tMax = semis[semis.length - 1].t
  const dur = tMax - tMin
  if (dur < 0.04) return null

  const n = semis.length
  const sumT = semis.reduce((a, s) => a + s.t, 0)
  const sumY = semis.reduce((a, s) => a + s.y, 0)
  const sumTT = semis.reduce((a, s) => a + s.t * s.t, 0)
  const sumTY = semis.reduce((a, s) => a + s.t * s.y, 0)
  const meanT = sumT / n
  const meanY = sumY / n
  const slope = (sumTY - n * meanT * meanY) / (sumTT - n * meanT * meanT)
  const slopePerSec = slope

  const thirdSize = Math.max(1, Math.floor(n / 3))
  const startMean = semis.slice(0, thirdSize).reduce((a, s) => a + s.y, 0) / thirdSize
  const endMean = semis.slice(-thirdSize).reduce((a, s) => a + s.y, 0) / thirdSize
  const midSlice = semis.slice(thirdSize, n - thirdSize)
  const midMin = midSlice.length ? Math.min(...midSlice.map(s => s.y)) : Math.min(startMean, endMean)

  if (slopePerSec > 8 && endMean - startMean > 1.5) return 2
  if (slopePerSec < -8 && startMean - endMean > 1.5) return 4
  if (midMin < startMean - 1 && midMin < endMean - 1 && endMean - midMin > 1) return 3
  if (Math.abs(slopePerSec) < 6 && meanY > -1) return 1
  if (meanY < -2 && endMean > midMin) return 3
  if (slopePerSec > 4) return 2
  if (slopePerSec < -4) return 4
  return 1
}

async function transcribeWhisper(wavBuf) {
  const form = new FormData()
  form.append('file', new Blob([wavBuf], { type: 'audio/wav' }), 'recording.wav')
  form.append('model', 'whisper-1')
  form.append('language', 'zh')
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'word')
  form.append('prompt', '请用普通话清晰朗读。')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Whisper failed: ${res.status} ${text.slice(0, 200)}`)
  }
  return res.json()
}

function alignCharsToTime(targetChars, tStart, tEnd) {
  const n = targetChars.length
  const total = tEnd - tStart
  return targetChars.map((c, i) => ({
    char: c,
    tStart: tStart + (i / n) * total,
    tEnd: tStart + ((i + 1) / n) * total,
  }))
}

function bestHeardChar(transcriptChars, i, target) {
  if (transcriptChars[i] && transcriptChars[i] === target) return target
  if (transcriptChars[i]) return transcriptChars[i]
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.socket?.remoteAddress ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many recordings — please wait an hour.' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' })
  }

  try {
    const { wav, target } = req.body ?? {}
    if (!wav || typeof wav !== 'string') return res.status(400).json({ error: 'Missing wav (base64)' })
    if (!target || typeof target !== 'string') return res.status(400).json({ error: 'Missing target' })
    if (target.length > 60) return res.status(400).json({ error: 'Target too long (max 60 chars)' })

    const wavBuf = Buffer.from(wav, 'base64')
    if (wavBuf.length > 5 * 1024 * 1024) return res.status(400).json({ error: 'Audio too large' })

    const { samples, sampleRate } = decodeWav(wavBuf)
    const frames = extractF0(samples, sampleRate)
    const median = speakerMedian(frames)
    const span = voicedSpan(frames)

    if (!span || !median) {
      return res.status(200).json({
        transcript: '',
        chars: [],
        warning: 'No voiced audio detected. Try recording closer to the mic.',
      })
    }

    const whisper = await transcribeWhisper(wavBuf)
    const transcript = (whisper.text ?? '').replace(/[\s\p{P}]/gu, '')

    const targetClean = [...target].filter(c => /\p{Script=Han}/u.test(c))
    const targetChars = targetClean
    const transcriptChars = [...transcript]
    const expectedPinyins = toPinyinArr(targetClean.join(''))

    const windows = alignCharsToTime(targetChars, span.tStart, span.tEnd)

    const charResults = windows.map((w, i) => {
      const expRaw = expectedPinyins[i] ?? ''
      const { base: expBase, tone: expTone } = splitTonedSyllable(expRaw)
      const { initial: expInitial, final: expFinal } = splitInitialFinal(expBase)

      const heard = bestHeardChar(transcriptChars, i, w.char)
      const heardPinyinRaw = heard ? (toPinyinArr(heard)[0] ?? '') : ''
      const { base: heardBase, tone: heardToneFromText } = splitTonedSyllable(heardPinyinRaw)
      const { initial: heardInitial, final: heardFinal } = splitInitialFinal(heardBase)

      const slice = frames.filter(f => f.t >= w.tStart && f.t <= w.tEnd)
      const detectedTone = classifyTone(slice, median)

      const initialOk = heard ? heardInitial === expInitial : null
      const finalOk = heard ? heardFinal === expFinal : null

      const toneOk = detectedTone == null ? null : detectedTone === expTone

      const sameChar = heard === w.char

      return {
        char: w.char,
        expected: { pinyin: expRaw, base: expBase, initial: expInitial, final: expFinal, tone: expTone },
        heard: {
          char: heard,
          pinyin: heardPinyinRaw,
          base: heardBase,
          initial: heardInitial,
          final: heardFinal,
          toneFromText: heardToneFromText || null,
        },
        scores: {
          initial: sameChar ? 'ok' : initialOk === null ? 'unknown' : initialOk ? 'ok' : 'miss',
          final: sameChar ? 'ok' : finalOk === null ? 'unknown' : finalOk ? 'ok' : 'miss',
          tone: detectedTone == null ? 'unknown' : toneOk ? 'ok' : 'miss',
        },
        detectedTone,
        timing: { tStart: w.tStart, tEnd: w.tEnd },
      }
    })

    const summary = {
      perfect: charResults.every(c => c.scores.initial === 'ok' && c.scores.final === 'ok' && c.scores.tone === 'ok'),
      toneMisses: charResults.filter(c => c.scores.tone === 'miss').length,
      soundMisses: charResults.filter(c => c.scores.initial === 'miss' || c.scores.final === 'miss').length,
    }

    res.status(200).json({ transcript, chars: charResults, summary })
  } catch (e) {
    console.error('score-recording error:', e)
    res.status(500).json({ error: e.message ?? 'Internal server error' })
  }
}
