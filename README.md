# DISHA AI MVP

DISHA is a hackathon MVP for AI-assisted career pathway recommendations. It uses synthetic learner, course, job, and demand data, then calls a real configured model for:

- Free-text learner profile extraction.
- Semantic career-fit scoring across candidate occupations.
- Grounded learner/counselor explanation text.

There is no deterministic fallback for those AI steps. If the model endpoint is unavailable, returns invalid JSON, omits candidate IDs, or returns an empty explanation, the flow stops with an error in the UI.

## Prerequisites

- Node.js 20 or newer.
- npm.
- A working LLM provider key or local model endpoint.

Keep registry or proxy settings in a local `.npmrc`; this file is ignored by git.

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Add your model provider settings to `.env`. Real keys should stay only in `.env`; this file is ignored by git.

Recommended Groq setup:

```bash
LLM_PROVIDER=groq
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.1-8b-instant
LLM_TIMEOUT_MS=30000
GROQ_API_KEY=your-groq-api-key
```

## Run Locally

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

The app should show `AI model ready` in the left rail. If it shows `AI unavailable`, check your `.env` provider, model name, API key, and network access.

## Learner Flow

1. Sign in with the seeded learner profile.
2. Review the current credits and completed courses.
3. Enter or edit the learner profile text.
4. Choose the aspiring role and constraints.
5. Click **Generate recommendation**.
4. The app runs three real model calls:
   - Profile extraction.
   - Semantic fit scoring.
   - Grounded explanation generation.
6. DISHA shows matched requirements, gaps to close, public course options, ranked pathways, and crowding signals.

## Other Provider Options

Ollama:

```bash
ollama pull gemma3:4b
ollama serve
```

```bash
LLM_PROVIDER=ollama
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=gemma3:4b
LLM_TIMEOUT_MS=30000
```

OpenAI-compatible endpoint:

```bash
LLM_PROVIDER=openai
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=your-model
LLM_API_KEY=your-key
```

Google AI Studio:

```bash
LLM_PROVIDER=google
LLM_BASE_URL=https://generativelanguage.googleapis.com
LLM_MODEL=gemini-2.0-flash
GEMINI_API_KEY=your-key
```

## Data

The demo data represents the PRD's six lists:

- Synthetic learners with embedded credential snapshots.
- Qualification-to-occupation mappings.
- Course catalog seed rows with provenance.
- Job evidence seed rows with provenance.
- Regional demand and absorbable capacity.
- Crowding counts derived from learner targets.

Validate the data:

```bash
npm run validate:data
```

## Build And Preview

Create a production build:

```bash
npm run build
```

Preview the built app:

```bash
npm run preview
```

The preview server also serves the `/api/ai/*` model bridge, so the AI flow works in preview as long as the configured model endpoint is reachable.

## Troubleshooting

`AI unavailable`

- Confirm `.env` exists.
- Confirm the provider name is one of `groq`, `ollama`, `openai`, or `google`.
- Confirm the API key is valid by testing the provider directly.
- Restart `npm run dev` after changing `.env`.

Groq JSON or reasoning errors:

- The app avoids Groq reasoning-only request fields and validates JSON server-side.
- If you change to another Groq model, test **Generate recommendation** again because reasoning behavior can differ by model.

Rate limits:

- Groq free/on-demand tiers can hit token-per-minute limits.
- Wait for the cooldown window or use a smaller test input.
