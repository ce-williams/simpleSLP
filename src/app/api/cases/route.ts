import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';


export async function GET() {
  const db = getDb();
  try {
    const cases = db.prepare(
      'SELECT * FROM cases WHERE deleted_at IS NULL ORDER BY created_at DESC'
    ).all();
    return NextResponse.json(cases);
  } finally {
    db.close();
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  try {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.display_name !== undefined) { fields.push('display_name = ?'); values.push(body.display_name); }
    if (body.diagnoses !== undefined) { fields.push('diagnoses = ?'); values.push(JSON.stringify(body.diagnoses)); }
    if (body.age_band !== undefined) { fields.push('age_band = ?'); values.push(body.age_band); }
    if (body.setting !== undefined) { fields.push('setting = ?'); values.push(body.setting); }
    if (body.session_length_minutes !== undefined) { fields.push('session_length_minutes = ?'); values.push(body.session_length_minutes); }
    if (body.equipment_available !== undefined) { fields.push('equipment_available = ?'); values.push(JSON.stringify(body.equipment_available)); }
    if (body.precautions !== undefined) { fields.push('precautions = ?'); values.push(JSON.stringify(body.precautions)); }
    if (body.status !== undefined) { fields.push('status = ?'); values.push(body.status); }

    if (fields.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    fields.push('updated_at = ?');
    values.push(now);
    values.push(body.id);

    db.prepare(`UPDATE cases SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'case', body.id, 'update', 'clinician', JSON.stringify({ updated_fields: fields.map(f => f.split(' = ')[0]) }), now);

    const updated = db.prepare('SELECT * FROM cases WHERE id = ?').get(body.id);
    return NextResponse.json(updated);
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
      `INSERT INTO cases (id, display_name, age_band, diagnoses, setting, session_length_minutes, equipment_available, precautions, caregiver_participation, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      body.display_name || null,
      body.age_band,
      JSON.stringify(body.diagnoses || []),
      body.setting,
      body.session_length_minutes,
      JSON.stringify(body.equipment_available || []),
      JSON.stringify(body.precautions || []),
      JSON.stringify(body.caregiver_participation || {}),
      body.status || 'active',
      now,
      now
    );

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'case', id, 'create', 'clinician', now);

    const created = db.prepare('SELECT * FROM cases WHERE id = ?').get(id);
    return NextResponse.json(created, { status: 201 });
  } finally {
    db.close();
  }
}
