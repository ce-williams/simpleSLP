import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';


export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  try {
    const now = new Date().toISOString();
    const id = nanoid();

    db.prepare(
      `INSERT INTO barriers (id, session_id, case_id, goal_id, description, category, impact, resolution, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, body.session_id || null, body.case_id, body.goal_id || null, body.description, body.category, body.impact || null, body.resolution || null, now, now);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'barrier', id, 'create', 'clinician', now);

    const created = db.prepare('SELECT * FROM barriers WHERE id = ?').get(id);
    return NextResponse.json(created, { status: 201 });
  } finally {
    db.close();
  }
}
