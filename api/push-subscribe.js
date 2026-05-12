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

async function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

export default async function handler(req, res) {
  const user = await getUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { subscription } = req.body ?? {}
    if (!subscription) return res.status(400).json({ error: 'Missing subscription' })

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ user_id: user.id, subscription }, { onConflict: 'user_id' })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
