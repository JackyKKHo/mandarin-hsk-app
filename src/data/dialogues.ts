export interface DialogueLine {
  speaker: 'A' | 'B'
  chinese: string
  pinyin: string
  english: string
}

export interface Dialogue {
  id: string
  emoji: string
  title: string
  titleZh: string
  situation: string
  hskLevel: number
  lines: DialogueLine[]
}

export const DIALOGUES: Dialogue[] = [
  {
    id: 'coffee-shop',
    emoji: '☕',
    title: 'Coffee Shop',
    titleZh: '咖啡店',
    situation: 'Ordering at a Beijing coffee shop',
    hskLevel: 1,
    lines: [
      { speaker: 'A', chinese: '你好，要点什么？', pinyin: 'Nǐ hǎo, yào diǎn shénme?', english: 'Hi, what would you like to order?' },
      { speaker: 'B', chinese: '一杯美式咖啡，谢谢。', pinyin: 'Yī bēi měishì kāfēi, xièxie.', english: 'An Americano please.' },
      { speaker: 'A', chinese: '要大杯还是小杯？', pinyin: 'Yào dà bēi háishi xiǎo bēi?', english: 'Large or small?' },
      { speaker: 'B', chinese: '大杯。多少钱？', pinyin: 'Dà bēi. Duōshao qián?', english: 'Large. How much?' },
      { speaker: 'A', chinese: '三十块。', pinyin: 'Sānshí kuài.', english: '30 yuan.' },
      { speaker: 'B', chinese: '好的，给你。', pinyin: 'Hǎo de, gěi nǐ.', english: 'OK, here you go.' },
    ],
  },
  {
    id: 'taxi',
    emoji: '🚕',
    title: 'Taking a Taxi',
    titleZh: '打车',
    situation: 'Hailing a DiDi in Shanghai',
    hskLevel: 1,
    lines: [
      { speaker: 'A', chinese: '你好，去哪儿？', pinyin: 'Nǐ hǎo, qù nǎr?', english: 'Hi, where are you going?' },
      { speaker: 'B', chinese: '去北京南站。', pinyin: 'Qù Běijīng Nán Zhàn.', english: 'Beijing South Station.' },
      { speaker: 'A', chinese: '好的，大概四十分钟。', pinyin: 'Hǎo de, dàgài sìshí fēnzhōng.', english: 'OK, about 40 minutes.' },
      { speaker: 'B', chinese: '可以快一点吗？我要赶火车。', pinyin: 'Kěyǐ kuài yīdiǎn ma? Wǒ yào gǎn huǒchē.', english: 'Can you hurry? I need to catch a train.' },
      { speaker: 'A', chinese: '没问题！', pinyin: 'Méi wèntí!', english: 'No problem!' },
      { speaker: 'B', chinese: '谢谢你。', pinyin: 'Xièxie nǐ.', english: 'Thank you.' },
    ],
  },
  {
    id: 'directions',
    emoji: '🗺️',
    title: 'Asking Directions',
    titleZh: '问路',
    situation: 'Lost near a subway station',
    hskLevel: 1,
    lines: [
      { speaker: 'A', chinese: '请问，地铁站在哪儿？', pinyin: 'Qǐngwèn, dìtiě zhàn zài nǎr?', english: 'Excuse me, where is the subway station?' },
      { speaker: 'B', chinese: '往前走，然后左转。', pinyin: 'Wǎng qián zǒu, ránhòu zuǒ zhuǎn.', english: 'Go straight, then turn left.' },
      { speaker: 'A', chinese: '走路要多久？', pinyin: 'Zǒulù yào duō jiǔ?', english: 'How long to walk?' },
      { speaker: 'B', chinese: '大概五分钟。', pinyin: 'Dàgài wǔ fēnzhōng.', english: 'About 5 minutes.' },
      { speaker: 'A', chinese: '谢谢！', pinyin: 'Xièxie!', english: 'Thank you!' },
      { speaker: 'B', chinese: '不客气！', pinyin: 'Bú kèqì!', english: "You're welcome!" },
    ],
  },
  {
    id: 'convenience-store',
    emoji: '🏪',
    title: 'Convenience Store',
    titleZh: '便利店',
    situation: 'Buying water at a 全家 (FamilyMart)',
    hskLevel: 1,
    lines: [
      { speaker: 'A', chinese: '有矿泉水吗？', pinyin: 'Yǒu kuàngquán shuǐ ma?', english: 'Do you have mineral water?' },
      { speaker: 'B', chinese: '有，在那边。', pinyin: 'Yǒu, zài nàbiān.', english: "Yes, over there." },
      { speaker: 'A', chinese: '谢谢。可以用微信付款吗？', pinyin: 'Xièxie. Kěyǐ yòng Wēixìn fùkuǎn ma?', english: 'Thanks. Can I pay with WeChat?' },
      { speaker: 'B', chinese: '可以，扫这里。', pinyin: 'Kěyǐ, sǎo zhèlǐ.', english: 'Yes, scan here.' },
      { speaker: 'A', chinese: '好的。', pinyin: 'Hǎo de.', english: 'Got it.' },
    ],
  },
  {
    id: 'wechat',
    emoji: '💬',
    title: 'WeChat Plans',
    titleZh: '微信聊天',
    situation: 'Making dinner plans over WeChat',
    hskLevel: 1,
    lines: [
      { speaker: 'A', chinese: '你在哪里？', pinyin: 'Nǐ zài nǎlǐ?', english: 'Where are you?' },
      { speaker: 'B', chinese: '在公司呢，怎么了？', pinyin: 'Zài gōngsī ne, zěnme le?', english: "At the office, what's up?" },
      { speaker: 'A', chinese: '今晚有空吗？一起吃饭？', pinyin: 'Jīn wǎn yǒu kòng ma? Yīqǐ chīfàn?', english: 'Are you free tonight? Eat together?' },
      { speaker: 'B', chinese: '有空！几点？', pinyin: 'Yǒu kòng! Jǐ diǎn?', english: "I'm free! What time?" },
      { speaker: 'A', chinese: '七点，老地方。', pinyin: 'Qī diǎn, lǎo dìfāng.', english: '7 o\'clock, the usual place.' },
      { speaker: 'B', chinese: '好的，见！', pinyin: 'Hǎo de, jiàn!', english: "OK, see you!" },
    ],
  },
  {
    id: 'restaurant',
    emoji: '🍜',
    title: 'At a Restaurant',
    titleZh: '餐厅点菜',
    situation: 'Ordering at a local Chinese restaurant',
    hskLevel: 2,
    lines: [
      { speaker: 'A', chinese: '欢迎光临！几位？', pinyin: 'Huānyíng guānglín! Jǐ wèi?', english: 'Welcome! How many people?' },
      { speaker: 'B', chinese: '两位。', pinyin: 'Liǎng wèi.', english: 'Two.' },
      { speaker: 'A', chinese: '请跟我来。这是菜单。', pinyin: 'Qǐng gēn wǒ lái. Zhè shì càidān.', english: 'Please follow me. Here is the menu.' },
      { speaker: 'B', chinese: '这里的招牌菜是什么？', pinyin: 'Zhèlǐ de zhāopái cài shì shénme?', english: "What's the signature dish?" },
      { speaker: 'A', chinese: '我们的红烧肉很有名。', pinyin: 'Wǒmen de hóngshāo ròu hěn yǒumíng.', english: 'Our braised pork belly is very famous.' },
      { speaker: 'B', chinese: '好，我要一份，还有一碗米饭。', pinyin: "Hǎo, wǒ yào yī fèn, hái yǒu yī wǎn mǐfàn.", english: "OK, I'll have one, plus a bowl of rice." },
    ],
  },
  {
    id: 'shopping',
    emoji: '🛍️',
    title: 'Bargaining',
    titleZh: '讨价还价',
    situation: 'Haggling at a market stall',
    hskLevel: 2,
    lines: [
      { speaker: 'A', chinese: '老板，这件多少钱？', pinyin: 'Lǎobǎn, zhè jiàn duōshao qián?', english: 'Boss, how much is this one?' },
      { speaker: 'B', chinese: '一百二十块。', pinyin: 'Yī bǎi èrshí kuài.', english: '120 yuan.' },
      { speaker: 'A', chinese: '太贵了，便宜一点吧。', pinyin: 'Tài guì le, piányí yīdiǎn ba.', english: 'Too expensive, a bit cheaper please.' },
      { speaker: 'B', chinese: '最低一百块，不能再少了。', pinyin: 'Zuì dī yī bǎi kuài, bù néng zài shǎo le.', english: '100 yuan minimum, I can\'t go lower.' },
      { speaker: 'A', chinese: '好吧，我买了。', pinyin: 'Hǎo ba, wǒ mǎi le.', english: "Fine, I'll take it." },
    ],
  },
  {
    id: 'pharmacy',
    emoji: '💊',
    title: 'At the Pharmacy',
    titleZh: '药店',
    situation: 'Describing symptoms at a Chinese pharmacy',
    hskLevel: 2,
    lines: [
      { speaker: 'A', chinese: '你哪里不舒服？', pinyin: 'Nǐ nǎlǐ bù shūfu?', english: 'Where do you feel unwell?' },
      { speaker: 'B', chinese: '我头疼，有点发烧。', pinyin: 'Wǒ tóuténg, yǒudiǎn fāshāo.', english: 'I have a headache and a slight fever.' },
      { speaker: 'A', chinese: '多久了？', pinyin: 'Duō jiǔ le?', english: 'How long?' },
      { speaker: 'B', chinese: '昨天开始的。', pinyin: 'Zuótiān kāishǐ de.', english: 'It started yesterday.' },
      { speaker: 'A', chinese: '给你这个药，一天三次。', pinyin: 'Gěi nǐ zhège yào, yītiān sān cì.', english: 'Take this medicine, three times a day.' },
      { speaker: 'B', chinese: '好的，谢谢大夫。', pinyin: 'Hǎo de, xièxie dàifu.', english: 'OK, thank you doctor.' },
    ],
  },
  {
    id: 'hotel',
    emoji: '🏨',
    title: 'Hotel Check-in',
    titleZh: '酒店入住',
    situation: 'Checking into a hotel in China',
    hskLevel: 2,
    lines: [
      { speaker: 'A', chinese: '您好，请问有预订吗？', pinyin: 'Nín hǎo, qǐngwèn yǒu yùdìng ma?', english: 'Hello, do you have a reservation?' },
      { speaker: 'B', chinese: '有，我叫李明。', pinyin: 'Yǒu, wǒ jiào Lǐ Míng.', english: 'Yes, my name is Li Ming.' },
      { speaker: 'A', chinese: '好的，请出示您的护照。', pinyin: 'Hǎo de, qǐng chūshì nín de hùzhào.', english: 'OK, please show your passport.' },
      { speaker: 'B', chinese: '给你。房间里有WiFi吗？', pinyin: 'Gěi nǐ. Fángjiān lǐ yǒu WiFi ma?', english: "Here you go. Is there WiFi in the room?" },
      { speaker: 'A', chinese: '有，密码在这张卡上。', pinyin: 'Yǒu, mìmǎ zài zhè zhāng kǎ shàng.', english: 'Yes, the password is on this card.' },
      { speaker: 'B', chinese: '太好了，谢谢！', pinyin: 'Tài hǎo le, xièxie!', english: 'Great, thank you!' },
    ],
  },
  {
    id: 'job-interview',
    emoji: '💼',
    title: 'Job Interview',
    titleZh: '面试',
    situation: 'A job interview at a Chinese company',
    hskLevel: 3,
    lines: [
      { speaker: 'A', chinese: '请先介绍一下自己。', pinyin: 'Qǐng xiān jièshào yīxià zìjǐ.', english: 'Please introduce yourself first.' },
      { speaker: 'B', chinese: '我叫王芳，毕业于北京大学，专业是计算机。', pinyin: 'Wǒ jiào Wáng Fāng, bìyè yú Běijīng Dàxué, zhuānyè shì jìsuànjī.', english: 'My name is Wang Fang, I graduated from Peking University with a computer science degree.' },
      { speaker: 'A', chinese: '你为什么想来我们公司？', pinyin: 'Nǐ wèishénme xiǎng lái wǒmen gōngsī?', english: 'Why do you want to join our company?' },
      { speaker: 'B', chinese: '贵公司在行业里很有名，我希望能在这里学到很多。', pinyin: 'Guì gōngsī zài hángyè lǐ hěn yǒumíng, wǒ xīwàng néng zài zhèlǐ xuédào hěn duō.', english: 'Your company is well-known in the industry, and I hope to learn a lot here.' },
      { speaker: 'A', chinese: '薪资方面你有什么要求？', pinyin: 'Xīnzī fāngmiàn nǐ yǒu shénme yāoqiú?', english: 'What are your salary expectations?' },
      { speaker: 'B', chinese: '我希望每月税后一万五左右。', pinyin: 'Wǒ xīwàng měi yuè shuì hòu yī wàn wǔ zuǒyòu.', english: 'I\'m hoping for around 15,000 yuan after tax per month.' },
    ],
  },
]
