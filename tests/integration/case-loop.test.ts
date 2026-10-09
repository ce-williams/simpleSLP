import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs';

describe('Case-to-Document Integration Loop', () => {
  let db: Database.Database;
  const testDbPath = path.join(process.cwd(), 'data', 'test-integration.db');

  beforeAll(() => {
    const dir = path.dirname(testDbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(testDbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE cases (id TEXT PRIMARY KEY, age_band TEXT, diagnoses TEXT DEFAULT '[]', setting TEXT, session_length_minutes INTEGER, equipment_available TEXT DEFAULT '[]', precautions TEXT DEFAULT '[]', caregiver_participation TEXT DEFAULT '{}', status TEXT DEFAULT 'active', created_at TEXT, updated_at TEXT, deleted_at TEXT);
      CREATE TABLE goals (id TEXT PRIMARY KEY, case_id TEXT REFERENCES cases(id), description TEXT, target_value TEXT, target_unit TEXT, baseline_value TEXT, baseline_unit TEXT, status TEXT DEFAULT 'active', domain TEXT, version INTEGER DEFAULT 1, previous_version_id TEXT, knowledge_type TEXT, created_at TEXT, updated_at TEXT, deleted_at TEXT);
      CREATE TABLE sessions (id TEXT PRIMARY KEY, case_id TEXT REFERENCES cases(id), session_date TEXT, duration_minutes INTEGER, setting TEXT, caregiver_present INTEGER DEFAULT 0, notes TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE interventions (id TEXT PRIMARY KEY, session_id TEXT REFERENCES sessions(id), goal_id TEXT REFERENCES goals(id), name TEXT, description TEXT, rationale TEXT, resource_ids TEXT DEFAULT '[]', knowledge_type TEXT, version INTEGER DEFAULT 1, previous_version_id TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE outcomes (id TEXT PRIMARY KEY, session_id TEXT REFERENCES sessions(id), goal_id TEXT REFERENCES goals(id), metric TEXT, value TEXT, unit TEXT, assistance_level TEXT, measurement_method TEXT, context TEXT, outcome_date TEXT, version INTEGER DEFAULT 1, previous_version_id TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE barriers (id TEXT PRIMARY KEY, session_id TEXT, case_id TEXT REFERENCES cases(id), goal_id TEXT, description TEXT, category TEXT, impact TEXT, resolution TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE documents (id TEXT PRIMARY KEY, case_id TEXT REFERENCES cases(id), doc_type TEXT, title TEXT, content TEXT, status TEXT DEFAULT 'draft', version INTEGER DEFAULT 1, previous_version_id TEXT, approved_at TEXT, approved_by TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE audit_log (id TEXT PRIMARY KEY, entity_type TEXT, entity_id TEXT, action TEXT, actor TEXT, details TEXT, created_at TEXT);
    `);
  });

  afterAll(() => {
    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  it('completes full case → goal → session → intervention → outcome → barrier → document loop', () => {
    const now = new Date().toISOString();

    // 1. Create case
    const caseId = nanoid();
    db.prepare('INSERT INTO cases (id, age_band, diagnoses, setting, session_length_minutes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      caseId, '2-3', '["feeding disorder"]', 'outpatient_clinic', 45, now, now
    );
    db.prepare('INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(nanoid(), 'case', caseId, 'create', 'clinician', now);

    const caseRow = db.prepare('SELECT * FROM cases WHERE id = ?').get(caseId) as Record<string, unknown>;
    expect(caseRow).toBeTruthy();
    expect(caseRow.age_band).toBe('2-3');

    // 2. Create goal
    const goalId = nanoid();
    db.prepare('INSERT INTO goals (id, case_id, description, target_value, target_unit, baseline_value, baseline_unit, domain, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      goalId, caseId, 'Increase food variety', '12', 'foods', '5', 'foods', 'feeding', 'therapist_experience', now, now
    );
    db.prepare('INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(nanoid(), 'goal', goalId, 'create', 'clinician', now);

    // 3. Create session
    const sessionId = nanoid();
    db.prepare('INSERT INTO sessions (id, case_id, session_date, duration_minutes, setting, caregiver_present, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      sessionId, caseId, '2026-09-15', 45, 'outpatient_clinic', 1, 'Introduced food play with banana', now, now
    );
    db.prepare('INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(nanoid(), 'session', sessionId, 'create', 'clinician', now);

    // 4. Create intervention
    const intId = nanoid();
    db.prepare('INSERT INTO interventions (id, session_id, goal_id, name, description, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      intId, sessionId, goalId, 'Sensory food play', 'Structured food exploration with banana', 'therapist_experience', now, now
    );
    db.prepare('INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(nanoid(), 'intervention', intId, 'create', 'clinician', now);

    // 5. Record outcome
    const outcomeId = nanoid();
    db.prepare('INSERT INTO outcomes (id, session_id, goal_id, metric, value, unit, assistance_level, measurement_method, outcome_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      outcomeId, sessionId, goalId, 'Foods tried', '2', 'new foods', 'moderate', 'direct observation', '2026-09-15', now, now
    );
    db.prepare('INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(nanoid(), 'outcome', outcomeId, 'create', 'clinician', now);

    // 6. Record barrier
    const barrierId = nanoid();
    db.prepare('INSERT INTO barriers (id, session_id, case_id, goal_id, description, category, impact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      barrierId, sessionId, caseId, goalId, 'Child refused banana on plate', 'patient', 'Limits mealtime exposure', now, now
    );
    db.prepare('INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(nanoid(), 'barrier', barrierId, 'create', 'clinician', now);

    // 7. Create document draft
    const docId = nanoid();
    const content = JSON.stringify({
      sections: [
        { heading: 'Session', content: '45-min session on 2026-09-15', source_records: [`session:${sessionId}`] },
        { heading: 'Intervention', content: 'Sensory food play with banana', source_records: [`intervention:${intId}`] },
        { heading: 'Outcome', content: 'Tried 2 new foods with moderate support', source_records: [`outcome:${outcomeId}`] },
      ],
      knowledge_type: 'ai_generated',
    });
    db.prepare('INSERT INTO documents (id, case_id, doc_type, title, content, status, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      docId, caseId, 'progress_note', 'Progress Note 2026-09-15', content, 'draft', 1, now, now
    );
    db.prepare('INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(nanoid(), 'document', docId, 'create', 'clinician', now);

    // 8. Approve document
    db.prepare('UPDATE documents SET status = ?, approved_at = ?, approved_by = ?, updated_at = ? WHERE id = ?').run(
      'approved', now, 'clinician', now, docId
    );
    db.prepare('INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(nanoid(), 'document', docId, 'approve', 'clinician', now);

    // Verify final state
    const finalDoc = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId) as Record<string, unknown>;
    expect(finalDoc.status).toBe('approved');
    expect(finalDoc.approved_by).toBe('clinician');

    const auditEntries = db.prepare('SELECT * FROM audit_log ORDER BY created_at').all();
    expect(auditEntries.length).toBeGreaterThanOrEqual(8);

    const entityTypes = auditEntries.map((e: any) => e.entity_type);
    expect(entityTypes).toContain('case');
    expect(entityTypes).toContain('goal');
    expect(entityTypes).toContain('session');
    expect(entityTypes).toContain('intervention');
    expect(entityTypes).toContain('outcome');
    expect(entityTypes).toContain('barrier');
    expect(entityTypes).toContain('document');
  });
});
