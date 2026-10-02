// Widget endpoint, plus the Scriptable script run against a strict mock of Scriptable's API
// (any call the mock doesn't define throws, so typos in the script surface here).
import { readFileSync } from 'node:fs'
import handler, { parseLevels, pickWord, syllables } from './widget.js'

function callApi(query) {
  let body, code
  const headers = {}
  handler({ query }, { setHeader(k, v) { headers[k] = v }, status(c) { code = c; return this }, json(b) { body = b } })
  return { body, code, headers }
}

describe('/api/widget', () => {
  it('parses level params and falls back to HSK 1', () => {
    expect(parseLevels('3')).toEqual([3])
    expect(parseLevels('4-2')).toEqual([2, 3, 4])
    for (const bad of ['x', '0', '10', undefined, '1-']) expect(parseLevels(bad)).toEqual([1])
  })

  it('keeps the same word within a time slot and changes it in the next one', () => {
    const t = Date.UTC(2026, 9, 2, 10, 5)
    const a = pickWord([3], 60, t).word.id
    expect(pickWord([3], 60, t + 50 * 60_000).word.id).toBe(a)
    expect(pickWord([3], 60, t + 60 * 60_000).word.id).not.toBe(a)
  })

  it('returns a word from the requested levels with a cache lifetime up to the next slot', () => {
    const { body, code, headers } = callApi({ level: '7-9', every: '1' })
    expect(code).toBe(200)
    expect(body.level).toBeGreaterThanOrEqual(7)
    expect(body.url).toBe(`https://www.mandarindaily.app/word/${body.id}`)
    const maxAge = Number(/s-maxage=(\d+)/.exec(headers['Cache-Control'])[1])
    expect(maxAge).toBeLessThanOrEqual(15 * 60) // `every` is clamped to at least 15 minutes
  })

  it('splits pinyin into tone-coloured syllables, including y/w initials and erhua', () => {
    const tones = p => syllables(p).filter(s => s.tone != null).map(s => `${s.text}${s.tone}`).join(' ')
    expect(tones('yīdiǎnr')).toBe('yī1 diǎnr3')
    expect(tones('wǒmen')).toBe('wǒ3 men0')
    expect(tones('zhūròu')).toBe('zhū1 ròu4')
    expect(tones('wánr')).toBe('wánr2')
    expect(tones('nǚ’ér')).toBe('nǚ3 ér2')
  })
})

describe('Scriptable widget script', () => {
  const src = readFileSync('public/mandarin-daily-widget.js', 'utf8')
  const strict = (name, obj) => new Proxy(obj, {
    get(t, k) { if (k in t || typeof k === 'symbol' || k === 'then') return t[k]; throw new Error(`${name}.${String(k)} not in Scriptable API`) },
    set(t, k, v) { if (!(k in t)) throw new Error(`${name}.${String(k)} is not settable`); t[k] = v; return true },
  })

  async function run(family, param, { online = true, files = new Map() } = {}) {
    const texts = []
    const requests = []
    class Color { constructor(h) { this.h = h } static dynamic(a) { return a } }
    class Font {
      static systemFont() { return new Font() } static mediumSystemFont() { return new Font() }
      static semiboldSystemFont() { return new Font() } static italicSystemFont() { return new Font() }
    }
    const text = s => { texts.push(s); return strict('WidgetText', { font: null, textColor: null, lineLimit: 0, minimumScaleFactor: 1, centerAlignText() {} }) }
    const stack = () => strict('WidgetStack', { spacing: 0, addText: text, addStack: stack, addSpacer() {}, layoutHorizontally() {}, layoutVertically() {}, centerAlignContent() {} })
    class ListWidget {
      constructor() { Object.assign(this, { url: null, refreshAfterDate: null, backgroundColor: null }); return strict('ListWidget', this) }
      addText(s) { return text(s) } addStack() { return stack() } addSpacer() {} setPadding() {} async presentMedium() {}
    }
    class Request {
      constructor(url) { this.url = url; this.timeoutInterval = 60; requests.push(url); return strict('Request', this) }
      async loadJSON() {
        if (!online) throw new Error('offline')
        return callApi(Object.fromEntries(new URL(this.url).searchParams)).body
      }
    }
    const fm = { documentsDirectory: () => '/d', joinPath: (a, b) => `${a}/${b}`, writeString: (p, s) => files.set(p, s), readString: p => files.get(p), fileExists: p => files.has(p) }
    let widget = null
    const globals = {
      Color, Font, ListWidget, Request, FileManager: { local: () => strict('FileManager', fm) },
      args: { widgetParameter: param }, config: { widgetFamily: family, runsInWidget: true },
      Script: { setWidget(w) { widget = w }, complete() {} },
    }
    await new Function(...Object.keys(globals), `return (async () => {\n${src}\n})()`)(...Object.values(globals))
    return { widget, texts, requests, files }
  }

  it.each(['small', 'medium', 'large', 'accessoryRectangular', 'accessoryInline', 'accessoryCircular'])('renders %s', async family => {
    const { widget, texts } = await run(family, '3')
    expect(widget.url).toMatch(/\/word\/hsk3_/)
    expect(widget.refreshAfterDate).toBeInstanceOf(Date)
    expect(texts.length).toBeGreaterThan(0)
  })

  it('passes level range and speed through, and ignores a bad parameter', async () => {
    expect((await run('small', '2-4,30')).requests[0]).toContain('level=2-4&every=30')
    expect((await run('small', 'garbage')).requests[0]).toContain('level=1&every=60')
  })

  it('shows the last cached word when offline', async () => {
    const first = await run('medium', '3')
    const offline = await run('medium', '3', { online: false, files: first.files })
    expect(offline.widget.url).toBe(first.widget.url)
    const none = await run('medium', '3', { online: false })
    expect(none.texts.join(' ')).toMatch(/no connection/)
  })
})
