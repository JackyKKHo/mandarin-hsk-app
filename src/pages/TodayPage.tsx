import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import Icon from '../components/Icon'
import { useVocab } from '../hooks/useVocab'
import { useSRS } from '../hooks/useSRS'
import { useStreak } from '../hooks/useStreak'
import { useSEO } from '../hooks/useSEO'
import type { VocabItem } from '../types'
import {
  NEW_WORDS_PER_DAY, type TodayPlan,
  todayKey, loadPlan, savePlan, getSavedLevel, saveLevel,
} from '../lib/todayPlan'

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Unseen words starting at `level`, then the levels above it, then below it
function pickNewWords(vocab: VocabItem[], level: number, isSeen: (id: string) => boolean, keep: string[]): string[] {
  const picked = [...keep]
  const order = [...LEVELS.filter(l => l >= level), ...LEVELS.filter(l => l < level)]
  for (const l of order) {
    for (const w of vocab) {
      if (picked.length >= NEW_WORDS_PER_DAY) return picked
      if (w.hskLevel === l && !isSeen(w.id) && !picked.includes(w.id)) picked.push(w.id)
    }
  }
  return picked
}

type StepState = 'done' | 'current' | 'upcoming'

export default function TodayPage() {
  useSEO({ title: 'Today', description: 'Your daily Mandarin session: review, learn new words, and practise speaking.', path: '/today' })
  const { words: vocab, loading } = useVocab()
  const { getCard, isDue } = useSRS()
  const { streak } = useStreak()
  const [plan, setPlan] = useState<TodayPlan | null>(() => loadPlan())
  const [level, setLevel] = useState(getSavedLevel)

  // Build today's plan once the vocab has loaded (and again if the date rolls over)
  useEffect(() => {
    if (loading || vocab.length === 0) return
    if (plan && plan.date === todayKey()) return
    const fresh: TodayPlan = { date: todayKey(), newIds: pickNewWords(vocab, level, id => !!getCard(id), []), spoken: false }
    savePlan(fresh)
    setPlan(fresh)
  }, [loading, vocab, plan, level, getCard])

  function changeLevel(l: number) {
    saveLevel(l)
    setLevel(l)
    if (!plan) return
    // Keep words already started today; refill the rest from the new level
    const started = plan.newIds.filter(id => getCard(id))
    const next = { ...plan, newIds: pickNewWords(vocab, l, id => !!getCard(id), started) }
    savePlan(next)
    setPlan(next)
  }

  const byId = useMemo(() => new Map(vocab.map(w => [w.id, w])), [vocab])
  const dueCount = useMemo(() => vocab.filter(w => getCard(w.id) && isDue(w.id)).length, [vocab, getCard, isDue])
  const newWords = (plan?.newIds ?? []).map(id => byId.get(id)).filter((w): w is VocabItem => !!w)
  const newDone = newWords.filter(w => getCard(w.id)).length
  const speakWord = newWords.find(w => w.examples[0]) ?? newWords[0]
  const speakTarget = speakWord?.examples[0]
    ? { zh: speakWord.examples[0].chinese, pinyin: speakWord.examples[0].pinyin, en: speakWord.examples[0].english }
    : speakWord ? { zh: speakWord.simplified, pinyin: speakWord.pinyin, en: speakWord.english } : null
  const recordHref = speakTarget ? `/record?${new URLSearchParams(speakTarget).toString()}` : '/record'

  const done = [dueCount === 0, newWords.length > 0 && newDone === newWords.length, !!plan?.spoken]
  const firstOpen = done.indexOf(false)
  const state = (i: number): StepState => done[i] ? 'done' : i === firstOpen ? 'current' : 'upcoming'
  const doneCount = done.filter(Boolean).length
  const allDone = doneCount === 3

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="today-page">
      <AppHeader />
      <main className="today-main">
        <div className="today-head">
          <div>
            <div className="today-date">{dateLabel}</div>
            <h1 className="today-title">Today</h1>
          </div>
          <div className="today-meta">
            {streak > 0 && (
              <span className="today-streak"><Icon name="flame" size={16} />{streak}-day streak</span>
            )}
            <span className="today-count">{doneCount} of 3 done</span>
          </div>
        </div>

        {loading || !plan ? (
          <p className="empty-state">Preparing today’s session…</p>
        ) : (
          <>
            {allDone && (
              <div className="today-complete">
                <div className="today-complete-glyph" aria-hidden="true">好</div>
                <div>
                  <div className="today-complete-title">You’re done for today</div>
                  <div className="today-complete-desc">
                    Come back tomorrow{streak > 0 ? ` to keep your ${streak}-day streak going` : ' for your next set'}.
                    Want more? Try a <Link to="/practice/smart">Smart Mix</Link> or a <Link to="/guides">guide</Link>.
                  </div>
                </div>
              </div>
            )}

            <ol className="today-steps">
              <li className={`today-step is-${state(0)}`}>
                <StepMarker n={1} state={state(0)} />
                <div className="today-step-body">
                  <div className="today-step-title">Review</div>
                  <div className="today-step-desc">
                    {dueCount > 0
                      ? `${dueCount} card${dueCount === 1 ? '' : 's'} due. Clear these first so nothing slips.`
                      : 'Nothing due. You’re caught up.'}
                  </div>
                </div>
                {dueCount > 0 && (
                  <Link to="/review" className={state(0) === 'current' ? 'btn-primary' : 'btn-secondary'}>Start review</Link>
                )}
              </li>

              <li className={`today-step is-${state(1)}`}>
                <StepMarker n={2} state={state(1)} />
                <div className="today-step-body">
                  <div className="today-step-title">
                    Learn {newWords.length} new words
                    <span className="today-step-progress">{newDone} / {newWords.length}</span>
                  </div>
                  <div className="today-step-desc">
                    From HSK{' '}
                    <select
                      className="today-level-select"
                      value={level}
                      onChange={e => changeLevel(Number(e.target.value))}
                      aria-label="Level for new words"
                    >
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  {newWords.length > 0 ? (
                    <div className="today-words">
                      {newWords.map(w => (
                        <Link
                          key={w.id}
                          to={`/word/${w.id}`}
                          className={`today-word${getCard(w.id) ? ' seen' : ''}`}
                          title={`${w.pinyin} — ${w.english}`}
                        >
                          {w.simplified}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="today-step-desc">You’ve started every word in the course. Impressive.</div>
                  )}
                </div>
                {newWords.length > 0 && newDone < newWords.length && (
                  <Link to="/practice/today" className={state(1) === 'current' ? 'btn-primary' : 'btn-secondary'}>
                    {newDone > 0 ? 'Continue' : 'Learn'}
                  </Link>
                )}
              </li>

              <li className={`today-step is-${state(2)}`}>
                <StepMarker n={3} state={state(2)} />
                <div className="today-step-body">
                  <div className="today-step-title">Speak</div>
                  {speakTarget ? (
                    <div className="today-speak">
                      <div className="today-speak-zh">{speakTarget.zh}</div>
                      <div className="today-speak-en">{speakTarget.en}</div>
                    </div>
                  ) : (
                    <div className="today-step-desc">Read a phrase aloud and get feedback on every tone.</div>
                  )}
                </div>
                {!plan.spoken && (
                  <Link to={recordHref} className={state(2) === 'current' ? 'btn-primary' : 'btn-secondary'}>
                    <Icon name="mic" size={16} /> Record
                  </Link>
                )}
              </li>
            </ol>

            <p className="today-widget-hint">
              Want more exposure? <Link to="/widget">Put a new word on your iPhone home screen every hour</Link>.
            </p>
          </>
        )}
      </main>
    </div>
  )
}

function StepMarker({ n, state }: { n: number; state: StepState }) {
  return (
    <span className="today-step-marker" aria-label={state === 'done' ? `Step ${n} done` : `Step ${n}`}>
      {state === 'done' ? '✓' : n}
    </span>
  )
}
