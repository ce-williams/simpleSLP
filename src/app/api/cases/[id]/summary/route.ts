import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/ai';


export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  try {
    const caseRow = db.prepare('SELECT * FROM cases WHERE id = ? AND deleted_at IS NULL').get(id) as Record<string, unknown> | undefined;
    if (!caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const goals = db.prepare('SELECT * FROM goals WHERE case_id = ? AND deleted_at IS NULL ORDER BY created_at DESC').all(id) as Record<string, unknown>[];
    const sessions = db.prepare('SELECT * FROM sessions WHERE case_id = ? ORDER BY session_date DESC').all(id) as Record<string, unknown>[];
    const barriers = db.prepare('SELECT * FROM barriers WHERE case_id = ? ORDER BY created_at DESC').all(id) as Record<string, unknown>[];
    const healthHistory = (db.prepare('SELECT * FROM health_history WHERE case_id = ?').get(id) || null) as Record<string, unknown> | null;
    const episodes = db.prepare('SELECT * FROM episodes WHERE case_id = ? ORDER BY episode_number ASC').all(id) as Record<string, unknown>[];

    const outcomes: Record<string, unknown>[] = [];
    for (const session of sessions.slice(0, 10)) {
      const sessionOutcomes = db.prepare('SELECT * FROM outcomes WHERE session_id = ? ORDER BY outcome_date DESC').all(session.id as string) as Record<string, unknown>[];
      outcomes.push(...sessionOutcomes);
    }

    const provider = getProvider();
    const summary = await provider.generatePatientSummary({
      caseId: id,
      caseData: caseRow as Record<string, unknown>,
      goals,
      sessions,
      outcomes,
      barriers,
      healthHistory,
      episodes,
    });

    return NextResponse.json(summary);
  } finally {
    db.close();
  }
}
