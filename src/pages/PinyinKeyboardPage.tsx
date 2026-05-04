import AppHeader from '../components/AppHeader'

interface Step {
  text: string
}

interface Platform {
  name: string
  icon: string
  switchKey: string
  steps: Step[]
  note?: string
}

const PLATFORMS: Platform[] = [
  {
    name: 'Windows 10 / 11',
    icon: '🪟',
    switchKey: 'Win + Space',
    steps: [
      { text: 'Open Settings → Time & Language → Language & region' },
      { text: 'Click Add a language' },
      { text: 'Search for Chinese (Simplified, China) and click Next → Install' },
      { text: 'After install, click the new language → Options' },
      { text: 'Under Keyboards, Microsoft Pinyin should already be listed' },
      { text: 'Press Win + Space (or click the language bar in the taskbar) to switch between English and Chinese' },
    ],
    note: 'You can also right-click the language bar to access IME settings and enable "English mode" shortcut (Shift key).',
  },
  {
    name: 'macOS',
    icon: '🍎',
    switchKey: 'Ctrl + Space  or  Cmd + Space',
    steps: [
      { text: 'Open System Settings → Keyboard → Input Sources' },
      { text: 'Click the + button' },
      { text: 'Select Chinese, Simplified in the left panel' },
      { text: 'Choose Pinyin – Simplified and click Add' },
      { text: 'Enable "Show Input menu in menu bar" to see the flag icon' },
      { text: 'Use Ctrl + Space to cycle through input sources' },
    ],
    note: 'In the menu bar input selector you can choose between Simplified and Traditional characters as you type.',
  },
  {
    name: 'iPhone / iPad (iOS)',
    icon: '📱',
    switchKey: 'Globe 🌐 key on keyboard',
    steps: [
      { text: 'Open Settings → General → Keyboard → Keyboards' },
      { text: 'Tap Add New Keyboard…' },
      { text: 'Scroll to Chinese (Simplified) and tap it' },
      { text: 'Select Pinyin and tap Done' },
      { text: 'When typing, tap the 🌐 globe icon to switch keyboards' },
    ],
    note: 'You can also press and hold the globe key to pick the keyboard from a list.',
  },
  {
    name: 'Android (Gboard)',
    icon: '🤖',
    switchKey: 'Globe 🌐 key on keyboard',
    steps: [
      { text: 'Install Gboard from the Play Store if not already your default keyboard' },
      { text: 'Open Gboard settings → Languages → Add keyboard' },
      { text: 'Search for Chinese (Simplified) and select it' },
      { text: 'Choose Pinyin layout and tap Done' },
      { text: 'Tap the globe 🌐 icon while typing to switch to Chinese' },
    ],
    note: 'Samsung keyboard also supports Chinese pinyin under Settings → General Management → Samsung Keyboard Settings → Add input languages.',
  },
]

const TIPS = [
  {
    title: 'How pinyin input works',
    body: 'Type the pinyin romanisation (e.g. "ni hao") and a list of matching Chinese characters appears. Tap or click the one you want. The IME learns your preferences over time.',
  },
  {
    title: 'Tone marks are automatic',
    body: 'You don\'t need to type tone numbers. Just type the pinyin letters — the character picker shows the right tones. If you want to filter, some IMEs let you type the number (e.g. "ni3") to narrow results.',
  },
  {
    title: 'Switch English mid-sentence',
    body: 'On Windows, press Shift to toggle between Chinese and English without changing the input source. On Mac, press Caps Lock. On mobile, tap the keyboard language key.',
  },
  {
    title: 'Double pinyin (advanced)',
    body: 'If you plan to type Chinese frequently, look into "双拼 (shuāng pīn)" — a compact layout that maps each pinyin syllable to just 2 key presses instead of typing out full syllables.',
  },
  {
    title: 'Practice here first',
    body: 'Use the Search page on Mandarin Daily to practise your input. Type a Chinese word you know (e.g. 你好) and see what comes up. You\'ll get the hang of the character picker within minutes.',
  },
]

export default function PinyinKeyboardPage() {
  return (
    <div className="browser-page">
      <AppHeader />
      <div className="guide-page">
        <div className="guide-hero">
          <h2 className="guide-title">Type Chinese on Your Keyboard</h2>
          <p className="guide-subtitle">
            Setting up Pinyin input takes 2 minutes on any device. Here's how.
          </p>
        </div>

        <div className="guide-platforms">
          {PLATFORMS.map(p => (
            <div key={p.name} className="guide-platform-card">
              <div className="guide-platform-header">
                <span className="guide-platform-icon">{p.icon}</span>
                <div>
                  <div className="guide-platform-name">{p.name}</div>
                  <div className="guide-platform-switch">Switch: <kbd>{p.switchKey}</kbd></div>
                </div>
              </div>
              <ol className="guide-steps">
                {p.steps.map((s, i) => (
                  <li key={i} className="guide-step">{s.text}</li>
                ))}
              </ol>
              {p.note && <p className="guide-note">💡 {p.note}</p>}
            </div>
          ))}
        </div>

        <div className="guide-tips-section">
          <h3 className="guide-tips-title">Tips for typing Chinese</h3>
          <div className="guide-tips-grid">
            {TIPS.map(t => (
              <div key={t.title} className="guide-tip-card">
                <div className="guide-tip-title">{t.title}</div>
                <div className="guide-tip-body">{t.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="guide-demo">
          <h3>What pinyin input looks like</h3>
          <div className="guide-demo-example">
            <div className="demo-row">
              <span className="demo-label">You type:</span>
              <span className="demo-typed">n i h a o</span>
            </div>
            <div className="demo-row">
              <span className="demo-label">IME shows:</span>
              <span className="demo-candidates">
                {['你好', '你号', '拟好', '逆耗'].map((c, i) => (
                  <span key={i} className={`demo-candidate${i === 0 ? ' selected' : ''}`}>{i + 1}.{c}</span>
                ))}
              </span>
            </div>
            <div className="demo-row">
              <span className="demo-label">Press 1:</span>
              <span className="demo-result">你好</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
