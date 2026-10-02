// Mandarin Daily widget for Scriptable (iOS)
// Shows a new HSK word every hour on your home screen or lock screen.
//
// Setup: add a Scriptable widget, choose this script, and set Parameter to your
// level, e.g. "3" for HSK 3 or "2-4" for HSK 2 to 4. Leave it empty for HSK 1.
// Optional: add a speed after a comma, e.g. "3,30" for a new word every 30 minutes.

const API = 'https://www.mandarindaily.app/api/widget'
const CACHE_FILE = 'mandarin-daily-widget.json'

// Same tone colours as the app (1 red, 2 orange, 3 green, 4 blue, neutral grey)
const TONE = {
  1: new Color('#c0392b'),
  2: new Color('#d35400'),
  3: new Color('#27ae60'),
  4: new Color('#2471a3'),
  0: new Color('#95a5a6'),
}
const BG = Color.dynamic(new Color('#f7f5f1'), new Color('#16181f'))
const TEXT = Color.dynamic(new Color('#1f1d1a'), new Color('#e8eaf0'))
const MUTED = Color.dynamic(new Color('#6b665e'), new Color('#9099b0'))
const RED = new Color('#c0392b')
const HANZI_FONT = 'PingFangSC-Semibold'
const ZH_FONT = 'PingFangSC-Regular'

const [levelParam, everyParam] = String(args.widgetParameter ?? '').split(',').map(s => s.trim())
const level = /^[1-9](-[1-9])?$/.test(levelParam ?? '') ? levelParam : '1'
const every = Number(everyParam) >= 15 ? Number(everyParam) : 60

const word = await loadWord()
const family = config.widgetFamily ?? 'medium'
const widget = word ? build(word, family) : errorWidget(family)

if (config.runsInWidget) {
  Script.setWidget(widget)
} else if (word) {
  // Running inside the Scriptable app: preview it
  await widget.presentMedium()
}
Script.complete()

async function loadWord() {
  const fm = FileManager.local()
  const path = fm.joinPath(fm.documentsDirectory(), CACHE_FILE)
  try {
    const req = new Request(`${API}?level=${encodeURIComponent(level)}&every=${every}`)
    req.timeoutInterval = 10
    const data = await req.loadJSON()
    if (!data || !data.hanzi) throw new Error('bad response')
    fm.writeString(path, JSON.stringify(data))
    return data
  } catch (e) {
    // Offline: show the last word we had
    return fm.fileExists(path) ? JSON.parse(fm.readString(path)) : null
  }
}

function build(w, family) {
  const lw = new ListWidget()
  lw.url = w.url
  // Ask iOS to refresh when the next word is due (iOS decides the exact time)
  lw.refreshAfterDate = new Date(w.nextAt)

  if (family === 'accessoryInline') {
    lw.addText(`${w.hanzi} ${w.pinyin} · ${w.englishShort}`)
    return lw
  }
  if (family === 'accessoryCircular') {
    const t = lw.addText(w.hanzi)
    t.font = new Font(HANZI_FONT, w.hanzi.length > 2 ? 14 : 22)
    t.minimumScaleFactor = 0.5
    t.centerAlignText()
    return lw
  }
  if (family === 'accessoryRectangular') {
    const top = lw.addStack()
    top.centerAlignContent()
    const h = top.addText(w.hanzi)
    h.font = new Font(HANZI_FONT, 20)
    h.minimumScaleFactor = 0.6
    top.addSpacer(6)
    const p = top.addText(w.pinyin)
    p.font = Font.mediumSystemFont(13)
    p.lineLimit = 1
    const e = lw.addText(w.englishShort)
    e.font = Font.systemFont(12)
    e.lineLimit = 2
    return lw
  }

  // Home screen
  lw.backgroundColor = BG
  const small = family === 'small'
  lw.setPadding(small ? 12 : 14, 16, small ? 12 : 14, 16)

  const header = lw.addStack()
  header.centerAlignContent()
  const tag = header.addText(`HSK ${w.level}`)
  tag.font = Font.semiboldSystemFont(10)
  tag.textColor = RED
  header.addSpacer()
  if (!small && w.pos) {
    const pos = header.addText(w.pos)
    pos.font = Font.italicSystemFont(10)
    pos.textColor = MUTED
  }

  lw.addSpacer(small ? 4 : 6)

  const main = lw.addStack()
  main.layoutHorizontally()
  main.centerAlignContent()

  const hz = main.addText(w.hanzi)
  hz.font = new Font(HANZI_FONT, small ? (w.hanzi.length > 2 ? 30 : 40) : 44)
  hz.textColor = TEXT
  hz.minimumScaleFactor = 0.5
  hz.lineLimit = 1

  if (!small) {
    main.addSpacer(12)
    const side = main.addStack()
    side.layoutVertically()
    addPinyin(side, w.syllables, 16)
    side.addSpacer(2)
    const en = side.addText(w.englishShort)
    en.font = Font.systemFont(13)
    en.textColor = TEXT
    en.lineLimit = 2
    main.addSpacer()
  } else {
    lw.addSpacer(2)
    addPinyin(lw, w.syllables, 14)
    const en = lw.addText(w.englishShort)
    en.font = Font.systemFont(12)
    en.textColor = MUTED
    en.lineLimit = 2
  }

  if (!small && w.example) {
    lw.addSpacer(family === 'large' ? 14 : 8)
    const ex = lw.addStack()
    ex.layoutVertically()
    const zh = ex.addText(w.example.zh)
    zh.font = new Font(ZH_FONT, family === 'large' ? 17 : 14)
    zh.textColor = TEXT
    zh.lineLimit = family === 'large' ? 3 : 1
    zh.minimumScaleFactor = 0.8
    if (family === 'large') {
      ex.addSpacer(3)
      const py = ex.addText(w.example.pinyin)
      py.font = Font.systemFont(12)
      py.textColor = MUTED
      py.lineLimit = 2
    }
    const exEn = ex.addText(w.example.en)
    exEn.font = Font.systemFont(family === 'large' ? 13 : 11)
    exEn.textColor = MUTED
    exEn.lineLimit = family === 'large' ? 3 : 1
  }

  if (family === 'large' && w.english !== w.englishShort) {
    lw.addSpacer(10)
    const full = lw.addText(w.english)
    full.font = Font.systemFont(12)
    full.textColor = MUTED
    full.lineLimit = 3
  }

  lw.addSpacer()
  return lw
}

// Pinyin with each syllable coloured by tone
function addPinyin(parent, syls, size) {
  const row = parent.addStack()
  row.spacing = 0
  for (const s of syls) {
    const t = row.addText(s.text)
    t.font = Font.mediumSystemFont(size)
    t.textColor = s.tone == null ? MUTED : TONE[s.tone]
  }
  return row
}

function errorWidget(family) {
  const lw = new ListWidget()
  if (!family.startsWith('accessory')) lw.backgroundColor = BG
  const t = lw.addText('Mandarin Daily: no connection yet')
  t.font = Font.systemFont(12)
  t.textColor = MUTED
  lw.refreshAfterDate = new Date(Date.now() + 15 * 60_000)
  return lw
}
