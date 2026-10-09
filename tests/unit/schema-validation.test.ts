import { describe, it, expect } from 'vitest';
import { TreatmentPlanOutputSchema, ActivityOutputSchema, ProgressNoteOutputSchema } from '../../src/lib/ai/schemas';

describe('Schema Validation', () => {
  describe('TreatmentPlanOutputSchema', () => {
    it('validates a valid treatment plan', () => {
      const plan = {
        clinical_summary: 'Test case summary',
        missing_information: [],
        clarifying_questions: [],
        proposed_goals: [{
          description: 'Test goal',
          rationale: 'Test rationale',
          measurement_method: 'Direct observation',
          knowledge_type: 'ai_generated' as const,
        }],
        suggested_interventions: [{
          name: 'Test intervention',
          description: 'Description',
          rationale: 'Rationale',
          resource_ids: ['res1'],
          knowledge_type: 'ai_generated' as const,
        }],
        safety_considerations: ['Monitor for distress'],
        alternatives: [{ description: 'Alt approach', rationale: 'Why' }],
        citations: [{ resource_id: 'res1', context: 'Background' }],
        limitations: ['Template-based'],
        precaution_conflicts: [],
        requires_clinician_review: true as const,
      };
      expect(() => TreatmentPlanOutputSchema.parse(plan)).not.toThrow();
    });

    it('rejects plan without clinician review flag', () => {
      const plan = {
        clinical_summary: 'Test',
        missing_information: [],
        clarifying_questions: [],
        proposed_goals: [],
        suggested_interventions: [],
        safety_considerations: [],
        alternatives: [],
        citations: [],
        limitations: [],
        precaution_conflicts: [],
        requires_clinician_review: false,
      };
      expect(() => TreatmentPlanOutputSchema.parse(plan)).toThrow();
    });

    it('rejects invalid knowledge type', () => {
      const plan = {
        clinical_summary: 'Test',
        missing_information: [],
        clarifying_questions: [],
        proposed_goals: [{
          description: 'Goal',
          rationale: 'R',
          measurement_method: 'M',
          knowledge_type: 'invalid_type',
        }],
        suggested_interventions: [],
        safety_considerations: [],
        alternatives: [],
        citations: [],
        limitations: [],
        precaution_conflicts: [],
        requires_clinician_review: true,
      };
      expect(() => TreatmentPlanOutputSchema.parse(plan)).toThrow();
    });
  });

  describe('ActivityOutputSchema', () => {
    it('validates a valid activity', () => {
      const activity = {
        name: 'Test Activity',
        premise: 'A fun activity',
        target_goal: 'Increase food variety',
        why_it_fits: 'Designed for the patient',
        materials: [{ item: 'Spoons', alternatives: ['Forks'] }],
        prep_steps: ['Set up workspace'],
        instructions: ['Step 1'],
        grading: { up: ['More variety'], down: ['Fewer items'] },
        measurement: 'Count interactions',
        safety_notes: ['Monitor for distress'],
        stop_criteria: ['Child requests stop'],
        provenance: 'MockProvider',
        knowledge_type: 'ai_generated' as const,
      };
      expect(() => ActivityOutputSchema.parse(activity)).not.toThrow();
    });

    it('rejects activity with wrong knowledge type', () => {
      const activity = {
        name: 'Test',
        premise: 'Test',
        target_goal: 'Test',
        why_it_fits: 'Test',
        materials: [],
        prep_steps: [],
        instructions: [],
        grading: { up: [], down: [] },
        measurement: 'Test',
        safety_notes: [],
        stop_criteria: [],
        provenance: 'Test',
        knowledge_type: 'published_evidence',
      };
      expect(() => ActivityOutputSchema.parse(activity)).toThrow();
    });
  });

  describe('ProgressNoteOutputSchema', () => {
    it('validates a valid progress note', () => {
      const note = {
        sections: [{
          heading: 'Session Info',
          content: '30-minute session',
          source_records: ['session:123'],
        }],
        unsupported_content: [],
        knowledge_type: 'ai_generated' as const,
      };
      expect(() => ProgressNoteOutputSchema.parse(note)).not.toThrow();
    });
  });
});
