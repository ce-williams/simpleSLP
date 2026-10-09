# DPOP — Data Model

## Overview

SQLite database stored at `./data/dpop.db`. All tables use TEXT primary keys (nanoid-generated), ISO 8601 timestamps, and soft-delete via `deleted_at` where applicable. Clinical records support versioning through `version` + `previous_version_id`.

## Entity Relationship

```
cases ──┬── goals ──── outcomes
        │            └── interventions (via sessions)
        ├── sessions ──┬── interventions
        │              ├── outcomes
        │              └── barriers
        ├── context_observations
        ├── barriers
        ├── care_coordination_log
        └── documents
```

## Tables

### cases
Core entity. Identified by random ID (never derived from patient data). Stores age band (not birth date), diagnoses, clinical setting, precautions, and caregiver participation.

### goals
Linked to a case. Tracks description, baseline, target, domain, and knowledge type. Versioned — modifications create new records with `previous_version_id` linking to the prior version.

### sessions
A single therapy session. Links to a case. Records date, duration, setting, caregiver presence, and notes (PII-guarded).

### interventions
What was done in a session toward a goal. Links to session + goal. Tracks rationale, linked resources, and knowledge type. Versioned.

### outcomes
Measured result of an intervention. Links to session + goal. Structured fields: metric, value, unit, assistance level, measurement method. Versioned.

### barriers
Obstacles to progress. Links to case, optionally to session and goal. Categorized: patient, environmental, systemic, caregiver, equipment.

### context_observations
Free-text clinical observations with PII guard. Source attribution and knowledge type.

### care_coordination_log
Inter-disciplinary communication records. PII-guarded summaries.

### resources
Evidence library. Source type (published_evidence, therapist_experience, ai_generated), verification status (always ships as unverified), topic tags, limitations.

### toolkit_items
Available therapy tools and materials. Categorized with suitability metadata (age bands, settings, domains).

### documents
Clinical documents (progress notes, treatment plans). JSON-structured content with section-level source tracing. Status lifecycle: draft → approved → locked. Versioned.

### audit_log
Immutable record of all create, update, approve, lock, and ai_generate actions.

### payer_workflows
Placeholder table for future insurance/payer integration. Not implemented in MVP.
