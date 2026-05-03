import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

// ─── Tone data ────────────────────────────────────────────────────────────────

const TONES = [
  {
    n: 1, mark: 'ā', name: 'First tone', zh: '阴平',
    desc: 'High and flat — hold it steady like a musical note',
    path: 'M12,14 L88,14',
    example: { char: '妈', pinyin: 'mā', en: 'mother' },
  },
  {
    n: 2, mark: 'á', name: 'Second tone', zh: '阳平',
    desc: 'Rising — like asking a question',
    path: 'M12,58 L88,14',
    example: { char: '麻', pinyin: 'má', en: 'hemp / numb' },
  },
  {
    n: 3, mark: 'ǎ', name: 'Third tone', zh: '上声',
    desc: 'Dip then rise — goes low before coming back up',
    path: 'M12,36 C32,72 60,72 88,28',
    example: { char: '马', pinyin: 'mǎ', en: 'horse' },
  },
  {
    n: 4, mark: 'à', name: 'Fourth tone', zh: '去声',
    desc: 'Sharp fall — like giving a firm command',
    path: 'M12,14 L88,70',
    example: { char: '骂', pinyin: 'mà', en: 'to scold' },
  },
  {
    n: 0, mark: '·', name: 'Neutral tone', zh: '轻声',
    desc: 'Light and short — unstressed, no fixed pitch',
    path: 'M32,44 L68,44',
    example: { char: '吗', pinyin: 'ma', en: 'question particle' },
  },
]

// ─── Initials ─────────────────────────────────────────────────────────────────

const INITIAL_GROUPS = [
  {
    label: 'Bilabial / Labiodental',
    items: [
      { init: 'b', char: '爸', tip: 'Like English "b" but unaspirated' },
      { init: 'p', char: '怕', tip: 'Like "p" — strongly puffed' },
      { init: 'm', char: '妈', tip: 'Same as English "m"' },
      { init: 'f', char: '发', tip: 'Same as English "f"' },
    ],
  },
  {
    label: 'Alveolar',
    items: [
      { init: 'd', char: '大', tip: 'Like "d" but unaspirated' },
      { init: 't', char: '他', tip: 'Like "t" — puffed' },
      { init: 'n', char: '那', tip: 'Same as English "n"' },
      { init: 'l', char: '来', tip: 'Same as English "l"' },
    ],
  },
  {
    label: 'Velar',
    items: [
      { init: 'g', char: '哥', tip: 'Like "g" but unaspirated' },
      { init: 'k', char: '看', tip: 'Like "k" — puffed' },
      { init: 'h', char: '好', tip: 'Throaty, like Scottish "loch"' },
    ],
  },
  {
    label: 'Palatal',
    items: [
      { init: 'j', char: '家', tip: 'Like "j" in jeep — no puff' },
      { init: 'q', char: '七', tip: 'Like "ch" in cheese — puffed' },
      { init: 'x', char: '小', tip: 'Like "sh" but forward, near teeth' },
    ],
  },
  {
    label: 'Retroflex (tongue curls back)',
    items: [
      { init: 'zh', char: '这', tip: 'Like "j" with tongue curled back' },
      { init: 'ch', char: '吃', tip: 'Like "ch" with tongue curled back' },
      { init: 'sh', char: '是', tip: 'Like "sh" with tongue curled back' },
      { init: 'r',  char: '人', tip: 'Voiced retroflex — like "r"+"zh"' },
    ],
  },
  {
    label: 'Sibilant',
    items: [
      { init: 'z', char: '在', tip: 'Like "ds" in "kids"' },
      { init: 'c', char: '错', tip: 'Like "ts" in "cats"' },
      { init: 's', char: '三', tip: 'Same as English "s"' },
    ],
  },
]

// ─── Finals ───────────────────────────────────────────────────────────────────

