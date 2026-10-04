import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App'
import { migrateVocab2026 } from './lib/migrateVocab2026'

// Translate saved progress to the 2026 word list before any hook reads it
migrateVocab2026().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  )
})
