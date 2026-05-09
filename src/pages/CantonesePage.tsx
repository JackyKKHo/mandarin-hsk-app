import AppHeader from '../components/AppHeader'
import { useSEO } from '../hooks/useSEO'

const TONE_MAP = [
  { cant: '1 (high level)', cantEx: '詩 sī', mand: '1st tone ¯', mandEx: '詩 shī', note: 'Both high and level' },
  { cant: '2 (high rising)', cantEx: '史 sí', mand: '2nd tone /', mandEx: '十 shí', note: 'Both rise upward' },
  { cant: '3 (mid level)', cantEx: '試 si', mand: '4th tone \\', mandEx: '是 shì', note: 'Cant. mid vs Mand. falling' },
  { cant: '4 (low falling)', cantEx: '時 sìh', mand: '2nd tone /', mandEx: '時 shí', note: 'Cant. falls, Mand. rises' },
  { cant: '5 (low rising)', cantEx: '市 síh', mand: '3rd tone ˇ', mandEx: '以 yǐ', note: 'Both dip/rise' },
  { cant: '6 (low level)', cantEx: '事 sih', mand: '4th tone \\', mandEx: '事 shì', note: 'Cant. low, Mand. falling' },
]

const INITIALS = [
  { cant: 'b (unaspirated)', mand: 'b (unaspirated)', example: '爸 baa3 / bà', note: 'Same' },
  { cant: 'p (aspirated)', mand: 'p (aspirated)', example: '怕 paa3 / pà', note: 'Same' },
  { cant: 'm', mand: 'm', example: '媽 maa1 / mā', note: 'Same' },
  { cant: 'f', mand: 'h (in some words)', example: '飛 fēi / fei1 — 好 hǎo / hóu', note: 'Cant. f ↔ Mand. f or h' },
  { cant: 'd (unaspirated)', mand: 'd (unaspirated)', example: '大 daai6 / dà', note: 'Same' },
  { cant: 't (aspirated)', mand: 't (aspirated)', example: '天 tin1 / tiān', note: 'Same' },
  { cant: 'n', mand: 'n / l (merged in HK)', example: '你 nei5 / nǐ — 拿 naa4 / ná', note: 'Young HK speakers merge n/l' },
  { cant: 'l', mand: 'l', example: '來 lai4 / lái', note: 'Same' },
  { cant: 'g (unaspirated)', mand: 'g (unaspirated)', example: '高 gou1 / gāo', note: 'Same' },
  { cant: 'k (aspirated)', mand: 'k (aspirated)', example: '看 hon3 / kàn', note: 'Same sound, different romanisation' },
  { cant: 'ng (initial)', mand: '— (dropped)', example: '我 ngo5 / wǒ', note: 'Cant. keeps ng-, Mand. drops it' },
  { cant: 'h', mand: 'h', example: '好 hou2 / hǎo', note: 'Same' },
  { cant: 'gw', mand: 'gu / w', example: '國 gwok3 / guó', note: 'Cant. gw- = Mand. gu-/w-' },
  { cant: 'kw', mand: 'ku / w', example: '括 kut3 / kuò', note: 'Cant. kw- = Mand. ku-' },
  { cant: 'j', mand: 'y', example: '有 jau5 / yǒu', note: 'Cant. j = Mand. y' },
  { cant: 'w', mand: 'w', example: '我 ngo5 / wǒ', note: 'Cant. uses ng-; w overlaps' },
  { cant: 'z (unaspirated)', mand: 'zh / z / j', example: '這 ze5 / zhè, 字 zi6 / zì', note: 'Cant. lacks zh/x/q distinction' },
  { cant: 'c (aspirated)', mand: 'ch / c / q', example: '車 ce1 / chē', note: 'Cant. c covers all aspirated affricates' },
  { cant: 's', mand: 'sh / s / x', example: '試 si3 / shì, 四 sei3 / sì', note: 'Cant. s covers sh/s/x' },
]

