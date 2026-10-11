import { getDb } from '@/lib/db/connection';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getProvider } from '@/lib/ai';
import { ActivityOutputSchema } from '@/lib/ai/schemas';


export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  try {
    const provider = getProvider();
    const activity = await provider.generateActivity({
      targetGoal: body.target_goal,
      patientInterests: body.patient_interests || [],
      developmentalLevel: body.developmental_level || 'early childhood',
      setting: body.setting || 'outpatient_clinic',
      timeAvailable: body.time_available || 30,
      availableTools: body.available_tools || [],
      accessibilityNeeds: body.accessibility_needs || [],
    });

    const validated = ActivityOutputSchema.parse(activity);

    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(nanoid(), 'activity', 'generated', 'ai_generate', provider.name, JSON.stringify({ provider: provider.name, goal: body.target_goal }), now);

    return NextResponse.json(validated);
  } finally {
    db.close();
  }
}
