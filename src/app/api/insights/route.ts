import { getDb } from '@/lib/db/connection';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();
  try {
    const cases = db.prepare('SELECT * FROM cases WHERE deleted_at IS NULL').all() as Record<string, unknown>[];
    const goals = db.prepare('SELECT * FROM goals WHERE deleted_at IS NULL').all() as Record<string, unknown>[];
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY session_date ASC').all() as Record<string, unknown>[];
    const outcomes = db.prepare('SELECT * FROM outcomes ORDER BY outcome_date ASC').all() as Record<string, unknown>[];
    const barriers = db.prepare('SELECT * FROM barriers ORDER BY created_at DESC').all() as Record<string, unknown>[];
    const interventions = db.prepare('SELECT * FROM interventions ORDER BY created_at ASC').all() as Record<string, unknown>[];

    // Goal status breakdown
    const goalsByStatus: Record<string, number> = {};
    const goalsByDomain: Record<string, number> = {};
    for (const g of goals) {
      const status = g.status as string;
      const domain = g.domain as string;
      goalsByStatus[status] = (goalsByStatus[status] || 0) + 1;
      goalsByDomain[domain] = (goalsByDomain[domain] || 0) + 1;
    }

    // Outcomes over time by domain
    const outcomesByGoalId: Record<string, Record<string, unknown>[]> = {};
    for (const o of outcomes) {
      const gid = o.goal_id as string;
      if (!outcomesByGoalId[gid]) outcomesByGoalId[gid] = [];
      outcomesByGoalId[gid].push(o);
    }

    const goalLookup = new Map(goals.map(g => [g.id as string, g]));

    // Domain outcome trends: average values per domain over time
    const domainTrends: Record<string, { date: string; avgValue: number; count: number }[]> = {};
    for (const [goalId, goalOutcomes] of Object.entries(outcomesByGoalId)) {
      const goal = goalLookup.get(goalId);
      if (!goal) continue;
      const domain = goal.domain as string;
      if (!domainTrends[domain]) domainTrends[domain] = [];
      for (const o of goalOutcomes) {
        const val = parseFloat(o.value as string);
        if (!isNaN(val)) {
          domainTrends[domain].push({
            date: o.outcome_date as string,
            avgValue: val,
            count: 1,
          });
        }
      }
    }

    // Session frequency by month
    const sessionsByMonth: Record<string, number> = {};
    for (const s of sessions) {
      const month = (s.session_date as string).slice(0, 7);
      sessionsByMonth[month] = (sessionsByMonth[month] || 0) + 1;
    }

    // Barrier categories
    const barriersByCategory: Record<string, number> = {};
    for (const b of barriers) {
      const cat = b.category as string;
      barriersByCategory[cat] = (barriersByCategory[cat] || 0) + 1;
    }

    // Intervention frequency
    const interventionCounts: Record<string, number> = {};
    for (const i of interventions) {
      const name = i.name as string;
      interventionCounts[name] = (interventionCounts[name] || 0) + 1;
    }
    const topInterventions = Object.entries(interventionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Per-case summary
    const caseSummaries = cases.map(c => {
      const caseId = c.id as string;
      const caseGoals = goals.filter(g => g.case_id === caseId);
      const caseSessions = sessions.filter(s => s.case_id === caseId);
      const caseBarriers = barriers.filter(b => b.case_id === caseId);
      const activeGoals = caseGoals.filter(g => g.status === 'active').length;
      const metGoals = caseGoals.filter(g => g.status === 'met').length;

      return {
        id: caseId,
        displayName: c.display_name || `Patient ${(caseId as string).slice(0, 8)}`,
        ageBand: c.age_band,
        setting: c.setting,
        status: c.status,
        totalGoals: caseGoals.length,
        activeGoals,
        metGoals,
        totalSessions: caseSessions.length,
        totalBarriers: caseBarriers.length,
        goalCompletionRate: caseGoals.length > 0 ? Math.round((metGoals / caseGoals.length) * 100) : 0,
      };
    });

    return NextResponse.json({
      overview: {
        totalPatients: cases.length,
        activePatients: cases.filter(c => c.status === 'active').length,
        totalGoals: goals.length,
        totalSessions: sessions.length,
        totalOutcomes: outcomes.length,
      },
      goalsByStatus,
      goalsByDomain,
      domainTrends,
      sessionsByMonth,
      barriersByCategory,
      topInterventions,
      caseSummaries,
    });
  } finally {
    db.close();
  }
}
