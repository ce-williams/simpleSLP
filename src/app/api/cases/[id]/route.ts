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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  try {
    const caseRow = db.prepare('SELECT * FROM cases WHERE id = ? AND deleted_at IS NULL').get(id);
    if (!caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const goals = db.prepare('SELECT * FROM goals WHERE case_id = ? AND deleted_at IS NULL ORDER BY created_at DESC').all(id);
    const sessions = db.prepare('SELECT * FROM sessions WHERE case_id = ? ORDER BY session_date DESC').all(id);
    const observations = db.prepare('SELECT * FROM context_observations WHERE case_id = ? ORDER BY observed_date DESC').all(id);
    const barriersList = db.prepare('SELECT * FROM barriers WHERE case_id = ? ORDER BY created_at DESC').all(id);
    const coordination = db.prepare('SELECT * FROM care_coordination_log WHERE case_id = ? ORDER BY coordination_date DESC').all(id);
    const documents = db.prepare('SELECT * FROM documents WHERE case_id = ? ORDER BY created_at DESC').all(id);
    const healthHistory = db.prepare('SELECT * FROM health_history WHERE case_id = ?').get(id) || null;
    const episodes = db.prepare('SELECT * FROM episodes WHERE case_id = ? ORDER BY episode_number ASC').all(id);
    const activities = db.prepare('SELECT id, title, created_at FROM activity_logs WHERE case_id = ? ORDER BY created_at DESC').all(id);

    return NextResponse.json({
      ...caseRow,
      goals,
      sessions,
      observations,
      barriers: barriersList,
      coordination,
      documents,
      health_history: healthHistory,
      episodes,
      activities,
    });
  } finally {
    db.close();
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  try {
    const now = new Date().toISOString();
    db.prepare(
      `UPDATE cases SET age_band = ?, diagnoses = ?, setting = ?, session_length_minutes = ?, equipment_available = ?, precautions = ?, caregiver_participation = ?, status = ?, updated_at = ? WHERE id = ?`
    ).run(
      body.age_band, JSON.stringify(body.diagnoses || []), body.setting, body.session_length_minutes,
      JSON.stringify(body.equipment_available || []), JSON.stringify(body.precautions || []),
      JSON.stringify(body.caregiver_participation || {}), body.status, now, id
    );

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'case', id, 'update', 'clinician', JSON.stringify(body), now);

    const updated = db.prepare('SELECT * FROM cases WHERE id = ?').get(id);
    return NextResponse.json(updated);
  } finally {
    db.close();
  }
}
