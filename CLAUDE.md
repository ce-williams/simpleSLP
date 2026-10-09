# SimpleSLP — Clinical Workspace for Speech-Language Pathologists

## Quick Start
```bash
npm install
npm run setup   # Creates SQLite DB and loads synthetic seed data
npm run dev     # Starts dev server at http://localhost:3000
```

## Stack
- Next.js 14 (App Router) + TypeScript (strict) + Tailwind CSS
- Drizzle ORM + better-sqlite3 (SQLite in `./data/dpop.db`)
- Zod for validation, nanoid for IDs
- Vitest for unit/integration tests, Playwright for e2e

## Key Commands
- `npm run dev` — Start development server
- `npm run setup` — Run migrations and seed data
- `npm run reset` — Drop DB and re-seed
- `npm test` — Run unit and integration tests
- `npm run test:e2e` — Run Playwright smoke tests

## Architecture
- `src/app/` — Next.js pages and API routes
- `src/lib/db/` — Database schema and connection
- `src/lib/ai/` — AI provider interface (MockProvider default)
- `src/lib/pii/` — PII guard for free-text inputs
- `src/components/` — React components
- `seed/` — Synthetic seed data files
- `data/` — SQLite database (gitignored)

## Rules
- All free-text must pass PII guard before save or AI submission
- Three knowledge types labeled everywhere: published_evidence, therapist_experience, ai_generated
- Resources ship as `unverified` — never fabricate citations
- AI defaults to MockProvider (no network). AnthropicProvider requires AI_PROVIDER=anthropic + ANTHROPIC_API_KEY + ALLOW_EXTERNAL_AI=true
- Clinical records are versioned; audit log tracks all mutations
