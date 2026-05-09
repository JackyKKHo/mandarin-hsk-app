import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import { useSEO } from '../hooks/useSEO'

/* ── Sound Rules ─────────────────────────────── */
interface Example { char: string; cant: string; mand: string; english: string }
interface SoundRule {
  id: string; shortTitle: string; title: string
  cant: string; mand: string; accuracy: string
  explanation: string; tip: string
  examples: Example[]; exceptions?: string[]
}

const SOUND_RULES: SoundRule[] = [
  {
    id: 'g-j', shortTitle: 'G → J', title: 'The G → J Rule',
    cant: 'g-', mand: 'j-', accuracy: '~90%',
    explanation: 'Cantonese g- initial almost always becomes j- in Mandarin. Once this clicks, a huge chunk of vocabulary unlocks at once.',
    tip: '家 gaa1 → jiā. 見 gin3 → jiàn. 講 gong2 → jiǎng. Say a Cantonese g- word, swap the initial to j-, and you\'re usually right.',
    examples: [
      { char: '家', cant: 'gaa1', mand: 'jiā', english: 'home / family' },
      { char: '見', cant: 'gin3', mand: 'jiàn', english: 'see / meet' },
      { char: '叫', cant: 'giu3', mand: 'jiào', english: 'call / be named' },
      { char: '九', cant: 'gau2', mand: 'jiǔ', english: 'nine' },
      { char: '舊', cant: 'gau6', mand: 'jiù', english: 'old / former' },
      { char: '今', cant: 'gam1', mand: 'jīn', english: 'now / today (今天)' },
      { char: '講', cant: 'gong2', mand: 'jiǎng', english: 'speak / explain' },
      { char: '幾', cant: 'gei2', mand: 'jǐ', english: 'how many / several' },
      { char: '街', cant: 'gaai1', mand: 'jiē', english: 'street' },
      { char: '記', cant: 'gei3', mand: 'jì', english: 'remember / record' },
      { char: '近', cant: 'gan6', mand: 'jìn', english: 'near / close' },
      { char: '驚', cant: 'geng1', mand: 'jīng', english: 'shocked / startled' },
      { char: '金', cant: 'gam1', mand: 'jīn', english: 'gold' },
      { char: '結', cant: 'git3', mand: 'jié', english: 'conclude / knot' },
      { char: '解', cant: 'gaai2', mand: 'jiě', english: 'solve / understand' },
    ],
    exceptions: ['顆 (go1) → kē — g stays as k when the original Middle Chinese was a different initial'],
  },
  {
    id: 'ptk', shortTitle: '-P/-T/-K Drop', title: 'The Entering Tone Drop',
    cant: '-p / -t / -k', mand: '(open syllable)', accuracy: '~95%',
    explanation: 'Cantonese kept the entering tones (入聲) from Middle Chinese — short syllables that end hard with -p, -t, or -k. Mandarin lost all of them. The consonant just vanishes.',
    tip: 'Strip the final stop. 食 sik6 → shí. 一 jat1 → yī. 學 hok6 → xué. It\'s one of the most consistent rules in the whole language.',
    examples: [
      { char: '一', cant: 'jat1', mand: 'yī', english: 'one (-t dropped)' },
      { char: '七', cant: 'cat1', mand: 'qī', english: 'seven (-t dropped)' },
      { char: '八', cant: 'baat3', mand: 'bā', english: 'eight (-t dropped)' },
      { char: '不', cant: 'bat1', mand: 'bù', english: 'not (-t dropped)' },
      { char: '日', cant: 'jat6', mand: 'rì', english: 'sun / day (-t dropped)' },
      { char: '月', cant: 'jyut6', mand: 'yuè', english: 'moon / month (-t dropped)' },
      { char: '十', cant: 'sap6', mand: 'shí', english: 'ten (-p dropped)' },
      { char: '入', cant: 'jap6', mand: 'rù', english: 'enter (-p dropped)' },
      { char: '急', cant: 'gap1', mand: 'jí', english: 'urgent (-p dropped)' },
      { char: '國', cant: 'gwok3', mand: 'guó', english: 'country (-k dropped)' },
      { char: '學', cant: 'hok6', mand: 'xué', english: 'study (-k dropped)' },
      { char: '白', cant: 'baak6', mand: 'bái', english: 'white (-k dropped)' },
      { char: '北', cant: 'bak1', mand: 'běi', english: 'north (-k dropped)' },
      { char: '六', cant: 'luk6', mand: 'liù', english: 'six (-k dropped)' },
      { char: '黑', cant: 'hak1', mand: 'hēi', english: 'black (-k dropped)' },
    ],
  },
  {
    id: 'ng', shortTitle: 'ng- Drops', title: 'The ng- Drop Rule',
    cant: 'ng-', mand: 'w- / y- / (zero)', accuracy: '~85%',
    explanation: 'Cantonese kept the ng- nasal initial from Middle Chinese. Mandarin dropped it. Depending on the vowel that follows, it either becomes w-, y-, or just disappears.',
    tip: 'ngo5 我 → wǒ. ngaan5 眼 → yǎn. The pattern isn\'t perfectly predictable but w- and y- are the two things to try first.',
    examples: [
      { char: '我', cant: 'ngo5', mand: 'wǒ', english: 'I / me (ng→w)' },
      { char: '牛', cant: 'ngau4', mand: 'niú', english: 'cow (ng→n)' },
      { char: '眼', cant: 'ngaan5', mand: 'yǎn', english: 'eye (ng→y)' },
      { char: '外', cant: 'ngoi6', mand: 'wài', english: 'outside (ng→w)' },
      { char: '鵝', cant: 'ngo4', mand: 'é', english: 'goose (ng drops)' },
      { char: '岸', cant: 'ngon6', mand: 'àn', english: 'shore (ng drops)' },
      { char: '吳', cant: 'ng4', mand: 'wú', english: 'surname Wu (ng→w)' },
      { char: '咬', cant: 'ngaau5', mand: 'yǎo', english: 'bite (ng→y)' },
      { char: '額', cant: 'ngaak6', mand: 'é', english: 'forehead / amount (ng drops)' },
    ],
    exceptions: ['Some ng- words keep n- in Mandarin: 牛 ngau4→niú, 年 nin4→nián'],
  },
  {
    id: 'm-n', shortTitle: '-M → -N', title: 'The -M to -N Rule',
    cant: 'final -m', mand: 'final -n', accuracy: '~95%',
    explanation: 'Cantonese kept the final -m from Middle Chinese. Mandarin merged it into -n. No major exceptions — this one just works.',
    tip: 'sam1 心 → xīn. saam1 三 → sān. gam1 今 → jīn. Every Cantonese -m word ends in -n in Mandarin.',
    examples: [
      { char: '心', cant: 'sam1', mand: 'xīn', english: 'heart' },
      { char: '三', cant: 'saam1', mand: 'sān', english: 'three' },
      { char: '今', cant: 'gam1', mand: 'jīn', english: 'today / now' },
      { char: '音', cant: 'jam1', mand: 'yīn', english: 'sound / music' },
      { char: '深', cant: 'sam1', mand: 'shēn', english: 'deep' },
      { char: '金', cant: 'gam1', mand: 'jīn', english: 'gold' },
      { char: '南', cant: 'naam4', mand: 'nán', english: 'south' },
      { char: '感', cant: 'gam2', mand: 'gǎn', english: 'feel / sense' },
      { char: '林', cant: 'lam4', mand: 'lín', english: 'forest / surname' },
      { char: '尋', cant: 'cam4', mand: 'xún', english: 'search / seek' },
      { char: '減', cant: 'gaam2', mand: 'jiǎn', english: 'reduce / subtract' },
      { char: '念', cant: 'nim6', mand: 'niàn', english: 'think / read aloud' },
    ],
  },
  {
    id: 'f-h', shortTitle: 'F → F or HU', title: 'The F Split Rule',
    cant: 'f-', mand: 'f- or hu-', accuracy: '~70%',
    explanation: 'Cantonese f- splits into two groups in Mandarin: some stay f-, others shift to hu-. There\'s no clean rule — it depends on the specific word\'s history.',
    tip: '飛 fei1 → fēi, 飯 faan6 → fàn (f stays). 花 faa1 → huā, 火 fo2 → huǒ (f → hu). When unsure, hu- is the more common shift for round-vowel syllables.',
    examples: [
      { char: '飛', cant: 'fei1', mand: 'fēi', english: 'fly (f stays f)' },
      { char: '法', cant: 'faat3', mand: 'fǎ', english: 'law / method (f stays f)' },
      { char: '飯', cant: 'faan6', mand: 'fàn', english: 'rice / meal (f stays f)' },
      { char: '風', cant: 'fung1', mand: 'fēng', english: 'wind (f stays f)' },
      { char: '父', cant: 'fu6', mand: 'fù', english: 'father (f stays f)' },
      { char: '分', cant: 'fan1', mand: 'fēn', english: 'divide / minute (f stays f)' },
      { char: '花', cant: 'faa1', mand: 'huā', english: 'flower (f → hu)' },
      { char: '火', cant: 'fo2', mand: 'huǒ', english: 'fire (f → hu)' },
      { char: '化', cant: 'faa3', mand: 'huà', english: 'transform (f → hu)' },
      { char: '歡', cant: 'fun1', mand: 'huān', english: 'happy / joyful (f → hu)' },
      { char: '揮', cant: 'fai1', mand: 'huī', english: 'wave / wield (f → hu)' },
    ],
    exceptions: ['This rule has more exceptions than the others — when in doubt, try both f- and hu-'],
  },
]

