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
- **Official 2026 HSK syllabus** (《HSK考试大纲》, published 2025-11): 11,000 words.
  `data/hsk1.json` → `data/hsk6.json`, plus `data/hsk7.json` = the **HSK 7–9 band** (one exam, 5,600 words).
  New words per level: 300 / 200 / 500 / 1,000 / 1,600 / 1,800 / 5,600.
- Level helpers live in `src/data/levels.ts` (`LEVELS`, `levelLabel(7) === '7–9'`, `toLevel` clamps old 8/9 links). Never hard-code 1–9.
- Built by `scripts/migrate-hsk-2026.mjs` from `data/source/hsk-2026-syllabus.json` (official list) + the pre-2026 data (content reused when characters and reading match) + `data/source/new-words-2026.json` (glosses for 1,245 new words).
- `src/data/idMap2026.json` maps pre-2026 word ids to new ones; `src/lib/migrateVocab2026.ts` translates saved progress on each device once. Supabase rows still hold old ids.
- All words have: `simplified`, `traditional`, `pinyin` (official), `pinyinNumbered`, `english`, `partOfSpeech` (from the official list), `examples`
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
| `/tones` | Tone Gym — live on-device pitch tracking for syllables and tone pairs (`src/lib/pitchTracker.ts`, `src/lib/toneGym.ts`; tone rules shared with Record & Score in `api/_toneContour.js`) |

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
| `node scripts/fill-explanations.mjs` | Submit Anthropic batch to fill `explanation` for all words |
| `node scripts/fill-explanations.mjs --status` | Check explanation batch status |
| `node scripts/fill-explanations.mjs --apply` | Apply explanation batch results to JSON files |
| `node scripts/generate-examples.mjs [level]` | Generate example sentences for a level |
| `node scripts/check-vocab.mjs [--changed]` | Validate vocab files; `--changed` compares with origin/main and allows only new, well-formed examples |
| `node scripts/build-tone-gym.mjs` | Rebuild `src/data/toneGym.json` (Tone Gym syllables + tone-pair words) from the HSK lists |

---

## Known Issues / TODO

- [x] **`explanation`** — filled for all 11,036 words
- [ ] **`examples`** — 4,798 words have none after the 2026 migration (785 in HSK 1–6, 4,013 in HSK 7–9); the Example Writer agent adds ~150/week, lowest level first (see `agents/`)
- [ ] **`explanation`** — empty for the 1,245 words new in the 2026 list
- [x] **`partOfSpeech`** — 100% filled across all levels
- [x] **Bundle size** — lazy-loaded per level via `vocabLoader.ts` dynamic imports
- [x] **SRS "again" re-queue** — cards loop back within the same session
- [x] **Lin Wei error UI** — 429/errors shown as chat messages
- [x] **Word detail next/prev** — prev/next navigation implemented
- [x] **Empty review state** — empty state with next-action suggestions shown

---

## Agents

Scheduled Claude agents open pull requests (never push to `main`). Job descriptions live in `agents/`; see `agents/README.md`.

## Product Principles

- Never hard-code vocab in components — always from `data/hsk*.json`
- localStorage is the source of truth for guests; Supabase syncs when logged in
- On login, local data is migrated to Supabase automatically
- Lin Wei responses are 2–4 sentences max, no markdown (spoken audio format)
- User prefers simplified Chinese
