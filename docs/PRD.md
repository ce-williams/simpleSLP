# DPOP — Product Requirements Document

## Overview

DPOP (Dynamic Patient Outcomes Portal) is a locally-runnable clinician-facing workspace for speech-language pathologists. It supports the core clinical loop: **case → goal → intervention → outcome → barrier → next decision**.

## Problem Statement

SLPs lack integrated tools that connect clinical evidence, therapist expertise, and AI-generated suggestions while maintaining clear provenance. Existing systems either silo data or obscure the source of clinical recommendations.

## Target User

Speech-language pathologists working in pediatric feeding therapy (initial scope), expandable to other domains.

## Core Principles

1. **Three knowledge types everywhere**: published evidence, therapist experience, AI-generated — labeled on every piece of data.
2. **Never fabricate**: No invented citations, URLs, measurements, or patient data.
3. **Clinician-in-the-loop**: All AI output requires clinician review before use.
4. **Privacy by design**: PII guard on all free-text input. No real patient data in seed or generated output.
5. **Offline-first**: Everything works with MockProvider and no network.

## Key Features

- **Case management**: Create and track patient cases by age band, diagnoses, setting, precautions.
- **Goal tracking**: Set goals with baselines, targets, and knowledge-type attribution.
- **Session recording**: Log sessions with interventions, outcomes, and barriers.
- **Similar-case retrieval**: Find matching cases with denominator language (never bare percentages).
- **Treatment plan generation**: AI-assisted plans with precaution conflict detection and missing-info surfacing.
- **Activity studio**: Generate therapy activities tailored to patient interests and needs.
- **Document lifecycle**: Draft → edit → approve → lock with full version history and audit trail.
- **Resource library**: Curated resources with source type and verification status tracking.

## Non-Functional Requirements

- Single-user MVP (no authentication)
- SQLite database (no server required)
- Synthetic seed data only
- All AI output validated by Zod schemas before rendering
