import { describe, it, expect } from 'vitest';
import { MockProvider } from '../../src/lib/ai/mock';

describe('Output Guard Tests', () => {
  const provider = new MockProvider();

  it('only cites resource IDs that exist in input', async () => {
    const existingIds = ['res-1', 'res-2', 'res-3'];
    const plan = await provider.generateTreatmentPlan({
      caseId: 'test',
      caseData: { age_band: '2-3', setting: 'outpatient_clinic', diagnoses: '["feeding"]', precautions: '[]', equipment_available: '[]', caregiver_participation: '{}' },
      goals: [{ id: 'g1', description: 'Test goal', domain: 'feeding' }],
      sessions: [],
      outcomes: [],
      barriers: [],
      resources: existingIds.map(id => ({ id, title: `Res ${id}` })),
      similarCases: [],
    });

    for (const c of plan.citations) {
      expect(existingIds).toContain(c.resource_id);
    }
    for (const int of plan.suggested_interventions) {
      for (const id of int.resource_ids) {
        expect(existingIds).toContain(id);
      }
    }
  });

  it('removes conflicting suggestions when precautions exist', async () => {
    const plan = await provider.generateTreatmentPlan({
      caseId: 'test',
      caseData: {
        age_band: '3-4', setting: 'home_health',
        diagnoses: '["dysphagia"]',
        precautions: '["aspiration risk documented"]',
        equipment_available: '[]', caregiver_participation: '{}',
      },
      goals: [{ id: 'g1', description: 'Safe oral intake', domain: 'swallowing' }],
      sessions: [], outcomes: [], barriers: [], resources: [], similarCases: [],
    });

    expect(plan.precaution_conflicts.length).toBeGreaterThan(0);
    for (const conflict of plan.precaution_conflicts) {
      expect(conflict.resolution).toBeTruthy();
      expect(conflict.resolution.toLowerCase()).toContain('removed');
    }
  });

  it('never outputs bare success percentages in similar case summaries', async () => {
    const { formatSimilarCaseSummary } = await import('../../src/lib/matching/similar-cases');
    const summary = formatSimilarCaseSummary({
      caseId: 'test',
      ageBand: '2-3',
      setting: 'outpatient_clinic',
      matchedFields: ['age_band', 'goal_domains'],
      matchedGoalDomains: ['feeding'],
      sessionCount: 8,
      progressRecordedSessions: 5,
      caveats: ['baseline differs', 'caregiver participation varies'],
    });

    expect(summary).not.toMatch(/\d+%/);
    expect(summary).toContain('8 sessions');
    expect(summary).toContain('5 sessions');
    expect(summary).toContain('does not show the activity caused progress');
  });

  it('all AI outputs are labeled as ai_generated', async () => {
    const activity = await provider.generateActivity({
      targetGoal: 'Test',
      patientInterests: [],
      developmentalLevel: 'toddler',
      setting: 'school',
      timeAvailable: 20,
      availableTools: [],
      accessibilityNeeds: [],
    });
    expect(activity.knowledge_type).toBe('ai_generated');

    const note = await provider.generateProgressNote({
      caseId: 'test',
      caseData: {},
      session: { id: 's1', session_date: '2026-01-01', duration_minutes: 30, setting: 'school', caregiver_present: false },
      interventions: [],
      outcomes: [],
      barriers: [],
      goals: [],
    });
    expect(note.knowledge_type).toBe('ai_generated');
  });
});
