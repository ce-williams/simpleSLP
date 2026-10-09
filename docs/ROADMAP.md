# DPOP — Roadmap

## Completed (MVP)

- Case management with age bands, diagnoses, settings, precautions
- Goal tracking with baselines, targets, and knowledge-type labels
- Session recording with interventions, outcomes, and barriers
- Care coordination log
- Resource library with source type and verification status
- PII guard on all free-text input
- Similar-case retrieval with denominator language
- Treatment plan builder with precaution conflict detection
- Activity studio with print support
- Document lifecycle (draft → approve → lock) with versioning
- MockProvider AI (deterministic, no network)
- Audit log for all operations
- Full test suite (49 unit/integration/guard tests)

## Recommended Next Phase

### Authentication and Multi-User
- User accounts with role-based permissions (SLP, supervisor, admin)
- Per-user audit trail attribution
- Session-based auth with secure token management

### Live AI Provider
- Complete AnthropicProvider implementation with Claude API
- Structured output via tool_use for validated responses
- Rate limiting and error handling for API calls

### Assessment Tools
- Oral-motor assessment checklists
- Standardized feeding assessment forms
- Assessment-to-goal recommendation pipeline

### Payer Workflow Integration
- Insurance authorization tracking
- Progress report templates aligned to payer requirements
- Documentation compliance checking

### Data Management
- Database backup and restore
- Data export (CSV, PDF for documents)
- Migration path from SQLite to PostgreSQL for multi-user deployment

### Expanded Domains
- Swallowing therapy workflows
- Communication/language therapy
- Adult rehabilitation protocols

### Accessibility Audit
- Full WCAG 2.1 AA compliance review
- Screen reader testing
- Keyboard navigation improvements
