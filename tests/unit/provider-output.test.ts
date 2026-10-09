import { describe, it, expect } from 'vitest';
import { MockProvider } from '../../src/lib/ai/mock';
import { TreatmentPlanOutputSchema, ActivityOutputSchema, ProgressNoteOutputSchema } from '../../src/lib/ai/schemas';

describe('MockProvider Output Validation', () => {
  const provider = new MockProvider();

  it('generates valid treatment plan output', async () => {
    const plan = await provider.generateTreatmentPlan({
      caseId: 'test',
      caseData: {
        age_band: '2-3',
        setting: 'outpatient_clinic',
        diagnoses: '["feeding disorder"]',
        precautions: '["no aspiration risk documented"]',
        equipment_available: '["chewy tubes"]',
        caregiver_participation: '{"stated_priorities": ["increase variety"]}',
      },
      goals: [{ id: 'g1', description: 'Increase food variety', domain: 'feeding', status: 'active' }],
      sessions: [{ id: 's1', session_date: '2026-09-01' }],
      outcomes: [{ id: 'o1', metric: 'foods accepted', value: '7', unit: 'count' }],
      barriers: [{ id: 'b1', description: 'Sensory sensitivity', category: 'patient' }],
      resources: [{ id: 'r1', title: 'Test Resource' }],
      similarCases: [],
    });

    expect(() => TreatmentPlanOutputSchema.parse(plan)).not.toThrow();
    expect(plan.requires_clinician_review).toBe(true);
  });

  it('flags aspiration precaution conflicts', async () => {
    const plan = await provider.generateTreatmentPlan({
      caseId: 'test',
      caseData: {
        age_band: '4-5',
        setting: 'home_health',
        diagnoses: '["dysphagia"]',
        precautions: '["aspiration risk - NPO pending eval"]',
        equipment_available: '[]',
        caregiver_participation: '{}',
      },
      goals: [{ id: 'g1', description: 'Safe swallowing', domain: 'swallowing' }],
      sessions: [],
      outcomes: [],
      barriers: [],
      resources: [],
      similarCases: [],
    });

    expect(plan.precaution_conflicts.length).toBeGreaterThan(0);
    expect(plan.precaution_conflicts[0].precaution).toContain('aspiration');
  });

  it('reports missing information when data is sparse', async () => {
    const plan = await provider.generateTreatmentPlan({
      caseId: 'test',
      caseData: {
        age_band: '2-3',
        setting: 'school',
        diagnoses: '[]',
        precautions: '[]',
        equipment_available: '[]',
        caregiver_participation: '{}',
      },
      goals: [],
      sessions: [],
      outcomes: [],
      barriers: [],
      resources: [],
      similarCases: [],
    });

    expect(plan.missing_information.length).toBeGreaterThan(0);
  });

  it('generates valid activity output', async () => {
    const activity = await provider.generateActivity({
      targetGoal: 'Increase food variety',
      patientInterests: ['dinosaurs'],
      developmentalLevel: 'early childhood',
      setting: 'outpatient_clinic',
      timeAvailable: 30,
      availableTools: ['chewy tubes'],
      accessibilityNeeds: [],
    });

    expect(() => ActivityOutputSchema.parse(activity)).not.toThrow();
    expect(activity.knowledge_type).toBe('ai_generated');
    expect(activity.name).toContain('Dinosaurs');
  });

  it('generates valid progress note output', async () => {
    const note = await provider.generateProgressNote({
      caseId: 'test',
      caseData: { setting: 'outpatient_clinic' },
      session: { id: 's1', session_date: '2026-09-01', duration_minutes: 30, setting: 'outpatient_clinic', caregiver_present: true, notes: 'Good session' },
      interventions: [{ id: 'i1', name: 'Food play', description: 'Sensory exploration' }],
      outcomes: [{ id: 'o1', metric: 'foods tried', value: '3', unit: 'count', assistance_level: 'moderate' }],
      barriers: [{ id: 'b1', description: 'Fatigue', category: 'patient' }],
      goals: [{ id: 'g1', description: 'Increase variety' }],
    });

    expect(() => ProgressNoteOutputSchema.parse(note)).not.toThrow();
    expect(note.knowledge_type).toBe('ai_generated');
    expect(note.sections.length).toBeGreaterThan(0);
  });

  it('only cites resource IDs that were provided', async () => {
    const resourceIds = ['r1', 'r2'];
    const plan = await provider.generateTreatmentPlan({
      caseId: 'test',
      caseData: { age_band: '2-3', setting: 'outpatient_clinic', diagnoses: '[]', precautions: '[]', equipment_available: '[]', caregiver_participation: '{}' },
      goals: [{ id: 'g1', description: 'Goal', domain: 'feeding' }],
      sessions: [],
      outcomes: [],
      barriers: [],
      resources: resourceIds.map(id => ({ id, title: `Resource ${id}` })),
      similarCases: [],
    });

    for (const citation of plan.citations) {
      expect(resourceIds).toContain(citation.resource_id);
    }
    for (const intervention of plan.suggested_interventions) {
      for (const refId of intervention.resource_ids) {
        expect(resourceIds).toContain(refId);
      }
    }
  });
});
