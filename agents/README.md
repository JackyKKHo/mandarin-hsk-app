# Agents

Scheduled Claude agents that improve Mandarin Daily in small steps. Each agent's job description
is a file in this folder: read it to know exactly what the agent is told to do, and edit it to
change how the agent behaves.

| Agent | File | Schedule | Changes |
|---|---|---|---|
| Example Writer | [example-writer.md](example-writer.md) | Weekly | Adds example sentences to words that have none (`data/hsk*.json` only) |

## How you stay in control

- **Pull requests only.** Agents open a pull request and stop. Nothing reaches the live site
  until you merge it. `main` is protected on GitHub so agents can't push to it directly.
- **Automatic checks.** `scripts/check-vocab.mjs --changed` fails if anything other than new
  examples changed, if the file format changed, or if a new example breaks the rules. Agents
  must pass it, plus tests and the build, before opening a pull request.
  `scripts/compare-pinyin.mjs` lists pinyin that differs from a reference library for review.
- **Readable summaries.** Every pull request says what changed, lists 10 examples to spot-check,
  and lists anything the agent skipped.
- **Run history.** Each run's full transcript is in Claude Code on the web.
- **Off switch.** Pause or delete a scheduled agent any time with `/schedule` in Claude Code.

## Reviewing an agent pull request

1. Read the summary and the 10 spot-check examples. Do they sound natural? Do they use the word
   in the meaning shown?
2. If it looks good, merge. If a few examples are off, comment on them or ask Claude to fix them.
3. If something is consistently wrong (too long, too formal, repetitive), update the agent's
   file in this folder so the next run does better.