/* ── Tone Mapping ─────────────────────────────── */
const TONES = [
  { cant: '1 陰平', cantDesc: 'high level', cantEx: 'si1 詩', mand: '1st ¯', mandEx: 'shī 詩', accuracy: '高', color: '#c0392b' },
  { cant: '2 陰上', cantDesc: 'high rising', cantEx: 'si2 史', mand: '3rd ˇ', mandEx: 'shǐ 史', accuracy: '中', color: '#d35400' },
  { cant: '3 陰去', cantDesc: 'mid level',   cantEx: 'si3 試', mand: '4th \\ (often)', mandEx: 'shì 試', accuracy: '中', color: '#d4a017' },
  { cant: '4 陽平', cantDesc: 'low falling',  cantEx: 'si4 時', mand: '2nd /', mandEx: 'shí 時', accuracy: '高', color: '#27ae60' },
  { cant: '5 陽上', cantDesc: 'low rising',   cantEx: 'si5 市', mand: '3rd or 4th ˇ\\', mandEx: 'varies', accuracy: '低', color: '#2471a3' },
  { cant: '6 陽去', cantDesc: 'low level',    cantEx: 'si6 事', mand: '4th \\ (often)', mandEx: 'shì 事', accuracy: '中', color: '#8e44ad' },
]

