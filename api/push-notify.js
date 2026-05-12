import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:jacky6556@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default async function handler(req, res) {
  // Only allow Vercel Cron or manual trigger with secret
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('user_id, subscription')

  if (error) return res.status(500).json({ error: error.message })
  if (!subscriptions?.length) return res.status(200).json({ sent: 0 })

  const t = today()
  const userIds = subscriptions.map(s => s.user_id)

  // Get users who studied today
  const { data: streaks } = await supabase
    .from('streaks')
    .select('user_id, last_date')
    .in('user_id', userIds)

  const studiedToday = new Set((streaks ?? []).filter(s => s.last_date === t).map(s => s.user_id))

  // Get users with SRS cards due today
  const { data: dueCards } = await supabase
    .from('srs_cards')
    .select('user_id')
    .in('user_id', userIds)
    .lte('due_date', t)

  const hasDueCards = new Set((dueCards ?? []).map(c => c.user_id))

  let sent = 0
  const stale = []

  for (const { user_id, subscription } of subscriptions) {
    const didStudy = studiedToday.has(user_id)
    const hasdue = hasDueCards.has(user_id)

    if (didStudy && !hasdue) continue

    const payload = hasdue && !didStudy
      ? { title: 'Mandarin Daily', body: `You have cards due for review — keep your streak alive!`, url: '/review' }
      : hasdue
      ? { title: 'Mandarin Daily', body: `Cards waiting for review — strengthen your memory!`, url: '/review' }
      : { title: 'Mandarin Daily', body: `Don't forget to study today — your streak is counting on you!`, url: '/' }

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload))
      sent++
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        stale.push(user_id)
      }
    }
  }

  // Clean up expired subscriptions
  if (stale.length) {
    await supabase.from('push_subscriptions').delete().in('user_id', stale)
  }

  return res.status(200).json({ sent, stale: stale.length })
}
