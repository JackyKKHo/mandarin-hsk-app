import { useState } from 'react'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, email, name }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setMessage('')
      setEmail('')
      setName('')
      setTimeout(() => { setOpen(false); setStatus('idle') }, 2500)
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <button
        className="feedback-fab"
        onClick={() => setOpen(o => !o)}
        title="Send feedback"
        aria-label="Send feedback"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="feedback-panel">
          <div className="feedback-panel-header">
            <h3>Send feedback</h3>
            <p className="feedback-panel-sub">Bug, suggestion, or just saying hi — all welcome.</p>
          </div>

          {status === 'sent' ? (
            <div className="feedback-sent">
              ✓ Thanks! Message received.
            </div>
          ) : (
            <form className="feedback-form" onSubmit={submit}>
              <input
                className="feedback-input"
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={80}
              />
              <input
                className="feedback-input"
                type="email"
                placeholder="Your email (optional, for replies)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                maxLength={200}
              />
              <textarea
                className="feedback-textarea"
                placeholder="What's on your mind?"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                maxLength={2000}
                required
              />
              {status === 'error' && (
                <p className="feedback-error">Something went wrong — please try again.</p>
              )}
              <button
                className="btn-primary feedback-submit"
                type="submit"
                disabled={!message.trim() || status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Send →'}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  )
}