const FINAL_GROUPS = [
  {
    label: 'Simple vowels',
    items: [
      { final: 'a', ex: 'ā', char: '啊', tip: '"Ah"' },
      { final: 'o', ex: 'ō', char: '哦', tip: '"Aw"' },
      { final: 'e', ex: 'ē', char: '鹅', tip: 'Neutral "uh"' },
      { final: 'i', ex: 'yī', char: '衣', tip: '"ee"  (or buzzy after zh/ch/sh/r/z/c/s)' },
      { final: 'u', ex: 'wū', char: '屋', tip: '"oo"' },
      { final: 'ü', ex: 'yú', char: '鱼', tip: 'Round lips for "ee"' },
    ],
  },
  {
    label: 'Diphthongs',
    items: [
      { final: 'ai', ex: 'ài', char: '爱', tip: '"eye"' },
      { final: 'ei', ex: 'ēi', char: '诶', tip: '"ay"' },
      { final: 'ao', ex: 'áo', char: '澳', tip: '"ow"' },
      { final: 'ou', ex: 'ōu', char: '欧', tip: '"oh"' },
      { final: 'er', ex: 'ér', char: '耳', tip: 'Like "er" — tongue curls slightly' },
    ],
  },
  {
    label: 'Nasal finals',
    items: [
      { final: 'an', ex: 'ān', char: '安', tip: '"ahn"' },
      { final: 'en', ex: 'ēn', char: '恩', tip: '"un"' },
      { final: 'in', ex: 'yīn', char: '因', tip: '"een"' },
      { final: 'un', ex: 'wēn', char: '温', tip: '"wen"' },
      { final: 'ün', ex: 'yún', char: '云', tip: 'Rounded "een"' },
      { final: 'ang', ex: 'āng', char: '昂', tip: '"ahng"' },
      { final: 'eng', ex: 'ēng', char: '鞥', tip: '"ung"' },
      { final: 'ing', ex: 'yīng', char: '英', tip: '"eeng"' },
      { final: 'ong', ex: 'yōng', char: '翁', tip: '"ong"' },
    ],
  },
  {
    label: '-i medial',
    items: [
      { final: 'ia',   ex: 'yā',   char: '牙', tip: '"yah"' },
      { final: 'ie',   ex: 'yē',   char: '也', tip: '"yeh"' },
      { final: 'iao',  ex: 'yāo',  char: '腰', tip: '"yow"' },
      { final: 'iu',   ex: 'yōu',  char: '优', tip: '"yo"' },
      { final: 'ian',  ex: 'yān',  char: '烟', tip: '"yen"' },
      { final: 'iang', ex: 'yāng', char: '央', tip: '"yahng"' },
      { final: 'iong', ex: 'yōng', char: '用', tip: '"yong"' },
    ],
  },
  {
    label: '-u medial',
    items: [
      { final: 'ua',   ex: 'wā',   char: '蛙', tip: '"wah"' },
      { final: 'uo',   ex: 'wō',   char: '窝', tip: '"waw"' },
      { final: 'uai',  ex: 'wài',  char: '外', tip: '"why"' },
      { final: 'ui',   ex: 'wèi',  char: '喂', tip: '"way"' },
      { final: 'uan',  ex: 'wān',  char: '弯', tip: '"wan"' },
      { final: 'uang', ex: 'wāng', char: '汪', tip: '"wahng"' },
    ],
  },
  {
    label: '-ü medial',
    items: [
      { final: 'üe',  ex: 'yuē',  char: '月', tip: '"yoo-eh"' },
      { final: 'üan', ex: 'yuān', char: '冤', tip: '"yoo-en"' },
    ],
  },
]

// ─── Syllable chart ───────────────────────────────────────────────────────────

const INITIALS = ['', 'b','p','m','f','d','t','n','l','g','k','h','j','q','x','zh','ch','sh','r','z','c','s']

// Finals columns shown in the chart, grouped
const CHART_FINALS = [
  ['a','o','e'],
  ['ai','ei','ao','ou','er'],
  ['an','en','ang','eng'],
  ['i','ia','ie','iao','iu','ian','in','iang','ing','iong'],
  ['u','ua','uo','uai','ui','uan','un','uang'],
  ['ü','üe','üan','ün'],
]

