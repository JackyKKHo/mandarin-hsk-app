import AppHeader from '../components/AppHeader'
import { Link } from 'react-router-dom'

interface Radical {
  char: string
  alt?: string      // simplified/variant form
  pinyin: string
  meaning: string
  examples: string  // e.g. "人(rén), 从(cóng)"
}

const RADICALS: Radical[] = [
  // People & body
  { char: '人', alt: '亻', pinyin: 'rén', meaning: 'person', examples: '他, 你, 位, 做, 们' },
  { char: '口', pinyin: 'kǒu', meaning: 'mouth', examples: '吃, 喝, 叫, 唱, 吧' },
  { char: '手', alt: '扌', pinyin: 'shǒu', meaning: 'hand', examples: '打, 拿, 找, 推, 把' },
  { char: '心', alt: '忄', pinyin: 'xīn', meaning: 'heart/mind', examples: '想, 忘, 快, 情, 忙' },
  { char: '目', pinyin: 'mù', meaning: 'eye', examples: '看, 睛, 眼, 睡, 盲' },
  { char: '耳', pinyin: 'ěr', meaning: 'ear', examples: '听, 聪, 职, 聊' },
  { char: '足', alt: '⻊', pinyin: 'zú', meaning: 'foot', examples: '跑, 跳, 路, 跟, 踢' },
  { char: '女', pinyin: 'nǚ', meaning: 'woman', examples: '她, 姐, 妈, 好, 姓' },
  { char: '子', pinyin: 'zǐ', meaning: 'child/son', examples: '学, 字, 孩, 孙, 孔' },
  // Nature
  { char: '日', pinyin: 'rì', meaning: 'sun/day', examples: '明, 时, 早, 晚, 春' },
  { char: '月', pinyin: 'yuè', meaning: 'moon/month', examples: '明, 期, 朋, 服, 脸' },
  { char: '水', alt: '氵', pinyin: 'shuǐ', meaning: 'water', examples: '河, 海, 游, 洗, 泳' },
  { char: '火', alt: '灬', pinyin: 'huǒ', meaning: 'fire', examples: '烧, 热, 煮, 烤, 熟' },
  { char: '木', pinyin: 'mù', meaning: 'wood/tree', examples: '树, 桌, 椅, 林, 森' },
  { char: '山', pinyin: 'shān', meaning: 'mountain', examples: '岁, 岛, 峰, 崖' },
  { char: '土', pinyin: 'tǔ', meaning: 'earth/soil', examples: '地, 城, 块, 坐, 场' },
  { char: '金', alt: '钅', pinyin: 'jīn', meaning: 'metal/gold', examples: '钱, 银, 铁, 钟, 镜' },
  { char: '草', alt: '艹', pinyin: 'cǎo', meaning: 'grass/plant', examples: '花, 茶, 药, 菜, 苦' },
  // Animals
  { char: '马', pinyin: 'mǎ', meaning: 'horse', examples: '骑, 驾, 骗, 驶' },
  { char: '鱼', pinyin: 'yú', meaning: 'fish', examples: '鲜, 鲸, 鳄, 鲤' },
  { char: '鸟', pinyin: 'niǎo', meaning: 'bird', examples: '鸡, 鸭, 鹅, 鸽, 鹰' },
  // Buildings & places
  { char: '宀', pinyin: 'mián', meaning: 'roof/house', examples: '家, 安, 字, 室, 客' },
  { char: '门', pinyin: 'mén', meaning: 'gate/door', examples: '问, 闻, 间, 关, 开' },
  { char: '囗', pinyin: 'wéi', meaning: 'enclosure', examples: '国, 园, 围, 图, 团' },
  // Movement & direction
  { char: '走', pinyin: 'zǒu', meaning: 'walk', examples: '起, 赶, 越, 超' },
  { char: '车', pinyin: 'chē', meaning: 'vehicle', examples: '辆, 轮, 轻, 转, 软' },
  { char: '行', pinyin: 'xíng', meaning: 'walk/do', examples: '很, 得, 街, 衔' },
  // Language & knowledge
  { char: '言', alt: '讠', pinyin: 'yán', meaning: 'speech/word', examples: '说, 话, 读, 请, 谢' },
  { char: '文', pinyin: 'wén', meaning: 'language/culture', examples: '文, 斐, 斑' },
  // Misc
  { char: '大', pinyin: 'dà', meaning: 'big', examples: '天, 太, 美, 类, 夫' },
  { char: '小', pinyin: 'xiǎo', meaning: 'small', examples: '少, 尖, 省' },
  { char: '力', pinyin: 'lì', meaning: 'strength', examples: '动, 努, 加, 助, 功' },
  { char: '刀', alt: '刂', pinyin: 'dāo', meaning: 'knife', examples: '分, 切, 利, 别, 到' },
  { char: '示', alt: '礻', pinyin: 'shì', meaning: 'spirit/show', examples: '祝, 视, 社, 神, 礼' },
  { char: '食', alt: '饣', pinyin: 'shí', meaning: 'food/eat', examples: '饭, 饿, 饮, 馆, 饼' },
  { char: '衣', alt: '衤', pinyin: 'yī', meaning: 'clothing', examples: '裙, 裤, 袜, 被, 初' },
  { char: '田', pinyin: 'tián', meaning: 'field', examples: '男, 画, 界, 留, 番' },
  { char: '石', pinyin: 'shí', meaning: 'stone/rock', examples: '破, 碗, 研, 碰, 磁' },
  { char: '雨', pinyin: 'yǔ', meaning: 'rain', examples: '雪, 云, 零, 电, 雷' },
  { char: '页', pinyin: 'yè', meaning: 'page/leaf', examples: '顺, 须, 题, 颜, 领' },
]

const CATEGORIES = [
  { label: 'People & Body', keys: ['人','口','手','心','目','耳','足','女','子'] },
  { label: 'Nature', keys: ['日','月','水','火','木','山','土','金','草'] },
  { label: 'Animals', keys: ['马','鱼','鸟'] },
  { label: 'Buildings & Places', keys: ['宀','门','囗'] },
  { label: 'Movement', keys: ['走','车','行'] },
  { label: 'Language & Knowledge', keys: ['言','文'] },
  { label: 'Other', keys: ['大','小','力','刀','示','食','衣','田','石','雨','页'] },
]

export default function RadicalsPage() {
  const byChar = Object.fromEntries(RADICALS.map(r => [r.char, r]))

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="guides-hero">
        <h2>Chinese Radicals <span className="header-zh">部首</span></h2>
        <p className="guides-hero-desc">
          Radicals are the building blocks of Chinese characters. Learning them helps you recognise and remember new words faster.
          Most characters contain a semantic radical (meaning hint) and a phonetic component.
        </p>
        <Link to="/guides" className="back-link" style={{ display: 'inline-block', marginTop: '0.5rem' }}>← Guides</Link>
      </div>

      {CATEGORIES.map(cat => (
        <section key={cat.label} className="radicals-section">
          <h3 className="radicals-section-title">{cat.label}</h3>
          <div className="radicals-grid">
            {cat.keys.map(k => {
              const r = byChar[k]
              if (!r) return null
              return (
                <div key={r.char} className="radical-card">
                  <div className="radical-char">
                    {r.char}{r.alt && <span className="radical-alt">{r.alt}</span>}
                  </div>
                  <div className="radical-pinyin">{r.pinyin}</div>
                  <div className="radical-meaning">{r.meaning}</div>
                  <div className="radical-examples">{r.examples}</div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
