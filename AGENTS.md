# AGENTS.md

Guidance for agents working in this repository.

## Project Overview

DISHA is a Vite + React web app for AI-assisted career pathway recommendations. It uses local seed data for learners, courses, jobs, demand, crowding, and Academic Bank of Credits-style academic records. The AI component is real: profile extraction, semantic scoring, and explanation generation call the configured model provider through the Vite middleware in `vite.config.js`.

## Key Files

- `src/App.jsx`: main role-gated UI, learner recommendation flow, counselor/government/operations screens.
- `src/App.css`: visual system and responsive layout.
- `src/data/demoData.js`: seed data, including learners and Academic Bank of Credits records.
- `src/lib/recommendation.js`: deterministic ranking, crowding, readiness, and aggregation logic.
- `src/lib/aiClient.js`: frontend calls to `/api/ai/*`.
- `vite.config.js`: local API middleware and LLM provider integration.
- `scripts/validate-data.mjs`: seed-data integrity checks.

## Product Constraints

- Keep the app role-gated through local seeded profiles. Do not add real auth unless explicitly requested.
- Keep the visible product UI production-oriented. Avoid visible copy such as "hackathon", "demo", "test user", "synthetic", "no auth", or raw implementation details in primary screens.
- Learner data should align with Academic Bank of Credits records: `university`, `course`, `subjectName`, `subjectCode`, `year`, `credit`, `selected`, and `status`.
- Do not remove the learner free-text input or recommendation flow.
- Do not add deterministic AI fallbacks. If the model is unavailable or returns invalid output, surface the error.
- Do not commit secrets. Keep API keys only in `.env`.

## AI Provider Notes

The app currently supports `groq`, `ollama`, `openai`, and `google` providers through environment variables. Groq uses the OpenAI-compatible endpoint and requires `GROQ_API_KEY` or `LLM_API_KEY`.

Recommended Groq variables:

```bash
LLM_PROVIDER=groq
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=llama-3.1-8b-instant
LLM_TIMEOUT_MS=30000
GROQ_API_KEY=your-key
```

Groq rate limits are expected on free/on-demand tiers. Treat `429` responses as real provider failures, not app bugs.

## Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Validate data:

```bash
npm run validate:data
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

In this Codex desktop environment, `npm` may not be on PATH. The bundled Node runtime has been used successfully:

```bash
/Users/vishnurr/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate-data.mjs
/Users/vishnurr/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vite/bin/vite.js build
```

## Validation Expectations

Before handing off changes, run:

```bash
npm run validate:data
npm run build
```

For UI changes, also verify in the browser:

- Sign-in page opens first.
- Each seeded profile opens only its assigned track.
- Logout returns to sign-in.
- Learner Academic Bank of Credits table renders without page overflow.
- Counselor Priority Learners rows do not clip avatar initials or readiness scores.
- `Generate recommendation` still calls the model and surfaces real model errors.

## Editing Guidelines

- Prefer small, scoped changes that match the existing React and CSS style.
- Keep cards at 8px radius unless the existing pattern requires otherwise.
- Use lucide-react icons already present in the project where possible.
- Keep secrets out of source, logs, screenshots, and docs.
- Preserve existing seed data semantics when adding fields; extend `scripts/validate-data.mjs` for new required data shapes.
