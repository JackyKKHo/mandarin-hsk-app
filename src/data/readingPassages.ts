export interface ReadingQuestion {
  q: string       // Chinese question
  qEn: string     // English gloss
  options: string[]
  answer: number  // index into options
}

export interface ReadingPassage {
  id: string
  level: 1 | 2 | 3 | 4 | 5 | 6
  title: string
  titleEn: string
  text: string
  translation: string
  questions: ReadingQuestion[]
}

const passages: ReadingPassage[] = [

  // ── HSK 1 ─────────────────────────────────────────────────────────────────

  {
    id: 'hsk1-1',
    level: 1,
    title: '我的家人',
    titleEn: 'My Family',
    text:
      '我叫李明，今年十二岁。我家有四个人：爸爸、妈妈、妹妹和我。\n' +
      '爸爸是老师，他在学校工作。妈妈在医院工作，她是医生。\n' +
      '妹妹今年八岁，是小学生。我们住在北京。我很爱我的家人。',
    translation:
      'My name is Li Ming and I am twelve years old. There are four people in my family: dad, mum, my younger sister, and me. ' +
      'Dad is a teacher who works at a school. Mum works at a hospital — she is a doctor. ' +
      'My younger sister is eight years old this year and is a primary school student. We live in Beijing. I love my family very much.',
    questions: [
      {
        q: '李明今年几岁？',
        qEn: 'How old is Li Ming this year?',
        options: ['八岁', '十岁', '十二岁', '十五岁'],
        answer: 2,
      },
      {
        q: '爸爸是做什么工作的？',
        qEn: "What is dad's job?",
        options: ['医生', '学生', '老师', '工人'],
        answer: 2,
      },
      {
        q: '李明家有几个人？',
        qEn: 'How many people are in Li Ming\'s family?',
        options: ['两个', '三个', '四个', '五个'],
        answer: 2,
      },
      {
        q: '他们住在哪里？',
        qEn: 'Where do they live?',
        options: ['上海', '北京', '中国南方', '学校里'],
        answer: 1,
      },
    ],
  },

  {
    id: 'hsk1-2',
    level: 1,
    title: '我的一天',
    titleEn: 'My Day',
    text:
      '我叫小华。我每天七点起床，七点半吃早饭。\n' +
      '八点我去学校，在学校我学习汉语和数学。\n' +
      '十二点我吃午饭。下午五点我回家，然后做作业。\n' +
      '晚上我看一个小时的书，十点睡觉。',
    translation:
      'My name is Xiaohua. Every day I get up at seven o\'clock and eat breakfast at seven-thirty. ' +
      'At eight o\'clock I go to school, where I study Chinese and maths. ' +
      'At noon I eat lunch. At five in the afternoon I go home and then do homework. ' +
      'In the evening I read for one hour and go to sleep at ten.',
    questions: [
      {
        q: '小华几点起床？',
        qEn: 'What time does Xiaohua get up?',
        options: ['六点', '七点', '八点', '九点'],
        answer: 1,
      },
      {
        q: '小华在学校学什么？',
        qEn: 'What does Xiaohua study at school?',
        options: ['英语和音乐', '汉语和数学', '数学和体育', '汉语和英语'],
        answer: 1,
      },
      {
        q: '小华下午几点回家？',
        qEn: 'What time does Xiaohua go home in the afternoon?',
        options: ['三点', '四点', '五点', '六点'],
        answer: 2,
      },
      {
        q: '小华几点睡觉？',
        qEn: 'What time does Xiaohua go to sleep?',
        options: ['八点', '九点', '十点', '十一点'],
        answer: 2,
      },
    ],
  },

  {
    id: 'hsk1-3',
    level: 1,
    title: '买东西',
    titleEn: 'Shopping',
    text:
      '今天是星期六。我和妈妈去商店买东西。\n' +
      '我们买了苹果、牛奶和面包。苹果一斤五块钱，我们买了两斤。\n' +
      '牛奶一瓶十块钱。面包八块钱一个。\n' +
      '我们一共花了二十八块钱。妈妈说："回家吃饭吧。"',
    translation:
      'Today is Saturday. Mum and I went to the shop to buy things. ' +
      'We bought apples, milk, and bread. Apples cost 5 yuan per jin, and we bought two jin. ' +
      'Milk costs 10 yuan per bottle. Bread is 8 yuan each. ' +
      'We spent 28 yuan in total. Mum said, "Let\'s go home and eat."',
    questions: [
      {
        q: '他们今天去哪里了？',
        qEn: 'Where did they go today?',
        options: ['学校', '医院', '商店', '饭店'],
        answer: 2,
      },
      {
        q: '苹果一斤多少钱？',
        qEn: 'How much do apples cost per jin?',
        options: ['三块', '四块', '五块', '八块'],
        answer: 2,
      },
      {
        q: '他们买了几斤苹果？',
        qEn: 'How many jin of apples did they buy?',
        options: ['一斤', '两斤', '三斤', '五斤'],
        answer: 1,
      },
      {
        q: '他们一共花了多少钱？',
        qEn: 'How much did they spend in total?',
        options: ['二十块', '二十五块', '二十八块', '三十块'],
        answer: 2,
      },
    ],
  },

  // ── HSK 2 ─────────────────────────────────────────────────────────────────

  {
    id: 'hsk2-1',
    level: 2,
    title: '上个周末',
    titleEn: 'Last Weekend',
    text:
      '上个周末，我和朋友们去公园玩。天气很好，阳光很美。\n' +
      '我们先打了一个小时的篮球，然后在草地上休息。\n' +
      '我的朋友小李带来了西瓜，大家吃得很开心。\n' +
      '下午，我们去看了一部电影，电影很有意思。\n' +
      '晚上我回家的时候，有点累，但是非常高兴。',
    translation:
      'Last weekend I went to the park with my friends. The weather was great and the sunshine was beautiful. ' +
      'We first played basketball for an hour, then rested on the grass. ' +
      'My friend Xiao Li brought watermelon, and everyone ate happily. ' +
      'In the afternoon we went to see a film — it was very interesting. ' +
      'When I got home in the evening I was a little tired but very happy.',
    questions: [
      {
        q: '他们去哪里玩？',
        qEn: 'Where did they go?',
        options: ['学校', '商店', '公园', '医院'],
        answer: 2,
      },
      {
        q: '他们先做了什么？',
        qEn: 'What did they do first?',
        options: ['看电影', '打篮球', '吃西瓜', '休息'],
        answer: 1,
      },
      {
        q: '小李带来了什么？',
        qEn: 'What did Xiao Li bring?',
        options: ['苹果', '面包', '西瓜', '饮料'],
        answer: 2,
      },
      {
        q: '他们下午做了什么？',
        qEn: 'What did they do in the afternoon?',
        options: ['继续打篮球', '休息', '看电影', '回家'],
        answer: 2,
      },
      {
        q: '他晚上回家时感觉怎么样？',
        qEn: 'How did he feel when he got home in the evening?',
        options: ['很高兴，不累', '有点累，但很高兴', '又累又不高兴', '不高兴，很累'],
        answer: 1,
      },
    ],
  },

  {
    id: 'hsk2-2',
    level: 2,
    title: '生病了',
    titleEn: 'Falling Ill',
    text:
      '昨天下午，我突然感觉头很疼，也有点发烧。\n' +
      '妈妈带我去医院看病。医生检查了我的身体，说我感冒了。\n' +
      '医生让我多喝水、多休息，还给我开了一些药。\n' +
      '妈妈在药店买了药回来。我吃了药以后就睡觉了。\n' +
      '今天早上，我感觉好多了。医生说得对，多喝水很重要。',
    translation:
      'Yesterday afternoon I suddenly felt a bad headache and also had a slight fever. ' +
      'Mum took me to the hospital to see a doctor. The doctor examined me and said I had a cold. ' +
      'The doctor told me to drink more water and rest more, and also prescribed some medicine. ' +
      'Mum bought the medicine at the pharmacy. After taking the medicine I went to sleep. ' +
      'This morning I felt much better. The doctor was right — drinking more water is very important.',
    questions: [
      {
        q: '他昨天下午感觉怎么样？',
        qEn: 'How did he feel yesterday afternoon?',
        options: ['肚子疼', '头疼，有点发烧', '腿疼', '眼睛不舒服'],
        answer: 1,
      },
      {
        q: '医生说他怎么了？',
        qEn: 'What did the doctor say was wrong?',
        options: ['发烧了', '生病了', '感冒了', '受伤了'],
        answer: 2,
      },
      {
        q: '医生建议他做什么？',
        qEn: 'What did the doctor advise him to do?',
        options: ['多运动', '多吃东西', '多喝水、多休息', '住院'],
        answer: 2,
      },
      {
        q: '药是在哪里买的？',
        qEn: 'Where was the medicine bought?',
        options: ['医院', '超市', '药店', '学校'],
        answer: 2,
      },
      {
        q: '他今天早上感觉怎么样？',
        qEn: 'How does he feel this morning?',
        options: ['还是很不舒服', '好多了', '没有变化', '头还是很疼'],
        answer: 1,
      },
    ],
  },

  {
    id: 'hsk2-3',
    level: 2,
    title: '我的工作',
    titleEn: 'My Job',
    text:
      '我叫张伟，在一家公司工作。我每天坐地铁去公司，大概需要四十分钟。\n' +
      '我的工作是帮助客户解决问题。我很喜欢我的同事，大家相处得很好。\n' +
      '我每个月的工资是六千块钱。虽然不是很多，但是我很满意。\n' +
      '下班以后，我常常去健身房运动，然后回家做饭。\n' +
      '我觉得工作和生活都很重要，要找到平衡才好。',
    translation:
      'My name is Zhang Wei and I work at a company. Every day I take the metro to the office — it takes about forty minutes. ' +
      'My job is to help customers solve problems. I really like my colleagues and we all get along well. ' +
      'My monthly salary is six thousand yuan. Although it is not a lot, I am very satisfied. ' +
      'After work I often go to the gym to exercise, then go home to cook. ' +
      'I think both work and life are important — you need to find a balance.',
    questions: [
      {
        q: '张伟怎么去公司？',
        qEn: 'How does Zhang Wei get to the office?',
        options: ['开车', '坐公共汽车', '坐地铁', '骑自行车'],
        answer: 2,
      },
      {
        q: '张伟去公司大概需要多长时间？',
        qEn: 'How long does it take him to get to the office?',
        options: ['二十分钟', '三十分钟', '四十分钟', '一个小时'],
        answer: 2,
      },
      {
        q: '张伟每月工资是多少？',
        qEn: 'What is his monthly salary?',
        options: ['四千块', '五千块', '六千块', '八千块'],
        answer: 2,
      },
      {
        q: '张伟下班以后常常做什么？',
        qEn: 'What does Zhang Wei often do after work?',
        options: ['看电视', '去健身房运动', '和朋友出去', '睡觉'],
        answer: 1,
      },
    ],
  },

  // ── HSK 3 ─────────────────────────────────────────────────────────────────

  {
    id: 'hsk3-1',
    level: 3,
    title: '独自旅行',
    titleEn: 'Travelling Alone',
    text:
      '去年暑假，我一个人去了云南旅行。那是我第一次独自旅行，我既兴奋又紧张。\n' +
      '云南风景非常美丽，有高山、大湖和各种少数民族文化。\n' +
      '我在丽江住了三天，每天都在古城里走走看看，拍了很多照片。\n' +
      '有一天，我爬了一座山，虽然很累，但是站在山顶上看到的风景让我忘记了一切疲劳。\n' +
      '这次旅行让我更加独立，也让我了解了更多中国的不同文化。',
    translation:
      'Last summer holiday, I travelled to Yunnan alone. It was my first time travelling by myself — I was both excited and nervous. ' +
      'Yunnan\'s scenery is extremely beautiful, with high mountains, large lakes, and various ethnic minority cultures. ' +
      'I stayed in Lijiang for three days, walking around the old town every day and taking lots of photos. ' +
      'One day I climbed a mountain. Although it was tiring, the view from the top made me forget all my fatigue. ' +
      'This trip made me more independent and helped me learn about more of China\'s diverse cultures.',
    questions: [
      {
        q: '作者去了哪里旅行？',
        qEn: 'Where did the author travel to?',
        options: ['北京', '上海', '云南', '西藏'],
        answer: 2,
      },
      {
        q: '这是作者第几次独自旅行？',
        qEn: 'How many times has the author travelled alone before?',
        options: ['第一次', '第二次', '第三次', '很多次'],
        answer: 0,
      },
      {
        q: '作者在丽江住了几天？',
        qEn: 'How many days did the author stay in Lijiang?',
        options: ['两天', '三天', '四天', '一个星期'],
        answer: 1,
      },
      {
        q: '爬山以后，作者感觉怎样？',
        qEn: 'How did the author feel after climbing the mountain?',
        options: ['很后悔去爬山', '觉得很危险', '忘记了疲劳', '立刻下山了'],
        answer: 2,
      },
      {
        q: '这次旅行对作者有什么影响？',
        qEn: 'What effect did the trip have on the author?',
        options: ['让他更了解外国文化', '让他更加独立', '让他不想再旅行', '让他学会了少数民族语言'],
        answer: 1,
      },
    ],
  },

  {
    id: 'hsk3-2',
    level: 3,
    title: '中国的春节',
    titleEn: 'Chinese New Year',
    text:
      '春节是中国最重要的传统节日，也叫"农历新年"。\n' +
      '春节前，人们会打扫房子、买新衣服和准备年货。\n' +
      '除夕夜，全家人一起吃年夜饭，菜肴非常丰富。\n' +
      '饭后，人们放烟花，互相拜年，说"新年快乐"或者"恭喜发财"。\n' +
      '孩子们最高兴的是收红包，里面有长辈给的压岁钱。\n' +
      '春节假期一般有七天，人们走亲访友，庆祝新年的到来。',
    translation:
      'The Spring Festival is the most important traditional holiday in China, also called "Lunar New Year". ' +
      'Before the Spring Festival, people clean their houses, buy new clothes, and prepare New Year goods. ' +
      'On New Year\'s Eve, the whole family eats a reunion dinner with very plentiful dishes. ' +
      'After dinner, people set off fireworks, exchange New Year greetings, and say "Happy New Year" or "Wishing you prosperity". ' +
      'Children are most happy to receive red envelopes containing lucky money from their elders. ' +
      'The Spring Festival holiday generally lasts seven days, during which people visit relatives and friends to celebrate.',
    questions: [
      {
        q: '春节也叫什么？',
        qEn: 'What else is the Spring Festival called?',
        options: ['清明节', '中秋节', '农历新年', '元宵节'],
        answer: 2,
      },
      {
        q: '除夕夜，全家人一起做什么？',
        qEn: 'What does the whole family do on New Year\'s Eve?',
        options: ['看电影', '吃年夜饭', '打扫房子', '购物'],
        answer: 1,
      },
      {
        q: '孩子们为什么特别高兴？',
        qEn: 'Why are children especially happy?',
        options: ['可以放假七天', '可以看烟花', '可以收红包', '可以买新衣服'],
        answer: 2,
      },
      {
        q: '春节假期一般有几天？',
        qEn: 'How long is the Spring Festival holiday?',
        options: ['三天', '五天', '七天', '十天'],
        answer: 2,
      },
      {
        q: '下面哪件事不是春节前要做的？',
        qEn: 'Which of the following is NOT done before the Spring Festival?',
        options: ['打扫房子', '买新衣服', '准备年货', '走亲访友'],
        answer: 3,
      },
    ],
  },

  {
    id: 'hsk3-3',
    level: 3,
    title: '学习汉语的经历',
    titleEn: 'My Experience Learning Chinese',
    text:
      '我叫大卫，是英国人。三年前，我开始学习汉语。\n' +
      '刚开始的时候，我觉得汉语很难，特别是汉字和声调。\n' +
      '但是我每天坚持练习，慢慢地进步了。\n' +
      '我的中国朋友们也经常帮助我，纠正我的发音和语法。\n' +
      '去年，我来到中国学习，在大学里上了一年的语言课程。\n' +
      '现在，我可以用汉语和中国人正常交流了，我感到非常自豪。',
    translation:
      'My name is David and I am British. Three years ago I started learning Chinese. ' +
      'At the beginning I found Chinese very difficult, especially the characters and the tones. ' +
      'But I practised every day and gradually made progress. ' +
      'My Chinese friends also helped me often, correcting my pronunciation and grammar. ' +
      'Last year I came to China to study and took a one-year language course at a university. ' +
      'Now I can communicate normally with Chinese people in Chinese, and I feel very proud.',
    questions: [
      {
        q: '大卫是哪国人？',
        qEn: 'What nationality is David?',
        options: ['美国人', '英国人', '法国人', '澳大利亚人'],
        answer: 1,
      },
      {
        q: '大卫学汉语学了多长时间？',
        qEn: 'How long has David been learning Chinese?',
        options: ['一年', '两年', '三年', '四年'],
        answer: 2,
      },
      {
        q: '大卫觉得汉语最难的是什么？',
        qEn: 'What does David find hardest about Chinese?',
        options: ['词汇量太大', '汉字和声调', '语法太复杂', '听力'],
        answer: 1,
      },
      {
        q: '大卫去年做了什么？',
        qEn: 'What did David do last year?',
        options: ['去英国旅行', '在大学上语言课程', '开始学习汉语', '参加了考试'],
        answer: 1,
      },
      {
        q: '现在大卫的汉语水平怎么样？',
        qEn: 'What is David\'s Chinese level like now?',
        options: ['还是很差', '可以和中国人正常交流', '只会说简单的词', '还在学习基础'],
        answer: 1,
      },
    ],
  },

  // ── HSK 4 ─────────────────────────────────────────────────────────────────

  {
    id: 'hsk4-1',
    level: 4,
    title: '城市生活的压力',
    titleEn: 'The Pressure of City Life',
    text:
      '随着中国城市化进程的加快，越来越多的人涌入大城市寻找机会。\n' +
      '然而，城市生活并不像想象中那么美好。高房价、长时间工作和激烈的竞争给人们带来了巨大的压力。\n' +
      '许多年轻人为了买房而不得不省吃俭用，节省每一分钱。\n' +
      '与此同时，繁忙的工作使很多人没有时间陪伴家人，生活质量下降。\n' +
      '尽管如此，仍有大量的人选择留在城市，因为城市提供了更多的就业机会和更完善的医疗、教育资源。\n' +
      '如何在城市中找到工作与生活的平衡，是现代人面临的重要课题。',
    translation:
      'As China\'s urbanisation process accelerates, more and more people are flooding into big cities to seek opportunities. ' +
      'However, city life is not as wonderful as imagined. High housing prices, long working hours, and intense competition bring enormous pressure to people. ' +
      'Many young people have to scrimp and save to buy a home, counting every penny. ' +
      'At the same time, demanding work means many people have no time to spend with their families, and quality of life declines. ' +
      'Despite this, a large number of people still choose to stay in cities because cities provide more employment opportunities and better medical and educational resources. ' +
      'How to find a balance between work and life in cities is an important challenge facing modern people.',
    questions: [
      {
        q: '根据文章，城市生活有哪些主要压力？',
        qEn: 'According to the article, what are the main pressures of city life?',
        options: ['交通问题和噪音', '高房价、长工时和激烈竞争', '食物价格高和空气污染', '娱乐活动太少'],
        answer: 1,
      },
      {
        q: '很多年轻人为什么省吃俭用？',
        qEn: 'Why do many young people scrimp and save?',
        options: ['为了旅行', '为了出国留学', '为了买房', '为了投资股票'],
        answer: 2,
      },
      {
        q: '繁忙的工作对人们有什么主要影响？',
        qEn: 'What is the main effect of demanding work on people?',
        options: ['影响身体健康', '减少收入', '没时间陪伴家人', '朋友越来越少'],
        answer: 2,
      },
      {
        q: '为什么还有大量的人选择留在城市？',
        qEn: 'Why do many people still choose to stay in cities?',
        options: ['城市文化丰富', '城市生活比农村便宜', '城市提供更多机会和资源', '城市天气比农村好'],
        answer: 2,
      },
      {
        q: '文章的主要议题是什么？',
        qEn: 'What is the main topic of the article?',
        options: ['中国城市化的历史', '城市生活的工作与生活平衡问题', '农村和城市的收入差距', '年轻人的消费习惯'],
        answer: 1,
      },
    ],
  },

  {
    id: 'hsk4-2',
    level: 4,
    title: '网络时代的学习',
    titleEn: 'Learning in the Internet Age',
    text:
      '互联网的发展彻底改变了人们的学习方式。如今，只要有一台电脑或手机，人们就可以随时随地获取知识。\n' +
      '在线课程、教育视频和学习应用层出不穷，使学习变得更加便捷和多样化。\n' +
      '然而，网络学习也存在一些挑战。由于缺乏老师的监督，很多人难以坚持，容易分心。\n' +
      '此外，网络上信息量庞大，质量参差不齐，学习者需要具备辨别能力。\n' +
      '专家建议，网络学习和传统课堂学习应该互相配合，发挥各自的优势。\n' +
      '总体来看，科技为教育带来了新的可能，关键在于如何合理利用这些工具。',
    translation:
      'The development of the internet has fundamentally changed how people learn. Nowadays, as long as people have a computer or phone, they can access knowledge anytime and anywhere. ' +
      'Online courses, educational videos, and learning apps keep emerging, making learning more convenient and diverse. ' +
      'However, online learning also presents some challenges. Due to a lack of teacher supervision, many people find it difficult to persevere and easily get distracted. ' +
      'Moreover, there is a vast amount of information online with uneven quality, so learners need the ability to judge what is reliable. ' +
      'Experts suggest that online learning and traditional classroom learning should complement each other, leveraging the advantages of each. ' +
      'Overall, technology has brought new possibilities to education — the key is how to make sensible use of these tools.',
    questions: [
      {
        q: '互联网主要改变了什么？',
        qEn: 'What has the internet mainly changed?',
        options: ['人们的工作方式', '人们的学习方式', '人们的娱乐方式', '人们的购物方式'],
        answer: 1,
      },
      {
        q: '网络学习的主要挑战是什么？',
        qEn: 'What is the main challenge of online learning?',
        options: ['费用太高', '内容太少', '缺乏监督，容易分心', '需要特殊设备'],
        answer: 2,
      },
      {
        q: '"质量参差不齐"的意思是？',
        qEn: 'What does "quality is uneven" mean in context?',
        options: ['内容数量很多', '有些内容好有些差', '内容更新太慢', '内容不够有趣'],
        answer: 1,
      },
      {
        q: '专家建议怎样学习最好？',
        qEn: 'How do experts say it is best to learn?',
        options: ['只用网络学习', '只用传统方法', '两种方法结合', '减少学习时间'],
        answer: 2,
      },
      {
        q: '文章对科技和教育的态度是？',
        qEn: 'What is the article\'s attitude towards technology and education?',
        options: ['完全反对使用科技', '完全支持网络学习', '肯定科技但提醒注意问题', '认为科技无法帮助教育'],
        answer: 2,
      },
    ],
  },

  {
    id: 'hsk4-3',
    level: 4,
    title: '传统文化与现代生活',
    titleEn: 'Traditional Culture and Modern Life',
    text:
      '在全球化的背景下，中国的传统文化面临着严峻的挑战。\n' +
      '随着现代生活节奏的加快，许多传统习俗和工艺正在逐渐消失。\n' +
      '然而，近年来社会各界开始重视文化传承，政府投入资金修缮古建筑、保护非物质文化遗产。\n' +
      '与此同时，年轻一代也在重新发现传统文化的魅力。汉服、国风音乐在网络上越来越受欢迎。\n' +
      '这些现象说明，传统文化并没有过时，关键在于如何用现代人喜闻乐见的方式去传播和诠释它。\n' +
      '只有让传统文化在当代生活中焕发新的活力，才能使其真正得到传承。',
    translation:
      'Against the backdrop of globalisation, China\'s traditional culture faces serious challenges. ' +
      'As the pace of modern life accelerates, many traditional customs and crafts are gradually disappearing. ' +
      'However, in recent years, people across society have begun to pay attention to cultural inheritance, and the government has invested money in restoring ancient buildings and protecting intangible cultural heritage. ' +
      'At the same time, younger generations are rediscovering the charm of traditional culture. Han-style clothing and "guofeng" music are growing increasingly popular online. ' +
      'These phenomena show that traditional culture has not become outdated — the key is how to spread and interpret it in ways that modern people enjoy. ' +
      'Only by letting traditional culture flourish with new vitality in contemporary life can it be truly passed down.',
    questions: [
      {
        q: '传统文化面临的主要挑战是什么？',
        qEn: 'What is the main challenge facing traditional culture?',
        options: ['政府不重视', '全球化和快节奏现代生活', '年轻人普遍不感兴趣', '缺少资金保护'],
        answer: 1,
      },
      {
        q: '政府采取了哪些保护措施？',
        qEn: 'What protective measures has the government taken?',
        options: ['举办文化节庆活动', '修缮古建筑和保护非物质文化遗产', '禁止外国文化进入', '向年轻人开展强制教育'],
        answer: 1,
      },
      {
        q: '年轻人对传统文化的态度如何？',
        qEn: 'How do young people feel about traditional culture?',
        options: ['普遍不感兴趣', '开始重新发现其魅力', '认为已经完全过时', '只在学校里了解'],
        answer: 1,
      },
      {
        q: '文章认为传承传统文化的关键是什么？',
        qEn: 'What does the article say is key to passing on traditional culture?',
        options: ['完全保持原有的形式', '让更多外国人了解', '用现代方式传播和诠释', '只依靠政府的力量'],
        answer: 2,
      },
      {
        q: '根据文章，下面哪个说法是正确的？',
        qEn: 'According to the article, which statement is correct?',
        options: [
          '传统文化已经无法适应现代社会',
          '年轻人对传统文化完全没有兴趣',
          '传统文化可以在现代生活中焕发新活力',
          '政府是保护传统文化的唯一力量',
        ],
        answer: 2,
      },
    ],
  },

  // ── HSK 5 ─────────────────────────────────────────────────────────────────

  {
    id: 'hsk5-1',
    level: 5,
    title: '人工智能的机遇与挑战',
    titleEn: 'Opportunities and Challenges of Artificial Intelligence',
    text:
      '近年来，人工智能技术的飞速发展引发了全球范围内的广泛讨论。\n' +
      '一方面，人工智能在医疗诊断、语言翻译、自动驾驶等领域展现出巨大的应用潜力，极大地提高了生产效率。\n' +
      '另一方面，随着智能机器逐步取代人工劳动，大量传统岗位面临消失的风险，社会就业结构将发生深刻变革。\n' +
      '此外，人工智能系统的决策过程往往缺乏透明度，引发了公众对算法偏见和数据隐私的担忧。\n' +
      '专家指出，技术本身并无善恶之分，关键在于人类如何规范和引导其发展方向。\n' +
      '各国政府和企业需要在推动创新的同时，建立健全相应的伦理规范与法律框架，确保人工智能造福全人类。',
    translation:
      'In recent years, the rapid development of artificial intelligence technology has sparked widespread discussion around the globe. ' +
      'On one hand, AI has demonstrated tremendous application potential in fields such as medical diagnosis, language translation, and autonomous driving, greatly improving productivity. ' +
      'On the other hand, as intelligent machines progressively replace human labour, a large number of traditional jobs face the risk of disappearing, and the social employment structure will undergo profound transformation. ' +
      'Furthermore, the decision-making processes of AI systems often lack transparency, raising public concerns about algorithmic bias and data privacy. ' +
      'Experts point out that technology itself is neither good nor bad — what matters is how human beings regulate and guide its direction of development. ' +
      'Governments and enterprises around the world need to foster innovation while establishing comprehensive ethical norms and legal frameworks to ensure AI benefits all of humanity.',
    questions: [
      {
        q: '文章提到人工智能在哪些领域有应用？',
        qEn: 'Which fields does the article mention AI being applied in?',
        options: ['农业、建筑和旅游', '医疗、翻译和自动驾驶', '教育、金融和体育', '新闻、时装和音乐'],
        answer: 1,
      },
      {
        q: '人工智能带来的主要社会问题是什么？',
        qEn: 'What is the main social problem brought by AI?',
        options: ['能源消耗增加', '网络安全漏洞', '传统岗位面临消失', '国际竞争加剧'],
        answer: 2,
      },
      {
        q: '"算法偏见"指的是什么问题？',
        qEn: 'What issue does "algorithmic bias" refer to?',
        options: ['计算速度不够快', 'AI决策不公平或不透明', '程序出现代码错误', '机器不能理解人类情感'],
        answer: 1,
      },
      {
        q: '专家认为解决人工智能问题的关键是什么？',
        qEn: 'What do experts say is key to addressing AI problems?',
        options: ['停止开发人工智能', '人类规范和引导技术发展', '只允许政府使用AI', '增加对AI研究的投入'],
        answer: 1,
      },
      {
        q: '文章对人工智能总体持什么态度？',
        qEn: 'What is the article\'s overall attitude towards artificial intelligence?',
        options: ['完全乐观', '完全悲观', '客观，承认机遇与风险并存', '无法判断'],
        answer: 2,
      },
    ],
  },

  {
    id: 'hsk5-2',
    level: 5,
    title: '职场压力与心理健康',
    titleEn: 'Workplace Stress and Mental Health',
    text:
      '在现代职场中，高强度的工作压力已经成为影响员工心理健康的重要因素。\n' +
      '长时间加班、业绩考核、人际关系紧张等问题，使许多职场人陷入焦虑与疲惫之中。\n' +
      '心理学研究表明，长期处于高压状态不仅会导致效率下降、创造力受损，还可能引发抑郁、失眠等严重的心理疾病。\n' +
      '然而，在一些企业文化中，员工往往将过度工作视为敬业的表现，不愿承认自己面临心理困境。\n' +
      '越来越多的企业开始意识到，员工的心理健康直接关系到企业的长远发展。\n' +
      '为此，一些公司引入了员工援助计划，提供心理咨询服务，鼓励员工保持工作与生活的平衡。',
    translation:
      'In the modern workplace, high-intensity work pressure has become an important factor affecting employees\' mental health. ' +
      'Problems such as prolonged overtime, performance appraisals, and strained interpersonal relationships leave many workplace employees mired in anxiety and exhaustion. ' +
      'Psychological research shows that sustained exposure to high-pressure conditions not only causes reduced efficiency and impaired creativity, but can also trigger serious psychological disorders such as depression and insomnia. ' +
      'However, in some corporate cultures, employees often regard overworking as a sign of dedication and are reluctant to acknowledge that they are facing psychological difficulties. ' +
      'More and more companies are beginning to realise that employees\' mental health is directly related to the long-term development of the enterprise. ' +
      'To this end, some companies have introduced employee assistance programmes, providing psychological counselling services and encouraging employees to maintain a work-life balance.',
    questions: [
      {
        q: '文章提到哪些造成职场压力的因素？',
        qEn: 'What factors causing workplace stress does the article mention?',
        options: ['低薪和通勤问题', '长时间加班、业绩考核和人际关系紧张', '工作环境差和管理混乱', '晋升机会少和技能不足'],
        answer: 1,
      },
      {
        q: '长期高压对员工有什么影响？',
        qEn: 'What effect does long-term high pressure have on employees?',
        options: ['使他们更有创造力', '效率下降并可能引发心理疾病', '促使他们寻找新工作', '让他们更加专注'],
        answer: 1,
      },
      {
        q: '为什么部分员工不愿承认心理问题？',
        qEn: 'Why are some employees reluctant to admit mental health problems?',
        options: ['他们认为自己很坚强', '担心被解雇', '企业文化认为过度工作是敬业的表现', '心理咨询费用太高'],
        answer: 2,
      },
      {
        q: '"员工援助计划"的主要目的是什么？',
        qEn: 'What is the main purpose of "employee assistance programmes"?',
        options: ['提高员工工资', '减少公司运营成本', '提供心理支持，促进工作与生活平衡', '帮助员工晋升'],
        answer: 2,
      },
      {
        q: '企业为什么开始重视员工心理健康？',
        qEn: 'Why are companies beginning to value employees\' mental health?',
        options: ['政府法律的强制要求', '员工集体抗议', '员工心理健康与企业长远发展直接相关', '竞争对手都这样做'],
        answer: 2,
      },
    ],
  },

  {
    id: 'hsk5-3',
    level: 5,
    title: '可持续发展与绿色生活',
    titleEn: 'Sustainable Development and Green Living',
    text:
      '随着全球气候变化问题日益严峻，可持续发展的理念正在被越来越多的国家和个人所接受。\n' +
      '在日常生活中，减少碳排放的方式多种多样：选择公共交通、减少一次性塑料的使用、推广太阳能等清洁能源。\n' +
      '中国政府已承诺在2060年前实现碳中和目标，并大力推进新能源汽车、绿色建筑等产业的发展。\n' +
      '消费者的选择同样至关重要。研究显示，如果消费者偏好购买绿色产品，企业就会有更强的动力减少污染。\n' +
      '然而，绿色生活方式的推广面临不少障碍，包括绿色产品价格偏高、消费者意识不足以及基础设施不完善等。\n' +
      '专家认为，唯有政府政策、企业行动与公众参与三者协同配合，才能真正推动社会走向可持续发展的未来。',
    translation:
      'As the problem of global climate change becomes increasingly serious, the concept of sustainable development is being embraced by more and more countries and individuals. ' +
      'In daily life, there are many ways to reduce carbon emissions: choosing public transport, reducing the use of single-use plastics, and promoting clean energy sources such as solar power. ' +
      'The Chinese government has pledged to achieve carbon neutrality before 2060 and is vigorously advancing the development of industries such as new-energy vehicles and green buildings. ' +
      'Consumer choices are equally crucial. Research shows that if consumers prefer to buy green products, businesses will have stronger motivation to reduce pollution. ' +
      'However, promoting a green lifestyle faces many obstacles, including the high prices of green products, insufficient consumer awareness, and incomplete infrastructure. ' +
      'Experts believe that only through the coordinated cooperation of government policy, corporate action, and public participation can society truly move towards a sustainable future.',
    questions: [
      {
        q: '文章提到了哪些减少碳排放的方式？',
        qEn: 'Which ways to reduce carbon emissions does the article mention?',
        options: ['种树和节约用水', '公共交通、减少塑料、推广清洁能源', '减少出行和禁止开车', '改变饮食习惯和减少用电'],
        answer: 1,
      },
      {
        q: '中国政府的碳中和目标是什么时候实现？',
        qEn: 'When does the Chinese government aim to achieve carbon neutrality?',
        options: ['2030年前', '2045年前', '2050年前', '2060年前'],
        answer: 3,
      },
      {
        q: '消费者的选择为什么重要？',
        qEn: 'Why are consumer choices important?',
        options: ['消费者是政府政策的主要来源', '消费者偏好影响企业减少污染的动力', '消费者直接控制企业的生产方式', '消费者比政府更了解环境问题'],
        answer: 1,
      },
      {
        q: '推广绿色生活方式面临哪些主要障碍？',
        qEn: 'What are the main obstacles to promoting a green lifestyle?',
        options: ['缺乏相关技术和创新', '价格偏高、意识不足、基础设施不完善', '政府不支持绿色产业', '媒体对绿色话题报道太少'],
        answer: 1,
      },
      {
        q: '实现可持续发展需要哪些方面的协同合作？',
        qEn: 'What aspects need to cooperate to achieve sustainable development?',
        options: ['科学家、工程师和艺术家', '政府、企业与公众', '发达国家与发展中国家', '教育机构与媒体'],
        answer: 1,
      },
    ],
  },

  // ── HSK 6 ─────────────────────────────────────────────────────────────────

  {
    id: 'hsk6-1',
    level: 6,
    title: '儒家思想对现代社会的影响',
    titleEn: 'The Influence of Confucianism on Modern Society',
    text:
      '儒家思想作为中国传统文化的核心，历经两千余年的演变，至今仍对中国乃至整个东亚社会产生着深远影响。\n' +
      '儒家所倡导的"仁、义、礼、智、信"五常，不仅构成了传统道德体系的基础，也在无形中塑造了东亚社会重视家庭、尊重权威、强调集体利益的文化特征。\n' +
      '在现代企业管理中，儒家的和谐理念与重视人际关系的思想，被认为是东亚经济腾飞的重要文化因素之一。\n' +
      '然而，也有学者指出，儒家思想中过于强调等级秩序与服从权威的一面，在一定程度上阻碍了个体独立思考与批判性精神的发展。\n' +
      '在全球化的今天，如何辩证地看待儒家遗产——吸收其精华、摒弃其糟粕——成为东亚知识界持续探讨的重要议题。\n' +
      '无论如何，儒家思想作为人类文明史上影响最为深远的思想体系之一，其当代价值仍值得深入研究与挖掘。',
    translation:
      'As the core of traditional Chinese culture, Confucian thought has undergone more than two thousand years of evolution and continues to exert a profound influence on China and indeed the whole of East Asian society. ' +
      'The five constants advocated by Confucianism — benevolence, righteousness, ritual propriety, wisdom, and faithfulness — not only form the foundation of the traditional moral system, but have also imperceptibly shaped the cultural characteristics of East Asian societies: emphasis on family, respect for authority, and prioritisation of collective interests. ' +
      'In modern corporate management, the Confucian concepts of harmony and the importance placed on interpersonal relationships are considered one of the key cultural factors behind the economic rise of East Asia. ' +
      'However, some scholars point out that the aspects of Confucian thought that place excessive emphasis on hierarchical order and deference to authority have, to some extent, impeded the development of individual independent thinking and a critical spirit. ' +
      'In today\'s globalised world, how to view the Confucian heritage dialectically — absorbing its essence and discarding its dross — has become an important subject of ongoing discussion in East Asian intellectual circles. ' +
      'Regardless, as one of the most influential thought systems in the history of human civilisation, the contemporary value of Confucian thought still merits in-depth research and exploration.',
    questions: [
      {
        q: '儒家"五常"指的是哪五种品德？',
        qEn: 'Which five virtues do the Confucian "Five Constants" refer to?',
        options: ['忠、孝、节、义、廉', '仁、义、礼、智、信', '勤、俭、谦、和、敬', '诚、善、美、真、勇'],
        answer: 1,
      },
      {
        q: '儒家思想被认为是东亚经济腾飞的重要因素，主要体现在哪方面？',
        qEn: 'In what way is Confucianism seen as an important factor in East Asia\'s economic rise?',
        options: ['强调个人主义和创新', '重视和谐与人际关系', '推崇自由竞争和市场经济', '强调法制建设和民主治理'],
        answer: 1,
      },
      {
        q: '一些学者对儒家思想持批评态度的原因是什么？',
        qEn: 'Why do some scholars take a critical view of Confucianism?',
        options: ['儒家思想过于复杂难以理解', '儒家文化阻碍了科技的发展', '过于强调等级服从，阻碍独立思考', '儒家道德标准不适合现代生活'],
        answer: 2,
      },
      {
        q: '"辩证地看待儒家遗产"意味着什么？',
        qEn: 'What does "viewing the Confucian heritage dialectically" mean?',
        options: ['完全接受儒家所有思想', '完全否定儒家价值观', '吸收精华同时摒弃糟粕', '将儒家思想原封不动地应用于现代'],
        answer: 2,
      },
      {
        q: '文章的主要论点是什么？',
        qEn: 'What is the main argument of the article?',
        options: [
          '儒家思想已经完全过时，应该被抛弃',
          '儒家思想对现代社会既有正面影响也有局限性，值得深入研究',
          '儒家思想是东亚成功的唯一原因',
          '西方价值观比儒家思想更适合现代社会',
        ],
        answer: 1,
      },
    ],
  },

  {
    id: 'hsk6-2',
    level: 6,
    title: '教育公平与社会流动',
    titleEn: 'Educational Equity and Social Mobility',
    text:
      '教育历来被视为打破阶层壁垒、实现社会流动的重要途径。然而，在现实中，教育资源的不均衡分配使这一美好愿景大打折扣。\n' +
      '城乡之间、重点学校与普通学校之间、不同经济背景家庭之间，在师资力量、硬件设施和教育机会上存在显著差距。\n' +
      '以中国高考制度为例，尽管其本意是为寒门子弟提供向上流动的通道，但补习班的盛行、择校行为的普遍化，实际上加剧了教育竞争中家庭经济实力的决定性作用。\n' +
      '与此同时，"内卷"现象的蔓延使得学生在激烈的同质化竞争中疲于奔命，教育的核心价值——培养人的全面发展——在分数压力下逐渐被侵蚀。\n' +
      '推进教育公平，需要政府在资源配置上向薄弱地区倾斜，同时深化考试评价体系的改革，减少单一分数对人才选拔的绝对主导。\n' +
      '唯有真正实现教育机会的均等化，社会流动的上升通道才能对所有人保持畅通。',
    translation:
      'Education has always been regarded as an important means of breaking down class barriers and achieving social mobility. In reality, however, the unequal distribution of educational resources greatly diminishes this ideal. ' +
      'There are significant gaps in teaching quality, facilities, and educational opportunities between urban and rural areas, between key schools and ordinary schools, and between families of different economic backgrounds. ' +
      'Take China\'s gaokao system as an example: although its original intention is to provide a channel of upward mobility for students from disadvantaged families, the prevalence of tutoring classes and the widespread practice of choosing schools have in practice amplified the decisive role of family economic power in educational competition. ' +
      'At the same time, the spread of the "involution" phenomenon leaves students exhausted in fierce homogeneous competition, and the core value of education — nurturing the all-round development of individuals — is gradually eroded under the pressure of grades. ' +
      'Advancing educational equity requires governments to direct resources towards disadvantaged areas in resource allocation, while also deepening reforms of examination and evaluation systems to reduce the absolute dominance of a single score in talent selection. ' +
      'Only by genuinely achieving equal educational opportunity can the channels of upward social mobility remain open to everyone.',
    questions: [
      {
        q: '文章认为教育资源不均衡体现在哪些方面？',
        qEn: 'In what aspects does the article say educational resource inequality is manifested?',
        options: ['教材内容不统一', '城乡差距、学校差距和家庭经济差距', '教师薪资水平不同', '升学考试制度不公平'],
        answer: 1,
      },
      {
        q: '高考制度的本意是什么？',
        qEn: 'What was the original intention of the gaokao system?',
        options: ['筛选最聪明的学生', '为寒门子弟提供向上流动的通道', '统一全国的教育标准', '减少高校招生的腐败现象'],
        answer: 1,
      },
      {
        q: '"内卷"在文中指的是什么现象？',
        qEn: 'What phenomenon does "involution" refer to in the article?',
        options: ['学生拒绝参加课外活动', '激烈的同质化竞争使学生疲惫', '教育内容脱离实际需求', '学生对学习失去兴趣'],
        answer: 1,
      },
      {
        q: '文章提出了哪些推进教育公平的建议？',
        qEn: 'What suggestions does the article make for advancing educational equity?',
        options: ['取消高考制度', '向薄弱地区倾斜资源并改革评价体系', '增加大学招生名额', '推广网络教育代替传统课堂'],
        answer: 1,
      },
      {
        q: '文章结尾的核心观点是什么？',
        qEn: 'What is the core point at the end of the article?',
        options: [
          '竞争是教育进步的唯一动力',
          '只有实现教育机会均等，社会流动才能真正畅通',
          '政府应该完全控制教育资源的分配',
          '分数是衡量学生能力的最好方式',
        ],
        answer: 1,
      },
    ],
  },

  {
    id: 'hsk6-3',
    level: 6,
    title: '全球化背景下的文化认同',
    titleEn: 'Cultural Identity in the Context of Globalisation',
    text:
      '全球化进程的深入推进，在促进各国经济互联互通的同时，也引发了一场关于文化认同的深层危机。\n' +
      '随着英语作为国际通用语的强势地位不断巩固，以及好莱坞影视、流行音乐等西方流行文化的广泛传播，不少小语种和地方文化传统正面临边缘化乃至消亡的威胁。\n' +
      '面对这一趋势，不同社会的应对方式截然不同。一些国家选择对外来文化采取保护性限制措施，以维护本土文化的独特性；另一些国家则更倾向于在开放与融合中寻求文化的创新性转化。\n' +
      '从人类学的视角来看，文化认同并非一成不变的固态概念，而是在与他者的持续对话中动态建构的过程。\n' +
      '问题的核心不在于如何抵御文化的外部影响，而在于一个社会是否具备足够的文化自信，能够在吸纳外来元素的同时，保持自身文化的主体性与创造力。\n' +
      '在这个意义上，文化多样性的保护与全球化的推进，并非不可调和的矛盾，而是人类文明共同繁荣的两翼。',
    translation:
      'The deepening of the globalisation process, while promoting economic interconnection among nations, has also triggered a profound crisis of cultural identity. ' +
      'As the dominant position of English as an international lingua franca is continuously consolidated, and Western popular culture such as Hollywood films and pop music spreads widely, many minority languages and local cultural traditions face the threat of marginalisation or even extinction. ' +
      'Faced with this trend, different societies have responded in very different ways. Some countries choose to impose protective restrictions on foreign culture in order to preserve the uniqueness of their native culture; others are more inclined to seek the innovative transformation of culture through openness and integration. ' +
      'From an anthropological perspective, cultural identity is not a static, unchanging concept, but a process of dynamic construction through continuous dialogue with others. ' +
      'The core of the issue is not how to resist external cultural influences, but whether a society possesses sufficient cultural confidence to maintain the subjectivity and creativity of its own culture while absorbing elements from outside. ' +
      'In this sense, the protection of cultural diversity and the advancement of globalisation are not irreconcilable contradictions, but two wings of the common prosperity of human civilisation.',
    questions: [
      {
        q: '文章认为全球化引发了什么危机？',
        qEn: 'What crisis does the article say globalisation has triggered?',
        options: ['经济不平等的加剧', '文化认同的深层危机', '国际政治关系的紧张', '科技发展的不平衡'],
        answer: 1,
      },
      {
        q: '小语种和地方文化面临威胁的原因是什么？',
        qEn: 'What are the reasons for the threat faced by minority languages and local cultures?',
        options: ['本地年轻人缺乏兴趣', '政府不重视文化保护', '英语强势地位和西方流行文化的广泛传播', '旅游业的过度开发'],
        answer: 2,
      },
      {
        q: '不同社会对外来文化的应对方式有哪两种？',
        qEn: 'What are the two ways different societies respond to foreign culture?',
        options: ['完全接受或完全拒绝', '保护性限制或在开放中寻求创新转化', '向政府申请资金或寻求国际援助', '推广本国文化或学习外国语言'],
        answer: 1,
      },
      {
        q: '从人类学角度看，文化认同是什么性质的概念？',
        qEn: 'From an anthropological perspective, what kind of concept is cultural identity?',
        options: ['固定不变的', '由政府决定的', '在与他者的对话中动态建构的', '完全由历史传统决定的'],
        answer: 2,
      },
      {
        q: '文章最终的核心论断是什么？',
        qEn: 'What is the article\'s ultimate core argument?',
        options: [
          '全球化必然导致文化的同质化',
          '文化多样性与全球化是对立矛盾的',
          '文化多样性保护与全球化可以共同促进人类文明繁荣',
          '只有抵制全球化才能保护本土文化',
        ],
        answer: 2,
      },
    ],
  },
]

export default passages
export function getPassagesByLevel(level: 1 | 2 | 3 | 4 | 5 | 6) {
  return passages.filter(p => p.level === level)
}
