import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const db = getDb();
  try {
    const caseRow = db.prepare('SELECT * FROM cases WHERE id = ? AND deleted_at IS NULL').get(caseId) as Record<string, unknown> | undefined;
    if (!caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const goals = db.prepare('SELECT id, description, target_value, target_unit, baseline_value, baseline_unit, status, domain FROM goals WHERE case_id = ? AND deleted_at IS NULL ORDER BY created_at DESC').all(caseId) as Record<string, unknown>[];

    const recentSessions = db.prepare('SELECT id, session_date, duration_minutes, setting, caregiver_present FROM sessions WHERE case_id = ? ORDER BY session_date DESC LIMIT 5').all(caseId) as Record<string, unknown>[];

    const outcomes: Record<string, unknown>[] = [];
    for (const session of recentSessions) {
      const sessionOutcomes = db.prepare('SELECT goal_id, metric, value, unit, assistance_level, outcome_date FROM outcomes WHERE session_id = ? ORDER BY outcome_date DESC').all(session.id as string) as Record<string, unknown>[];
      outcomes.push(...sessionOutcomes);
    }

    const activeEpisode = db.prepare('SELECT frequency, duration, notes FROM episodes WHERE case_id = ? AND status = ? ORDER BY episode_number DESC LIMIT 1').get(caseId, 'active') as Record<string, unknown> | undefined;

    const activeGoals = goals.filter(g => g.status === 'active');

    // Build home practice recommendations per active goal
    const homePractice = activeGoals.map(g => {
      const goalOutcomes = outcomes.filter(o => o.goal_id === g.id);
      const latestOutcome = goalOutcomes[0];

      return {
        goal: g.description,
        domain: g.domain,
        currentProgress: latestOutcome
          ? `${latestOutcome.value} ${latestOutcome.unit || ''}`.trim()
          : 'Baseline being established',
        target: g.target_value ? `${g.target_value} ${g.target_unit || ''}`.trim() : 'In progress',
        suggestions: [
          `Practice activities related to ${g.domain} for 5-10 minutes daily`,
          'Use positive reinforcement and follow your child\'s lead',
          'Note any changes or concerns to share at the next visit',
        ],
      };
    });

    return NextResponse.json({
      patientName: caseRow.display_name || `Patient ${caseId.slice(0, 8)}`,
      ageBand: caseRow.age_band,
      setting: caseRow.setting,
      activeGoals: activeGoals.map(g => ({
        description: g.description,
        domain: g.domain,
        status: g.status,
        target: g.target_value ? `${g.target_value} ${g.target_unit || ''}`.trim() : null,
        baseline: g.baseline_value ? `${g.baseline_value} ${g.baseline_unit || ''}`.trim() : null,
      })),
      recentVisits: recentSessions.map(s => ({
        date: s.session_date,
        duration: s.duration_minutes,
        setting: s.setting,
      })),
      recentOutcomes: outcomes.slice(0, 10).map(o => ({
        metric: o.metric,
        value: o.value,
        unit: o.unit,
        date: o.outcome_date,
        assistanceLevel: o.assistance_level,
      })),
      homePractice,
      nextVisitInfo: activeEpisode ? {
        frequency: activeEpisode.frequency,
        duration: activeEpisode.duration,
      } : null,
    });
  } finally {
    db.close();
  }
}
