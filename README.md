# AI Resume & Interview Coach

Agentic coaching tool: paste a resume + job description and an agent runs a
multi-step analysis (gap identification → ATS keyword matching → tailored
bullet rewriting). A second agent runs a live mock interview — asking
role-specific questions, scoring spoken or typed answers, and deciding on
its own whether to probe deeper with a follow-up.

## Stack

- **Next.js 14** (App Router, TypeScript) — frontend + API routes
- **Gemini** (`gemini-2.5-flash-lite` via `@google/generative-ai`) — all agent reasoning, using JSON schema mode for structured output
- **Prisma + SQLite** — persists resume sessions and interview transcripts
- **Web Speech API** — in-browser voice input, with a typed fallback when unsupported
- **Tailwind CSS**

## Setup

```bash
npm install
cp .env.example .env
# edit .env and add your Gemini API key from https://aistudio.google.com/apikey

npx prisma migrate dev --name init
npm run dev
```

Open http://localhost:3000.

## How the agents work

### Resume agent (`src/lib/agents/resumeAgent.ts`)

Runs as a sequence of three focused Gemini calls rather than one big prompt,
each returning structured JSON (schema-enforced via Gemini's `responseSchema`):

1. **Gap identification** — compares resume vs. JD, flags missing skills/experience and real strengths.
2. **ATS keyword matching** — extracts screenable keywords from the JD, checks resume coverage, scores 0–100.
3. **Bullet rewriting** — takes the gaps + missing keywords from steps 1–2 as context and rewrites the resume's strongest bullets to close them, without fabricating experience.

Each step is logged to an `agentTrace` array so the "autonomous multi-step"
behavior is visible in the UI, not a black box.

### Interview agent (`src/lib/agents/interviewAgent.ts`)

A stateful loop, orchestrated in `src/app/api/interview/respond/route.ts`:

1. Generate an opening question grounded in the role (and resume, if linked).
2. On each answer: evaluate it (score, strengths, improvements, ideal-answer pointers) **and** decide whether it warrants a follow-up probe.
3. If yes → ask the generated follow-up. If no → generate the next main question, aware of everything already asked (to avoid repeats and vary question type). Caps at 8 questions.

## Project structure

```
src/
  app/
    resume/                 resume analysis page
    interview/               interview setup + live session pages
    api/resume/analyze       runs the resume agent, persists results
    api/resume/parse         PDF → text extraction for resume upload
    api/interview/start      creates a session, generates opening question
    api/interview/respond    evaluates an answer, decides next step
    api/interview/[id]       fetches session state
  lib/
    agents/                  the two agent pipelines
    gemini.ts                Gemini client + structured-output helper
    prisma.ts                Prisma client singleton
    types.ts                 shared structured-output types
    useSpeechRecognition.ts  Web Speech API hook
  components/
    AnalysisResults.tsx
    VoiceRecorder.tsx
prisma/schema.prisma
```

## Notes

- Voice input requires a Chromium-based browser (Web Speech API isn't
  supported everywhere); the UI falls back to typing automatically.
- SQLite is fine for local/demo use. Swap `DATABASE_URL` + the Prisma
  `provider` to Postgres for anything beyond that.
