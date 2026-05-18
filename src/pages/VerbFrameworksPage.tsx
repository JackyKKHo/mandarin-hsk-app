import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import { useSEO } from '../hooks/useSEO'

// ── Types ──────────────────────────────────────────────────────────────────────

interface VerbExample {
  mand: string
  cant?: string
  pinyin: string
  english: string
  note?: string
}

interface Framework {
  id: string
  num: number
  title: string
  subtitle: string
  emoji: string
  concept: string
  rule: string
  warning?: string
  sections: { heading: string; rows: VerbExample[] }[]
}

// ── Data ───────────────────────────────────────────────────────────────────────

const FRAMEWORKS: Framework[] = [
  {
    id: 'singles',
    num: 1,
    title: 'Simple Singles',
    subtitle: 'One character, full meaning',
    emoji: '①',
    concept:
      'Single-character verbs that carry both the action and its result in one shot — just like basic English verbs. No assembly required.',
    rule: '[Subject] + [Verb] + [Object]',
    sections: [
      {
        heading: 'Core singles',
        rows: [
          { mand: '开', cant: '开 (hōi)', pinyin: 'kāi', english: 'open' },
          { mand: '关', cant: '闩 (sān)', pinyin: 'guān', english: 'close' },
          { mand: '打', cant: '打 (dá)', pinyin: 'dǎ', english: 'hit / strike' },
          { mand: '看', cant: '睇 (tái)', pinyin: 'kàn', english: 'look / watch' },
          { mand: '走', cant: '走 (jáu)', pinyin: 'zǒu', english: 'walk / leave' },
          { mand: '说', cant: '讲 (góng)', pinyin: 'shuō', english: 'speak / say' },
        ],
      },
      {
        heading: 'In a sentence',
        rows: [
          { mand: '帮我关门', cant: '帮我闩门', pinyin: 'bāng wǒ guān mén', english: 'Help me close the door' },
          { mand: '他打我', cant: '佢打我', pinyin: 'tā dǎ wǒ', english: 'He hit me' },
        ],
      },
    ],
  },
  {
    id: 'result',
    num: 2,
    title: 'Result Recipe',
    subtitle: 'Manner + Result compounds',
    emoji: '②',
    concept:
      'Chinese splits the HOW from the WHAT HAPPENED. A manner verb describes the motion; a result brick describes the outcome. Together they form one compound event.',
    rule: '[Manner Verb] + [Result Brick]',
    warning:
      'Completed action markers (了 / 咗) follow the entire compound — never split it: ✓ 打开了 ✗ 打了开',
    sections: [
      {
        heading: 'Same manner 打, different results',
        rows: [
          { mand: '打开', cant: '打开 (dá hōi)', pinyin: 'dǎ kāi', english: 'strike + open → slam open' },
          { mand: '打碎', pinyin: 'dǎ suì', english: 'strike + shatter → smash to pieces' },
          { mand: '打倒', pinyin: 'dǎ dǎo', english: 'strike + fall → knock down' },
          { mand: '打死', pinyin: 'dǎ sǐ', english: 'strike + die → strike dead' },
          { mand: '打破', pinyin: 'dǎ pò', english: 'strike + break → break / rupture' },
          { mand: '打完', pinyin: 'dǎ wán', english: 'strike + finish → finish hitting' },
        ],
      },
      {
        heading: 'Same result 开, different manners',
        rows: [
          { mand: '推开', cant: '推开 (tēui hōi)', pinyin: 'tuī kāi', english: 'push + open → push open' },
          { mand: '拉开', cant: '扯开 (ché hōi)', pinyin: 'lā kāi', english: 'pull + open → pull open' },
          { mand: '踢开', cant: '踢开 (tek hōi)', pinyin: 'tī kāi', english: 'kick + open → kick open' },
          { mand: '撕开', cant: '撕开 (sī hōi)', pinyin: 'sī kāi', english: 'rip + open → tear open' },
        ],
      },
    ],
  },
  {
    id: 'sandwich',
    num: 3,
    title: 'Separable Sandwiches',
    subtitle: '离合词 — verb + built-in object',
    emoji: '③',
    concept:
      'These verbs come pre-packaged with their natural object (e.g. 吃饭 eat-rice, 睡觉 sleep-sleep). The gap between the two halves is a slot — aspect markers, quantities, and frequency words go inside, not after.',
    rule: '[Action Verb] + [SLOT] + [Object]',
    warning:
      'In Cantonese, aspect markers must go in the slot — 食咗饭 ✓, never 食饭咗 ✗. Mandarin allows 毕业了 colloquially, but splitting is always safer.',
    sections: [
      {
        heading: 'Common separable pairs',
        rows: [
          { mand: '吃饭', cant: '食饭 (sihk faahn)', pinyin: 'chī fàn', english: 'eat (eat-rice)' },
          { mand: '睡觉', cant: '瞓觉 (fan gaau)', pinyin: 'shuì jiào', english: 'sleep (sleep-sleep)' },
          { mand: '跑步', cant: '慢跑 (maahn páu)', pinyin: 'pǎo bù', english: 'jog (run-step)' },
          { mand: '毕业', cant: '毕业 (bāt yihp)', pinyin: 'bì yè', english: 'graduate (end-industry)' },
          { mand: '唱歌', cant: '唱歌 (cheung gō)', pinyin: 'chàng gē', english: 'sing (sing-song)' },
          { mand: '游泳', cant: '游水 (yàuh séui)', pinyin: 'yóu yǒng', english: 'swim (swim-swim)' },
        ],
      },
      {
        heading: 'What goes in the slot',
        rows: [
          { mand: '吃了饭', cant: '食咗饭', pinyin: 'chī le fàn', english: 'completed eating', note: '了/咗 = done' },
          { mand: '吃过饭', cant: '食过饭', pinyin: 'chī guo fàn', english: 'have eaten before', note: '过/过 = experience' },
          { mand: '吃完饭', cant: '食埋饭', pinyin: 'chī wán fàn', english: 'finished eating', note: '完/埋 = task done' },
          { mand: '吃了两次饭', pinyin: 'chī le liǎng cì fàn', english: 'ate twice', note: 'quantity in slot' },
        ],
      },
    ],
  },
  {
    id: 'direction',
    num: 4,
    title: 'Direction Drop',
    subtitle: 'Movement + Direction + Perspective',
    emoji: '④',
    concept:
      'Maps exactly where an action travels in 3D space. Direction says which way (in/out/up/down/back). Perspective says whether it moves towards you (来/嚟) or away from you (去/去).',
    rule: '[Movement Verb] + [Direction] + [来/去]',
    sections: [
      {
        heading: 'Direction blueprint using 跑 (run)',
        rows: [
          { mand: '跑出去', pinyin: 'pǎo chū qù', english: 'run out → away from speaker' },
          { mand: '跑出来', pinyin: 'pǎo chū lái', english: 'run out → towards speaker' },
          { mand: '跑进去', pinyin: 'pǎo jìn qù', english: 'run in → away from speaker' },
          { mand: '跑进来', pinyin: 'pǎo jìn lái', english: 'run in → towards speaker' },
          { mand: '跑回去', pinyin: 'pǎo huí qù', english: 'run back → away from speaker' },
          { mand: '跑上去', pinyin: 'pǎo shàng qù', english: 'run up → away from speaker' },
          { mand: '跑下去', pinyin: 'pǎo xià qù', english: 'run down → away from speaker' },
        ],
      },
      {
        heading: 'Direction bricks (swap any movement verb in)',
        rows: [
          { mand: '出', pinyin: 'chū', english: 'out' },
          { mand: '进', pinyin: 'jìn', english: 'in / into' },
          { mand: '上', pinyin: 'shàng', english: 'up' },
          { mand: '下', pinyin: 'xià', english: 'down' },
          { mand: '回', pinyin: 'huí', english: 'back' },
          { mand: '过', pinyin: 'guò', english: 'across / past' },
        ],
      },
    ],
  },
  {
    id: 'bridge',
    num: 5,
    title: 'Bridge Block',
    subtitle: 'Potential complements — can / cannot',
    emoji: '⑤',
    concept:
      'Inserts a conditional token into the middle of a Framework 2 or 4 compound to declare whether the action can or cannot achieve its result. Think of it as runtime logic: "is this achievable?"',
    rule: '[Manner] + [得/不] + [Result or Direction]',
    sections: [
      {
        heading: 'Can (得 / 得) vs Cannot (不 / 唔)',
        rows: [
          { mand: '打得开', cant: '打得开 (dá dak hōi)', pinyin: 'dǎ de kāi', english: 'can hit open' },
          { mand: '打不开', cant: '打唔开 (dá m hōi)', pinyin: 'dǎ bù kāi', english: 'cannot hit open' },
          { mand: '跑得出来', cant: '跑得出来 (páu dak chēut làih)', pinyin: 'pǎo de chū lái', english: 'can run out (towards)' },
          { mand: '爬不进去', cant: '爬唔进去 (pàh m yeuhp heu)', pinyin: 'pá bù jìn qù', english: 'cannot crawl in (away)' },
          { mand: '听得懂', pinyin: 'tīng de dǒng', english: 'can understand by listening' },
          { mand: '听不懂', pinyin: 'tīng bù dǒng', english: 'cannot understand by listening' },
          { mand: '做得到', pinyin: 'zuò de dào', english: 'can accomplish' },
          { mand: '做不到', pinyin: 'zuò bù dào', english: 'cannot accomplish' },
        ],
      },
      {
        heading: 'Framework 2 + Bridge combined',
        rows: [
          { mand: '看得见', pinyin: 'kàn de jiàn', english: 'can see (look + perceive)', note: 'vision possible' },
          { mand: '看不见', pinyin: 'kàn bù jiàn', english: 'cannot see', note: 'vision blocked' },
          { mand: '吃得完', pinyin: 'chī de wán', english: 'can finish eating', note: 'quantity manageable' },
          { mand: '吃不完', pinyin: 'chī bù wán', english: 'cannot finish eating', note: 'too much' },
        ],
      },
    ],
  },
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function VerbFrameworksPage() {
  useSEO({
    title: '5 Frameworks That Unlock 83% of Chinese Verbs',
    description: 'Master Chinese compound verbs with 5 core patterns: simple singles, result recipes, separable sandwiches, direction drops, and bridge blocks.',
    path: '/verb-frameworks',
  })

  const [active, setActive] = useState('singles')
  const fw = FRAMEWORKS.find(f => f.id === active)!

  return (
    <div className="browser-page">
      <AppHeader />

      <div className="cant-hero">
        <h2>5 Verb Frameworks</h2>
        <p className="cant-hero-sub">
          These 5 patterns account for 83% of all multi-character Chinese verbs. Learn the system, not just the words.
        </p>
      </div>

      {/* Framework tabs */}
      <div className="cant-rule-tabs" style={{ flexWrap: 'wrap' }}>
        {FRAMEWORKS.map(f => (
          <button
            key={f.id}
            className={`cant-rule-tab${active === f.id ? ' active' : ''}`}
            onClick={() => setActive(f.id)}
          >
            <span style={{ fontWeight: 700 }}>{f.emoji}</span> {f.title}
          </button>
        ))}
      </div>

      {/* Active framework */}
      <div className="cant-rule-detail" key={fw.id}>
        <div className="cant-rule-header">
          <div>
            <h3 className="cant-rule-title">Framework {fw.num}: {fw.title}</h3>
            <p className="cant-rule-subtitle">{fw.subtitle}</p>
          </div>
        </div>

        <div className="cant-rule-explanation">{fw.concept}</div>

        <div className="vf-rule-box">
          <span className="vf-rule-label">Pattern</span>
          <code className="vf-rule-pattern">{fw.rule}</code>
        </div>

        {fw.warning && (
          <div className="vf-warning">
            ⚠️ {fw.warning}
          </div>
        )}

        {fw.sections.map(sec => (
          <div key={sec.heading} className="vf-section">
            <h4 className="vf-section-heading">{sec.heading}</h4>
            <div className="vf-table">
              {sec.rows.map((row, i) => (
                <div key={i} className="vf-row">
                  <span className="vf-chinese">{row.mand}</span>
                  <span className="vf-pinyin">{row.pinyin}</span>
                  <span className="vf-english">{row.english}</span>
                  {row.cant && <span className="vf-cant">{row.cant}</span>}
                  {row.note && <span className="vf-note">{row.note}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary pipeline */}
      <div className="vf-pipeline">
        <h3 className="vf-pipeline-title">Quick Decision Guide</h3>
        <div className="vf-pipeline-steps">
          {[
            { num: '1', q: 'Single character?', a: 'Use as-is — no assembly needed.' },
            { num: '2', q: 'Action with an outcome?', a: 'Manner + Result compound. Keep 了 at the end.' },
            { num: '3', q: 'Verb with a built-in object?', a: 'Separable sandwich — put modifiers in the slot.' },
            { num: '4', q: 'Movement through space?', a: 'Add direction brick + 来/去 for perspective.' },
            { num: '5', q: '得 or 不 in the middle?', a: 'Potential complement — "can" or "cannot" achieve the result.' },
          ].map(step => (
            <div key={step.num} className="vf-step">
              <span className="vf-step-num">{step.num}</span>
              <div>
                <div className="vf-step-q">{step.q}</div>
                <div className="vf-step-a">{step.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
