# Known Limitations

## Mocked / Not Yet Implemented

- **Authentication**: No user auth. Single implicit "clinician" actor for all operations.
- **AnthropicProvider**: Interface defined but implementation uses MockProvider fallback. To enable, set `AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY`, and `ALLOW_EXTERNAL_AI=true`.
- **Payer workflows**: Database table exists. No UI beyond placeholder.
- **Assessment / oral-motor checklists**: Not built. Architecture supports adding as a new module.
- **Low-tech AAC generator**: Not built.
- **EHR integration**: Not built. No external system connections.
- **Multi-user access**: Not built. No role-based permissions.
- **File upload / attachment**: Text input only. No image or document uploads.
- **Full-text search**: Resource search is basic SQL LIKE matching, not full-text indexed.

## AI Provider Limitations

- **MockProvider output**: Template-based, deterministic. Does not produce natural language quality comparable to an LLM. Demonstrates data flow and UI patterns only.
- **No swallowing/feeding procedures generated**: The system flags aspiration risk and medical restrictions for clinical review rather than generating procedures.
- **Citation placeholders**: All seed resources ship as `unverified`. No real citations, DOIs, or URLs are included.

## PII Guard Limitations

- **Regex-based**: Will produce false positives on some clinical text (e.g., therapy schedule times that look like phone numbers). Users can confirm false positives as "synthetic data."
- **Not ML-based**: Cannot detect contextual PII (e.g., a rare disease + age + location combination that could identify someone).
- **English only**: Patterns are designed for English-language PII formats.

## Data

- **Synthetic only**: All seed data is fictional. Do not enter real patient data.
- **SQLite single-writer**: Only supports one concurrent user. Not suitable for multi-user deployment without migration to a server database.
- **No backup/export**: No built-in data export or backup functionality.

## UI

- **No offline PWA support**: Requires running dev server.
- **Print layout**: Basic CSS print support for activities. Not optimized for all document types.
- **Accessibility**: Basic semantic HTML and ARIA labels. Not fully audited for WCAG 2.1 AA compliance.
