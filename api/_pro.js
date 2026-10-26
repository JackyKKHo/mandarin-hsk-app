// Server-side Pro check. There's no billing yet, so Pro = a signed-in user whose email is listed in
// the PRO_EMAILS env var (comma-separated). Swap proUser() for a Supabase table read when Stripe lands.
import { createClient } from '@supabase/supabase-js'

let supabase = null
function auth() {
  supabase ??= createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE ?? process.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } },
  )
  return supabase.auth
}

/** Lower-cased emails from a comma-separated list */
export function parseProEmails(raw) {
  return new Set((raw ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean))
}

/** The signed-in Pro user behind the request's Bearer token, or null */
export async function proUser(req) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return null
  try {
    const { data, error } = await auth().getUser(token)
    const email = data?.user?.email?.toLowerCase()
    if (error || !email) return null
    return parseProEmails(process.env.PRO_EMAILS).has(email) ? data.user : null
  } catch {
    return null
  }
}

export async function proStatus(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  res.status(200).json({ pro: Boolean(await proUser(req)) })
}
