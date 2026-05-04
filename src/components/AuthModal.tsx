import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  onClose: () => void
}

export default function AuthModal({ onClose }: Props) {
  const { sendOtp, verifyOtp } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus()
  }, [step])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await sendOtp(email)
    setLoading(false)
    if (error) setError(error)
    else setStep('code')
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await verifyOtp(email, code.trim())
    setLoading(false)
    if (error) setError(error)
    else onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.close} onClick={onClose}>✕</button>

        {step === 'email' ? (
          <>
            <h2 style={styles.title}>Sign in</h2>
            <p style={styles.sub}>We'll send a 6-digit code to your email.</p>
            <form onSubmit={handleSend} style={styles.form}>
              <input
                style={styles.input}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              {error && <p style={styles.error}>{error}</p>}
              <button style={styles.submit} type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 style={styles.title}>Enter code</h2>
            <p style={styles.sub}>Check {email} for a 6-digit code.</p>
            <form onSubmit={handleVerify} style={styles.form}>
              <input
                ref={codeRef}
                style={{ ...styles.input, ...styles.codeInput }}
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\s/g, '').slice(0, 8))}
                maxLength={8}
                required
              />
              {error && <p style={styles.error}>{error}</p>}
              <button style={styles.submit} type="submit" disabled={loading || code.length < 6}>
                {loading ? 'Verifying…' : 'Sign in'}
              </button>
              <button
                type="button"
                style={styles.toggle}
                onClick={() => { setStep('email'); setCode(''); setError('') }}
              >
                ← Use a different email
              </button>
            </form>
          </>
        )}
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
    color: 'var(--text)',
  },
  codeInput: { fontSize: '1.75rem', textAlign: 'center', letterSpacing: '0.4em', fontWeight: 700 },
  submit: {
    padding: '0.7rem', borderRadius: 8, fontSize: '1rem', fontWeight: 600,
    background: '#e85d2f', color: '#fff', border: 'none', cursor: 'pointer', marginTop: 4,
  },
  error: { color: '#c00', fontSize: '0.875rem', margin: 0 },
  toggle: {
    background: 'none', border: 'none', color: 'var(--muted, #888)',
    cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', padding: 0,
  },
}
