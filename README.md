# SimpleSLP — Dynamic Patient Outcomes Portal

A locally-runnable clinical workspace for speech-language pathologists, built around the loop: **case → goal → intervention → outcome → barrier → next decision**.

## Setup

```bash
npm install
npm run setup
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run setup` | Create database and load synthetic seed data |
| `npm run reset` | Drop database and re-seed from scratch |
| `npm test` | Run unit and integration tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |

## Key Features

- **Case management** with age band, setting, precautions, and caregiver context
- **Goal tracking** with baseline vs. latest vs. target comparisons
- **Session logging** with interventions, outcomes, and barriers
- **Resource library** with source-type and verification-status badges
- **Similar-case retrieval** with explainable matching and denominators
- **AI-powered drafts** for treatment plans, activities, and progress notes (MockProvider default — works fully offline)
- **Document workflow**: draft → edit → approve → locked, with version history
- **PII guard** on all free-text inputs
- **Audit log** for all clinical record changes

## Data

All data is synthetic. The database is a SQLite file stored in `./data/dpop.db` (gitignored). No cloud services or accounts are required.

## AI Providers

The app defaults to `MockProvider`, which generates deterministic template-based drafts with no network access. To enable the Anthropic provider, set these environment variables:

```
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key
ALLOW_EXTERNAL_AI=true
```

## License

Private — not for distribution.
