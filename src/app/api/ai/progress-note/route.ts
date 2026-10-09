import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { getProvider } from '@/lib/ai';
import { ProgressNoteOutputSchema } from '@/lib/ai/schemas';

function getDb() {
  const db = new Database(path.join(process.cwd(), 'data', 'dpop.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export async function POST(req: NextRequest) {
  const { caseId, sessionId } = await req.json();
  const db = getDb();
  try {
    const caseData = db.prepare('SELECT * FROM cases WHERE id = ?').get(caseId) as Record<string, unknown> | undefined;
    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as Record<string, unknown> | undefined;
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const interventions = db.prepare('SELECT * FROM interventions WHERE session_id = ?').all(sessionId);
    const outcomes = db.prepare('SELECT * FROM outcomes WHERE session_id = ?').all(sessionId);
    const barriers = db.prepare('SELECT * FROM barriers WHERE session_id = ?').all(sessionId);
    const goals = db.prepare('SELECT * FROM goals WHERE case_id = ? AND deleted_at IS NULL').all(caseId);

    const provider = getProvider();
    const note = await provider.generateProgressNote({
      caseId,
      caseData: caseData as Record<string, unknown>,
      session: session as Record<string, unknown>,
      interventions: interventions as Record<string, unknown>[],
      outcomes: outcomes as Record<string, unknown>[],
      barriers: barriers as Record<string, unknown>[],
      goals: goals as Record<string, unknown>[],
    });

    const validated = ProgressNoteOutputSchema.parse(note);

    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'progress_note', sessionId, 'ai_generate', provider.name, JSON.stringify({ provider: provider.name }), now);

    return NextResponse.json(validated);
  } finally {
    db.close();
  }
}
