import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';

function getDb() {
  const db = new Database(path.join(process.cwd(), 'data', 'dpop.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export async function GET(req: NextRequest) {
  const db = getDb();
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    if (sessionId) {
      const interventions = db.prepare('SELECT * FROM interventions WHERE session_id = ? ORDER BY created_at ASC').all(sessionId);
      return NextResponse.json(interventions);
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
      `INSERT INTO interventions (id, session_id, goal_id, name, description, rationale, resource_ids, knowledge_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, body.session_id, body.goal_id, body.name, body.description, body.rationale || null, JSON.stringify(body.resource_ids || []), body.knowledge_type || 'therapist_experience', now, now);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'intervention', id, 'create', 'clinician', now);

    const created = db.prepare('SELECT * FROM interventions WHERE id = ?').get(id);
    return NextResponse.json(created, { status: 201 });
  } finally {
    db.close();
  }
}