/* ── Vocabulary Swaps ─────────────────────────── */
interface VocabSwap { char: string; altChar?: string; cant: string; mand: string; english: string; note?: string }

const VOCAB_SECTIONS: Array<{ title: string; items: VocabSwap[] }> = [
  {
    title: 'Pronouns',
    items: [
      { char: '我', cant: 'ngo5', mand: 'wǒ', english: 'I / me', note: 'Same char, ng→w' },
      { char: '你', cant: 'nei5', mand: 'nǐ', english: 'you', note: 'Same char, similar sound' },
      { char: '佢', altChar: '他/她', cant: 'keoi5', mand: 'tā', english: 'he / she', note: 'Completely different char' },
      { char: '我哋', altChar: '我们', cant: 'ngo5 dei6', mand: 'wǒmen', english: 'we / us', note: '哋 vs 们 for plural' },
      { char: '你哋', altChar: '你们', cant: 'nei5 dei6', mand: 'nǐmen', english: 'you all' },
      { char: '佢哋', altChar: '他们', cant: 'keoi5 dei6', mand: 'tāmen', english: 'they / them' },
    ],
  },
  {
    title: 'Core Verbs',
    items: [
      { char: '食', altChar: '吃', cant: 'sik6', mand: 'chī', english: 'eat', note: 'Mandarin uses a different character entirely' },
      { char: '飲', altChar: '喝', cant: 'jam2', mand: 'hē', english: 'drink', note: 'Different character' },
      { char: '睇', altChar: '看', cant: 'tai2', mand: 'kàn', english: 'look / watch', note: '睇 is unique to Cantonese' },
      { char: '講', cant: 'gong2', mand: 'jiǎng / shuō', english: 'speak', note: '講 = 讲 (simplified), but 说 shuō is more common for "say"' },
      { char: '聽', cant: 'teng1', mand: 'tīng', english: 'listen', note: '聽→听 simplified, same meaning, different sound' },
      { char: '做', cant: 'zou6', mand: 'zuò', english: 'do / make', note: 'Same character, similar sound' },
      { char: '買', cant: 'maai5', mand: 'mǎi', english: 'buy', note: '買→买 simplified' },
      { char: '賣', cant: 'maai6', mand: 'mài', english: 'sell', note: '賣→卖 simplified' },
      { char: '走', cant: 'zau2', mand: 'zǒu', english: 'walk / leave (Mand.) / run (Cant.)', note: 'FALSE FRIEND — means "run" in Cant., "walk/go" in Mand.' },
      { char: '係', altChar: '是', cant: 'hai6', mand: 'shì', english: 'is / am / are', note: 'Different character' },
    ],
  },
  {
    title: 'Negation',
    items: [
      { char: '唔', altChar: '不', cant: 'm4', mand: 'bù', english: 'not', note: '唔 is unique to Cantonese' },
      { char: '冇', altChar: '没有', cant: 'mou5', mand: 'méiyǒu', english: "don't have / there is no", note: '冇 is a unique Cantonese character' },
      { char: '唔係', altChar: '不是', cant: 'm4 hai6', mand: 'bú shì', english: 'is not', note: 'Both negate "to be"' },
      { char: '唔知', altChar: '不知道', cant: 'm4 zi1', mand: 'bù zhīdào', english: "don't know", note: 'Cantonese is shorter' },
      { char: '唔好', altChar: '不要', cant: 'm4 hou2', mand: 'bú yào', english: "don't (imperative)", note: 'Both mean "don\'t do it"' },
    ],
  },
  {
    title: 'Particles & Function Words',
    items: [
      { char: '嘅', altChar: '的', cant: 'ge3', mand: 'de', english: 'possessive / descriptive particle', note: 'Different character, same function' },
      { char: '咗', altChar: '了', cant: 'zo2', mand: 'le', english: 'completion marker', note: '食咗 = 吃了 (have eaten)' },
      { char: '緊', altChar: '在/着', cant: 'gan2', mand: 'zài / zhe', english: 'progressive marker', note: '食緊 = 在吃 (eating now)' },
      { char: '喺', altChar: '在', cant: 'hai2', mand: 'zài', english: 'at / in (location)', note: 'Different character, same function' },
      { char: '俾', altChar: '给', cant: 'bei2', mand: 'gěi', english: 'give / to (indirect object)', note: '俾我 = 给我 (give me)' },
      { char: '咩', altChar: '吗', cant: 'me3', mand: 'ma', english: 'yes/no question particle', note: 'Both go at sentence end' },
      { char: '囉', altChar: '嘛', cant: 'lo3', mand: 'ma /嘛', english: 'obviouly / of course particle', note: 'Sentence-final softener' },
    ],
  },
  {
    title: 'Time & Place',
    items: [
      { char: '而家', altChar: '现在', cant: 'ji4 gaa1', mand: 'xiànzài', english: 'now', note: 'Completely different' },
      { char: '今日', altChar: '今天', cant: 'gam1 jat6', mand: 'jīntiān', english: 'today', note: '今 shared, 日→天 differs' },
      { char: '琴日', altChar: '昨天', cant: 'kam4 jat6', mand: 'zuótiān', english: 'yesterday', note: 'Completely different' },
      { char: '聽日', altChar: '明天', cant: 'ting1 jat6', mand: 'míngtiān', english: 'tomorrow', note: '聽 vs 明 differ' },
      { char: '呢度', altChar: '这里', cant: 'ni1 dou6', mand: 'zhèlǐ', english: 'here', note: 'Different' },
      { char: '嗰度', altChar: '那里', cant: 'go2 dou6', mand: 'nàlǐ', english: 'there', note: 'Different' },
      { char: '點', altChar: '怎么', cant: 'dim2', mand: 'zěnme', english: 'how', note: '點解 = 为什么 (why)' },
    ],
  },
  {
    title: 'Common Adjectives',
    items: [
      { char: '好', cant: 'hou2', mand: 'hǎo', english: 'good', note: 'Same char, slightly different tone pattern' },
      { char: '好', cant: 'hou2 (as "very")', mand: 'hěn', english: 'very (adverb)', note: 'TRICKY: 好 means "very" in Cant., but 很 means "very" in Mand.' },
      { char: '靚', altChar: '漂亮/美', cant: 'leng3', mand: 'piàoliang / měi', english: 'beautiful / pretty', note: '靚 is a Cantonese character' },
      { char: '大', cant: 'daai6', mand: 'dà', english: 'big', note: 'Same char, similar sound' },
      { char: '細', altChar: '小', cant: 'sai3', mand: 'xiǎo', english: 'small', note: 'Cant. 細 sai3, Mand. 小 xiǎo — different characters' },
      { char: '多', cant: 'do1', mand: 'duō', english: 'many / much', note: 'Same char, similar sound' },
    ],
  },
]

