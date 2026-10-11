import type { TreatmentPlanOutput, ActivityOutput, ProgressNoteOutput, PatientSummaryOutput, PayerProgressReportOutput } from './schemas';

export interface PatientSummaryInput {
  caseId: string;
  caseData: Record<string, unknown>;
  goals: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  outcomes: Record<string, unknown>[];
  barriers: Record<string, unknown>[];
  healthHistory: Record<string, unknown> | null;
  episodes: Record<string, unknown>[];
}

export interface TreatmentPlanInput {
  caseId: string;
  caseData: Record<string, unknown>;
  goals: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  outcomes: Record<string, unknown>[];
  barriers: Record<string, unknown>[];
  resources: Record<string, unknown>[];
  similarCases: Record<string, unknown>[];
}

export interface ActivityInput {
  targetGoal: string;
  patientInterests: string[];
  developmentalLevel: string;
  setting: string;
  timeAvailable: number;
  availableTools: string[];
  accessibilityNeeds: string[];
}

export interface ProgressNoteInput {
  caseId: string;
  caseData: Record<string, unknown>;
  session: Record<string, unknown>;
  interventions: Record<string, unknown>[];
  outcomes: Record<string, unknown>[];
  barriers: Record<string, unknown>[];
  goals: Record<string, unknown>[];
}

export interface PayerProgressReportInput {
  caseId: string;
  caseData: Record<string, unknown>;
  goals: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  outcomes: Record<string, unknown>[];
  barriers: Record<string, unknown>[];
  interventions: Record<string, unknown>[];
  episodes: Record<string, unknown>[];
  caregiverParticipation: Record<string, unknown> | null;
}

export interface AIProvider {
  readonly name: string;
  generateTreatmentPlan(input: TreatmentPlanInput): Promise<TreatmentPlanOutput>;
  generateActivity(input: ActivityInput): Promise<ActivityOutput>;
  generateProgressNote(input: ProgressNoteInput): Promise<ProgressNoteOutput>;
  generatePatientSummary(input: PatientSummaryInput): Promise<PatientSummaryOutput>;
  generatePayerProgressReport(input: PayerProgressReportInput): Promise<PayerProgressReportOutput>;
}
