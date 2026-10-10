// Live pitch tracking in the browser: microphone → pitch frames ~60 times a second.
// Listening ends by itself when you stop talking, so a rep is one tap.
import { YIN } from 'pitchfinder'
import type { Frame } from './toneGym'

const TARGET_RATE = 16000   // pitch is detected on audio decimated to ~16 kHz, like the server
const WINDOW = 1024         // samples at the decimated rate (~64 ms; reaches low male voices)

type AC = typeof AudioContext
const AudioCtx = (): AC => window.AudioContext || (window as unknown as { webkitAudioContext: AC }).webkitAudioContext

function decimate(src: Float32Array, factor: number, out: Float32Array) {
  for (let i = 0; i < out.length; i++) {
    let s = 0
    for (let k = 0; k < factor; k++) s += src[i * factor + k]
    out[i] = s / factor
  }
}

function rmsOf(buf: Float32Array) {
  let s = 0
  for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]
  return Math.sqrt(s / buf.length)
}

export interface ListenResult { frames: Frame[]; audio: Blob | null }

export class PitchTracker {
  private ctx: AudioContext | null = null
  private stream: MediaStream | null = null
  private analyser: AnalyserNode | null = null
  private stopRequested = false

  async open() {
    if (this.ctx) return
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: false },
    })
    const ctx = new (AudioCtx())()
    const src = ctx.createMediaStreamSource(this.stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 4096
    src.connect(analyser)
    this.ctx = ctx
    this.analyser = analyser
  }

  get isOpen() { return this.ctx != null }

  /** Ends the current listen early (e.g. the user taps stop). */
  stop() { this.stopRequested = true }

  /**
   * Listens for one utterance. Resolves after `silenceSec` of quiet once speech has started,
   * or after `maxSec`. Calls onFrame for every frame so the contour can be drawn live.
   */
  async listen(onFrame: (f: Frame, speaking: boolean) => void, { maxSec = 3, silenceSec = 0.45, waitSec = 5 } = {}): Promise<ListenResult> {
    if (!this.ctx || !this.analyser || !this.stream) throw new Error('Microphone not open')
    const ctx = this.ctx, analyser = this.analyser
    await ctx.resume()
    this.stopRequested = false

    const factor = Math.max(1, Math.round(ctx.sampleRate / TARGET_RATE))
    const rate = ctx.sampleRate / factor
    const detect = YIN({ sampleRate: rate, threshold: 0.15 })
    const raw = new Float32Array(analyser.fftSize)
    const small = new Float32Array(WINDOW)
    const need = WINDOW * factor

    let recorder: MediaRecorder | null = null
    const chunks: Blob[] = []
    try {
      recorder = new MediaRecorder(this.stream)
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
      recorder.start()
    } catch { recorder = null }

    const frames: Frame[] = []
    const t0 = ctx.currentTime
    let floor = 0, floorN = 0
    let startedAt: number | null = null
    let lastVoiced = 0

    await new Promise<void>(resolve => {
      const tick = () => {
        const t = ctx.currentTime - t0
        analyser.getFloatTimeDomainData(raw)
        decimate(raw.subarray(raw.length - need), factor, small)
        const rms = rmsOf(small)
        // The first 200 ms set the background noise level
        if (t < 0.2 && startedAt == null) { floor += rms; floorN++ }
        const threshold = Math.max(0.006, floorN ? (floor / floorN) * 2.5 : 0.01)
        let f: number | null = null
        if (rms > threshold) {
          const hz = detect(small)
          if (hz && hz > 65 && hz < 520) f = hz
        }
        if (f != null) { lastVoiced = t; if (startedAt == null) startedAt = t }
        const frame = { t, f, rms }
        if (startedAt != null) { frames.push(frame); onFrame(frame, true) } else onFrame(frame, false)

        const done = this.stopRequested
          || (startedAt != null && t - lastVoiced > silenceSec && lastVoiced - startedAt > 0.1)
          || (startedAt != null && t - startedAt > maxSec)
          || (startedAt == null && t > waitSec)
        if (done) resolve()
        else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })

    let audio: Blob | null = null
    if (recorder && recorder.state !== 'inactive') {
      audio = await new Promise<Blob>(res => {
        recorder!.onstop = () => res(new Blob(chunks, { type: recorder!.mimeType || 'audio/webm' }))
        recorder!.stop()
      })
    }
    return { frames, audio: frames.length ? audio : null }
  }

  close() {
    this.stream?.getTracks().forEach(t => t.stop())
    void this.ctx?.close()
    this.ctx = null; this.stream = null; this.analyser = null
  }
}

/** Pitch frames for a finished clip (the native-speaker audio), using the same detector. */
export async function analyzeClip(data: ArrayBuffer): Promise<Frame[]> {
  const ctx = new (AudioCtx())()
  try {
    const audio = await ctx.decodeAudioData(data)
    const ch = audio.getChannelData(0)
    const factor = Math.max(1, Math.round(audio.sampleRate / TARGET_RATE))
    const rate = audio.sampleRate / factor
    const mono = new Float32Array(Math.floor(ch.length / factor))
    decimate(ch, factor, mono)
    const detect = YIN({ sampleRate: rate, threshold: 0.15 })
    const hop = 256
    const frames: Frame[] = []
    let peak = 0
    for (let i = 0; i < mono.length; i++) peak = Math.max(peak, Math.abs(mono[i]))
    for (let start = 0; start + WINDOW <= mono.length; start += hop) {
      const w = mono.subarray(start, start + WINDOW)
      const rms = rmsOf(w)
      let f: number | null = null
      if (rms > peak * 0.05) {
        const hz = detect(w)
        if (hz && hz > 65 && hz < 520) f = hz
      }
      frames.push({ t: start / rate, f, rms })
    }
    return frames
  } finally {
    void ctx.close()
  }
}
