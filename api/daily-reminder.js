import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

const RESEND_API_KEY = process.env.RESEND_API_KEY

function today() {
  return new Date().toISOString().slice(0, 10)
}

async function sendEmail(to, subject, html) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Mandarin Daily <noreply@mandarindaily.app>',
      to,
      subject,
      html,
    }),
  })
  if (!r.ok) throw new Error(await r.text())
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const t = today()

  // Get all opted-in users
  const { data: prefs, error } = await supabase
    .from('email_reminders')
    .select('user_id')
    .eq('enabled', true)

  if (error) return res.status(500).json({ error: error.message })
  if (!prefs?.length) return res.status(200).json({ sent: 0 })

  const userIds = prefs.map(p => p.user_id)

  // Get their emails from auth.users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) return res.status(500).json({ error: usersError.message })

  const emailMap = Object.fromEntries(
    users.filter(u => userIds.includes(u.id)).map(u => [u.id, u.email])
  )

  // Get users who studied today
  const { data: streaks } = await supabase
    .from('streaks')
    .select('user_id, last_date, count')
    .in('user_id', userIds)

  const streakMap = Object.fromEntries((streaks ?? []).map(s => [s.user_id, s]))

  // Get users with SRS cards due
  const { data: dueCards } = await supabase
    .from('srs_cards')
    .select('user_id')
    .in('user_id', userIds)
    .lte('due_date', t)

  const hasDueCards = new Set((dueCards ?? []).map(c => c.user_id))

  let sent = 0

  for (const userId of userIds) {
    const email = emailMap[userId]
    if (!email) continue

    const streak = streakMap[userId]
    const studiedToday = streak?.last_date === t
    const hasdue = hasDueCards.has(userId)
    const streakCount = streak?.count ?? 0

    if (studiedToday && !hasdue) continue

    let subject, html

    if (hasdue && !studiedToday) {
      subject = `🔥 Keep your ${streakCount}-day streak alive — cards due today`
      html = `
        <p>Hi there,</p>
        <p>You have Mandarin cards due for review today, and your <strong>${streakCount}-day streak</strong> is at risk!</p>
        <p><a href="https://www.mandarindaily.app/review" style="background:#c0392b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin:8px 0;">Review now →</a></p>
        <p style="color:#888;font-size:12px;">
          <a href="https://www.mandarindaily.app/stats">Unsubscribe from reminders</a>
        </p>
      `
    } else if (hasdue) {
      subject = `📚 Mandarin cards waiting for review`
      html = `
        <p>Hi there,</p>
        <p>You have Mandarin vocabulary cards due for review — strengthen your memory before they fade!</p>
        <p><a href="https://www.mandarindaily.app/review" style="background:#c0392b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin:8px 0;">Review now →</a></p>
        <p style="color:#888;font-size:12px;">
          <a href="https://www.mandarindaily.app/stats">Unsubscribe from reminders</a>
        </p>
      `
    } else {
      subject = `🔥 Don't break your ${streakCount}-day streak!`
      html = `
        <p>Hi there,</p>
        <p>You haven't studied yet today — don't let your <strong>${streakCount}-day streak</strong> slip away!</p>
        <p><a href="https://www.mandarindaily.app" style="background:#c0392b;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin:8px 0;">Study now →</a></p>
        <p style="color:#888;font-size:12px;">
          <a href="https://www.mandarindaily.app/stats">Unsubscribe from reminders</a>
        </p>
      `
    }

    try {
      await sendEmail(email, subject, html)
      sent++
    } catch (err) {
      console.error(`Failed to send to ${email}:`, err.message)
    }
  }

  return res.status(200).json({ sent })
}
