// Draws a Describe It ladder as one shareable PNG: the labelled photo, the staircase and each revealed level.
// Drawn by hand on a canvas (no library) so the Chinese is exactly the text on screen.

export interface CardLabel { zh: string; pinyin: string; x: number; y: number }
export interface CardLevel { badge: string; layer: string; zh: string }
export interface CardInput {
  image: string
  title: string
  titleEn: string
  labels: CardLabel[]
  levels: CardLevel[]   // revealed levels only
  totalLevels: number
  credit?: string
}

const W = 1080
const PAD = 64
const RED = '#c0392b'
const INK = '#1f1d1a'
const MUTED = '#6b665e'
const PAPER = '#f7f5f1'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // Wikimedia sends Access-Control-Allow-Origin: *, so sample photos don't taint the canvas
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Breaks Chinese text into lines that fit, character by character, keeping punctuation off line starts */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const ch of text) {
    if (line && ctx.measureText(line + ch).width > width && !/[，。！？、；：”）》]/.test(ch)) {
      lines.push(line)
      line = ''
    }
    line += ch
  }
  if (line) lines.push(line)
  return lines
}

export interface Placement<T> { label: T; left: boolean; dy: number }

/**
 * Puts each label's tag beside its dot without covering another tag: tries the preferred side, the other side,
 * then nudged up or down. A label with nowhere to go is dropped (Claude sometimes puts two things in one spot).
 * Sizes and the photo are in pixels; `size` gives a tag's width and height.
 */
export function placeLabels<T extends { x: number; y: number }>(
  labels: T[], photoW: number, photoH: number, size: (l: T) => { w: number; h: number }, dot = 8,
): Placement<T>[] {
  const placed: { x0: number; y0: number; x1: number; y1: number }[] = []
  const out: Placement<T>[] = []
  for (const label of labels) {
    const cx = (label.x / 100) * photoW, cy = (label.y / 100) * photoH
    const { w, h } = size(label)
    const prefer = label.x > 60
    const tries: [boolean, number][] = []
    for (const dy of [0, -(h + 4), h + 4]) for (const left of [prefer, !prefer]) tries.push([left, dy])
    for (const [left, dy] of tries) {
      const x0 = left ? cx - dot - w : cx + dot, y0 = cy - h / 2 + dy
      const box = { x0, y0, x1: x0 + w, y1: y0 + h }
      const inside = box.x0 >= 0 && box.y0 >= 0 && box.x1 <= photoW && box.y1 <= photoH
      const clear = placed.every(p => box.x1 + 3 <= p.x0 || p.x1 + 3 <= box.x0 || box.y1 + 3 <= p.y0 || p.y1 + 3 <= box.y0)
      if (inside && clear) {
        placed.push(box)
        out.push({ label, left, dy })
        break
      }
    }
  }
  return out
}

/** Red mixed toward paper: step 0 is the lightest, the top step full red */
export function stairShade(i: number, total: number): number {
  return Math.round(35 + (65 * i) / Math.max(1, total - 1))
}

