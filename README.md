# DISHA AI MVP

DISHA is a hackathon MVP for AI-assisted career pathway recommendations. This app uses synthetic learner, course, job, and demand data, then calls a real configured model for:

- Free-text learner profile extraction in English or Tamil.
- Semantic career-fit scoring across candidate occupations.
- Grounded learner/counselor explanation text.

There is no deterministic fallback for those AI steps. If the model endpoint is unavailable, returns invalid JSON, omits candidate IDs, or returns an empty explanation, the flow stops with an error in the UI.

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL, usually `http://127.0.0.1:5173`.

The included `.npmrc` uses the Oracle artifact registry/proxy settings provided for the hackathon environment.

## Model Setup

Default local setup:

```bash
ollama pull gemma3:4b
ollama serve
```

`.env`:

```bash
LLM_PROVIDER=ollama
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=gemma3:4b
LLM_TIMEOUT_MS=30000
```

OpenAI-compatible setup:

```bash
LLM_PROVIDER=openai
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=your-model
LLM_API_KEY=your-key
```

Google AI Studio setup:

```bash
LLM_PROVIDER=google
LLM_BASE_URL=https://generativelanguage.googleapis.com
LLM_MODEL=gemini-2.0-flash
GEMINI_API_KEY=your-key
```

Groq setup:

```bash
LLM_PROVIDER=groq
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_MODEL=qwen/qwen3.6-27b
GROQ_API_KEY=your-key
```

## App Flow

1. Use **AI Intake** to enter an English or Tamil learner profile.
2. The model extracts structured learner JSON.
3. The model scores semantic fit for each occupation.
4. Deterministic DISHA rules rank paths using qualification fit, pay gain, nearby jobs, demand strength, and crowding penalty.
5. The model writes a grounded explanation from validated recommendation facts.
6. **Counselor** and **Government** views read the same synthetic learner pool and the latest AI-scored run.

## Data

The demo data represents the PRD's six lists:

- Synthetic learners with embedded credential snapshots.
- Qualification-to-occupation mappings.
- Course catalog seed rows with provenance.
- Job evidence seed rows with provenance.
- Regional demand and absorbable capacity.
- Crowding counts derived from learner targets.

Run:

```bash
npm run validate:data
```

## Evaluation Notes

Recommended Phase 2 test set:

- English learner input.
- Tamil learner input.
- Mixed English/Tamil input.
- Missing credential.
- Unknown credential.
- Missing region.
- Low wage expectation.
- Overqualified learner.
- Learner interested in crowded path.
- Learner with no nearby jobs.

Track these metrics:

- JSON validity rate.
- Profile extraction accuracy.
- Hallucinated course/job ID acceptance rate.
- Top-3 recommendation agreement against a hand-authored rubric.
- Explanation factuality.
- Tamil explanation usability pass/fail.
- Average latency.

## Build

```bash
npm run build
npm run preview
```

The preview server also serves the `/api/ai/*` model bridge, so the AI flow works in preview as long as the model endpoint is reachable.
