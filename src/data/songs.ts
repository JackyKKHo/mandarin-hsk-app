export interface LyricLine {
  chinese: string
  pinyin: string
  english: string
  note?: string
}

export interface SongVocab {
  simplified: string
  pinyin: string
  english: string
  hskLevel: number
  note: string
}

export interface Song {
  id: string
  title: string
  titlePinyin: string
  artist: string
  year: number
  difficulty: 'Beginner' | 'Elementary' | 'Intermediate'
  hskRange: string
  description: string
  culturalNote: string
  learningTips: string[]
  sections: { label: string; lines: LyricLine[] }[]
  vocab: SongVocab[]
  youtubeId: string
}

export const SONGS: Song[] = [
  {
    youtubeId: 'IiFm7AWP9n4',
    id: 'moon',
    title: '月亮代表我的心',
    titlePinyin: 'Yuèliàng Dàibiǎo Wǒ de Xīn',
    artist: '邓丽君 (Teresa Teng)',
    year: 1977,
    difficulty: 'Beginner',
    hskRange: 'HSK 1–3',
    description: 'Arguably the most beloved Chinese-language song ever recorded. Teresa Teng\'s gentle ballad about undying love is known by virtually every Chinese speaker across generations. Its simple, repetitive structure and everyday vocabulary make it perfect for learners.',
    culturalNote: 'Teresa Teng (邓丽君, 1953–1995) was a Taiwanese singer whose music reached every corner of the Chinese-speaking world. There\'s a famous saying: "There\'s a place where the sun shines, there\'s a place where Teresa Teng\'s music plays." This song is often the first thing Chinese people teach foreigners to sing.',
    learningTips: [
      'The phrase 有多深 (yǒu duō shēn) means "how deep" — 多 + adjective is a common pattern for "how + adjective".',
      '有几分 (yǒu jǐ fēn) means "how much" — 几分 literally "how many parts", used colloquially for degree.',
      'Reduplication: 轻轻 (qīngqīng) intensifies 轻 (light/gentle). This doubling pattern appears throughout Chinese.',
      '已经 (yǐjīng) meaning "already" is one of the most useful adverbs in Mandarin — learn it early.',
      'The chorus repeats 3 times — great for drilling the tones on 月亮代表我的心.',
    ],
    sections: [
      {
        label: 'Verse 1',
        lines: [
          { chinese: '你问我爱你有多深', pinyin: 'Nǐ wèn wǒ ài nǐ yǒu duō shēn', english: 'You ask how deeply I love you', note: '有多深 = "how deep" — a useful pattern' },
          { chinese: '我爱你有几分', pinyin: 'Wǒ ài nǐ yǒu jǐ fēn', english: 'How much I love you' },
          { chinese: '你去想一想', pinyin: 'Nǐ qù xiǎng yi xiǎng', english: 'Think about it', note: 'V + 一 + V = do something briefly — xiǎng yi xiǎng = "think a little"' },
          { chinese: '你去看一看', pinyin: 'Nǐ qù kàn yi kàn', english: 'Take a look' },
          { chinese: '月亮代表我的心', pinyin: 'Yuèliàng dàibiǎo wǒ de xīn', english: 'The moon represents my heart' },
        ],
      },
      {
        label: 'Bridge',
        lines: [
          { chinese: '轻轻的一个吻', pinyin: 'Qīngqīng de yī gè wěn', english: 'A gentle kiss', note: '轻轻 = gentle/soft (reduplicated adjective)' },
          { chinese: '已经打动我的心', pinyin: 'Yǐjīng dǎdòng wǒ de xīn', english: 'Has already moved my heart', note: '已经 = already; 打动 = to move/touch emotionally' },
          { chinese: '深深的一段情', pinyin: 'Shēnshēn de yī duàn qíng', english: 'A deep, lasting love', note: '一段情 = a period/stretch of romance (段 is the measure word for sections)' },
          { chinese: '叫我思念到如今', pinyin: 'Jiào wǒ sīniàn dào rújīn', english: 'Makes me miss you to this day', note: '叫 here means "makes/causes" — not just "to call"' },
        ],
      },
      {
        label: 'Chorus (repeats 3×)',
        lines: [
          { chinese: '你问我爱你有多深', pinyin: 'Nǐ wèn wǒ ài nǐ yǒu duō shēn', english: 'You ask how deeply I love you' },
          { chinese: '我爱你有几分', pinyin: 'Wǒ ài nǐ yǒu jǐ fēn', english: 'How much I love you' },
          { chinese: '你去想一想', pinyin: 'Nǐ qù xiǎng yi xiǎng', english: 'Think about it' },
          { chinese: '你去看一看', pinyin: 'Nǐ qù kàn yi kàn', english: 'Take a look' },
          { chinese: '月亮代表我的心', pinyin: 'Yuèliàng dàibiǎo wǒ de xīn', english: 'The moon represents my heart' },
        ],
      },
    ],
    vocab: [
      { simplified: '月亮', pinyin: 'yuèliàng', english: 'moon', hskLevel: 2, note: '月 (yuè) alone means month or moon — 亮 means bright.' },
      { simplified: '代表', pinyin: 'dàibiǎo', english: 'to represent', hskLevel: 3, note: 'Also used as a noun: 代表 = representative, delegate.' },
      { simplified: '爱', pinyin: 'ài', english: 'to love', hskLevel: 1, note: 'The character combines 爪 (claw/hand), 心 (heart), and 友 (friend).' },
      { simplified: '深', pinyin: 'shēn', english: 'deep', hskLevel: 3, note: 'Opposite: 浅 (qiǎn) = shallow. Also used for colours: 深红 = dark red.' },
      { simplified: '轻轻', pinyin: 'qīngqīng', english: 'gently, softly', hskLevel: 3, note: 'Reduplicated form of 轻 (light). Reduplication adds a softer, affectionate tone.' },
      { simplified: '已经', pinyin: 'yǐjīng', english: 'already', hskLevel: 2, note: 'Essential adverb. Goes before the verb: 我已经吃了 = I have already eaten.' },
      { simplified: '打动', pinyin: 'dǎdòng', english: 'to move / touch emotionally', hskLevel: 4, note: '打 (hit) + 动 (move) — to strike someone\'s emotions.' },
      { simplified: '思念', pinyin: 'sīniàn', english: 'to miss / long for', hskLevel: 4, note: 'More literary than 想念 — often found in songs and poetry.' },
      { simplified: '如今', pinyin: 'rújīn', english: 'nowadays / to this day', hskLevel: 4, note: 'Slightly formal/literary. Everyday alternative: 现在 (xiànzài).' },
      { simplified: '心', pinyin: 'xīn', english: 'heart / mind', hskLevel: 2, note: 'Appears in dozens of compounds: 心情 (mood), 小心 (careful), 开心 (happy).' },
    ],
  },
  {
    youtubeId: 'd_4AKkBIWpc',
    id: 'jasmine',
    title: '茉莉花',
    titlePinyin: 'Mòlìhuā',
    artist: '传统民歌 (Traditional folk song)',
    year: 1700,
    difficulty: 'Beginner',
    hskRange: 'HSK 1–2',
    description: 'One of China\'s most iconic folk songs, originating in Jiangsu province. It was performed at the 2008 Beijing Olympics and is often the first Chinese song foreigners encounter. The language is simple and poetic, built around describing a beautiful flower.',
    culturalNote: 'The jasmine (茉莉花) symbolises purity and grace in Chinese culture. This melody has been used by Western composers including Puccini in Turandot. It is sometimes called China\'s unofficial second national anthem.',
    learningTips: [
      '好一朵 is a set phrase meaning "what a beautiful…" — 好 here is exclamatory, not just "good".',
      '量词 (measure words): 朵 (duǒ) is the measure word for flowers. 一朵花 = one flower.',
      '满枝桠 (full branches) — 满 means "full of / filled with". 满 + location is a common pattern.',
      'The character 摘 (zhāi) means to pick/pluck — useful for fruit, flowers, and even downloading files in modern usage.',
    ],
    sections: [
      {
        label: 'Verse 1',
        lines: [
          { chinese: '好一朵美丽的茉莉花', pinyin: 'Hǎo yī duǒ měilì de mòlìhuā', english: 'What a beautiful jasmine flower', note: '好一朵 = exclamatory "what a…"; 朵 is the measure word for flowers' },
          { chinese: '好一朵美丽的茉莉花', pinyin: 'Hǎo yī duǒ měilì de mòlìhuā', english: 'What a beautiful jasmine flower' },
          { chinese: '芬芳美丽满枝桠', pinyin: 'Fēnfāng měilì mǎn zhī yā', english: 'Fragrant and beautiful, filling every branch', note: '满 = full of, filled with' },
          { chinese: '又香又白人人夸', pinyin: 'Yòu xiāng yòu bái rénrén kuā', english: 'Both fragrant and white, praised by all', note: '又…又… = both… and…; 人人 = everyone (lit. person-person)' },
          { chinese: '让我来将你摘下', pinyin: 'Ràng wǒ lái jiāng nǐ zhāi xià', english: 'Let me come and pick you', note: '让 = let/allow; 摘 = to pluck/pick' },
          { chinese: '送给别人家', pinyin: 'Sòng gěi biérén jiā', english: 'And give you to someone\'s home' },
          { chinese: '茉莉花啊茉莉花', pinyin: 'Mòlìhuā a mòlìhuā', english: 'Jasmine flower, oh jasmine flower', note: '啊 (a) is a softening particle expressing feeling — untranslatable but sounds natural' },
        ],
      },
    ],
    vocab: [
      { simplified: '美丽', pinyin: 'měilì', english: 'beautiful', hskLevel: 2, note: 'More formal than 好看. Used for scenery, people, and abstract things.' },
      { simplified: '芬芳', pinyin: 'fēnfāng', english: 'fragrant, sweet-smelling', hskLevel: 5, note: 'Literary word — you\'d use 香 in everyday speech, but 芬芳 in poetry.' },
      { simplified: '满', pinyin: 'mǎn', english: 'full, filled with', hskLevel: 3, note: '满 + place: 满街都是人 = the streets are full of people.' },
      { simplified: '香', pinyin: 'xiāng', english: 'fragrant / delicious', hskLevel: 2, note: 'Used for both smell and taste — 这个菜很香 = this dish smells/tastes amazing.' },
      { simplified: '让', pinyin: 'ràng', english: 'to let / allow / make', hskLevel: 2, note: '让 + person + verb is essential: 让我看看 = let me see.' },
      { simplified: '送', pinyin: 'sòng', english: 'to give (as a gift) / to send', hskLevel: 2, note: 'Different from 给 — 送 implies a gift. 送礼物 = to give a gift.' },
    ],
  },
  {
    id: 'sweet',
    youtubeId: '5eF8oOWtsk4',
    title: '甜蜜蜜',
    titlePinyin: 'Tián Mì Mì',
    artist: '邓丽君 (Teresa Teng)',
    year: 1979,
    difficulty: 'Beginner',
    hskRange: 'HSK 1–3',
    description: 'A warm, joyful love song comparing the feeling of being in love to sweetness and honey. One of Teresa Teng\'s most recognisable songs, originally based on an Indonesian folk melody. The repeating sweetness imagery makes it easy and enjoyable for learners to follow.',
    culturalNote: '甜蜜蜜 was made internationally famous by the 1996 Hong Kong film of the same name starring Maggie Cheung and Leon Lai. The film follows two mainland Chinese immigrants in Hong Kong who bond over their shared love of Teresa Teng\'s music — making this song a symbol of nostalgia, longing, and connection across generations.',
    learningTips: [
      '甜蜜蜜 uses reduplication (蜜蜜) to intensify 甜 (sweet). This pattern — repeating a syllable — is very common for adjectives and adverbs.',
      '你笑得甜蜜蜜 — 得 here links a verb to its complement. V + 得 + description is one of the most important grammar patterns to master.',
      '好像 (hǎoxiàng) means "it seems like / as if" — extremely common in spoken Chinese.',
      '在哪里 (zài nǎlǐ) = "where is / where are" — the basic location question pattern.',
      'The phrase 梦里 (mèng lǐ) = "in a dream" — 里 attached to a noun means "inside/within it".',
    ],
    sections: [
      {
        label: 'Verse 1',
        lines: [
          { chinese: '甜蜜蜜，你笑得甜蜜蜜', pinyin: 'Tián mì mì, nǐ xiào de tián mì mì', english: 'So sweet, your smile is so sweet', note: 'V + 得 + adj describes how an action is done — 笑得甜蜜蜜 = "smile sweetly"' },
          { chinese: '好像花儿开在春风里', pinyin: 'Hǎoxiàng huā er kāi zài chūnfēng lǐ', english: 'Like flowers blooming in the spring breeze', note: '好像 = as if / like; 儿 (er) is a Beijing dialect suffix adding warmth' },
          { chinese: '开在春风里', pinyin: 'Kāi zài chūnfēng lǐ', english: 'Blooming in the spring breeze' },
        ],
      },
      {
        label: 'Verse 2',
        lines: [
          { chinese: '在哪里，在哪里见过你', pinyin: 'Zài nǎlǐ, zài nǎlǐ jiànguò nǐ', english: 'Where, where have I seen you before', note: '在哪里 = where; 见过 = have seen (过 marks a past experience)' },
          { chinese: '你的笑容这样熟悉', pinyin: 'Nǐ de xiàoróng zhèyàng shúxi', english: 'Your smile is so familiar', note: '这样 = this way / so (like this); 熟悉 = familiar' },
          { chinese: '我一时想不起', pinyin: 'Wǒ yīshí xiǎng bu qǐ', english: 'I can\'t quite remember', note: '想不起 = can\'t recall — potential complement V + 不 + result' },
        ],
      },
      {
        label: 'Chorus',
        lines: [
          { chinese: '啊，在梦里', pinyin: 'Ā, zài mèng lǐ', english: 'Ah, in a dream', note: '梦里 = inside a dream; 里 turns a noun into a location' },
          { chinese: '梦里，梦里见过你', pinyin: 'Mèng lǐ, mèng lǐ jiànguò nǐ', english: 'In a dream, in a dream I\'ve seen you' },
          { chinese: '甜蜜笑得多甜蜜', pinyin: 'Tián mì xiào de duō tián mì', english: 'Sweet, smiling so sweetly' },
          { chinese: '是你，是你，梦见的就是你', pinyin: 'Shì nǐ, shì nǐ, mèng jiàn de jiù shì nǐ', english: 'It\'s you, it\'s you, the one I dreamed of is you', note: '就是 = it is precisely / none other than' },
        ],
      },
    ],
    vocab: [
      { simplified: '甜蜜', pinyin: 'tiánmì', english: 'sweet / honeyed', hskLevel: 4, note: 'Used for both literal sweetness and figurative happiness. 甜蜜的生活 = a sweet life.' },
      { simplified: '笑容', pinyin: 'xiàoróng', english: 'smile / smiling expression', hskLevel: 3, note: '笑 (smile) + 容 (appearance). More specific than just 笑 — refers to the look of a smile.' },
      { simplified: '好像', pinyin: 'hǎoxiàng', english: 'seems like / as if', hskLevel: 2, note: 'One of the most useful hedging words in Mandarin. 好像要下雨了 = it looks like it\'s going to rain.' },
      { simplified: '春风', pinyin: 'chūnfēng', english: 'spring breeze', hskLevel: 3, note: '春 (spring) + 风 (wind). Often used metaphorically for warmth and kindness.' },
      { simplified: '熟悉', pinyin: 'shúxi', english: 'familiar / to be familiar with', hskLevel: 3, note: 'Can be verb or adjective. 我对北京很熟悉 = I\'m very familiar with Beijing.' },
      { simplified: '梦', pinyin: 'mèng', english: 'dream', hskLevel: 3, note: '做梦 = to have a dream; 梦想 = dream/aspiration; 白日梦 = daydream.' },
      { simplified: '就是', pinyin: 'jiùshì', english: 'exactly / none other than', hskLevel: 2, note: 'Used for emphasis: 我要的就是这个 = this is exactly what I want.' },
    ],
  },
]
