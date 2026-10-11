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
      `INSERT INTO care_coordination_log (id, case_id, contact_role, summary, coordination_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, body.case_id, body.contact_role, body.summary, body.coordination_date, now);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'care_coordination', id, 'create', 'clinician', now);

    const created = db.prepare('SELECT * FROM care_coordination_log WHERE id = ?').get(id);
    return NextResponse.json(created, { status: 201 });
  } finally {
    db.close();
  }
}
