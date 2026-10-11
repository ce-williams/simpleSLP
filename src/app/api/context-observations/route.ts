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
      `INSERT INTO context_observations (id, case_id, observation, source, observed_date, knowledge_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, body.case_id, body.observation, body.source, body.observed_date, body.knowledge_type || 'therapist_experience', now, now);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'context_observation', id, 'create', 'clinician', now);

    const created = db.prepare('SELECT * FROM context_observations WHERE id = ?').get(id);
    return NextResponse.json(created, { status: 201 });
  } finally {
    db.close();
  }
}
