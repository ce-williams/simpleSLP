import Database from 'better-sqlite3';

interface CaseRow {
  id: string;
  age_band: string;
  diagnoses: string;
  setting: string;
  precautions: string;
}

interface GoalRow {
  id: string;
  case_id: string;
  description: string;
  domain: string;
}

interface MatchResult {
  caseId: string;
  ageBand: string;
  setting: string;
  matchedFields: string[];
  matchedGoalDomains: string[];
  sessionCount: number;
  progressRecordedSessions: number;
  caveats: string[];
}

export function findSimilarCases(db: Database.Database, targetCaseId: string): MatchResult[] {
  const targetCase = db.prepare('SELECT * FROM cases WHERE id = ? AND deleted_at IS NULL').get(targetCaseId) as CaseRow | undefined;
  if (!targetCase) return [];

  const targetGoals = db.prepare('SELECT * FROM goals WHERE case_id = ? AND deleted_at IS NULL').all(targetCaseId) as GoalRow[];
  const targetDomains = new Set(targetGoals.map(g => g.domain));
  const targetDiagnoses = new Set(JSON.parse(targetCase.diagnoses || '[]') as string[]);

  const allCases = db.prepare('SELECT * FROM cases WHERE id != ? AND deleted_at IS NULL').all(targetCaseId) as CaseRow[];
  const results: MatchResult[] = [];

  for (const c of allCases) {
    const matchedFields: string[] = [];
    const caveats: string[] = [];

    if (c.age_band === targetCase.age_band) {
      matchedFields.push('age_band');
    } else {
      caveats.push(`Age bands differ (${c.age_band} vs ${targetCase.age_band})`);
    }

    if (c.setting === targetCase.setting) {
      matchedFields.push('setting');
    } else {
      caveats.push(`Settings differ (${c.setting} vs ${targetCase.setting})`);
    }

    const caseDiagnoses = new Set(JSON.parse(c.diagnoses || '[]') as string[]);
    const sharedDiagnoses = [...targetDiagnoses].filter(d => caseDiagnoses.has(d));
    if (sharedDiagnoses.length > 0) {
      matchedFields.push('diagnoses');
    }

    const caseGoals = db.prepare('SELECT * FROM goals WHERE case_id = ? AND deleted_at IS NULL').all(c.id) as GoalRow[];
    const caseDomains = new Set(caseGoals.map(g => g.domain));
    const matchedGoalDomains = [...targetDomains].filter(d => caseDomains.has(d));
    if (matchedGoalDomains.length > 0) {
      matchedFields.push('goal_domains');
    }

    if (matchedFields.length < 2) continue;

    const sessionCount = (db.prepare('SELECT COUNT(*) as count FROM sessions WHERE case_id = ?').get(c.id) as { count: number }).count;
    const outcomeCount = (db.prepare(
      `SELECT COUNT(DISTINCT s.id) as count FROM sessions s
       JOIN outcomes o ON o.session_id = s.id
       WHERE s.case_id = ?`
    ).get(c.id) as { count: number }).count;

    const targetPrecautions = JSON.parse(targetCase.precautions || '[]') as string[];
    const casePrecautions = JSON.parse(c.precautions || '[]') as string[];
    if (JSON.stringify(targetPrecautions.sort()) !== JSON.stringify(casePrecautions.sort())) {
      caveats.push('Precautions differ between cases');
    }

    const targetCaregiverJson = targetCase.caregiver_participation || '{}';
    const caseCaregiverJson = (db.prepare('SELECT caregiver_participation FROM cases WHERE id = ?').get(c.id) as { caregiver_participation: string })?.caregiver_participation || '{}';
    if (targetCaregiverJson !== caseCaregiverJson) {
      caveats.push('Caregiver participation patterns differ');
    }

    results.push({
      caseId: c.id,
      ageBand: c.age_band,
      setting: c.setting,
      matchedFields,
      matchedGoalDomains,
      sessionCount,
      progressRecordedSessions: outcomeCount,
      caveats,
    });
  }

  results.sort((a, b) => b.matchedFields.length - a.matchedFields.length);
  return results;
}

export function formatSimilarCaseSummary(match: MatchResult): string {
  const parts = [`Documented in ${match.sessionCount} session${match.sessionCount !== 1 ? 's' : ''}`];
  parts.push(`progress recorded in ${match.progressRecordedSessions} session${match.progressRecordedSessions !== 1 ? 's' : ''}`);
  if (match.caveats.length > 0) {
    parts.push(`cases differed in: ${match.caveats.join('; ')}`);
  }
  parts.push('so this does not show the activity caused progress');
  return parts.join('; ');
}
