import AppHeader from '../components/AppHeader'
import { Link } from 'react-router-dom'
import TonedPinyin from '../components/TonedPinyin'
import { useSEO } from '../hooks/useSEO'

interface MW {
  char: string
  pinyin: string
  meaning: string
  usedFor: string
  examples: { zh: string; en: string }[]
}

const MEASURE_WORDS: MW[] = [
  {
    char: '个', pinyin: 'gè', meaning: 'general counter',
    usedFor: 'Most nouns — people, fruit, ideas (most versatile)',
    examples: [
      { zh: '一个人', en: 'one person' },
      { zh: '两个苹果', en: 'two apples' },
      { zh: '三个问题', en: 'three questions' },
    ],
  },
  {
    char: '本', pinyin: 'běn', meaning: 'volume',
    usedFor: 'Books, magazines, notebooks',
    examples: [
      { zh: '一本书', en: 'one book' },
      { zh: '两本杂志', en: 'two magazines' },
    ],
  },
  {
    char: '张', pinyin: 'zhāng', meaning: 'flat, sheet',
    usedFor: 'Paper, photos, tickets, tables, faces',
    examples: [
      { zh: '一张纸', en: 'one sheet of paper' },
      { zh: '两张票', en: 'two tickets' },
      { zh: '一张桌子', en: 'one table' },
    ],
  },
  {
    char: '条', pinyin: 'tiáo', meaning: 'strip, long & flexible',
    usedFor: 'Long flexible things — fish, snakes, trousers, roads, rivers',
    examples: [
      { zh: '一条鱼', en: 'one fish' },
      { zh: '两条路', en: 'two roads' },
      { zh: '一条裤子', en: 'a pair of trousers' },
    ],
  },
  {
    char: '只', pinyin: 'zhī', meaning: 'single (animal)',
    usedFor: 'Small animals (cats, dogs, birds), one of a pair',
    examples: [
      { zh: '一只猫', en: 'one cat' },
      { zh: '两只鸟', en: 'two birds' },
      { zh: '一只手', en: 'one hand' },
    ],
  },
  {
    char: '辆', pinyin: 'liàng', meaning: 'wheeled vehicle',
    usedFor: 'Cars, bikes, buses, trains',
    examples: [
      { zh: '一辆车', en: 'one car' },
      { zh: '两辆自行车', en: 'two bicycles' },
    ],
  },
  {
    char: '件', pinyin: 'jiàn', meaning: 'item, piece',
    usedFor: 'Clothing (tops), matters, luggage',
    examples: [
      { zh: '一件衣服', en: 'one piece of clothing' },
      { zh: '三件事', en: 'three matters' },
    ],
  },
  {
    char: '双', pinyin: 'shuāng', meaning: 'pair',
    usedFor: 'Things that come in pairs — shoes, socks, chopsticks, eyes',
    examples: [
      { zh: '一双鞋', en: 'a pair of shoes' },
      { zh: '两双筷子', en: 'two pairs of chopsticks' },
    ],
  },
  {
    char: '杯', pinyin: 'bēi', meaning: 'cup, glass',
    usedFor: 'Drinks in cups or glasses',
    examples: [
      { zh: '一杯水', en: 'a glass of water' },
      { zh: '两杯咖啡', en: 'two cups of coffee' },
    ],
  },
  {
    char: '碗', pinyin: 'wǎn', meaning: 'bowl',
    usedFor: 'Food or drink served in bowls',
    examples: [
      { zh: '一碗饭', en: 'a bowl of rice' },
      { zh: '两碗汤', en: 'two bowls of soup' },
    ],
  },
  {
    char: '瓶', pinyin: 'píng', meaning: 'bottle',
    usedFor: 'Bottled drinks',
    examples: [
      { zh: '一瓶水', en: 'a bottle of water' },
      { zh: '两瓶啤酒', en: 'two bottles of beer' },
    ],
  },
  {
    char: '块', pinyin: 'kuài', meaning: 'chunk, piece',
    usedFor: 'Chunky things — bread, cake, soap, land; also colloquial for 元 (yuan)',
    examples: [
      { zh: '一块蛋糕', en: 'a piece of cake' },
      { zh: '两块钱', en: 'two yuan (colloquial)' },
    ],
  },
  {
    char: '把', pinyin: 'bǎ', meaning: 'handful, handle',
    usedFor: 'Things with handles — umbrella, knife, chairs',
    examples: [
      { zh: '一把伞', en: 'one umbrella' },
      { zh: '一把椅子', en: 'one chair' },
      { zh: '一把刀', en: 'one knife' },
    ],
  },
  {
    char: '封', pinyin: 'fēng', meaning: 'sealed',
    usedFor: 'Letters, emails',
    examples: [
      { zh: '一封信', en: 'a letter' },
      { zh: '两封邮件', en: 'two emails' },
    ],
  },
  {
    char: '间', pinyin: 'jiān', meaning: 'room, space',
    usedFor: 'Rooms',
    examples: [
      { zh: '一间房间', en: 'one room' },
      { zh: '两间教室', en: 'two classrooms' },
    ],
  },
  {
    char: '位', pinyin: 'wèi', meaning: 'polite person counter',
    usedFor: 'People (polite/formal)',
    examples: [
      { zh: '一位老师', en: 'one teacher (polite)' },
      { zh: '三位客人', en: 'three guests (polite)' },
    ],
  },
  {
    char: '首', pinyin: 'shǒu', meaning: 'head (songs/poems)',
    usedFor: 'Songs, poems',
    examples: [
      { zh: '一首歌', en: 'one song' },
      { zh: '两首诗', en: 'two poems' },
    ],
  },
  {
    char: '节', pinyin: 'jié', meaning: 'section, lesson',
    usedFor: 'Classes, sections, segments',
    examples: [
      { zh: '一节课', en: 'one class/lesson' },
      { zh: '三节电池', en: 'three batteries' },
    ],
  },
  {
    char: '台', pinyin: 'tái', meaning: 'platform/machine',
    usedFor: 'Machines, appliances, computers, TVs',
    examples: [
      { zh: '一台电脑', en: 'one computer' },
      { zh: '两台电视', en: 'two TVs' },
    ],
  },
  {
    char: '棵', pinyin: 'kē', meaning: 'plant/tree',
    usedFor: 'Trees, plants',
    examples: [
      { zh: '一棵树', en: 'one tree' },
      { zh: '两棵草', en: 'two blades of grass' },
    ],
  },
]