// Comprehensive syllable → example character map
const CHAR_MAP: Record<string, string> = {
  a:'啊', o:'哦', e:'鹅', ai:'爱', ei:'诶', ao:'傲', ou:'欧', an:'安', en:'恩', ang:'昂', eng:'鞥', er:'耳',
  ba:'爸', bo:'波', bai:'白', bei:'北', bao:'包', ban:'半', ben:'本', bang:'帮', beng:'崩',
  bi:'比', bie:'别', biao:'表', bian:'边', bin:'宾', bing:'病', bu:'不',
  pa:'怕', po:'破', pai:'牌', pei:'配', pao:'跑', pou:'剖', pan:'盘', pen:'喷',
  pang:'旁', peng:'碰', pi:'皮', pie:'撇', piao:'漂', pian:'片', pin:'品', ping:'平', pu:'铺',
  ma:'妈', mo:'默', me:'么', mai:'买', mei:'美', mao:'猫', mou:'某', man:'慢', men:'门',
  mang:'忙', meng:'梦', mi:'米', mie:'灭', miao:'描', miu:'谬', mian:'面', min:'民', ming:'名', mu:'木',
  fa:'发', fo:'佛', fei:'飞', fou:'否', fan:'饭', fen:'分', fang:'方', feng:'风', fu:'福',
  da:'大', de:'的', dai:'带', dao:'到', dou:'都', dan:'但', dang:'当', deng:'等',
  dong:'东', di:'地', die:'蝶', diao:'调', diu:'丢', dian:'电', ding:'定', du:'读', duo:'多', dui:'对', duan:'段', dun:'顿',
  ta:'他', te:'特', tai:'太', tao:'套', tou:'投', tan:'谈', tang:'糖', teng:'疼', tong:'同',
  ti:'题', tie:'铁', tiao:'跳', tian:'天', ting:'听', tu:'土', tuo:'拖', tui:'推', tuan:'团', tun:'吞',
  na:'那', ne:'呢', nai:'奶', nei:'内', nao:'脑', nan:'南', nen:'嫩', nang:'馕', neng:'能', nong:'农',
  ni:'你', nie:'捏', niao:'鸟', niu:'牛', nian:'年', nin:'您', niang:'娘', ning:'宁',
  nu:'努', nuo:'挪', nuan:'暖', 'nü':'女', 'nüe':'虐',
  la:'拉', le:'了', lai:'来', lei:'累', lao:'老', lou:'楼', lan:'蓝', lang:'浪', leng:'冷', long:'龙',
  li:'里', lia:'俩', lie:'列', liao:'聊', liu:'六', lian:'练', lin:'林', liang:'两', ling:'零',
  lu:'路', luo:'落', luan:'乱', lun:'论', 'lü':'旅', 'lüe':'略',
  ga:'嘎', ge:'个', gai:'改', gei:'给', gao:'高', gou:'狗', gan:'干', gen:'根', gang:'钢', geng:'更',
  gong:'工', gu:'古', gua:'瓜', guo:'国', guai:'怪', gui:'贵', guan:'管', gun:'滚',
  ka:'卡', ke:'可', kai:'开', kao:'考', kou:'口', kan:'看', ken:'肯', kang:'康', keng:'坑',
  kong:'空', ku:'哭', kua:'夸', kuo:'扩', kuai:'快', kui:'愧', kuan:'款', kun:'困',
  ha:'哈', he:'和', hai:'还', hei:'黑', hao:'好', hou:'后', han:'汉', hen:'很', hang:'航', heng:'横',
  hong:'红', hu:'虎', hua:'花', huo:'火', huai:'坏', hui:'回', huan:'换', hun:'婚',
  ji:'几', jia:'家', jie:'节', jiao:'叫', jiu:'就', jian:'见', jin:'今', jiang:'讲', jing:'京', jiong:'炯',
  ju:'局', jue:'绝', juan:'卷', jun:'军',
  qi:'气', qia:'掐', qie:'切', qiao:'桥', qiu:'球', qian:'前', qin:'琴', qiang:'强', qing:'请', qiong:'穷',
  qu:'去', que:'却', quan:'全', qun:'群',
  xi:'西', xia:'下', xie:'写', xiao:'小', xiu:'秀', xian:'先', xin:'心', xiang:'想', xing:'行', xiong:'熊',
  xu:'续', xue:'学', xuan:'选', xun:'训',
  zha:'炸', zhe:'这', zhi:'知', zhao:'找', zhou:'周', zhan:'战', zhen:'真', zhang:'张', zheng:'正', zhong:'中',
  zhu:'主', zhuo:'桌', zhuai:'拽', zhui:'追', zhuan:'专', zhun:'准',
  cha:'茶', che:'车', chi:'吃', chao:'超', chou:'臭', chan:'产', chen:'沉', chang:'长', cheng:'城', chong:'虫',
  chu:'出', chuo:'戳', chuai:'揣', chui:'吹', chuan:'船', chun:'春',
  sha:'沙', she:'蛇', shi:'是', shao:'少', shou:'手', shan:'山', shen:'深', shang:'上', sheng:'生',
  shu:'书', shuo:'说', shua:'刷', shuai:'帅', shui:'水', shuan:'拴', shun:'顺',
  re:'热', ri:'日', rao:'绕', rou:'肉', ran:'然', ren:'人', rang:'让', reng:'仍', rong:'容',
  ru:'入', ruo:'若', rui:'瑞', ruan:'软', run:'润',
  za:'杂', ze:'则', zi:'子', zao:'早', zou:'走', zan:'赞', zen:'怎', zang:'脏', zeng:'增', zong:'总',
  zu:'组', zuo:'做', zui:'最', zuan:'钻', zun:'遵',
  ca:'擦', ce:'测', ci:'次', cao:'草', cou:'凑', can:'参', cen:'岑', cang:'藏', ceng:'层', cong:'从',
  cu:'粗', cuo:'错', cui:'催', cuan:'蹿', cun:'村',
  sa:'撒', se:'色', si:'四', sao:'扫', sou:'搜', san:'三', sen:'森', sang:'嗓', song:'送',
  su:'素', suo:'所', sui:'岁', suan:'算', sun:'孙',
  ya:'牙', ye:'也', yi:'一', yo:'哟', yao:'要', you:'有', yan:'言', yin:'因', yang:'样', ying:'英', yong:'用',
  yu:'鱼', yue:'月', yuan:'元', yun:'云',
  wa:'蛙', wo:'我', wu:'五', wai:'外', wei:'为', wan:'万', wen:'问', wang:'王', weng:'翁',
}

