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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  try {
    const now = new Date().toISOString();
    const id = nanoid();

    db.prepare(
      `INSERT INTO sessions (id, case_id, session_date, duration_minutes, setting, caregiver_present, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, body.case_id, body.session_date, body.duration_minutes, body.setting, body.caregiver_present ? 1 : 0, body.notes || null, now, now);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'session', id, 'create', 'clinician', now);

    const created = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
    return NextResponse.json(created, { status: 201 });
  } finally {
    db.close();
  }
}
