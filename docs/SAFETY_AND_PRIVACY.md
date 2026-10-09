# DPOP — Safety and Privacy

## PII Guard

All free-text input passes through a regex-based PII detection layer before storage or AI processing.

### Detected Patterns
- Phone numbers, email addresses, SSNs
- Full dates with year (numeric and named-month formats)
- Medical record numbers (MRN patterns)
- Street addresses and ZIP codes in address context
- Patient names following identifier phrases ("patient named", "child called")

### User Flow
1. Text is scanned on blur/submit
2. If PII is detected, a warning modal highlights matched spans
3. User can **edit** (fix the text) or **confirm as synthetic** (acknowledge and proceed)
4. No text reaches the AI provider without passing the guard

### Limitations
- Regex-based: will produce false positives on some clinical text
- Cannot detect contextual PII (rare condition + location combinations)
- English-language patterns only

## AI Safety Rules

1. **Never fabricate** citations, URLs, measurements, patient history, or responses
2. **Never generate** swallowing or feeding procedures — flag aspiration, medical instability, or restrictions for clinical review
3. **No guarantees** of insurance approval or claims of HIPAA compliance
4. **No judgmental labels** about patients or caregivers
5. **Clinician review required** banner on all AI-generated output
6. **Precaution conflict detection**: AI output is checked against case precautions; conflicting suggestions are removed and flagged
7. **Missing information surfaced**: Gaps are reported rather than filled with assumptions
8. **All AI output labeled** with `knowledge_type: "ai_generated"`

## Resource Integrity

- All resources ship as `verification_status: "unverified"`
- No fabricated citations or DOIs
- Citation fields are nullable — empty is better than invented

## Data Privacy

- Case IDs are random (nanoid), never derived from patient data
- Age stored as band (e.g., "2-3"), never as birth date
- All seed data is synthetic
- SQLite database is local-only — no network transmission
- No telemetry, analytics, or external service calls in MockProvider mode
