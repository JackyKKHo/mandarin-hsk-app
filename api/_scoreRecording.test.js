// Runs synthetic recordings through the real scoring handler (Whisper stubbed out) to check
// that correct Mandarin isn't marked wrong because of tone changes, and wrong tones are caught.
import handler from './score-recording.js'

const SR = 16000
const SYL = 0.32

// Pitch contours in semitones around 190 Hz, t in [0, 1]
const CONTOUR = {
  1: () => 3,
  2: t => -2 + 6 * t,
  3: t => (t < 0.5 ? -2 - 5 * t : -4.5 + 6 * (t - 0.5)),
  4: t => 4 - 8 * t,
  h: t => -2.5 - 2.5 * t, // half-third: low, slight fall, no rise
  n: t => -1 - 1.5 * t,   // neutral: light, follows the previous syllable
  r: t => (t < 0.25 ? -3 - 3 * t : -3.75 + 6 * (t - 0.25)), // sandhi 2nd tone: low start, brief dip, then rise
  s: t => 1 + 1.5 * t,    // short, shallow rise (一/不 before a 4th tone)
}

function makeWav(shapes) {
  const n = Math.round(SR * SYL * shapes.length) + SR * 0.2
  const pcm = new Int16Array(n)
  let phase = 0
  for (let i = 0; i < n; i++) {
    const t = i / SR - 0.1
    let amp = 0, f = 190
    if (t >= 0 && t < SYL * shapes.length) {
      const k = Math.floor(t / SYL)
      f = 190 * 2 ** (CONTOUR[shapes[k]]((t - k * SYL) / SYL) / 12)
      amp = 0.5
    }
    phase += (2 * Math.PI * f) / SR
    pcm[i] = Math.round(amp * 12000 * (Math.sin(phase) + 0.5 * Math.sin(2 * phase) + 0.25 * Math.sin(3 * phase)))
  }
  const buf = Buffer.alloc(44 + pcm.length * 2)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + pcm.length * 2, 4); buf.write('WAVE', 8)
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34)
  buf.write('data', 36); buf.writeUInt32LE(pcm.length * 2, 40)
  Buffer.from(pcm.buffer).copy(buf, 44)
  return buf.toString('base64')
}

async function toneScores(target, shapes) {
  vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => ({ text: target }) }))
  let body
  const res = { status() { return this }, json(b) { body = b; return this }, setHeader() {} }
  await handler({ method: 'POST', headers: { 'x-forwarded-for': `test-${Math.random()}` }, body: { wav: makeWav(shapes), target } }, res)
  return body.chars.map(c => c.scores.tone)
}

beforeAll(() => { process.env.OPENAI_API_KEY = 'test' })
afterAll(() => { vi.unstubAllGlobals() })

describe('score-recording tone changes', () => {
  // Said correctly by a native speaker: nothing should be marked wrong.
  // (Phrases start on a non-1st tone: a level 1st tone at the very start of a
  // recording currently reads as rising, which is a separate pitch-tracking issue.)
  it.each([
    ['我有三个苹果', [2, 3, 1, 4, 2, 3]], // wó yǒu: 3-3 sandhi
    ['我们', ['h', 'n']],                 // half-third + neutral
    ['你的', ['h', 'n']],
    ['好吃', ['h', 1]],
    ['我爱你', ['h', 4, 3]],
    ['谢谢', [4, 'n']],                   // reduplication said light
    ['看看', [4, 'n']],
    ['什么', [2, 'n']],
    ['想想', [2, 'n']],                   // xiáng xiang
    ['姐姐', ['h', 'n']],
    ['不是', [2, 4]],                     // 不 change
    ['一起', [4, 3]],                     // 一 change
    ['你好', ['r', 3]],                   // sandhi 2nd tone said as a low rise with a dip
    ['我有三个苹果', ['r', 3, 1, 4, 2, 3]],
    ['一个', ['s', 4]],                   // yí gè with a short rise
    ['不是', ['s', 4]],
    ['不对', ['r', 4]],
    ['看不见', [4, 'n', 4]],              // light 不 in a potential complement
    ['对不起', [4, 'n', 3]],
    ['是不是', [4, 'n', 4]],
  ])('accepts correct %s', async (target, shapes) => {
    expect(await toneScores(target, shapes)).not.toContain('miss')
  })

  // Said wrongly: the wrong syllable must still be caught.
  it.each([
    ['我有三个苹果', [3, 3, 1, 4, 2, 3], 0], // wǒ yǒu without sandhi
    ['你好', [3, 3], 0],                     // full dip on 你
    ['有一个', ['h', 1, 4], 1],              // yī gè: level, no rise (mid-phrase; see onset note above)
    ['一个', [4, 4], 0],                     // falling 一
    ['不是', [4, 4], 0],                     // bù shì without the change
    ['我们', [1, 'n'], 0],                   // high level 我
    ['我们', [2, 'n'], 0],                   // rising 我
    ['好吃', [4, 1], 0],                     // full 4th instead of half-third
    ['大家', [2, 1], 0],
  ])('catches wrong %s (%j)', async (target, shapes, idx) => {
    expect((await toneScores(target, shapes))[idx]).toBe('miss')
  })
})
