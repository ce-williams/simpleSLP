import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { findSimilarCases, formatSimilarCaseSummary } from '@/lib/matching/similar-cases';

function getDb() {
  const db = new Database(path.join(process.cwd(), 'data', 'dpop.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get('case_id');
  if (!caseId) {
    return NextResponse.json({ error: 'case_id required' }, { status: 400 });
  }

  const db = getDb();
  try {
    const matches = findSimilarCases(db, caseId);
    const results = matches.map(m => ({
      ...m,
      summary: formatSimilarCaseSummary(m),
    }));
    return NextResponse.json(results);
  } finally {
    db.close();
  }
}