const VOCAB_DIFF = [
  { concept: 'I / me', cant: '我 (ngo5)', mand: '我 (wǒ)', note: 'Same character, different sound' },
  { concept: 'You', cant: '你 (nei5)', mand: '你 (nǐ)', note: 'Same character' },
  { concept: 'He/She', cant: '佢 (keoi5)', mand: '他/她 (tā)', note: 'Different characters' },
  { concept: 'We', cant: '我哋 (ngo5 dei6)', mand: '我们 (wǒmen)', note: 'Cant. 哋 vs Mand. 们 for plural' },
  { concept: 'Very', cant: '好 (hou2)', mand: '很 (hěn)', note: 'Different characters' },
  { concept: 'Not / No', cant: '唔 (m4)', mand: '不 (bù)', note: 'Completely different' },
  { concept: "Don't have", cant: '冇 (mou5)', mand: '没有 (méiyǒu)', note: 'Unique Cant. character 冇' },
  { concept: 'Eat', cant: '食 (sik6)', mand: '吃 (chī)', note: 'Different characters' },
  { concept: 'Speak', cant: '講 (gong2)', mand: '说 (shuō)', note: 'Different characters' },
  { concept: 'Go', cant: '去 (heoi3)', mand: '去 (qù)', note: 'Same character, different sound' },
  { concept: 'Come', cant: '嚟 (lai4)', mand: '来 (lái)', note: 'Same sound/meaning, different char' },
  { concept: 'Good', cant: '好 (hou2)', mand: '好 (hǎo)', note: 'Same character' },
  { concept: "Question particle", cant: '咩 (me3) / 呀 (aa3)', mand: '吗 (ma) / 呢 (ne)', note: 'Both have sentence-final particles' },
  { concept: 'Sentence-final completion', cant: '咗 (zo2)', mand: '了 (le)', note: 'Both mark completed action' },
]

const SOUND_SHIFTS = [
  {
    title: 'The "n → l" drift in Hong Kong Cantonese',
    body: 'Many younger Hong Kong speakers merge initial n- and l-, pronouncing 你 as lèi5 instead of nei5. This is a modern sound change unique to HK Cantonese — not present in Guangdong or Macau Cantonese.',
  },
  {
    title: 'Mandarin lost entering tones (入聲)',
    body: "Classical Chinese had a 4th category: 入聲 (entering tones) — short, stopped syllables ending in -p, -t, -k. Cantonese preserved them (e.g. 食 sik6, 白 baak6, 得 dak1). Mandarin merged these into the other 4 tones, which is why Mandarin lacks final consonants like -p, -t, -k.",
  },
  {
    title: 'The great "f ↔ h" split',
    body: 'Many Cantonese f- words correspond to Mandarin f- or h- words. 飛 (fly): Cant. fei1, Mand. fēi (same). But 好 (good): Cant. hou2, Mand. hǎo — Cant. h → Mand. h. Meanwhile 花 (flower): Cant. faa1, Mand. huā — the Cant. f became Mand. hu.',
  },
  {
    title: 'Cantonese preserves Middle Chinese nasal initials',
    body: 'Many words starting with ng- in Cantonese lost their nasal onset in Mandarin. 我 (I): Cant. ngo5, Mand. wǒ. 牛 (cow): Cant. ngau4, Mand. niú. 眼 (eye): Cant. ngaan5, Mand. yǎn. The ng- is a relic of Middle Chinese.',
  },
  {
    title: 'Retroflexes: Mandarin added, Cantonese never did',
    body: "Mandarin developed retroflex consonants (zh, ch, sh, r) from palatals. Cantonese didn't undergo this shift, so it lacks zh/ch/sh/r entirely. Where Mandarin says zhōng (中), Cantonese says zung1 — the affricate is the same class, just non-retroflex.",
  },
]

