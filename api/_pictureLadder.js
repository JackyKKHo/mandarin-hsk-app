// "Describe It" (看图说话): one photo, described seven times, one rung per HSK level.
// Each rung adds a new layer — what, where, details, why, inference, opinion, written style —
// so the learner sees the same scene grow in language they can climb.

export const RUNGS = [
  { level: 1, layer: 'What', brief: 'Say only what is happening: who or what, doing what. One very short sentence using HSK 1 words only.' },
  { level: 2, layer: 'Where', brief: 'Add where it is happening (and when, if obvious). One or two short sentences; HSK 1–2 words; 在…上/里, 正在.' },
  { level: 3, layer: 'Details', brief: 'Add what things look like: colour, material, size, how many. Two sentences; HSK 1–3 words; 的-phrases, 有…还有…, 比.' },
  { level: 4, layer: 'Why', brief: 'Add reasons or purpose and how the parts relate. Two or three sentences; up to HSK 4; 因为…所以…, 为了, 一边…一边…, 不但…而且….' },
  { level: 5, layer: 'Inference', brief: 'Infer what probably happened before or will happen next, and how the person may feel. Three sentences; up to HSK 5; 看起来, 可能, 好像, 既…又….' },
  { level: 6, layer: 'Opinion', brief: 'Comment on the scene: design, safety, daily life, what it says about the place. Three or four sentences; up to HSK 6; 之所以…是因为…, 与其说…不如说…, natural connectors.' },
  { level: 7, layer: 'Written style', brief: 'Rewrite the scene as polished written Chinese (书面语) for HSK 7–9: formal vocabulary, one fitting 成语 or set phrase, 之, 于, 而, 以. Three or four sentences.' },
]

export const SYSTEM_PROMPT = `You write graded Mandarin descriptions of a photo for learners of Chinese, in simplified characters.

You describe the same photo seven times, one rung per HSK level (official 2026 syllabus; rung 7 is the HSK 7–9 band). Each rung keeps what the rung before said (reworded at the new level if natural) and adds exactly one new layer:

${RUNGS.map(r => `Rung ${r.level} — ${r.layer}: ${r.brief}`).join('\n')}

For every rung give:
- zh: the description in simplified Chinese. Stay inside that rung's vocabulary level; this matters more than detail.
- pinyin: tone-marked pinyin for zh, words separated by spaces, punctuation kept.
- en: a natural English translation.
- focus: one short English line naming what is new at this rung (the new layer plus the key pattern used), e.g. "Location: 在 + place + 上".
- ask: one question in Chinese, at this rung's level, that the learner could answer to produce this rung themselves (e.g. rung 2: 这是在哪儿？).
- askEn: the question in English.
- keywords: 2–4 words from zh that are new at this rung and worth learning, each with zh, pinyin and en (dictionary form, short gloss).

Also give title (2–6 Chinese characters naming the scene) and titleEn.

Describe only what can be seen or reasonably inferred. Never guess who a real person is, their name, ethnicity, religion, health or other sensitive traits; refer to people as 一个人, 一位女士, 一个孩子 and so on. If the photo contains text, you may mention what it says. If the photo is unclear, describe what you can.`

const keyword = {
  type: 'object',
  additionalProperties: false,
  required: ['zh', 'pinyin', 'en'],
  properties: { zh: { type: 'string' }, pinyin: { type: 'string' }, en: { type: 'string' } },
}

export const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'titleEn', 'levels'],
  properties: {
    title: { type: 'string' },
    titleEn: { type: 'string' },
    levels: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['zh', 'pinyin', 'en', 'focus', 'ask', 'askEn', 'keywords'],
        properties: {
          zh: { type: 'string' },
          pinyin: { type: 'string' },
          en: { type: 'string' },
          focus: { type: 'string' },
          ask: { type: 'string' },
          askEn: { type: 'string' },
          keywords: { type: 'array', items: keyword },
        },
      },
    },
  },
}

const MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
// The API takes images up to 5 MB; base64 is 4/3 of the bytes
const MAX_BASE64 = Math.floor((5 * 1024 * 1024 * 4) / 3)
// Sample photos come from the picture quiz, which only uses Wikimedia Commons
const SAMPLE_HOSTS = new Set(['upload.wikimedia.org', 'thumb.wikimedia.org'])

/** Turns the request body into an image content block, or returns an error message */
export function imageBlock(body) {
  const { image, mediaType, imageUrl } = body ?? {}
  if (typeof imageUrl === 'string') {
    let url
    try { url = new URL(imageUrl) } catch { return { error: 'Bad image URL' } }
    if (url.protocol !== 'https:' || !SAMPLE_HOSTS.has(url.hostname)) return { error: 'Only sample photos can be sent by URL' }
    return { block: { type: 'image', source: { type: 'url', url: url.href } } }
  }
  if (typeof image !== 'string' || !image) return { error: 'Missing image' }
  if (!MEDIA_TYPES.has(mediaType)) return { error: 'Unsupported image type' }
  if (image.length > MAX_BASE64) return { error: 'Image too large' }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(image)) return { error: 'Image must be base64' }
  return { block: { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } } }
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Keeps only well-formed rungs, trimmed and capped, so the page never renders surprises */
export function sanitiseLadder(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.levels)) return null
  const levels = raw.levels.slice(0, RUNGS.length).map(l => ({
    zh: str(l?.zh, 400),
    pinyin: str(l?.pinyin, 800),
    en: str(l?.en, 600),
    focus: str(l?.focus, 160),
    ask: str(l?.ask, 120),
    askEn: str(l?.askEn, 200),
    keywords: (Array.isArray(l?.keywords) ? l.keywords : [])
      .map(k => ({ zh: str(k?.zh, 12), pinyin: str(k?.pinyin, 60), en: str(k?.en, 80) }))
      .filter(k => k.zh && /\p{Script=Han}/u.test(k.zh))
      .slice(0, 4),
  }))
  if (levels.length < RUNGS.length || levels.some(l => !l.zh)) return null
  return { title: str(raw.title, 20), titleEn: str(raw.titleEn, 80), levels }
}