/* ── Grammar ─────────────────────────────────── */
const GRAMMAR = [
  {
    title: 'Negation',
    cant: '我唔識 (ngo5 m4 sik1)',
    mand: '我不知道 (wǒ bù zhīdào)',
    breakdown: [
      { cant: '唔', mand: '不', note: 'not' },
      { cant: '識', mand: '知道', note: 'know / understand' },
    ],
  },
  {
    title: 'Completed action (了/咗)',
    cant: '我食咗飯 (ngo5 sik6 zo2 faan6)',
    mand: '我吃了饭 (wǒ chī le fàn)',
    breakdown: [
      { cant: '食', mand: '吃', note: 'eat' },
      { cant: '咗', mand: '了', note: 'completion marker — placed right after the verb in both' },
      { cant: '飯', mand: '饭', note: 'rice/meal — same character, simplified' },
    ],
  },
  {
    title: 'Progressive (doing something now)',
    cant: '我食緊飯 (ngo5 sik6 gan2 faan6)',
    mand: '我在吃饭 (wǒ zài chī fàn)',
    breakdown: [
      { cant: '緊 (after verb)', mand: '在 (before verb)', note: 'KEY DIFFERENCE: Cantonese puts the marker after the verb; Mandarin puts 在 before it' },
    ],
  },
  {
    title: 'Giving / indirect object',
    cant: '佢俾錢我 (keoi5 bei2 cin2 ngo5)',
    mand: '他给我钱 (tā gěi wǒ qián)',
    breakdown: [
      { cant: '俾', mand: '给', note: 'give — same function word' },
      { cant: 'Direct obj before recipient', mand: 'Recipient before direct obj', note: 'WORD ORDER DIFFERS: Cant. gives money-then-me; Mand. gives me-then-money' },
    ],
  },
  {
    title: 'A-not-A questions',
    cant: '你好唔好？(nei5 hou2 m4 hou2)',
    mand: '你好不好？/ 你好吗？(nǐ hǎo bù hǎo / nǐ hǎo ma)',
    breakdown: [
      { cant: '唔', mand: '不', note: 'Both use A-不/唔-A — this structure is the SAME' },
    ],
  },
  {
    title: 'Disposal construction (把/將)',
    cant: '我將本書放低 (ngo5 zoeng1 bun2 syu1 fong3 dai1)',
    mand: '我把书放下 (wǒ bǎ shū fàng xià)',
    breakdown: [
      { cant: '將 zoeng1', mand: '把 bǎ', note: 'Both are disposal markers — takes the object and fronts it' },
      { cant: '放低', mand: '放下', note: 'put down — 低 vs 下 (both mean "down")' },
    ],
  },
]