export default function MeasureWordsPage() {
  useSEO({ title: 'Chinese Measure Words Guide (量词)', description: 'Master 20 essential Chinese measure words (量词) with usage rules and example phrases. Learn 个, 本, 张, 条 and more.', path: '/measure-words' })
  return (
    <div className="browser-page">
      <AppHeader />
      <div className="guides-hero">
        <h2>Measure Words <span className="header-zh">量词</span></h2>
        <p className="guides-hero-desc">
          Chinese nouns always need a measure word (量词) when counting.
          English uses measure words for uncountable nouns ("a cup of tea"), but Mandarin uses them for <em>all</em> nouns.
          When unsure, <strong>个 (gè)</strong> works for most situations.
        </p>
        <Link to="/guides" className="back-link" style={{ display: 'inline-block', marginTop: '0.5rem' }}>← Guides</Link>
      </div>

      <div className="mw-tip">
        <strong>Pattern:</strong> Number + Measure word + Noun &nbsp;→&nbsp; 两<strong>个</strong>苹果 (two apples), 一<strong>本</strong>书 (one book)
      </div>

      <div className="mw-grid">
        {MEASURE_WORDS.map(mw => (
          <div key={mw.char} className="mw-card">
            <div className="mw-header">
              <span className="mw-char">{mw.char}</span>
              <div>
                <TonedPinyin pinyin={mw.pinyin} className="mw-pinyin" />
                <div className="mw-meaning">{mw.meaning}</div>
              </div>
            </div>
            <div className="mw-used-for">{mw.usedFor}</div>
            <div className="mw-examples">
              {mw.examples.map((ex, i) => (
                <div key={i} className="mw-example">
                  <span className="mw-ex-zh">{ex.zh}</span>
                  <span className="mw-ex-en">{ex.en}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
