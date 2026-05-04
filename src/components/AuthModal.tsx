import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  onClose: () => void
}

export default function AuthModal({ onClose }: Props) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const fn = mode === 'signin' ? signIn : signUp
    const { error } = await fn(email, password)

    setLoading(false)
    if (error) {
      setError(error)
    } else if (mode === 'signup') {
      setMessage('Check your email to confirm your account.')
    } else {
      onClose()
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.close} onClick={onClose}>✕</button>
        <h2 style={styles.title}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
        <p style={styles.sub}>Sync your progress across devices</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}
          <button style={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Loading…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          style={styles.toggle}
          onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setMessage('') }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: 'var(--bg, #fff)', borderRadius: 12, padding: '2rem',
    width: '100%', maxWidth: 360, position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  close: {
    position: 'absolute', top: 12, right: 12, background: 'none',
    border: 'none', fontSize: 18, cursor: 'pointer', opacity: 0.5,
  },
  title: { margin: '0 0 4px', fontSize: '1.4rem' },
  sub: { margin: '0 0 1.5rem', opacity: 0.6, fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: {
    padding: '0.65rem 0.9rem', borderRadius: 8, fontSize: '1rem',
    border: '1px solid var(--border, #ddd)', background: 'var(--input-bg, #f9f9f9)',
  },
  submit: {
    padding: '0.7rem', borderRadius: 8, fontSize: '1rem', fontWeight: 600,
    background: '#e85d2f', color: '#fff', border: 'none', cursor: 'pointer', marginTop: 4,
  },
  error: { color: '#c00', fontSize: '0.875rem', margin: 0 },
  success: { color: '#090', fontSize: '0.875rem', margin: 0 },
  toggle: {
    marginTop: '1rem', background: 'none', border: 'none',
    color: '#e85d2f', cursor: 'pointer', fontSize: '0.875rem', width: '100%',
  },
}