/* ── Simplified chars ─────────────────────────── */
const SIMP = [
  { trad: '愛', simp: '爱', mand: 'ài', english: 'love' },
  { trad: '書', simp: '书', mand: 'shū', english: 'book' },
  { trad: '語', simp: '语', mand: 'yǔ', english: 'language' },
  { trad: '聽', simp: '听', mand: 'tīng', english: 'listen' },
  { trad: '說', simp: '说', mand: 'shuō', english: 'speak' },
  { trad: '學', simp: '学', mand: 'xué', english: 'learn/study' },
  { trad: '買', simp: '买', mand: 'mǎi', english: 'buy' },
  { trad: '賣', simp: '卖', mand: 'mài', english: 'sell' },
  { trad: '開', simp: '开', mand: 'kāi', english: 'open' },
  { trad: '國', simp: '国', mand: 'guó', english: 'country' },
  { trad: '來', simp: '来', mand: 'lái', english: 'come' },
  { trad: '問', simp: '问', mand: 'wèn', english: 'ask' },
  { trad: '關', simp: '关', mand: 'guān', english: 'close / concern' },
  { trad: '時', simp: '时', mand: 'shí', english: 'time' },
  { trad: '點', simp: '点', mand: 'diǎn', english: 'point / a little' },
  { trad: '長', simp: '长', mand: 'cháng', english: 'long' },
  { trad: '東', simp: '东', mand: 'dōng', english: 'east' },
  { trad: '體', simp: '体', mand: 'tǐ', english: 'body / form' },
  { trad: '這', simp: '这', mand: 'zhè', english: 'this' },
  { trad: '對', simp: '对', mand: 'duì', english: 'correct / toward' },
]

