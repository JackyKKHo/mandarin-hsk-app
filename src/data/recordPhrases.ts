export interface RecordPhrase {
  zh: string
  pinyin: string
  en: string
  level: 'beginner' | 'intermediate' | 'advanced'
  topic: 'greetings' | 'daily' | 'food' | 'travel' | 'shopping' | 'work' | 'social' | 'tones'
}

export const RECORD_PHRASES: RecordPhrase[] = [
  { zh: '你好', pinyin: 'nǐ hǎo', en: 'Hello', level: 'beginner', topic: 'greetings' },
  { zh: '谢谢你', pinyin: 'xièxie nǐ', en: 'Thank you', level: 'beginner', topic: 'greetings' },
  { zh: '不客气', pinyin: 'bú kèqi', en: "You're welcome", level: 'beginner', topic: 'greetings' },
  { zh: '对不起', pinyin: 'duìbuqǐ', en: "I'm sorry", level: 'beginner', topic: 'greetings' },
  { zh: '没关系', pinyin: 'méi guānxi', en: 'No problem', level: 'beginner', topic: 'greetings' },
  { zh: '再见', pinyin: 'zàijiàn', en: 'Goodbye', level: 'beginner', topic: 'greetings' },
  { zh: '早上好', pinyin: 'zǎoshang hǎo', en: 'Good morning', level: 'beginner', topic: 'greetings' },
  { zh: '晚安', pinyin: 'wǎn ān', en: 'Good night', level: 'beginner', topic: 'greetings' },

  { zh: '我叫李明', pinyin: 'wǒ jiào Lǐ Míng', en: 'My name is Li Ming', level: 'beginner', topic: 'daily' },
  { zh: '我是学生', pinyin: 'wǒ shì xuésheng', en: 'I am a student', level: 'beginner', topic: 'daily' },
  { zh: '今天天气很好', pinyin: 'jīntiān tiānqì hěn hǎo', en: "The weather is nice today", level: 'beginner', topic: 'daily' },
  { zh: '我有点累', pinyin: 'wǒ yǒudiǎn lèi', en: "I'm a bit tired", level: 'beginner', topic: 'daily' },
  { zh: '请说慢一点', pinyin: 'qǐng shuō màn yìdiǎn', en: 'Please speak more slowly', level: 'beginner', topic: 'daily' },
  { zh: '我听不懂', pinyin: 'wǒ tīng bu dǒng', en: "I don't understand", level: 'beginner', topic: 'daily' },

  { zh: '我想吃面条', pinyin: 'wǒ xiǎng chī miàntiáo', en: 'I want to eat noodles', level: 'beginner', topic: 'food' },
  { zh: '这个多少钱', pinyin: 'zhège duōshao qián', en: 'How much is this?', level: 'beginner', topic: 'shopping' },
  { zh: '太贵了', pinyin: 'tài guì le', en: 'Too expensive', level: 'beginner', topic: 'shopping' },
  { zh: '可以便宜点吗', pinyin: 'kěyǐ piányi diǎn ma', en: 'Can it be cheaper?', level: 'intermediate', topic: 'shopping' },
  { zh: '我要一杯咖啡', pinyin: 'wǒ yào yì bēi kāfēi', en: 'I want a cup of coffee', level: 'beginner', topic: 'food' },
  { zh: '请给我菜单', pinyin: 'qǐng gěi wǒ càidān', en: 'Please give me the menu', level: 'intermediate', topic: 'food' },
  { zh: '这道菜很辣', pinyin: 'zhè dào cài hěn là', en: 'This dish is very spicy', level: 'intermediate', topic: 'food' },

  { zh: '地铁站在哪里', pinyin: 'dìtiě zhàn zài nǎlǐ', en: 'Where is the subway station?', level: 'intermediate', topic: 'travel' },
  { zh: '一直往前走', pinyin: 'yìzhí wǎng qián zǒu', en: 'Go straight ahead', level: 'intermediate', topic: 'travel' },
  { zh: '我迷路了', pinyin: 'wǒ mí lù le', en: "I'm lost", level: 'intermediate', topic: 'travel' },
  { zh: '我想订一张机票', pinyin: 'wǒ xiǎng dìng yì zhāng jīpiào', en: 'I want to book a plane ticket', level: 'intermediate', topic: 'travel' },

  { zh: '很高兴认识你', pinyin: 'hěn gāoxìng rènshi nǐ', en: 'Nice to meet you', level: 'intermediate', topic: 'social' },
  { zh: '你周末做什么', pinyin: 'nǐ zhōumò zuò shénme', en: 'What do you do on weekends?', level: 'intermediate', topic: 'social' },
  { zh: '我们一起去吧', pinyin: "wǒmen yìqǐ qù ba", en: "Let's go together", level: 'intermediate', topic: 'social' },

  { zh: '我在一家公司工作', pinyin: 'wǒ zài yì jiā gōngsī gōngzuò', en: 'I work at a company', level: 'intermediate', topic: 'work' },
  { zh: '今天的会议很重要', pinyin: 'jīntiān de huìyì hěn zhòngyào', en: "Today's meeting is very important", level: 'advanced', topic: 'work' },
  { zh: '我对这个职位很感兴趣', pinyin: 'wǒ duì zhège zhíwèi hěn gǎn xìngqù', en: 'I am very interested in this position', level: 'advanced', topic: 'work' },
  { zh: '我们需要尽快做决定', pinyin: 'wǒmen xūyào jǐnkuài zuò juédìng', en: 'We need to make a decision as soon as possible', level: 'advanced', topic: 'work' },

  { zh: '妈麻马骂', pinyin: 'mā má mǎ mà', en: 'Tone drill — mother, hemp, horse, scold', level: 'beginner', topic: 'tones' },
  { zh: '四是四十是十', pinyin: 'sì shì sì shí shì shí', en: 'Tongue twister — four is four, ten is ten', level: 'intermediate', topic: 'tones' },
  { zh: '吃葡萄不吐葡萄皮', pinyin: 'chī pútao bù tǔ pútao pí', en: "Eat grapes without spitting out the skins", level: 'advanced', topic: 'tones' },
]

export function pickDailyPhrase(date = new Date()): RecordPhrase {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  return RECORD_PHRASES[seed % RECORD_PHRASES.length]
}

export const TOPICS: { id: RecordPhrase['topic']; label: string; emoji: string }[] = [
  { id: 'greetings', label: 'Greetings', emoji: '👋' },
  { id: 'daily', label: 'Daily life', emoji: '🌤️' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'travel', label: 'Travel', emoji: '🚇' },
  { id: 'social', label: 'Social', emoji: '🤝' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'tones', label: 'Tone drills', emoji: '🎵' },
]
