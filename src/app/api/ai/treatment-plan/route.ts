import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getProvider } from '@/lib/ai';
import { TreatmentPlanOutputSchema } from '@/lib/ai/schemas';
import { findSimilarCases } from '@/lib/matching/similar-cases';
import { guardText } from '@/lib/pii/guard';


export async function POST(req: NextRequest) {
  const { caseId } = await req.json();
  const db = getDb();
  try {
    const caseData = db.prepare('SELECT * FROM cases WHERE id = ? AND deleted_at IS NULL').get(caseId) as Record<string, unknown> | undefined;
    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

    const goals = db.prepare('SELECT * FROM goals WHERE case_id = ? AND deleted_at IS NULL').all(caseId);
    const sessions = db.prepare('SELECT * FROM sessions WHERE case_id = ? ORDER BY session_date DESC').all(caseId);
    const outcomes = db.prepare(
      `SELECT o.* FROM outcomes o JOIN sessions s ON o.session_id = s.id WHERE s.case_id = ? ORDER BY o.outcome_date DESC`
    ).all(caseId);
    const barriers = db.prepare('SELECT * FROM barriers WHERE case_id = ?').all(caseId);
    const resources = db.prepare('SELECT * FROM resources').all();
    const similarCases = findSimilarCases(db, caseId);

    const freeTextFields = [
      ...goals.map((g: any) => g.description),
      ...sessions.map((s: any) => s.notes).filter(Boolean),
    ];
    for (const text of freeTextFields) {
      const result = guardText(text);
      if (!result.safe) {
        return NextResponse.json({
          error: 'PII detected in case data. Please review and clean data before generating plan.',
          findings: result.findings,
        }, { status: 400 });
      }
    }

    const provider = getProvider();
    const plan = await provider.generateTreatmentPlan({
      caseId,
      caseData: caseData as Record<string, unknown>,
      goals: goals as Record<string, unknown>[],
      sessions: sessions as Record<string, unknown>[],
      outcomes: outcomes as Record<string, unknown>[],
      barriers: barriers as Record<string, unknown>[],
      resources: resources as Record<string, unknown>[],
      similarCases: similarCases as unknown as Record<string, unknown>[],
    });

    const validated = TreatmentPlanOutputSchema.parse(plan);

    const existingResourceIds = new Set(resources.map((r: any) => r.id));
    validated.citations = validated.citations.filter(c => existingResourceIds.has(c.resource_id));
    for (const intervention of validated.suggested_interventions) {
      intervention.resource_ids = intervention.resource_ids.filter(id => existingResourceIds.has(id));
    }

    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'treatment_plan', caseId, 'ai_generate', provider.name, JSON.stringify({ provider: provider.name }), now);

    return NextResponse.json(validated);
  } finally {
    db.close();
  }
}