export default function CantonesePage() {
  useSEO({ title: 'Cantonese to Mandarin — Tones, Sounds & Vocabulary', path: '/cantonese' })

  return (
    <div className="browser-page">
      <AppHeader />
      <div className="cant-page">

        <div className="cant-hero">
          <h2 className="cant-title">Cantonese → Mandarin</h2>
          <p className="cant-subtitle">
            Both languages descended from Middle Chinese. Understanding how they diverged
            helps you predict pronunciations, recall vocabulary, and see the patterns behind the differences.
          </p>
        </div>

        {/* Tones */}
        <section className="cant-section">
          <h3 className="cant-section-title">Tone Mapping</h3>
          <p className="cant-note">
            Cantonese has 6 tones (9 including checked tones); Mandarin has 4 + neutral.
            They don't map 1:1, but patterns exist.
          </p>
          <div className="tone-compare-grid">
            {TONE_MAP.map((t, i) => (
              <div key={i} className="tone-compare-row">
                <div className="tc-cant">
                  <span className="tc-badge tc-badge-cant">Cant.</span>
                  <span className="tc-tone">{t.cant}</span>
                  <span className="tc-ex">{t.cantEx}</span>
                </div>
                <span className="tc-arrow">→</span>
                <div className="tc-mand">
                  <span className="tc-badge tc-badge-mand">Mand.</span>
                  <span className="tc-tone">{t.mand}</span>
                  <span className="tc-ex">{t.mandEx}</span>
                </div>
                <span className="tc-note">{t.note}</span>
              </div>
            ))}
          </div>
          <div className="cant-callout">
            <strong>Key insight:</strong> Cantonese Tone 1 (high level) often corresponds to Mandarin Tone 1.
            Cantonese Tone 3 and 6 (both level tones at different pitches) often map to Mandarin Tone 4.
            The mapping is not strict — the same character can differ based on historical sound shifts.
          </div>
        </section>

        {/* Sound shifts */}
        <section className="cant-section">
          <h3 className="cant-section-title">Key Sound Shifts</h3>
          <div className="sound-shift-list">
            {SOUND_SHIFTS.map(s => (
              <div key={s.title} className="sound-shift-card">
                <h4 className="sound-shift-title">{s.title}</h4>
                <p className="sound-shift-body">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Initials */}
        <section className="cant-section">
          <h3 className="cant-section-title">Initial Consonant Mapping</h3>
          <p className="cant-note">
            Cantonese has 19 initials; Mandarin has 21 (plus retroflex set zh/ch/sh/r).
            Many map directly — the key divergences are marked.
          </p>
          <div className="initials-table-wrap">
            <table className="initials-table">
              <thead>
                <tr>
                  <th>Cantonese</th>
                  <th>Mandarin equivalent</th>
                  <th>Example</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {INITIALS.map((row, i) => (
                  <tr key={i} className={row.note !== 'Same' ? 'row-diff' : ''}>
                    <td className="init-cant"><strong>{row.cant}</strong></td>
                    <td className="init-mand">{row.mand}</td>
                    <td className="init-ex">{row.example}</td>
                    <td className="init-note">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Vocabulary differences */}
        <section className="cant-section">
          <h3 className="cant-section-title">Vocabulary Comparison</h3>
          <p className="cant-note">
            Many everyday words diverged — Cantonese often preserved older forms or developed uniquely.
          </p>
          <div className="vocab-compare-grid">
            {VOCAB_DIFF.map(v => (
              <div key={v.concept} className="vocab-compare-card">
                <div className="vc-concept">{v.concept}</div>
                <div className="vc-row">
                  <span className="vc-badge vc-cant">粵</span>
                  <span className="vc-word">{v.cant}</span>
                </div>
                <div className="vc-row">
                  <span className="vc-badge vc-mand">普</span>
                  <span className="vc-word">{v.mand}</span>
                </div>
                <div className="vc-note">{v.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Finals / finals comparison */}
        <section className="cant-section">
          <h3 className="cant-section-title">Final Consonants</h3>
          <p className="cant-note">
            This is one of the biggest structural differences between the two languages.
          </p>
          <div className="finals-compare">
            <div className="finals-col">
              <div className="finals-col-head cant-head">Cantonese finals</div>
              <div className="finals-list">
                {['-p','-t','-k','-m','-n','-ng'].map(f => (
                  <span key={f} className="final-badge final-cant">{f}</span>
                ))}
              </div>
              <p className="finals-desc">Preserves all 6 final consonants from Middle Chinese.</p>
            </div>
            <div className="finals-col">
              <div className="finals-col-head mand-head">Mandarin finals</div>
              <div className="finals-list">
                {['-n','-ng'].map(f => (
                  <span key={f} className="final-badge final-mand">{f}</span>
                ))}
                {['-p','-t','-k','-m'].map(f => (
                  <span key={f} className="final-badge final-lost">{f} ✗</span>
                ))}
              </div>
              <p className="finals-desc">Dropped -p, -t, -k, -m. Those syllables merged into open syllables or tonal shifts.</p>
            </div>
          </div>
          <div className="cant-callout">
            <strong>Examples of lost finals:</strong>&ensp;
            食 Cant. <em>sik6</em> → Mand. <em>shí</em> (lost -k) ·
            入 Cant. <em>jap6</em> → Mand. <em>rù</em> (lost -p) ·
            白 Cant. <em>baak6</em> → Mand. <em>bái</em> (lost -k) ·
            合 Cant. <em>hap6</em> → Mand. <em>hé</em> (lost -p)
          </div>
        </section>

        <div className="cant-footer">
          <p>
            Both Cantonese and Mandarin descend from Middle Chinese (中古漢語) of the Tang Dynasty (~7th–10th century).
            Cantonese is considered more conservative — it preserved sounds that Mandarin lost.
            Knowing Cantonese gives you a window into how Classical Chinese poetry was originally recited.
          </p>
        </div>

      </div>
    </div>
  )
}