function mix(pct: number): string {
  const a = [0xc0, 0x39, 0x2b], b = [0xf7, 0xf5, 0xf1]
  return `rgb(${a.map((v, k) => Math.round((v * pct + b[k] * (100 - pct)) / 100)).join(',')})`
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

export async function renderDescribeCard(input: CardInput): Promise<Blob> {
  const font = getComputedStyle(document.body).fontFamily
  const img = await loadImage(input.image)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = 8000 // cropped to the drawn height at the end
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, canvas.height)
  let y = PAD

  // Title
  ctx.fillStyle = INK
  ctx.font = `700 64px ${font}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(input.title, PAD, y + 56)
  const titleW = ctx.measureText(input.title).width
  ctx.fillStyle = MUTED
  ctx.font = `400 34px ${font}`
  ctx.fillText(input.titleEn, PAD + titleW + 24, y + 54)
  y += 100

  // Photo with labels
  const maxW = W - PAD * 2, maxH = 820
  const scale = Math.min(maxW / img.width, maxH / img.height)
  const pw = img.width * scale, ph = img.height * scale
  const px = (W - pw) / 2
  ctx.save()
  roundRect(ctx, px, y, pw, ph, 24)
  ctx.clip()
  ctx.drawImage(img, px, y, pw, ph)
  ctx.restore()
  const tagSize = (l: CardLabel) => {
    ctx.font = `700 34px ${font}`
    const zw = ctx.measureText(l.zh).width
    ctx.font = `400 20px ${font}`
    return { w: Math.max(zw, ctx.measureText(l.pinyin).width) + 24, h: 70 }
  }
  for (const { label: l, left, dy } of placeLabels(input.labels, pw, ph, tagSize, 14)) {
    const cx = px + (l.x / 100) * pw, cy = y + (l.y / 100) * ph
    const { w: tw, h: th } = tagSize(l)
    const tx = left ? cx - 14 - tw : cx + 14
    const ty = cy - th / 2 + dy
    ctx.fillStyle = 'rgba(255,255,255,0.94)'
    roundRect(ctx, tx, ty, tw, th, 12)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.font = `700 34px ${font}`
    ctx.fillText(l.zh, tx + 12, ty + 38)
    ctx.fillStyle = MUTED
    ctx.font = `400 20px ${font}`
    ctx.fillText(l.pinyin, tx + 12, ty + 61)
    ctx.beginPath()
    ctx.arc(cx, cy, 11, 0, Math.PI * 2)
    ctx.fillStyle = RED
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#fff'
    ctx.stroke()
  }
  y += ph + 56

  // Staircase: one step per level, filled once revealed
  const n = input.totalLevels
  const gap = 10, sw = (W - PAD * 2 - gap * (n - 1)) / n
  const base = y + 40 + 24 * (n - 1) + 60
  for (let i = 0; i < n; i++) {
    const h = 60 + 24 * i
    const sx = PAD + i * (sw + gap)
    const open = i < input.levels.length
    roundRect(ctx, sx, base - h, sw, h, 10)
    if (open) {
      ctx.fillStyle = mix(stairShade(i, n))
      ctx.fill()
    } else {
      ctx.setLineDash([8, 6])
      ctx.lineWidth = 3
      ctx.strokeStyle = '#cfc8bd'
      ctx.stroke()
      ctx.setLineDash([])
    }
    const label = i === n - 1 ? '7–9' : String(i + 1)
    ctx.fillStyle = open ? (stairShade(i, n) > 60 ? '#fff' : INK) : MUTED
    ctx.font = `800 30px ${font}`
    ctx.textAlign = 'center'
    ctx.fillText(label, sx + sw / 2, base - 18)
    if (open) {
      ctx.fillStyle = MUTED
      ctx.font = `600 22px ${font}`
      ctx.fillText(`${[...input.levels[i].zh].filter(c => /\p{Script=Han}/u.test(c)).length}字`, sx + sw / 2, base - h - 12)
    }
    ctx.textAlign = 'left'
  }
  y = base + 56

  // Levels
  for (const [i, lv] of input.levels.entries()) {
    ctx.fillStyle = mix(stairShade(i, n))
    ctx.font = `800 24px ${font}`
    const bw = ctx.measureText(lv.badge).width + 28
    roundRect(ctx, PAD, y, bw, 40, 20)
    ctx.fill()
    ctx.fillStyle = stairShade(i, n) > 60 ? '#fff' : INK
    ctx.fillText(lv.badge, PAD + 14, y + 29)
    ctx.fillStyle = INK
    ctx.font = `700 28px ${font}`
    ctx.fillText(lv.layer, PAD + bw + 16, y + 30)
    y += 64
    ctx.font = `400 40px ${font}`
    for (const line of wrap(ctx, lv.zh, W - PAD * 2)) {
      ctx.fillText(line, PAD, y + 36)
      y += 58
    }
    y += 30
  }

  // Footer
  ctx.fillStyle = RED
  ctx.fillRect(PAD, y, W - PAD * 2, 3)
  y += 44
  ctx.fillStyle = INK
  ctx.font = `700 28px ${font}`
  ctx.fillText('Describe It 看图说话 · mandarindaily.app', PAD, y)
  if (input.credit) {
    y += 40
    ctx.fillStyle = MUTED
    ctx.font = `400 22px ${font}`
    ctx.fillText(input.credit, PAD, y)
  }
  y += PAD

  const out = document.createElement('canvas')
  out.width = W
  out.height = Math.ceil(y)
  out.getContext('2d')!.drawImage(canvas, 0, 0)
  return new Promise((resolve, reject) => out.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
}

/** Opens the share sheet where the browser can share files (phones), otherwise downloads the PNG */
export async function shareOrDownload(blob: Blob, name: string, title: string) {
  const file = new File([blob], name, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
