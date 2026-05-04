# Mandarin Daily — Claude Code Instructions

## Project Overview

**Live site:** https://www.mandarindaily.app  
**Repo:** https://github.com/JackyKKHo/mandarin-hsk-app  
**Stack:** React 18 + TypeScript + Vite, deployed on Vercel  
**Database:** Supabase (auth + user data sync)  
**AI:** Anthropic Claude Haiku 4.5 (Lin Wei tutor), Google TTS (audio)

---

## What's Been Built

### Data
- `data/hsk1.json` → `data/hsk9.json` — 11,036 words across HSK 1–9
- All words have: `simplified`, `traditional`, `pinyin`, `pinyinNumbered`, `english`, `examples`
- `partOfSpeech` — filled via batch script (see Scripts below)
- `data/grammar.json` — grammar reference

### Pages
| Route | Page |
|-------|------|
| `/welcome` | One-time onboarding (level picker, shown once via localStorage flag `hsk-onboarded`) |
| `/hsk/:level` | Vocab browser with search, progress bar, practice dropdown |
| `/word/:id` | Word detail — pinyin, examples, stroke order, AI teacher, SRS buttons |
| `/practice/:level` | Practice mode selector |
| `/quiz/:level` | Multiple choice quiz (zh→en, en→zh, pinyin→zh) |
| `/write/:level` | Stroke order writing practice |
| `/listen/:level` | Listening comprehension |
| `/fill/:level` | Fill in the blank |
| `/pronunciation` | Pronunciation guide (tones, initials, finals) |
| `/review` | SRS due-card review (self-rated flashcards: Again / Good / Easy) |
| `/grammar/:level` | Grammar list by level |
| `/grammar/point/:id` | Grammar detail |
| `/favourites` | Favourited words |
| `/search` | Cross-level search |
| `/stats` | Progress stats, streak, SRS due count |

### Components
- `AppHeader` — nav with Sign in/out button
- `AuthModal` — email OTP sign-in (2-step: email → 8-char code)
- `AudioButton` — plays TTS audio
- `PronunciationChecker` — speech recording feedback
- `StrokeOrder` — hanzi-writer stroke animation
- `TeacherButton` — opens Lin Wei chat
- `TonedPinyin` — coloured pinyin by tone

### Hooks (all hybrid: localStorage + Supabase when logged in)
- `useSRS` — spaced repetition (SM-2 algorithm)
- `useProgress` — learned words
- `useFavourites` — starred words
- `useStreak` — daily study streak
- `useDismissed` — "too easy" words
- `useDarkMode` — theme toggle
- `usePracticeWords` — resolves level param → word list (supports `'review'` for due cards)

### API (Vercel serverless)
- `api/teacher.js` — Lin Wei AI tutor (Anthropic SDK + prompt caching + rate limit: 50 req/IP/hour)
- `api/tts.js` — Google TTS endpoint (24h cache)

### Auth
- Supabase magic OTP (email → 8-digit code → instant sign-in)
- Custom SMTP via Resend → sends from `noreply@mandarindaily.app`
- Supabase Site URL set to `https://www.mandarindaily.app`

### Supabase Tables
```
progress    (user_id, word_id)
srs_cards   (user_id, word_id, interval, ease_factor, due_date, reps)
favourites  (user_id, word_id)
dismissed   (user_id, word_id)
streaks     (user_id, count, last_date)
```
All tables have RLS enabled — users only access their own rows.

---

## Environment Variables

### Local (`.env.local`)
```
ANTHROPIC_API_KEY=...
GOOGLE_TTS_API_KEY=...
VITE_SUPABASE_URL=https://pygobypsdlhwxicwqbld.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### Vercel (set in dashboard)
Same as above — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be set for production auth to work.

---

## Scripts

| Script | Purpose |
|--------|---------|
| `node scripts/fill-pinyin-numbered.mjs` | Fill `pinyinNumbered` from simplified characters using pinyin-pro |
| `node scripts/fill-part-of-speech.mjs` | Submit Anthropic batch to fill `partOfSpeech` for all words |
| `node scripts/fill-part-of-speech.mjs --status` | Check batch status |
| `node scripts/fill-part-of-speech.mjs --apply` | Apply batch results to JSON files |
| `node scripts/generate-examples.mjs [level]` | Generate example sentences for a level |

---

## Known Issues / TODO

- [ ] **`partOfSpeech`** — batch submitted, apply once complete
- [ ] **Bundle size** — 3.9MB JS chunk (all HSK JSON loaded upfront). Fix: lazy-load by level
- [ ] **SRS "again" re-queue** — cards marked "again" don't resurface in same session
- [ ] **Lin Wei error UI** — 429/error responses show nothing to user
- [ ] **Word detail next/prev** — no navigation between words without going back to list
- [ ] **Empty review state** — could suggest next action when no cards due

---

## Product Principles

- Never hard-code vocab in components — always from `data/hsk*.json`
- localStorage is the source of truth for guests; Supabase syncs when logged in
- On login, local data is migrated to Supabase automatically
- Lin Wei responses are 2–4 sentences max, no markdown (spoken audio format)
- User prefers simplified Chinese
