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
      `INSERT INTO goals (id, case_id, description, target_value, target_unit, baseline_value, baseline_unit, status, domain, knowledge_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, body.case_id, body.description,
      body.target_value || null, body.target_unit || null,
      body.baseline_value || null, body.baseline_unit || null,
      body.status || 'active', body.domain,
      body.knowledge_type || 'therapist_experience',
      now, now
    );

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'goal', id, 'create', 'clinician', now);

    const created = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    return NextResponse.json(created, { status: 201 });
  } finally {
    db.close();
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  try {
    const now = new Date().toISOString();

    db.prepare(
      `UPDATE goals SET description = ?, target_value = ?, target_unit = ?, baseline_value = ?, baseline_unit = ?, status = ?, domain = ?, knowledge_type = ?, updated_at = ? WHERE id = ?`
    ).run(
      body.description, body.target_value, body.target_unit,
      body.baseline_value, body.baseline_unit,
      body.status, body.domain, body.knowledge_type, now, body.id
    );

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'goal', body.id, 'update', 'clinician', JSON.stringify(body), now);

    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(body.id);
    return NextResponse.json(updated);
  } finally {
    db.close();
  }
}
