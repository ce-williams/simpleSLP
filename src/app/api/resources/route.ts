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
    const search = req.nextUrl.searchParams.get('search');
    const sourceType = req.nextUrl.searchParams.get('source_type');

    let query = 'SELECT * FROM resources WHERE 1=1';
    const params: string[] = [];

    if (search) {
      query += ' AND (title LIKE ? OR evidence_summary LIKE ? OR topic_tags LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (sourceType) {
      query += ' AND source_type = ?';
      params.push(sourceType);
    }
    query += ' ORDER BY created_at DESC';

    const resources = db.prepare(query).all(...params);
    return NextResponse.json(resources);
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
      `INSERT INTO resources (id, title, author_or_org, source_type, citation_or_url, publication_date, topic_tags, evidence_summary, limitations, verification_status, last_checked, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, body.title, body.author_or_org, body.source_type, body.citation_or_url || null, body.publication_date || null, JSON.stringify(body.topic_tags || []), body.evidence_summary, body.limitations || null, 'unverified', null, now, now);

    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'resource', id, 'create', 'clinician', now);

    const created = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    return NextResponse.json(created, { status: 201 });
  } finally {
    db.close();
  }
}