export default function CantonesePage() {
  useSEO({ title: 'Cantonese → Mandarin: The Copy & Paste Method', path: '/cantonese' })
  const [activeRule, setActiveRule] = useState(0)
  const [revealedVocab, setRevealedVocab] = useState<Set<string>>(new Set())
  const [revealAll, setRevealAll] = useState(false)

  function toggleVocab(key: string) {
    setRevealedVocab(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }

  const rule = SOUND_RULES[activeRule]

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="cm-page">

        {/* Hero */}
        <div className="cm-hero">
          <div className="cm-hero-badge">粵語 → 普通話</div>
          <h2 className="cm-title">Cantonese → Mandarin</h2>
          <p className="cm-subtitle">
            Most Cantonese speakers learning Mandarin are closer than they realise —
            the characters are already there, the tones already make sense.
            What's left is mostly pronunciation shifts you can predict.
          </p>
        </div>

        {/* Cheat sheet */}
        <section className="cm-section">
          <h3 className="cm-section-title">Quick Reference Cheat Sheet</h3>
          <p className="cm-note">The patterns that do most of the heavy lifting. Everything else in the modules below is detail.</p>
          <div className="cm-cheatsheet">

            <div className="cm-cs-block">
              <div className="cm-cs-title">Sound Rules</div>
              <div className="cm-cs-rows">
                {[
                  { rule: 'G → J', cant: 'gaa1 家', mand: 'jiā', acc: '~90%' },
                  { rule: '-T drop', cant: 'jat1 一', mand: 'yī', acc: '~95%' },
                  { rule: '-K drop', cant: 'hok6 學', mand: 'xué', acc: '~95%' },
                  { rule: '-P drop', cant: 'sap6 十', mand: 'shí', acc: '~95%' },
                  { rule: 'ng → w/y', cant: 'ngo5 我', mand: 'wǒ', acc: '~85%' },
                  { rule: '-M → -N', cant: 'sam1 心', mand: 'xīn', acc: '~95%' },
                  { rule: 'F → HU', cant: 'faa1 花', mand: 'huā', acc: '~70%' },
                ].map(r => (
                  <div key={r.rule} className="cm-cs-row">
                    <span className="cm-cs-rule">{r.rule}</span>
                    <span className="cm-cs-cant">{r.cant}</span>
                    <span className="cm-cs-arrow">→</span>
                    <span className="cm-cs-mand">{r.mand}</span>
                    <span className="cm-cs-acc">{r.acc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cm-cs-block">
              <div className="cm-cs-title">Must-Know Vocab Swaps</div>
              <div className="cm-cs-rows">
                {[
                  { cant: '食 sik6', mand: '吃 chī', eng: 'eat' },
                  { cant: '飲 jam2', mand: '喝 hē', eng: 'drink' },
                  { cant: '睇 tai2', mand: '看 kàn', eng: 'look/watch' },
                  { cant: '唔 m4', mand: '不 bù', eng: 'not' },
                  { cant: '冇 mou5', mand: '没有 méiyǒu', eng: "don't have" },
                  { cant: '佢 keoi5', mand: '他/她 tā', eng: 'he/she' },
                  { cant: '係 hai6', mand: '是 shì', eng: 'is/am/are' },
                  { cant: '而家 ji4gaa1', mand: '现在 xiànzài', eng: 'now' },
                ].map(r => (
                  <div key={r.cant} className="cm-cs-row">
                    <span className="cm-cs-cant">{r.cant}</span>
                    <span className="cm-cs-arrow">→</span>
                    <span className="cm-cs-mand">{r.mand}</span>
                    <span className="cm-cs-acc cm-cs-eng">{r.eng}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cm-cs-block">
              <div className="cm-cs-title">Tone Mapping (rough guide)</div>
              <div className="cm-cs-rows">
                {[
                  { cant: 'Tone 1 陰平 (high)', mand: '1st tone ¯', acc: 'High' },
                  { cant: 'Tone 2 陰上 (rising)', mand: '3rd tone ˇ', acc: 'Mid' },
                  { cant: 'Tone 3 陰去 (mid)', mand: '4th tone \\', acc: 'Mid' },
                  { cant: 'Tone 4 陽平 (low fall)', mand: '2nd tone /', acc: 'High' },
                  { cant: 'Tone 5 陽上 (low rise)', mand: '3rd or 4th', acc: 'Low' },
                  { cant: 'Tone 6 陽去 (low level)', mand: '4th tone \\', acc: 'Mid' },
                ].map(r => (
                  <div key={r.cant} className="cm-cs-row">
                    <span className="cm-cs-cant" style={{ flex: 2 }}>{r.cant}</span>
                    <span className="cm-cs-arrow">→</span>
                    <span className="cm-cs-mand">{r.mand}</span>
                    <span className={`cm-cs-acc cm-cs-rel-${r.acc.toLowerCase()}`}>{r.acc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Key Differences / Exceptions */}
        <section className="cm-section">
          <h3 className="cm-section-title">The Traps</h3>
          <p className="cm-note">Knowing the rules gets you 80% there. These are the other 20% — places where Cantonese intuition actively misleads you.</p>
          <div className="cm-diff-grid">
            {[
              {
                tag: 'False Friend',
                color: '#c0392b',
                title: '走 means different things',
                cant: '走 zau2 = run / flee',
                mand: '走 zǒu = walk / leave',
                note: 'If you say 走 meaning "run" in Mandarin, people will think you said "leave".',
              },
              {
                tag: 'False Friend',
                color: '#c0392b',
                title: '好 as "very"',
                cant: '好靚 hou2 leng3 = very pretty',
                mand: '很漂亮 hěn piàoliang (NOT 好)',
                note: '好 hǎo in Mandarin means "good" — use 很 hěn for "very".',
              },
              {
                tag: 'Word Order',
                color: '#d35400',
                title: 'Give sentence order flips',
                cant: '佢俾錢我 — give money me',
                mand: '他给我钱 — give me money',
                note: 'Cantonese: verb → object → recipient. Mandarin: verb → recipient → object.',
              },
              {
                tag: 'Grammar',
                color: '#2471a3',
                title: 'Progressive marker position',
                cant: '食緊 — eat [marker] (after verb)',
                mand: '在吃 — [marker] eat (before verb)',
                note: 'Cantonese 緊 comes after the verb; Mandarin 在 comes before.',
              },
              {
                tag: 'Grammar',
                color: '#2471a3',
                title: 'No 嘅/的 needed for predicates',
                cant: '佢係好人嘅 — he is good person 嘅',
                mand: '他是好人 — no particle needed',
                note: 'Cantonese uses 嘅 at sentence end for softening; Mandarin drops it in simple predicate sentences.',
              },
              {
                tag: 'Sound Exception',
                color: '#8e44ad',
                title: 'F → HU is inconsistent',
                cant: '飛 fei1 → fēi (f stays)',
                mand: '花 faa1 → huā (f → hu)',
                note: 'Unlike the other 4 rules, F split has ~30% exceptions. When in doubt, try both.',
              },
              {
                tag: 'Sound Exception',
                color: '#8e44ad',
                title: 'ng- sometimes stays as n-',
                cant: '牛 ngau4 → niú (ng → n)',
                mand: '年 nin4 → nián (ng → n)',
                note: 'ng- usually drops to w- or y-, but before certain vowels it softens to n- instead.',
              },
              {
                tag: 'Vocab Gap',
                color: '#27ae60',
                title: 'Cantonese-only characters',
                cant: '唔 冇 咗 嘅 喺 俾 睇',
                mand: 'None of these exist in Mandarin',
                note: 'These characters were invented for Cantonese. You must swap them — there is no sound rule that helps.',
              },
            ].map(d => (
              <div key={d.title} className="cm-diff-card">
                <div className="cm-diff-tag" style={{ background: d.color }}>{d.tag}</div>
                <div className="cm-diff-title">{d.title}</div>
                <div className="cm-diff-rows">
                  <div className="cm-diff-row"><span className="cm-diff-badge cant-badge">粵</span>{d.cant}</div>
                  <div className="cm-diff-row"><span className="cm-diff-badge mand-badge">普</span>{d.mand}</div>
                </div>
                <div className="cm-diff-note">{d.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Your advantage */}
        <section className="cm-section">
          <h3 className="cm-section-title">What You're Starting With</h3>
          <div className="cm-advantage-grid">
            <div className="cm-adv adv-yes">
              <div className="cm-adv-head">Already in your head</div>
              <ul>
                <li><strong>Chinese characters</strong> — Traditional maps to Simplified; most are recognisable even if different</li>
                <li><strong>Tonal instinct</strong> — You already hear tones as meaning. Going from 6 to 4 is far easier than learning tones from scratch</li>
                <li><strong>Sentence structure</strong> — Both SVO. The bones of a sentence transfer well</li>
                <li><strong>A large chunk of vocabulary</strong> — Shared characters with the same or similar meaning</li>
              </ul>
            </div>
            <div className="cm-adv adv-learn">
              <div className="cm-adv-head">What actually needs work</div>
              <ul>
                <li><strong>Pronunciation shifts</strong> — The 5 rules on this page cover most of it</li>
                <li><strong>Retroflex sounds</strong> — zh, ch, sh, r don't exist in Cantonese and take real practice</li>
                <li><strong>~30 vocab swaps</strong> — Common words that Mandarin does differently (食→吃, 唔→不, etc.)</li>
                <li><strong>Tone remapping</strong> — Your 6 tones don't map 1:1, but the overlap patterns are learnable</li>
                <li><strong>Simplified characters</strong> — A minority look very different; most you can guess</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sound Rules */}
        <section className="cm-section">
          <h3 className="cm-section-title">Module 1 — Sound Shifts</h3>
          <p className="cm-note">Five patterns that cover the majority of pronunciation differences. They're not perfect, but they're predictive enough to be genuinely useful.</p>

          <div className="cm-rule-tabs">
            {SOUND_RULES.map((r, i) => (
              <button
                key={r.id}
                className={`cm-rule-tab${activeRule === i ? ' active' : ''}`}
                onClick={() => setActiveRule(i)}
              >
                {r.shortTitle}
              </button>
            ))}
          </div>

          <div className="cm-rule-card">
            <div className="cm-rule-header">
              <div>
                <h4 className="cm-rule-title">{rule.title}</h4>
                <div className="cm-rule-pattern">
                  <span className="cm-rp-cant">{rule.cant}</span>
                  <span className="cm-rp-arrow">→</span>
                  <span className="cm-rp-mand">{rule.mand}</span>
                  <span className="cm-rp-acc">{rule.accuracy} accuracy</span>
                </div>
              </div>
            </div>
            <p className="cm-rule-exp">{rule.explanation}</p>
            <div className="cm-rule-tip">
              <span className="cm-tip-icon">💡</span>
              {rule.tip}
            </div>

            <div className="cm-examples-grid">
              {rule.examples.map(ex => (
                <div key={ex.char} className="cm-example">
                  <span className="cm-ex-char">{ex.char}</span>
                  <div className="cm-ex-pron">
                    <span className="cm-ex-cant">{ex.cant}</span>
                    <span className="cm-ex-arrow">→</span>
                    <span className="cm-ex-mand">{ex.mand}</span>
                  </div>
                  <span className="cm-ex-eng">{ex.english}</span>
                </div>
              ))}
            </div>

            {rule.exceptions && (
              <div className="cm-exceptions">
                <strong>Note:</strong> {rule.exceptions.join(' · ')}
              </div>
            )}
          </div>
        </section>

        {/* Tone Mapping */}
        <section className="cm-section">
          <h3 className="cm-section-title">Module 2 — Tone Mapping</h3>
          <p className="cm-note">
            Cantonese tone 1 and tone 4 map cleanly to Mandarin. The others are messier — tones 3 and 6 both often land on Mandarin 4th, and tones 2 and 5 overlap on Mandarin 3rd.
            Don't try to memorise this table — use it to verify words you already half-know.
          </p>
          <div className="cm-tone-grid">
            {TONES.map(t => (
              <div key={t.cant} className="cm-tone-card" style={{ borderTop: `3px solid ${t.color}` }}>
                <div className="cm-tone-cant" style={{ color: t.color }}>{t.cant}</div>
                <div className="cm-tone-cant-desc">{t.cantDesc}</div>
                <div className="cm-tone-ex-cant">{t.cantEx}</div>
                <div className="cm-tone-arrow">↓</div>
                <div className="cm-tone-mand">{t.mand}</div>
                <div className="cm-tone-ex-mand">{t.mandEx}</div>
                <div className={`cm-tone-acc cm-acc-${t.accuracy}`}>{t.accuracy} reliability</div>
              </div>
            ))}
          </div>
          <div className="cm-tone-note">
            Cantonese tones 3 and 6 (both level tones at mid/low pitch) frequently become Mandarin tone 4.
            Tones 2 and 5 often land on Mandarin tone 3. These overlaps are normal — context fills the gaps.
          </div>
        </section>

        {/* Retroflex section */}
        <section className="cm-section">
          <h3 className="cm-section-title">Module 3 — Retroflex Sounds</h3>
          <p className="cm-note">zh, ch, sh, r — these are the only sounds in Mandarin with no Cantonese equivalent. Everything else is a shift of something you already have.</p>
          <div className="cm-retro-grid">
            {[
              { mand: 'zh', cant: 'z', ex: '中 zhōng (zung1)', desc: 'Curl tongue back, unaspirated' },
              { mand: 'ch', cant: 'c', ex: '車 chē (ce1)', desc: 'Curl tongue back, aspirated' },
              { mand: 'sh', cant: 's', ex: '是 shì (hai6)', desc: 'Curl tongue back, fricative' },
              { mand: 'r', cant: '(none)', ex: '人 rén (jan4)', desc: 'Retroflex approximant — like a "j" with tongue curled back' },
            ].map(r => (
              <div key={r.mand} className="cm-retro-card">
                <div className="cm-retro-pair">
                  <span className="cm-retro-mand">{r.mand}</span>
                  <span className="cm-retro-eq">≈</span>
                  <span className="cm-retro-cant">{r.cant}</span>
                </div>
                <div className="cm-retro-ex">{r.ex}</div>
                <div className="cm-retro-desc">{r.desc}</div>
              </div>
            ))}
          </div>
          <div className="cm-callout">
            A lot of Mandarin speakers — especially in Taiwan and southern China — don't fully retroflex zh/ch/sh in casual speech. Your Cantonese z/c/s will be understood while you're still practising. The one that actually matters early on is r: it has no Cantonese equivalent at all and it will stand out when you get it wrong.
          </div>
        </section>

        {/* Vocabulary swaps */}
        <section className="cm-section">
          <h3 className="cm-section-title">Module 4 — Vocabulary Swaps</h3>
          <p className="cm-note">
            The words where Cantonese and Mandarin just do it differently — different characters, different sounds, sometimes both.
            Click a card to reveal the Mandarin.
          </p>
          <div className="cm-reveal-ctrl">
            <button className="cm-reveal-all" onClick={() => { setRevealAll(r => !r); setRevealedVocab(new Set()) }}>
              {revealAll ? 'Hide all Mandarin' : 'Reveal all Mandarin'}
            </button>
          </div>

          {VOCAB_SECTIONS.map(sec => (
            <div key={sec.title} className="cm-vocab-section">
              <h4 className="cm-vocab-section-title">{sec.title}</h4>
              <div className="cm-vocab-grid">
                {sec.items.map((item, i) => {
                  const key = `${sec.title}-${i}`
                  const shown = revealAll || revealedVocab.has(key)
                  return (
                    <div
                      key={key}
                      className={`cm-vocab-card${shown ? ' revealed' : ''}`}
                      onClick={() => toggleVocab(key)}
                    >
                      <div className="cm-vc-chars">
                        <span className="cm-vc-trad">{item.char}</span>
                        {item.altChar && <span className="cm-vc-alt">→ {item.altChar}</span>}
                      </div>
                      <div className="cm-vc-cant">
                        <span className="cm-vc-badge cm-vc-cant-badge">粵</span>
                        {item.cant}
                      </div>
                      <div className={`cm-vc-mand${shown ? '' : ' hidden'}`}>
                        <span className="cm-vc-badge cm-vc-mand-badge">普</span>
                        {shown ? item.mand : '•••'}
                      </div>
                      <div className="cm-vc-english">{item.english}</div>
                      {item.note && <div className="cm-vc-note">{item.note}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Grammar */}
        <section className="cm-section">
          <h3 className="cm-section-title">Module 5 — Grammar</h3>
          <p className="cm-note">Most of it transfers. These are the places it doesn't.</p>
          <div className="cm-grammar-list">
            {GRAMMAR.map(g => (
              <div key={g.title} className="cm-grammar-card">
                <h4 className="cm-grammar-title">{g.title}</h4>
                <div className="cm-grammar-sentences">
                  <div className="cm-gs-row">
                    <span className="cm-gs-badge cant-badge">粵</span>
                    <span className="cm-gs-text">{g.cant}</span>
                  </div>
                  <div className="cm-gs-row">
                    <span className="cm-gs-badge mand-badge">普</span>
                    <span className="cm-gs-text">{g.mand}</span>
                  </div>
                </div>
                {g.breakdown.length > 0 && (
                  <div className="cm-grammar-breakdown">
                    {g.breakdown.map((b, i) => (
                      <div key={i} className="cm-gb-row">
                        <span className="cm-gb-cant">{b.cant}</span>
                        <span className="cm-gb-arrow">↔</span>
                        <span className="cm-gb-mand">{b.mand}</span>
                        {b.note && <span className="cm-gb-note">— {b.note}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Simplified characters */}
        <section className="cm-section">
          <h3 className="cm-section-title">Module 6 — Traditional → Simplified</h3>
          <p className="cm-note">
            Most simplified characters are close enough to guess from traditional. These are the ones that aren't — they changed significantly enough to trip you up.
          </p>
          <div className="cm-simp-grid">
            {SIMP.map(s => (
              <div key={s.trad} className="cm-simp-card">
                <div className="cm-simp-pair">
                  <span className="cm-simp-trad">{s.trad}</span>
                  <span className="cm-simp-arrow">→</span>
                  <span className="cm-simp-simp">{s.simp}</span>
                </div>
                <div className="cm-simp-mand">{s.mand}</div>
                <div className="cm-simp-eng">{s.english}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="cm-footer">
          <p>
            Approach inspired by Sheldon Ho's work on systematic Cantonese–Mandarin transfer.
            The core insight — that the shift is predictable, not arbitrary — makes a real difference to how you study.
          </p>
        </div>

      </div>
    </div>
  )
}
