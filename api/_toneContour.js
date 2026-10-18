// Tone shape rules shared by Record & Score (server) and the Tone Gym (runs in the browser).
// Input is a pitch contour in semitones relative to the speaker's normal pitch:
// points = [{ t: seconds, y: semitones }], voiced frames only, in time order.

const mean = ys => ys.reduce((a, y) => a + y, 0) / ys.length

function thirds(ys) {
  const third = Math.max(1, Math.floor(ys.length / 3))
  return { third, start: mean(ys.slice(0, third)), end: mean(ys.slice(-third)) }
}

/** Returns the tone (1–4) a contour sounds like, or null if it's too short to tell. */
export function classifyContour(points) {
  if (points.length < 4) return null
  const tMin = points[0].t
  const tMax = points[points.length - 1].t
  if (tMax - tMin < 0.04) return null

  const n = points.length
  const sumT = points.reduce((a, s) => a + s.t, 0)
  const sumY = points.reduce((a, s) => a + s.y, 0)
  const sumTT = points.reduce((a, s) => a + s.t * s.t, 0)
  const sumTY = points.reduce((a, s) => a + s.t * s.y, 0)
  const meanT = sumT / n
  const meanY = sumY / n
  const slopePerSec = (sumTY - n * meanT * meanY) / (sumTT - n * meanT * meanT)

  const ys = points.map(p => p.y)
  const { third, start: startMean, end: endMean } = thirds(ys)
  const midSlice = ys.slice(third, n - third)
  const midMin = midSlice.length ? Math.min(...midSlice) : Math.min(startMean, endMean)

  if (slopePerSec > 8 && endMean - startMean > 1.5) return 2
  if (slopePerSec < -8 && startMean - endMean > 1.5) return 4
  if (midMin < startMean - 1 && midMin < endMean - 1 && endMean - midMin > 1) return 3
  if (Math.abs(slopePerSec) < 6 && meanY > -1) return 1
  if (meanY < -2 && endMean > midMin) return 3
  if (slopePerSec > 4) return 2
  if (slopePerSec < -4) return 4
  return 1
}

// A half-third tone sags gently (2-3 semitones) and doesn't rise again; classifyContour
// tends to call that a 4th tone. A real 4th tone falls much further, from the top of the
// voice. Register alone can't tell them apart in short phrases where every syllable is low
// (我们), so this looks at the size of the fall and whether the pitch sits low.
export function isHalfThirdContour(ys, detectedTone) {
  if (ys.length < 4) return false
  const { start, end } = thirds(ys)
  if (start - end >= 4.5) return false                     // a full fall is a real 4th tone
  if (start < 0 && mean(ys) < -1.5) return true            // clearly low in the voice
  if (detectedTone === 4 && start - end < 4) return true    // a gentle sag, not a full fall
  return false
}

// A 2nd tone that comes from a tone change (你好's 你, 一个's 一, 不是's 不) is often said as
// a low rise that dips briefly at the start, which classifyContour can read as a 3rd tone (or as
// level, when the rise is short before a 4th tone). Accept it if the pitch ends clearly higher
// than it started, or rises well above an early low point. A real dipping 3rd tone has its
// low point in the middle and ends near where it started, so it's still caught.
export function isRisingContour(ys) {
  if (ys.length < 4) return false
  const { start, end } = thirds(ys)
  const min = Math.min(...ys)
  const minAt = ys.indexOf(min) / (ys.length - 1)
  if (end - start >= 1) return true
  return minAt < 0.35 && end - min >= 1.5
}

const TONE_NAME = { 1: '1st tone (flat)', 2: '2nd tone (rising)', 3: '3rd tone (dipping)', 4: '4th tone (falling)' }
export const toneName = t => TONE_NAME[t] ?? 'unclear'

/**
 * One line of coaching for a single syllable: what went wrong and what to do instead,
 * or how to make a correct tone clearer. ys is the contour in semitones.
 */
export function coachTone(expected, detected, ys) {
  const { start, end } = ys.length >= 4 ? thirds(ys) : { start: 0, end: 0 }
  const fall = start - end
  const rise = end - start
  const low = ys.length ? Math.min(...ys) : 0

  if (detected === expected) {
    if (expected === 4 && fall < 3.5) return 'Good. Start higher and let it drop further for a crisper 4th tone.'
    if (expected === 2 && rise < 2.5) return 'Good. Let it rise a little more, like a surprised "huh?".'
    if (expected === 3 && low > -3) return 'Good. You can go even lower in the middle of your voice.'
    if (expected === 1 && Math.abs(fall) > 1.5) return 'Good. Keep it even flatter, like holding one sung note.'
    return 'Clean tone.'
  }

  const tips = {
    1: {
      2: 'It rose. Start at the top of your voice and hold it flat, like singing one note.',
      3: 'It dipped. Start high and stay there the whole time.',
      4: 'It fell. Hold the pitch steady and high until the end.',
    },
    2: {
      1: 'It stayed flat. Start in the middle of your voice and rise, like asking "huh?".',
      3: 'It dipped before rising. Start the rise straight away, without going down first.',
      4: 'It fell. Go up instead: start mid and finish high.',
    },
    3: {
      1: 'It stayed high and flat. Drop low in your voice, almost to a creak, then let it come back up.',
      2: 'It rose without dipping first. Go down low before coming back up.',
      4: 'It fell but didn\'t come back up. Start lower, sink to the bottom of your voice, then let it rise.',
    },
    4: {
      1: 'It stayed flat. Start at the top of your voice and drop sharply, like a firm "No!".',
      2: 'It rose. Go the other way: start high and drop.',
      3: 'It came back up at the end. Drop sharply and stop, with no rise.',
    },
  }
  return tips[expected]?.[detected] ?? 'Hard to hear. Say it a bit louder and longer.'
}
