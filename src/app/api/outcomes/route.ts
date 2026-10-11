import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';


export async function GET(req: NextRequest) {
  const db = getDb();
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    const goalId = req.nextUrl.searchParams.get('goal_id');
    if (sessionId) {
      return NextResponse.json(db.prepare('SELECT * FROM outcomes WHERE session_id = ? ORDER BY outcome_date ASC').all(sessionId));
    }
    if (goalId) {
      return NextResponse.json(db.prepare('SELECT * FROM outcomes WHERE goal_id = ? ORDER BY outcome_date DESC').all(goalId));
    }
    return NextResponse.json([]);
  } finally {
    db.close();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  try {
    const now = new Date().toISOString();
    const id = nanoid();

    db.prepare(
      `INSERT INTO outcomes (id, session_id, goal_id, metric, value, unit, assistance_level, measurement_method, context, outcome_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, body.session_id, body.goal_id, body.metric, body.value, body.unit, body.assistance_level || null, body.measurement_method || null, body.context || null, body.outcome_date, now, now);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'outcome', id, 'create', 'clinician', now);

    const created = db.prepare('SELECT * FROM outcomes WHERE id = ?').get(id);
    return NextResponse.json(created, { status: 201 });
  } finally {
    db.close();
  }
}
