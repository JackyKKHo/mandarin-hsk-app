// Short graded stories for Record & Score. Each story is read aloud one sentence at a time:
// the scorer spreads characters evenly over the voiced audio, so long recordings with pauses
// between sentences would misplace the tone checks. Keep sentences under ~25 characters.
// Pinyin follows the phrase bank: 一 / 不 tone changes are written, 3-3 sandhi is not.

export interface StorySentence {
  zh: string
  pinyin: string
  en: string
}

export interface RecordStory {
  id: string
  level: 1 | 2 | 3 | 4 | 5 | 6
  title: string
  titleEn: string
  sentences: StorySentence[]
}

export const RECORD_STORIES: RecordStory[] = [
  {
    id: 'weekend',
    level: 1,
    title: '我的周末',
    titleEn: 'My Weekend',
    sentences: [
      { zh: '星期六早上，我和妈妈去商店。', pinyin: 'xīngqīliù zǎoshang, wǒ hé māma qù shāngdiàn.', en: 'On Saturday morning, Mum and I went to the shop.' },
      { zh: '我们买了很多水果和米饭。', pinyin: 'wǒmen mǎi le hěn duō shuǐguǒ hé mǐfàn.', en: 'We bought lots of fruit and rice.' },
      { zh: '下午，我的朋友来我家。', pinyin: 'xiàwǔ, wǒ de péngyou lái wǒ jiā.', en: 'In the afternoon, my friend came to my home.' },
      { zh: '我们一起喝茶，看电视。', pinyin: 'wǒmen yìqǐ hē chá, kàn diànshì.', en: 'We drank tea and watched TV together.' },
      { zh: '晚上，爸爸做了中国菜。', pinyin: 'wǎnshang, bàba zuò le Zhōngguó cài.', en: 'In the evening, Dad cooked Chinese food.' },
      { zh: '我很喜欢我的周末。', pinyin: 'wǒ hěn xǐhuan wǒ de zhōumò.', en: 'I really like my weekend.' },
    ],
  },
  {
    id: 'restaurant',
    level: 1,
    title: '在饭馆',
    titleEn: 'At the Restaurant',
    sentences: [
      { zh: '今天中午，我和同学去饭馆吃饭。', pinyin: 'jīntiān zhōngwǔ, wǒ hé tóngxué qù fànguǎn chī fàn.', en: 'At noon today, my classmate and I went to a restaurant.' },
      { zh: '服务员问我们想吃什么。', pinyin: 'fúwùyuán wèn wǒmen xiǎng chī shénme.', en: 'The waiter asked what we wanted to eat.' },
      { zh: '我想吃米饭，同学想吃面条。', pinyin: 'wǒ xiǎng chī mǐfàn, tóngxué xiǎng chī miàntiáo.', en: 'I wanted rice; my classmate wanted noodles.' },
      { zh: '我们还要了两杯茶。', pinyin: 'wǒmen hái yào le liǎng bēi chá.', en: 'We also ordered two cups of tea.' },
      { zh: '菜很好吃，也不太贵。', pinyin: 'cài hěn hǎochī, yě bú tài guì.', en: 'The food was tasty and not too expensive.' },
      { zh: '我们对服务员说谢谢。', pinyin: 'wǒmen duì fúwùyuán shuō xièxie.', en: 'We said thank you to the waiter.' },
    ],
  },
  {
    id: 'rainy-day',
    level: 2,
    title: '下雨天',
    titleEn: 'A Rainy Day',
    sentences: [
      { zh: '今天早上下雨了，天气有点冷。', pinyin: 'jīntiān zǎoshang xià yǔ le, tiānqì yǒudiǎn lěng.', en: 'It rained this morning, and it was a bit cold.' },
      { zh: '我没有带伞，所以坐出租车去公司。', pinyin: 'wǒ méiyǒu dài sǎn, suǒyǐ zuò chūzūchē qù gōngsī.', en: "I didn't bring an umbrella, so I took a taxi to work." },
      { zh: '路上车很多，我们走得很慢。', pinyin: 'lù shang chē hěn duō, wǒmen zǒu de hěn màn.', en: 'There were lots of cars, so we went slowly.' },
      { zh: '到公司的时候，已经九点半了。', pinyin: 'dào gōngsī de shíhou, yǐjīng jiǔ diǎn bàn le.', en: 'By the time I got to work, it was already half past nine.' },
      { zh: '同事给我一杯热咖啡。', pinyin: 'tóngshì gěi wǒ yì bēi rè kāfēi.', en: 'A colleague gave me a cup of hot coffee.' },
      { zh: '我觉得这个下雨天也不错。', pinyin: 'wǒ juéde zhège xià yǔ tiān yě búcuò.', en: "I think this rainy day isn't so bad after all." },
    ],
  },
  {
    id: 'birthday-present',
    level: 2,
    title: '生日礼物',
    titleEn: 'A Birthday Present',
    sentences: [
      { zh: '明天是妹妹的生日，她就要十岁了。', pinyin: 'míngtiān shì mèimei de shēngrì, tā jiù yào shí suì le.', en: "Tomorrow is my little sister's birthday; she's turning ten." },
      { zh: '我想送她一件新衣服。', pinyin: 'wǒ xiǎng sòng tā yí jiàn xīn yīfu.', en: 'I want to give her some new clothes.' },
      { zh: '我在商店里看了很久。', pinyin: 'wǒ zài shāngdiàn li kàn le hěn jiǔ.', en: 'I looked around the shop for a long time.' },
      { zh: '最后我买了一件红色的衣服。', pinyin: 'zuìhòu wǒ mǎi le yí jiàn hóngsè de yīfu.', en: 'In the end I bought something red.' },
      { zh: '妹妹说她最喜欢红色。', pinyin: 'mèimei shuō tā zuì xǐhuan hóngsè.', en: 'My sister says red is her favourite colour.' },
      { zh: '我希望她明天会很高兴。', pinyin: 'wǒ xīwàng tā míngtiān huì hěn gāoxìng.', en: "I hope she'll be happy tomorrow." },
    ],
  },
  {
    id: 'high-speed-train',
    level: 3,
    title: '第一次坐高铁',
    titleEn: 'My First High-Speed Train',
    sentences: [
      { zh: '上个月，我第一次坐高铁去上海。', pinyin: 'shàng ge yuè, wǒ dì-yī cì zuò gāotiě qù Shànghǎi.', en: 'Last month I took the high-speed train to Shanghai for the first time.' },
      { zh: '火车站很大，人也特别多。', pinyin: 'huǒchēzhàn hěn dà, rén yě tèbié duō.', en: 'The station was huge and very crowded.' },
      { zh: '我找了半天才找到我的座位。', pinyin: 'wǒ zhǎo le bàntiān cái zhǎodào wǒ de zuòwèi.', en: 'It took me ages to find my seat.' },
      { zh: '高铁又快又安静，比飞机还方便。', pinyin: 'gāotiě yòu kuài yòu ānjìng, bǐ fēijī hái fāngbiàn.', en: 'The train was fast and quiet, even more convenient than flying.' },
      { zh: '我一边看窗外的风景，一边听音乐。', pinyin: 'wǒ yìbiān kàn chuāngwài de fēngjǐng, yìbiān tīng yīnyuè.', en: 'I watched the scenery outside while listening to music.' },
      { zh: '不到五个小时，我就到上海了。', pinyin: 'bú dào wǔ ge xiǎoshí, wǒ jiù dào Shànghǎi le.', en: 'In under five hours, I was in Shanghai.' },
      { zh: '下次去别的城市，我还要坐高铁。', pinyin: 'xià cì qù bié de chéngshì, wǒ hái yào zuò gāotiě.', en: "Next time I go to another city, I'll take the high-speed train again." },
    ],
  },
  {
    id: 'dumplings',
    level: 3,
    title: '学包饺子',
    titleEn: 'Learning to Make Dumplings',
    sentences: [
      { zh: '春节的时候，我跟奶奶学包饺子。', pinyin: 'Chūnjié de shíhou, wǒ gēn nǎinai xué bāo jiǎozi.', en: 'At Spring Festival, I learned to make dumplings from Grandma.' },
      { zh: '她先准备好肉和白菜。', pinyin: 'tā xiān zhǔnbèi hǎo ròu hé báicài.', en: 'First she got the meat and cabbage ready.' },
      { zh: '然后她给我看怎么包。', pinyin: 'ránhòu tā gěi wǒ kàn zěnme bāo.', en: 'Then she showed me how to wrap them.' },
      { zh: '我包的饺子不太好看，有的还破了。', pinyin: 'wǒ bāo de jiǎozi bú tài hǎokàn, yǒude hái pò le.', en: "My dumplings didn't look great, and some even split open." },
      { zh: '奶奶笑着说，第一次包都是这样。', pinyin: 'nǎinai xiào zhe shuō, dì-yī cì bāo dōu shì zhèyàng.', en: "Grandma laughed and said everyone's first try looks like that." },
      { zh: '我们一家人一起吃饺子，非常热闹。', pinyin: 'wǒmen yì jiā rén yìqǐ chī jiǎozi, fēicháng rènao.', en: 'The whole family ate dumplings together; it was lively and fun.' },
    ],
  },
  {
    id: 'moving-house',
    level: 4,
    title: '搬家',
    titleEn: 'Moving House',
    sentences: [
      { zh: '上周末我终于搬进了新家。', pinyin: 'shàng zhōumò wǒ zhōngyú bānjìn le xīn jiā.', en: 'Last weekend I finally moved into my new home.' },
      { zh: '新家离公司比较近，走路只要十分钟。', pinyin: 'xīn jiā lí gōngsī bǐjiào jìn, zǒulù zhǐ yào shí fēnzhōng.', en: "It's quite close to work, only a ten-minute walk." },
      { zh: '搬家那天，几个好朋友都来帮忙。', pinyin: 'bānjiā nà tiān, jǐ ge hǎo péngyou dōu lái bāngmáng.', en: 'On moving day, several good friends came to help.' },
      { zh: '东西太多了，我们整整忙了一天。', pinyin: 'dōngxi tài duō le, wǒmen zhěngzhěng máng le yì tiān.', en: 'There was so much stuff that we were busy the whole day.' },
      { zh: '为了感谢他们，我请大家吃了一顿火锅。', pinyin: 'wèile gǎnxiè tāmen, wǒ qǐng dàjiā chī le yí dùn huǒguō.', en: 'To thank them, I treated everyone to hotpot.' },
      { zh: '虽然很累，但是我心里特别高兴。', pinyin: 'suīrán hěn lèi, dànshì wǒ xīnli tèbié gāoxìng.', en: 'I was tired, but really happy inside.' },
      { zh: '我相信在这里的生活会越来越好。', pinyin: 'wǒ xiāngxìn zài zhèlǐ de shēnghuó huì yuè lái yuè hǎo.', en: 'I believe life here will keep getting better.' },
    ],
  },
  {
    id: 'interview',
    level: 4,
    title: '面试',
    titleEn: 'The Job Interview',
    sentences: [
      { zh: '昨天我参加了一家公司的面试。', pinyin: 'zuótiān wǒ cānjiā le yì jiā gōngsī de miànshì.', en: 'Yesterday I had a job interview at a company.' },
      { zh: '为了这次面试，我准备了整整一个星期。', pinyin: 'wèile zhè cì miànshì, wǒ zhǔnbèi le zhěngzhěng yí ge xīngqī.', en: 'I spent a whole week preparing for it.' },
      { zh: '进门以前，我紧张得手都出汗了。', pinyin: 'jìn mén yǐqián, wǒ jǐnzhāng de shǒu dōu chū hàn le.', en: 'Before going in, I was so nervous my hands were sweating.' },
      { zh: '面试官问了我很多关于工作经验的问题。', pinyin: 'miànshìguān wèn le wǒ hěn duō guānyú gōngzuò jīngyàn de wèntí.', en: 'The interviewer asked lots of questions about my work experience.' },
      { zh: '我尽量放松，把自己的想法说清楚。', pinyin: 'wǒ jǐnliàng fàngsōng, bǎ zìjǐ de xiǎngfǎ shuō qīngchu.', en: 'I tried to relax and explain my ideas clearly.' },
      { zh: '结束的时候，他说下周会给我打电话。', pinyin: 'jiéshù de shíhou, tā shuō xià zhōu huì gěi wǒ dǎ diànhuà.', en: "At the end, he said they'd call me next week." },
      { zh: '不管结果怎么样，这都是一次很好的经验。', pinyin: 'bùguǎn jiéguǒ zěnmeyàng, zhè dōu shì yí cì hěn hǎo de jīngyàn.', en: 'Whatever the result, it was a great experience.' },
    ],
  },
  {
    id: 'rooftop-garden',
    level: 5,
    title: '楼顶的菜园',
    titleEn: 'The Rooftop Garden',
    sentences: [
      { zh: '我家楼顶上有一个小小的菜园。', pinyin: 'wǒ jiā lóudǐng shang yǒu yí ge xiǎoxiǎo de càiyuán.', en: 'There is a tiny vegetable garden on the roof of our building.' },
      { zh: '这是退休的王爷爷三年前开的。', pinyin: 'zhè shì tuìxiū de Wáng yéye sān nián qián kāi de.', en: 'Grandpa Wang, who is retired, started it three years ago.' },
      { zh: '他每天早上都去浇水，从来没有间断过。', pinyin: 'tā měitiān zǎoshang dōu qù jiāo shuǐ, cónglái méiyǒu jiànduàn guo.', en: 'He waters it every morning and has never missed a day.' },
      { zh: '夏天的时候，菜园里有很多西红柿和黄瓜。', pinyin: 'xiàtiān de shíhou, càiyuán li yǒu hěn duō xīhóngshì hé huángguā.', en: 'In summer, the garden is full of tomatoes and cucumbers.' },
      { zh: '王爷爷常常把新鲜的蔬菜分给邻居们。', pinyin: 'Wáng yéye chángcháng bǎ xīnxiān de shūcài fēn gěi línjūmen.', en: 'Grandpa Wang often shares the fresh vegetables with the neighbours.' },
      { zh: '因为这个菜园，楼里的人慢慢熟悉起来了。', pinyin: 'yīnwèi zhège càiyuán, lóu li de rén mànmàn shúxī qǐlai le.', en: 'Thanks to the garden, people in the building slowly got to know each other.' },
      { zh: '大家都说，这块小菜园让生活多了一份温暖。', pinyin: 'dàjiā dōu shuō, zhè kuài xiǎo càiyuán ràng shēnghuó duō le yí fèn wēnnuǎn.', en: 'Everyone says this little garden has made life a bit warmer.' },
    ],
  },
  {
    id: 'old-letter',
    level: 5,
    title: '一封旧信',
    titleEn: 'An Old Letter',
    sentences: [
      { zh: '整理书房的时候，我发现了一封旧信。', pinyin: 'zhěnglǐ shūfáng de shíhou, wǒ fāxiàn le yì fēng jiù xìn.', en: 'While tidying the study, I found an old letter.' },
      { zh: '信是二十年前爸爸写给妈妈的。', pinyin: 'xìn shì èrshí nián qián bàba xiě gěi māma de.', en: 'Dad wrote it to Mum twenty years ago.' },
      { zh: '那时候爸爸在外地工作，一年只能回家一次。', pinyin: 'nà shíhou bàba zài wàidì gōngzuò, yì nián zhǐ néng huí jiā yí cì.', en: 'Back then he worked far away and could only come home once a year.' },
      { zh: '信里写满了对家人的思念和对未来的计划。', pinyin: 'xìn li xiě mǎn le duì jiārén de sīniàn hé duì wèilái de jìhuà.', en: 'The letter was full of missing his family and plans for the future.' },
      { zh: '读着读着，我的眼睛忍不住湿润了。', pinyin: 'dú zhe dú zhe, wǒ de yǎnjing rěnbuzhù shīrùn le.', en: "As I read on, I couldn't help tearing up." },
      { zh: '我把信小心地放回原处，没有告诉任何人。', pinyin: 'wǒ bǎ xìn xiǎoxīn de fàng huí yuánchù, méiyǒu gàosu rènhé rén.', en: 'I carefully put the letter back and told no one.' },
      { zh: '原来，平平淡淡的日子里也藏着这么深的感情。', pinyin: 'yuánlái, píngpíngdàndàn de rìzi li yě cáng zhe zhème shēn de gǎnqíng.', en: 'So even plain, ordinary days can hold such deep feelings.' },
    ],
  },
  {
    id: 'slowing-down',
    level: 6,
    title: '慢下来',
    titleEn: 'Slowing Down',
    sentences: [
      { zh: '在快节奏的城市里，很多人习惯了匆匆忙忙地生活。', pinyin: 'zài kuài jiézòu de chéngshì li, hěn duō rén xíguàn le cōngcōngmángmáng de shēnghuó.', en: 'In a fast-paced city, many people are used to living in a rush.' },
      { zh: '我曾经也是这样，每天被工作和手机填得满满的。', pinyin: 'wǒ céngjīng yě shì zhèyàng, měitiān bèi gōngzuò hé shǒujī tián de mǎnmǎn de.', en: 'I used to be the same, every day packed with work and my phone.' },
      { zh: '直到有一次生病，我才不得不停下来休息。', pinyin: 'zhídào yǒu yí cì shēngbìng, wǒ cái bùdébù tíng xiàlai xiūxi.', en: 'It took getting ill before I finally had to stop and rest.' },
      { zh: '那段时间，我开始每天散步，认真地做一顿饭。', pinyin: 'nà duàn shíjiān, wǒ kāishǐ měitiān sànbù, rènzhēn de zuò yí dùn fàn.', en: 'During that time I started taking daily walks and cooking proper meals.' },
      { zh: '我渐渐发现，生活中值得留意的东西其实很多。', pinyin: 'wǒ jiànjiàn fāxiàn, shēnghuó zhōng zhíde liúyì de dōngxi qíshí hěn duō.', en: 'I gradually realised how much in life is worth noticing.' },
      { zh: '慢下来并不是落后，而是给自己留一点空间。', pinyin: 'màn xiàlai bìng bú shì luòhòu, ér shì gěi zìjǐ liú yìdiǎn kōngjiān.', en: "Slowing down doesn't mean falling behind; it means leaving yourself some room." },
      { zh: '现在的我，比以前更懂得珍惜身边的人和事。', pinyin: 'xiànzài de wǒ, bǐ yǐqián gèng dǒngde zhēnxī shēnbiān de rén hé shì.', en: 'Now I value the people and things around me more than ever.' },
    ],
  },
  {
    id: 'old-bookshop',
    level: 6,
    title: '老街的书店',
    titleEn: 'The Bookshop on the Old Street',
    sentences: [
      { zh: '老街拐角处有一家开了三十多年的小书店。', pinyin: 'lǎo jiē guǎijiǎo chù yǒu yì jiā kāi le sānshí duō nián de xiǎo shūdiàn.', en: 'On the corner of the old street is a little bookshop that has been open for over thirty years.' },
      { zh: '店主是一位头发花白的老先生，说话总是慢条斯理。', pinyin: 'diànzhǔ shì yí wèi tóufa huābái de lǎo xiānsheng, shuōhuà zǒngshì màntiáo-sīlǐ.', en: 'The owner is a grey-haired old gentleman who always speaks calmly and unhurriedly.' },
      { zh: '随着网上购书越来越普遍，来店里的顾客明显少了。', pinyin: 'suízhe wǎngshàng gòu shū yuè lái yuè pǔbiàn, lái diàn li de gùkè míngxiǎn shǎo le.', en: 'As buying books online became common, noticeably fewer customers came in.' },
      { zh: '有人劝他关门，他却坚持每天准时开店。', pinyin: 'yǒu rén quàn tā guān mén, tā què jiānchí měitiān zhǔnshí kāi diàn.', en: 'Some advised him to close, but he still opens on time every day.' },
      { zh: '他说，书店不仅是卖书的地方，更是人们交流的空间。', pinyin: 'tā shuō, shūdiàn bùjǐn shì mài shū de dìfang, gèng shì rénmen jiāoliú de kōngjiān.', en: 'He says a bookshop is not just a place to sell books, but a space for people to connect.' },
      { zh: '后来，附近的大学生自发组织了读书会。', pinyin: 'hòulái, fùjìn de dàxuéshēng zìfā zǔzhī le dúshūhuì.', en: 'Later, students from a nearby university set up a book club on their own.' },
      { zh: '如今，这家小书店反而成了老街上最有人气的地方。', pinyin: "rújīn, zhè jiā xiǎo shūdiàn fǎn'ér chéng le lǎo jiē shang zuì yǒu rénqì de dìfang.", en: 'Today the little bookshop has, if anything, become the most popular spot on the street.' },
    ],
  },
]

export const STORY_LEVELS = [1, 2, 3, 4, 5, 6] as const

// Share of checks (initial, final, tone) that passed; unknown checks don't count either way.
export function sentenceScore(chars: { scores: Record<string, 'ok' | 'miss' | 'unknown'> }[]): number | null {
  let ok = 0
  let known = 0
  for (const c of chars) {
    for (const s of Object.values(c.scores)) {
      if (s === 'unknown') continue
      known++
      if (s === 'ok') ok++
    }
  }
  return known ? Math.round((ok / known) * 100) : null
}
