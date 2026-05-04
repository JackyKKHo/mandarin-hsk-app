export interface Lesson {
  id: string
  emoji: string
  title: string
  titleZh: string
  description: string
  chars: string[]
}

export const BEGINNER_LESSONS: Lesson[] = [
  {
    id: 'lesson-01',
    emoji: '👋',
    title: 'First Words',
    titleZh: '入门词',
    description: 'The very first words you need — yes, no, good, and the core pronouns.',
    chars: ['我', '你', '他', '她', '是', '不', '好', '大', '小', '我们', '你们', '他们'],
  },
  {
    id: 'lesson-02',
    emoji: '🙏',
    title: 'Greetings',
    titleZh: '问候语',
    description: 'Say hello, goodbye, thank you, and sorry — the basics of every conversation.',
    chars: ['再见', '请', '谢谢', '对不起', '请进', '先生', '朋友', '名字', '叫'],
  },
  {
    id: 'lesson-03',
    emoji: '🔢',
    title: 'Numbers',
    titleZh: '数字',
    description: 'Count from zero to a hundred. Numbers unlock prices, dates, and time.',
    chars: ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '两', '多少', '几'],
  },
  {
    id: 'lesson-04',
    emoji: '👨‍👩‍👧',
    title: 'Family',
    titleZh: '家人',
    description: 'Talk about the people closest to you.',
    chars: ['爸爸', '妈妈', '哥哥', '姐姐', '弟弟', '妹妹', '儿子', '女儿', '人', '家'],
  },
  {
    id: 'lesson-05',
    emoji: '⏰',
    title: 'Time & Days',
    titleZh: '时间',
    description: 'Say when things happen — today, tomorrow, morning, and afternoon.',
    chars: ['今天', '明天', '昨天', '年', '月', '日', '上午', '下午', '现在', '时候', '今年', '前天'],
  },
  {
    id: 'lesson-06',
    emoji: '🍜',
    title: 'Food & Drink',
    titleZh: '饮食',
    description: 'Order food, talk about eating and drinking — essential daily vocabulary.',
    chars: ['吃', '喝', '水', '茶', '米饭', '菜', '水果', '鸡蛋', '渴', '饿', '东西'],
  },
  {
    id: 'lesson-07',
    emoji: '🏙️',
    title: 'Places',
    titleZh: '地点',
    description: 'Navigate the world around you — home, school, shops, and China itself.',
    chars: ['家', '学校', '医院', '商店', '饭店', '中国', '北京', '上面', '下面', '里'],
  },
  {
    id: 'lesson-08',
    emoji: '❓',
    title: 'Questions',
    titleZh: '疑问词',
    description: 'Ask who, what, where, and how — the words that unlock real conversations.',
    chars: ['什么', '哪', '谁', '怎么', '怎么样', '哪儿', '这', '那', '这里', '那里'],
  },
  {
    id: 'lesson-09',
    emoji: '🏃',
    title: 'Actions',
    titleZh: '动词',
    description: 'Go, come, look, speak — the action words that make sentences come alive.',
    chars: ['去', '来', '看', '说', '听', '写', '买', '学习', '工作', '知道', '回', '走'],
  },
  {
    id: 'lesson-10',
    emoji: '💡',
    title: 'Useful Phrases',
    titleZh: '常用语',
    description: 'Put it all together with the key words for expressing wants, abilities, and feelings.',
    chars: ['有', '没有', '想', '要', '喜欢', '能', '会', '爱', '爱好', '高兴', '对'],
  },
]
