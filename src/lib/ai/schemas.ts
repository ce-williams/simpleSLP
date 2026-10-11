import { z } from 'zod';

export const TreatmentPlanOutputSchema = z.object({
  clinical_summary: z.string(),
  missing_information: z.array(z.string()),
  clarifying_questions: z.array(z.string()),
  proposed_goals: z.array(z.object({
    description: z.string(),
    rationale: z.string(),
    measurement_method: z.string(),
    knowledge_type: z.enum(['published_evidence', 'therapist_experience', 'ai_generated']),
  })),
  suggested_interventions: z.array(z.object({
    name: z.string(),
    description: z.string(),
    rationale: z.string(),
    resource_ids: z.array(z.string()),
    knowledge_type: z.enum(['published_evidence', 'therapist_experience', 'ai_generated']),
  })),
  safety_considerations: z.array(z.string()),
  alternatives: z.array(z.object({ description: z.string(), rationale: z.string() })),
  citations: z.array(z.object({ resource_id: z.string(), context: z.string() })),
  limitations: z.array(z.string()),
  precaution_conflicts: z.array(z.object({
    precaution: z.string(),
    conflicting_suggestion: z.string(),
    resolution: z.string(),
  })),
  requires_clinician_review: z.literal(true),
});

export const ActivityOutputSchema = z.object({
  name: z.string(),
  premise: z.string(),
  target_goal: z.string(),
  why_it_fits: z.string(),
  materials: z.array(z.object({ item: z.string(), alternatives: z.array(z.string()) })),
  prep_steps: z.array(z.string()),
  instructions: z.array(z.string()),
  grading: z.object({ up: z.array(z.string()), down: z.array(z.string()) }),
  measurement: z.string(),
  safety_notes: z.array(z.string()),
  stop_criteria: z.array(z.string()),
  provenance: z.string(),
  knowledge_type: z.literal('ai_generated'),
});

export const ProgressNoteOutputSchema = z.object({
  sections: z.array(z.object({
    heading: z.string(),
    content: z.string(),
    source_records: z.array(z.string()),
  })),
  unsupported_content: z.array(z.object({ text: z.string(), reason: z.string() })),
  knowledge_type: z.literal('ai_generated'),
});

export const PatientSummaryOutputSchema = z.object({
  patient_snapshot: z.string(),
  treatment_summary: z.string(),
  recent_outcomes: z.string(),
  active_barriers: z.string(),
  next_steps: z.string(),
  limitations: z.array(z.string()),
  knowledge_type: z.literal('ai_generated'),
  requires_clinician_review: z.literal(true),
});

export const PayerProgressReportOutputSchema = z.object({
  report_type: z.literal('medicaid_progress_report'),
  patient_identifier: z.string(),
  reporting_period: z.object({ start: z.string(), end: z.string() }),
  diagnoses: z.array(z.string()),
  authorization_info: z.string(),
  goals_progress: z.array(z.object({
    goal_description: z.string(),
    domain: z.string(),
    baseline: z.string(),
    current_level: z.string(),
    target: z.string(),
    progress_rating: z.enum(['significant_progress', 'moderate_progress', 'minimal_progress', 'regression', 'maintained']),
    sessions_addressed: z.number(),
    interventions_used: z.array(z.string()),
    objective_data: z.string(),
  })),
  session_summary: z.object({
    total_sessions: z.number(),
    attended: z.number(),
    cancelled: z.number(),
    frequency: z.string(),
    duration_minutes: z.number(),
    setting: z.string(),
  }),
  barriers_to_progress: z.array(z.string()),
  caregiver_involvement: z.string(),
  medical_necessity_justification: z.string(),
  continued_treatment_recommendation: z.string(),
  plan_modifications: z.array(z.string()),
  clinician_signature_line: z.string(),
  knowledge_type: z.literal('ai_generated'),
  requires_clinician_review: z.literal(true),
});

export type PayerProgressReportOutput = z.infer<typeof PayerProgressReportOutputSchema>;

export type TreatmentPlanOutput = z.infer<typeof TreatmentPlanOutputSchema>;
export type ActivityOutput = z.infer<typeof ActivityOutputSchema>;
export type ProgressNoteOutput = z.infer<typeof ProgressNoteOutputSchema>;
export type PatientSummaryOutput = z.infer<typeof PatientSummaryOutputSchema>;
