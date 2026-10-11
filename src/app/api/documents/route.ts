import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';


export async function GET(req: NextRequest) {
  const db = getDb();
  try {
    const docId = req.nextUrl.searchParams.get('id');
    if (docId) {
      const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId);
      return doc ? NextResponse.json(doc) : NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const caseId = req.nextUrl.searchParams.get('case_id');
    if (caseId) {
      return NextResponse.json(db.prepare('SELECT * FROM documents WHERE case_id = ? ORDER BY created_at DESC').all(caseId));
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
      `INSERT INTO documents (id, case_id, doc_type, title, content, status, version, previous_version_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, body.case_id, body.doc_type, body.title, JSON.stringify(body.content), 'draft', 1, null, now, now);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'document', id, 'create', 'clinician', JSON.stringify({ doc_type: body.doc_type }), now);

    const created = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
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
    const existing = db.prepare('SELECT * FROM documents WHERE id = ?').get(body.id) as Record<string, unknown> | undefined;
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (existing.status === 'locked') {
      return NextResponse.json({ error: 'Document is locked and cannot be edited' }, { status: 400 });
    }

    if (body.action === 'approve') {
      if (existing.status === 'approved') {
        // Create new version from approved doc
        const newId = nanoid();
        const newVersion = (existing.version as number) + 1;
        db.prepare(
          `INSERT INTO documents (id, case_id, doc_type, title, content, status, version, previous_version_id, approved_at, approved_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(newId, existing.case_id, existing.doc_type, body.title || existing.title, JSON.stringify(body.content), 'approved', newVersion, body.id, now, 'clinician', now, now);

        // Lock the previous version
        db.prepare('UPDATE documents SET status = ?, updated_at = ? WHERE id = ?').run('locked', now, body.id);

        db.prepare(
          'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(nanoid(), 'document', newId, 'approve', 'clinician', JSON.stringify({ previous_version: body.id }), now);

        const created = db.prepare('SELECT * FROM documents WHERE id = ?').get(newId);
        return NextResponse.json(created);
      }

      db.prepare('UPDATE documents SET status = ?, approved_at = ?, approved_by = ?, content = ?, title = ?, updated_at = ? WHERE id = ?')
        .run('approved', now, 'clinician', JSON.stringify(body.content), body.title || existing.title, now, body.id);

      db.prepare(
        'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(nanoid(), 'document', body.id, 'approve', 'clinician', now);
    } else {
      db.prepare('UPDATE documents SET content = ?, title = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(body.content), body.title || existing.title, now, body.id);

      db.prepare(
        'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(nanoid(), 'document', body.id, 'update', 'clinician', now);
    }

    const updated = db.prepare('SELECT * FROM documents WHERE id = ?').get(body.id);
    return NextResponse.json(updated);
  } finally {
    db.close();
  }
}
