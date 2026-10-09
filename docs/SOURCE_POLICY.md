# DPOP — Source Policy

## Three Knowledge Types

Every piece of clinical data in DPOP is labeled with one of three knowledge types:

| Type | Badge Color | Meaning |
|------|-------------|---------|
| `published_evidence` | Blue | From a published study, guideline, or systematic review |
| `therapist_experience` | Green | Based on clinical expertise and professional judgment |
| `ai_generated` | Amber | Produced by an AI provider (mock or live) |

## Where Labels Appear

- Goals, interventions, outcomes, and context observations
- Resources in the library
- AI-generated treatment plans, activities, and progress notes
- Document sections with source record references

## Rules

1. **Labels are mandatory** — no clinical data exists without a knowledge type
2. **AI output is always `ai_generated`** — enforced by Zod schema validation (the field is a literal type)
3. **Resources are always `unverified`** — verification status tracks whether a human has confirmed the source
4. **Citations are never fabricated** — if a citation doesn't exist, the field is left empty
5. **Denominators required** — similar-case comparisons always include session counts and the caveat "does not show the activity caused progress"
6. **Source records traced** — document sections link back to the session, intervention, outcome, or resource they reference

## Verification Status

Resources have a separate `verification_status` field:
- `unverified` (default): The resource has been entered but not independently verified
- `verified`: A clinician has confirmed the citation and content

All seed resources ship as `unverified`. The system never auto-verifies.
