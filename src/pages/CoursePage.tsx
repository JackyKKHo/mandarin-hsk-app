import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { BEGINNER_LESSONS } from '../data/beginnerCourse'
import { useCourseProgress } from '../hooks/useCourseProgress'

export default function CoursePage() {
  const { completed } = useCourseProgress()
  const doneCount = completed.size
  const total = BEGINNER_LESSONS.length
  const pct = Math.round((doneCount / total) * 100)

  return (
    <div className="browser-page">
      <AppHeader />

      <div className="course-hero">
        <div className="course-hero-text">
          <div className="course-hero-label">Beginner Course</div>
          <h2 className="course-hero-title">Mandarin from Zero</h2>
          <p className="course-hero-sub">
            10 bite-sized lessons covering everything you need to start speaking Mandarin.
            Each lesson takes 5–10 minutes.
          </p>
        </div>
        <div className="course-hero-progress">
          <svg viewBox="0 0 64 64" className="course-ring" width="80" height="80">
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--border)" strokeWidth="6"/>
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke="var(--red)"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
            />
            <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)">{pct}%</text>
          </svg>
          <span className="course-ring-label">{doneCount} / {total} lessons</span>
        </div>
      </div>

      <div className="course-lessons">
        {BEGINNER_LESSONS.map((lesson, i) => {
          const done = completed.has(lesson.id)
          const isNext = !done && i === [...BEGINNER_LESSONS].findIndex(l => !completed.has(l.id))
          return (
            <Link
              key={lesson.id}
              to={`/course/${lesson.id}`}
              className={`course-lesson-card${done ? ' clc-done' : ''}${isNext ? ' clc-next' : ''}`}
            >
              <div className="clc-num">{done ? '✓' : i + 1}</div>
              <div className="clc-emoji">{lesson.emoji}</div>
              <div className="clc-body">
                <div className="clc-title">{lesson.title} <span className="clc-zh">{lesson.titleZh}</span></div>
                <div className="clc-desc">{lesson.description}</div>
                <div className="clc-words">{lesson.chars.length} words</div>
              </div>
              {isNext && <div className="clc-next-badge">Start →</div>}
              {done && <div className="clc-done-badge">✓</div>}
            </Link>
          )
        })}
      </div>

      {doneCount === total && (
        <div className="course-complete-banner">
          🎉 Course complete! You know the essentials of Mandarin.
          Keep going with <Link to="/hsk/2" className="course-complete-link">HSK 2 →</Link>
        </div>
      )}
    </div>
  )
}
