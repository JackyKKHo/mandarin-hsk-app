import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import AudioButton from '../components/AudioButton'
import TonedPinyin from '../components/TonedPinyin'
import { BEGINNER_LESSONS } from '../data/beginnerCourse'
import { useVocab } from '../hooks/useVocab'
import { useProgress } from '../hooks/useProgress'
import { useCourseProgress } from '../hooks/useCourseProgress'

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const lesson = BEGINNER_LESSONS.find(l => l.id === lessonId)
  const { words: hsk1, loading } = useVocab(1)
  const { learned, markLearned } = useProgress()
  const { isComplete, completeLesson, uncompleteLesson } = useCourseProgress()

  const lessonIndex = lesson ? BEGINNER_LESSONS.findIndex(l => l.id === lessonId) : -1
  const prevLesson = lessonIndex > 0 ? BEGINNER_LESSONS[lessonIndex - 1] : null
  const nextLesson = lessonIndex >= 0 && lessonIndex < BEGINNER_LESSONS.length - 1
    ? BEGINNER_LESSONS[lessonIndex + 1] : null

  const words = useMemo(() => {
    if (!lesson) return []
    return lesson.chars
      .map(ch => hsk1.find(w => w.simplified === ch))
      .filter((w): w is NonNullable<typeof w> => w !== undefined)
  }, [lesson, hsk1])

  const done = lesson ? isComplete(lesson.id) : false
  const learnedCount = words.filter(w => learned.has(w.id)).length

  function toggleComplete() {
    if (!lesson) return
    done ? uncompleteLesson(lesson.id) : completeLesson(lesson.id)
  }

  if (!lesson) {
    return (
      <div className="browser-page">
        <AppHeader />
        <p className="empty-state">Lesson not found.</p>
      </div>
    )
  }

  return (
    <div className="browser-page">
      <AppHeader />

      <div className="lesson-hero">
        <Link to="/course" className="back-link">← Beginner Course</Link>
        <div className="lesson-hero-inner">
          <span className="lesson-hero-emoji">{lesson.emoji}</span>
          <div>
            <div className="lesson-hero-num">Lesson {lessonIndex + 1} of {BEGINNER_LESSONS.length}</div>
            <h2 className="lesson-hero-title">{lesson.title} <span className="lesson-hero-zh">{lesson.titleZh}</span></h2>
            <p className="lesson-hero-desc">{lesson.description}</p>
          </div>
        </div>
        <div className="lesson-hero-actions">
          <button
            className={`btn-${done ? 'secondary' : 'primary'} lesson-complete-btn`}
            onClick={toggleComplete}
          >
            {done ? '✓ Completed — mark incomplete' : 'Mark as Complete'}
          </button>
          {learnedCount > 0 && (
            <span className="lesson-learned-badge">{learnedCount}/{words.length} learned</span>
          )}
        </div>
      </div>

      <div className="lesson-words">
        {loading ? (
          <p className="empty-state">Loading words…</p>
        ) : words.length === 0 ? (
          <p className="empty-state">No words loaded.</p>
        ) : words.map(word => {
          const isLearned = learned.has(word.id)
          return (
            <div key={word.id} className={`lesson-word-card${isLearned ? ' lwc-learned' : ''}`}>
              <div className="lwc-top">
                <div className="lwc-chinese">
                  <Link to={`/word/${word.id}`} className="lwc-hanzi">{word.simplified}</Link>
                  <TonedPinyin pinyin={word.pinyin} className="lwc-pinyin" />
                </div>
                <div className="lwc-right">
                  <span className="lwc-english">{word.english}</span>
                  <div className="lwc-actions">
                    <AudioButton text={word.simplified} audioUrl={word.audio.wordAudioUrl} label={`Play ${word.simplified}`} />
                    <button
                      className={`lwc-learn-btn${isLearned ? ' learned' : ''}`}
                      onClick={() => markLearned(word.id)}
                      title={isLearned ? 'Already learned' : 'Mark learned'}
                    >
                      {isLearned ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              </div>
              {word.examples[0] && (
                <div className="lwc-example">
                  <div className="lwc-ex-row">
                    <span className="lwc-ex-zh">{word.examples[0].chinese}</span>
                    <AudioButton text={word.examples[0].chinese} audioUrl={word.audio.exampleAudioUrls[0] ?? null} label="Play example" />
                  </div>
                  <TonedPinyin pinyin={word.examples[0].pinyin} className="lwc-ex-pinyin" />
                  <div className="lwc-ex-en">{word.examples[0].english}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="lesson-footer-nav">
        {prevLesson ? (
          <Link to={`/course/${prevLesson.id}`} className="btn-secondary lesson-nav-btn">
            ← {prevLesson.title}
          </Link>
        ) : <span />}
        {nextLesson ? (
          <Link to={`/course/${nextLesson.id}`} className="btn-primary lesson-nav-btn">
            {nextLesson.title} →
          </Link>
        ) : (
          <Link to="/course" className="btn-primary lesson-nav-btn">
            Back to course →
          </Link>
        )}
      </div>
    </div>
  )
}
