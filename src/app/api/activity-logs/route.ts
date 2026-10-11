import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';


export async function GET() {
  const db = getDb();
  try {
    const logs = db.prepare(
      'SELECT * FROM activity_logs ORDER BY created_at DESC'
    ).all();

    const enriched = logs.map((log: Record<string, unknown>) => {
      const entries = db.prepare(
        'SELECT * FROM activity_log_entries WHERE log_id = ? ORDER BY created_at ASC'
      ).all(log.id as string);
      return { ...log, entries };
    });

    return NextResponse.json(enriched);
  } finally {
    db.close();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  try {
    const now = new Date().toISOString();

    if (body.action === 'add_entry') {
      const entryId = nanoid();
      db.prepare(
        'INSERT INTO activity_log_entries (id, log_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(entryId, body.log_id, body.role, JSON.stringify(body.content), now);

      const entries = db.prepare(
        'SELECT * FROM activity_log_entries WHERE log_id = ? ORDER BY created_at ASC'
      ).all(body.log_id);

      return NextResponse.json({ entries }, { status: 201 });
    }

    const logId = nanoid();
    db.prepare(
      'INSERT INTO activity_logs (id, case_id, title, input_params, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(logId, body.case_id || null, body.title, JSON.stringify(body.input_params), now);

    const entryId = nanoid();
    db.prepare(
      'INSERT INTO activity_log_entries (id, log_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(entryId, logId, 'generated', JSON.stringify(body.activity), now);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'activity_log', logId, 'create', 'clinician', now);

    return NextResponse.json({ id: logId }, { status: 201 });
  } finally {
    db.close();
  }
}
