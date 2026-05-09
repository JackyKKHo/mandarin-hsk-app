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
    explanation: 'Cantonese g- initial almost always becomes j- in Mandarin. This is the single most powerful copy & paste rule.',
    tip: 'When you see g- in Jyutping, think j- in Pinyin. 家 gaa1 → jiā. Try it with every g- word you know.',
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
    explanation: 'Cantonese kept the entering tones (入聲) from Middle Chinese — short syllables ending in -p, -t, or -k. Mandarin lost them all. Strip the final consonant and you\'re usually right.',
    tip: 'See a Cantonese word ending in -p, -t, or -k? Drop it. 食 sik → shí. 一 jat → yī. 入 jap → rù.',
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
    explanation: 'Cantonese preserved the Middle Chinese ng- nasal initial. Mandarin dropped it entirely — the word either starts with w-, y-, or a vowel directly.',
    tip: '我 is ngo5 in Cantonese but wǒ in Mandarin. The ng is gone. Look for w- or y- as the Mandarin replacement.',
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
    explanation: 'Cantonese kept the final -m from Middle Chinese. Mandarin merged it into -n. This rule is extremely consistent.',
    tip: 'If a Cantonese word ends in -m, the Mandarin version ends in -n. 心 sam1 → xīn. 三 saam1 → sān.',
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
    explanation: 'Cantonese f- words split into two groups in Mandarin: some stay f-, others become hu-. No perfect rule, but knowing both possibilities helps a lot.',
    tip: 'When Cantonese f- is followed by a back/round vowel (o, oo), it often becomes hu- in Mandarin. Before flat vowels (aa, an, ung), it usually stays f-.',
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
          <div className="cm-hero-badge">Copy & Paste Method™</div>
          <h2 className="cm-title">Cantonese → Mandarin</h2>
          <p className="cm-subtitle">
            You already know the characters, the tones, and the grammar structure.
            The gap is smaller than you think — learn the patterns, not the words.
          </p>
        </div>

        {/* Your advantage */}
        <section className="cm-section">
          <h3 className="cm-section-title">Your Unfair Advantage</h3>
          <div className="cm-advantage-grid">
            <div className="cm-adv adv-yes">
              <div className="cm-adv-head">✓ You already know</div>
              <ul>
                <li><strong>All Chinese characters</strong> — Traditional chars map directly to Simplified</li>
                <li><strong>Tonal awareness</strong> — You already feel tones. 6 tones → 4 is easier than 0 → 4</li>
                <li><strong>Grammar structure</strong> — Both are SVO. Most sentence patterns transfer</li>
                <li><strong>~60–70% of vocabulary</strong> — Shared characters, often same or similar meaning</li>
                <li><strong>Cultural context</strong> — Idioms, number superstitions, social norms</li>
              </ul>
            </div>
            <div className="cm-adv adv-learn">
              <div className="cm-adv-head">→ What you need to learn</div>
              <ul>
                <li><strong>5 pronunciation rules</strong> — Systematic sound shifts you can predict</li>
                <li><strong>Tone remapping</strong> — Map your 6 Cantonese tones to 4 Mandarin tones</li>
                <li><strong>~30 key vocabulary swaps</strong> — High-frequency words that differ</li>
                <li><strong>Retroflex sounds</strong> — zh, ch, sh, r (Cantonese has no equivalents)</li>
                <li><strong>Simplified characters</strong> — ~20% differ significantly; rest are recognisable</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sound Rules */}
        <section className="cm-section">
          <h3 className="cm-section-title">Module 1 — The 5 Copy & Paste Sound Rules</h3>
          <p className="cm-note">Learn these 5 rules and you can predict Mandarin pronunciation from Cantonese ~85% of the time.</p>

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
          <h3 className="cm-section-title">Module 2 — Tone Mapping (80% Accuracy)</h3>
          <p className="cm-note">
            You can predict the correct Mandarin tone from your Cantonese tone about 80% of the time.
            Tones 1 and 4 map most reliably. Tones 2, 3, 5, 6 overlap in Mandarin.
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
          <h3 className="cm-section-title">Module 3 — Retroflex Sounds (zh, ch, sh, r)</h3>
          <p className="cm-note">Cantonese has no retroflex consonants. These are the only truly new sounds you need to learn.</p>
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
            <strong>Shortcut:</strong> In casual spoken Mandarin, many native speakers (especially in Taiwan and the south) pronounce zh/ch/sh without full retroflexion. You can often get away with using your Cantonese z/c/s while you practice. Prioritise r — it has no Cantonese equivalent and will stand out most.
          </div>
        </section>

        {/* Vocabulary swaps */}
        <section className="cm-section">
          <h3 className="cm-section-title">Module 4 — Essential Vocabulary Swaps</h3>
          <p className="cm-note">
            These are the most common words that differ between Cantonese and Mandarin.
            Click any card to reveal the Mandarin pronunciation.
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
          <h3 className="cm-section-title">Module 5 — Grammar Differences</h3>
          <p className="cm-note">Most grammar transfers directly. Here are the key differences to know.</p>
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
          <h3 className="cm-section-title">Module 6 — Traditional to Simplified</h3>
          <p className="cm-note">
            Most characters are identical or near-identical. These ~20 are the most common ones that changed significantly — learn to recognise them.
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
            Inspired by Sheldon Ho's Copy & Paste Method — the insight that Cantonese speakers can predict
            Mandarin systematically rather than memorising from scratch.
            This reference is free. The patterns are yours to keep.
          </p>
        </div>

      </div>
    </div>
  )
}
