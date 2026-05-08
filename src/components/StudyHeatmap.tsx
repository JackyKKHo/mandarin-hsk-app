import { useStudyHistory } from '../hooks/useStudyHistory'

const WEEKS = 26  // 6 months
const DAYS = ['', 'M', '', 'W', '', 'F', '']  // label every other row

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function StudyHeatmap() {
  const { hasStudied } = useStudyHistory()

  // Build a grid: columns = weeks (oldest left), rows = days (Mon=0)
  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7  // 0=Mon … 6=Sun

  // Start from the Monday of (WEEKS) weeks ago
  const start = new Date(today)
  start.setDate(today.getDate() - todayDow - (WEEKS - 1) * 7)

  const weeks: Date[][] = []
  for (let w = 0; w < WEEKS; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(start)
      day.setDate(start.getDate() + w * 7 + d)
      week.push(day)
    }
    weeks.push(week)
  }

  // Month labels: show label at first week of each month
  const monthLabels: { label: string; col: number }[] = []
  weeks.forEach((week, i) => {
    const firstDay = week[0]
    if (firstDay.getDate() <= 7) {
      monthLabels.push({
        label: firstDay.toLocaleString('default', { month: 'short' }),
        col: i,
      })
    }
  })

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-months">
        {monthLabels.map(({ label, col }) => (
          <span key={col} className="heatmap-month" style={{ gridColumn: col + 1 }}>{label}</span>
        ))}
      </div>
      <div className="heatmap-body">
        <div className="heatmap-days">
          {DAYS.map((d, i) => <span key={i} className="heatmap-day-label">{d}</span>)}
        </div>
        <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }}>
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const ds = dateStr(day)
              const future = day > today
              const studied = !future && hasStudied(ds)
              const isToday = ds === dateStr(today)
              return (
                <div
                  key={`${wi}-${di}`}
                  className={`heatmap-cell${studied ? ' hm-studied' : ''}${future ? ' hm-future' : ''}${isToday ? ' hm-today' : ''}`}
                  title={`${ds}${studied ? ' — studied' : ''}`}
                />
              )
            })
          )}
        </div>
      </div>
      <div className="heatmap-legend">
        <span className="hm-legend-label">Less</span>
        <div className="heatmap-cell" />
        <div className="heatmap-cell hm-studied" />
        <span className="hm-legend-label">More</span>
      </div>
    </div>
  )
}
