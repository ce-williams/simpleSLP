import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { findSimilarCases, formatSimilarCaseSummary } from '@/lib/matching/similar-cases';


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
