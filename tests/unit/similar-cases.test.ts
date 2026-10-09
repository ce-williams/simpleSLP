import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import { findSimilarCases, formatSimilarCaseSummary } from '../../src/lib/matching/similar-cases';
import path from 'path';
import fs from 'fs';

describe('Similar Case Matching', () => {
  let db: Database.Database;
  const testDbPath = path.join(process.cwd(), 'data', 'test-similar.db');

  beforeAll(() => {
    const dir = path.dirname(testDbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    db = new Database(testDbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
      CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, age_band TEXT, diagnoses TEXT DEFAULT '[]', setting TEXT, session_length_minutes INTEGER, equipment_available TEXT DEFAULT '[]', precautions TEXT DEFAULT '[]', caregiver_participation TEXT DEFAULT '{}', status TEXT DEFAULT 'active', created_at TEXT, updated_at TEXT, deleted_at TEXT);
      CREATE TABLE IF NOT EXISTS goals (id TEXT PRIMARY KEY, case_id TEXT, description TEXT, target_value TEXT, target_unit TEXT, baseline_value TEXT, baseline_unit TEXT, status TEXT DEFAULT 'active', domain TEXT, version INTEGER DEFAULT 1, previous_version_id TEXT, knowledge_type TEXT, created_at TEXT, updated_at TEXT, deleted_at TEXT);
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, case_id TEXT, session_date TEXT, duration_minutes INTEGER, setting TEXT, caregiver_present INTEGER DEFAULT 0, notes TEXT, created_at TEXT, updated_at TEXT);
      CREATE TABLE IF NOT EXISTS outcomes (id TEXT PRIMARY KEY, session_id TEXT, goal_id TEXT, metric TEXT, value TEXT, unit TEXT, assistance_level TEXT, measurement_method TEXT, context TEXT, outcome_date TEXT, version INTEGER DEFAULT 1, previous_version_id TEXT, created_at TEXT, updated_at TEXT);
    `);

    const now = new Date().toISOString();

    // Target case
    db.prepare('INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'target', '2-3', '["feeding disorder"]', 'outpatient_clinic', 45, '[]', '[]', '{}', 'active', now, now, null
    );
    db.prepare('INSERT INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'g1', 'target', 'Increase food variety', '12', 'foods', '5', 'foods', 'active', 'feeding', 1, null, 'therapist_experience', now, now, null
    );

    // Similar case (shares age_band + domain)
    db.prepare('INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'similar1', '2-3', '["feeding disorder"]', 'home_health', 30, '[]', '["allergy risk"]', '{}', 'active', now, now, null
    );
    db.prepare('INSERT INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'g2', 'similar1', 'Expand food repertoire', '10', 'foods', '3', 'foods', 'active', 'feeding', 1, null, 'therapist_experience', now, now, null
    );
    const s1 = nanoid();
    db.prepare('INSERT INTO sessions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      s1, 'similar1', '2026-09-01', 30, 'home_health', 1, null, now, now
    );
    db.prepare('INSERT INTO outcomes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      nanoid(), s1, 'g2', 'foods accepted', '5', 'count', null, null, null, '2026-09-01', 1, null, now, now
    );

    // Dissimilar case (different age, different domain)
    db.prepare('INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'different', '12-18', '["aphasia"]', 'hospital', 60, '[]', '[]', '{}', 'active', now, now, null
    );
    db.prepare('INSERT INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'g3', 'different', 'Improve word finding', null, null, null, null, 'active', 'communication', 1, null, 'therapist_experience', now, now, null
    );
  });

  afterAll(() => {
    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  it('finds similar cases with overlapping fields', () => {
    const results = findSimilarCases(db, 'target');
    expect(results.length).toBe(1);
    expect(results[0].caseId).toBe('similar1');
  });

  it('reports matched fields', () => {
    const results = findSimilarCases(db, 'target');
    expect(results[0].matchedFields).toContain('age_band');
    expect(results[0].matchedFields).toContain('diagnoses');
    expect(results[0].matchedFields).toContain('goal_domains');
  });

  it('excludes dissimilar cases', () => {
    const results = findSimilarCases(db, 'target');
    const ids = results.map(r => r.caseId);
    expect(ids).not.toContain('different');
  });

  it('includes session and outcome counts', () => {
    const results = findSimilarCases(db, 'target');
    expect(results[0].sessionCount).toBe(1);
    expect(results[0].progressRecordedSessions).toBe(1);
  });

  it('includes caveats for differences', () => {
    const results = findSimilarCases(db, 'target');
    expect(results[0].caveats.length).toBeGreaterThan(0);
  });

  it('formats summary with denominators and no bare percentages', () => {
    const results = findSimilarCases(db, 'target');
    const summary = formatSimilarCaseSummary(results[0]);
    expect(summary).toContain('session');
    expect(summary).toContain('progress recorded');
    expect(summary).toContain('does not show the activity caused progress');
    expect(summary).not.toMatch(/\d+%/);
  });
});
