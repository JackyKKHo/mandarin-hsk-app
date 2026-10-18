// Validates the learner profile the browser sends with each Lin Wei message and turns it
// into a short system-prompt note. The body is user-controlled, so only Chinese words of
// sensible length get through — nothing else from it reaches the prompt.

const MAX_WEAK = 12
const HAN_WORD = /^\p{Script=Han}{1,6}$/u

export function sanitiseLearner(raw) {
  if (!raw || typeof raw !== 'object') return null
  const level = Math.min(7, Math.max(1, Math.floor(Number(raw.level)) || 1))
  const mastered = Math.max(0, Math.min(20000, Math.floor(Number(raw.mastered)) || 0))
  const weakWords = Array.isArray(raw.weakWords)
    ? [...new Set(raw.weakWords.filter(w => typeof w === 'string' && HAN_WORD.test(w)))].slice(0, MAX_WEAK)
    : []
  return { level, mastered, weakWords }
}

export function learnerNote(learner) {
  if (!learner) return ''
  const label = learner.level >= 7 ? '7–9' : String(learner.level)
  let note = `The student is working at HSK ${label} and has about ${learner.mastered} words solidly learned. ` +
    `When you give Chinese examples, keep the other words in them at or below HSK ${label} so the example itself is readable.`
  if (learner.weakWords.length > 0) {
    note += ` Words the student keeps forgetting in review: ${learner.weakWords.join('、')}. ` +
      `If one fits naturally, reuse it in an example so they meet it again; if the student's question touches one of them ` +
      `(a near-synonym, a shared character, the same pattern), point out the link in a few words. Never list these words back to the student.`
  }
  return note
}