// Tone mark helpers
const VOWEL_MARKS: Record<number, Record<string, string>> = {
  1: { a:'ā',e:'ē',i:'ī',o:'ō',u:'ū',ü:'ǖ' },
  2: { a:'á',e:'é',i:'í',o:'ó',u:'ú',ü:'ǘ' },
  3: { a:'ǎ',e:'ě',i:'ǐ',o:'ǒ',u:'ǔ',ü:'ǚ' },
  4: { a:'à',e:'è',i:'ì',o:'ò',u:'ù',ü:'ǜ' },
}

function markTone(syllable: string, tone: number): string {
  if (tone === 0) return syllable
  const m = VOWEL_MARKS[tone]
  if (!m) return syllable
  // Rule: a/e take the mark; ou → mark on o; else last vowel
  for (const v of ['a', 'e']) {
    if (syllable.includes(v)) return syllable.replace(v, m[v])
  }
  if (syllable.includes('ou')) return syllable.replace('o', m['o'])
  for (const v of ['ü', 'u', 'i', 'o']) {
    const idx = syllable.lastIndexOf(v)
    if (idx !== -1) return syllable.slice(0, idx) + m[v] + syllable.slice(idx + 1)
  }
  return syllable
}

// Resolve written syllable from initial + final
function getSyllable(init: string, fin: string): string {
  if (!init) {
    // zero initial spelling rules
    const zeroI: Record<string, string> = {
      i:'yi', ia:'ya', ie:'ye', iao:'yao', iu:'you', ian:'yan', in:'yin', iang:'yang', ing:'ying', iong:'yong',
      u:'wu', ua:'wa', uo:'wo', uai:'wai', ui:'wei', uan:'wan', un:'wen', uang:'wang',
      'ü':'yu', 'üe':'yue', 'üan':'yuan', 'ün':'yun',
    }
    return zeroI[fin] ?? fin
  }
  // j/q/x + ü finals: write ü as u
  if (['j','q','x'].includes(init)) {
    const jqxFin = fin.replace('ü', 'u')
    return init + jqxFin
  }
  return init + fin
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PronunciationPage() {
  const [chartTone, setChartTone] = useState(1)
  const [playing, setPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  async function playChar(char: string, id: string) {
    if (playing === id) return
    setPlaying(id)
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(char)}`)
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      audioRef.current?.pause()
      const audio = new Audio(url)
      audioRef.current = audio
      audio.play().catch(() => {})
      audio.onended = () => setPlaying(null)
    } catch {
      setPlaying(null)
    }
  }

  return (
    <div className="pron-page">
      <Link to="/hsk/1" className="back-link">← Home</Link>

      <div className="pron-hero">
        <h1 className="pron-title">Pronunciation Guide <span className="pron-title-zh">发音指南</span></h1>
        <p className="pron-subtitle">Master the building blocks of Mandarin — tones, initials, and finals.</p>
      </div>

      {/* ── Tones ─────────────────────────────────────────────────── */}
      <section className="pron-section">
        <h2 className="pron-section-title">Tones <span className="pron-section-zh">声调</span></h2>
        <p className="pron-section-desc">
          Mandarin has 4 tones (plus a neutral tone). The same syllable spoken in different tones means
          completely different things — <em>mā má mǎ mà</em> are four distinct words.
        </p>

        <div className="tone-cards">
          {TONES.map(t => (
            <div key={t.n} className={`tone-card tone-card-${t.n}`}>
              <div className="tone-card-header">
                <span className="tone-num">{t.n === 0 ? '·' : t.n}</span>
                <span className="tone-name">{t.name}</span>
                <span className="tone-zh">{t.zh}</span>
              </div>

              {/* Pitch contour */}
              <div className="tone-contour-wrap">
                <svg viewBox="0 0 100 84" className="tone-contour-svg">
                  {/* Level lines */}
                  {[14, 28, 42, 56, 70].map((y, i) => (
                    <g key={i}>
                      <line x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
                      <text x="3" y={y - 2} fontSize="7" fill="currentColor" fillOpacity="0.35">{5 - i}</text>
                    </g>
                  ))}
                  {/* Tone curve */}
                  <path d={t.path} stroke="currentColor" strokeWidth="3.5" fill="none"
                    strokeLinecap="round" strokeLinejoin="round" />
                  {/* Arrow tip */}
                  <circle cx={t.path.match(/L(\d+),(\d+)$/)?.[1] ?? t.path.match(/(\d+),(\d+)$/)?.[1] ?? '50'}
                          cy={t.path.match(/L(\d+),(\d+)$/)?.[2] ?? t.path.match(/(\d+),(\d+)$/)?.[2] ?? '40'}
                          r="3.5" fill="currentColor" />
                </svg>
              </div>

              <p className="tone-desc">{t.desc}</p>

              <button
                className={`tone-example-btn${playing === `tone-${t.n}` ? ' playing' : ''}`}
                onClick={() => playChar(t.example.char, `tone-${t.n}`)}
              >
                <span className="tone-ex-char">{t.example.char}</span>
                <span className="tone-ex-pinyin">{t.example.pinyin}</span>
                <span className="tone-ex-en">{t.example.en}</span>
                <span className="tone-play-icon">{playing === `tone-${t.n}` ? '🔊' : '▶'}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Initials ──────────────────────────────────────────────── */}
      <section className="pron-section">
        <h2 className="pron-section-title">Initials <span className="pron-section-zh">声母</span></h2>
        <p className="pron-section-desc">
          21 consonants that begin a syllable. Click any to hear it in context.
        </p>

        {INITIAL_GROUPS.map(grp => (
          <div key={grp.label} className="pron-group">
            <div className="pron-group-label">{grp.label}</div>
            <div className="pron-items-grid">
              {grp.items.map(({ init, char, tip }) => {
                const id = `init-${init}`
                return (
                  <button
                    key={init}
                    className={`pron-item-btn${playing === id ? ' playing' : ''}`}
                    onClick={() => playChar(char, id)}
                    title={tip}
                  >
                    <span className="pron-item-main">{init}</span>
                    <span className="pron-item-char">{char}</span>
                    <span className="pron-item-tip">{tip}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Finals ────────────────────────────────────────────────── */}
      <section className="pron-section">
        <h2 className="pron-section-title">Finals <span className="pron-section-zh">韵母</span></h2>
        <p className="pron-section-desc">
          The vowel (or vowel + nasal) endings. Every Mandarin syllable contains a final.
        </p>

        {FINAL_GROUPS.map(grp => (
          <div key={grp.label} className="pron-group">
            <div className="pron-group-label">{grp.label}</div>
            <div className="pron-items-grid">
              {grp.items.map(({ final, char, ex, tip }) => {
                const id = `fin-${final}`
                return (
                  <button
                    key={final}
                    className={`pron-item-btn${playing === id ? ' playing' : ''}`}
                    onClick={() => playChar(char, id)}
                    title={tip}
                  >
                    <span className="pron-item-main">{final}</span>
                    <span className="pron-item-char">{char}</span>
                    <span className="pron-item-tip">{ex} · {tip}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Syllable chart ────────────────────────────────────────── */}
      <section className="pron-section">
        <h2 className="pron-section-title">Syllable Chart <span className="pron-section-zh">拼音表</span></h2>
        <p className="pron-section-desc">
          Every valid initial + final combination. Select a tone, then click any cell to hear it.
          Greyed cells are not valid in standard Mandarin.
        </p>

        {/* Tone picker */}
        <div className="chart-tone-picker">
          <span className="chart-tone-label">Tone:</span>
          {[1,2,3,4].map(t => (
            <button
              key={t}
              className={`chart-tone-btn${chartTone === t ? ' active' : ''}`}
              onClick={() => setChartTone(t)}
            >
              {t} <span className="chart-tone-mark">{VOWEL_MARKS[t]['a']}</span>
            </button>
          ))}
        </div>

        <div className="chart-scroll">
          {CHART_FINALS.map((finGroup, gi) => {
            const groupLabel = [
              'Basic vowels', 'Diphthongs & er', 'Nasal ( -n / -ng )',
              '-i medial', '-u medial', '-ü medial',
            ][gi]
            return (
              <div key={gi} className="chart-sub">
                <div className="chart-sub-title">{groupLabel}</div>
                <table className="pron-table">
                  <thead>
                    <tr>
                      <th className="pron-th-init">声母</th>
                      {finGroup.map(f => (
                        <th key={f} className="pron-th-fin">{f}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INITIALS.map(init => (
                      <tr key={init || '∅'}>
                        <td className="pron-td-init">{init || '∅'}</td>
                        {finGroup.map(fin => {
                          const syl = getSyllable(init, fin)
                          const char = CHAR_MAP[syl]
                          const id = `chart-${syl}`
                          const marked = markTone(syl, chartTone)

                          if (!char) {
                            return <td key={fin} className="pron-td pron-td-empty">—</td>
                          }
                          return (
                            <td key={fin} className="pron-td">
                              <button
                                className={`chart-cell-btn${playing === id ? ' playing' : ''}`}
                                onClick={() => playChar(char, id)}
                                title={`${marked} (${char})`}
                              >
                                <span className="chart-cell-syl">{marked}</span>
                                <span className="chart-cell-char">{char}</span>
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
