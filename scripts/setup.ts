import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';

const DB_PATH = path.join(process.cwd(), 'data', 'dpop.db');

function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      age_band TEXT NOT NULL,
      diagnoses TEXT NOT NULL DEFAULT '[]',
      setting TEXT NOT NULL,
      session_length_minutes INTEGER NOT NULL,
      equipment_available TEXT NOT NULL DEFAULT '[]',
      precautions TEXT NOT NULL DEFAULT '[]',
      caregiver_participation TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS context_observations (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      observation TEXT NOT NULL,
      source TEXT NOT NULL,
      observed_date TEXT NOT NULL,
      knowledge_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      description TEXT NOT NULL,
      target_value TEXT,
      target_unit TEXT,
      baseline_value TEXT,
      baseline_unit TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      domain TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      previous_version_id TEXT,
      knowledge_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      session_date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      setting TEXT NOT NULL,
      caregiver_present INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS interventions (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      goal_id TEXT NOT NULL REFERENCES goals(id),
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      rationale TEXT,
      resource_ids TEXT NOT NULL DEFAULT '[]',
      knowledge_type TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      previous_version_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outcomes (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      goal_id TEXT NOT NULL REFERENCES goals(id),
      metric TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT NOT NULL,
      assistance_level TEXT,
      measurement_method TEXT,
      context TEXT,
      outcome_date TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      previous_version_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS barriers (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      case_id TEXT NOT NULL REFERENCES cases(id),
      goal_id TEXT,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      impact TEXT,
      resolution TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS care_coordination_log (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      contact_role TEXT NOT NULL,
      summary TEXT NOT NULL,
      coordination_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author_or_org TEXT NOT NULL,
      source_type TEXT NOT NULL,
      citation_or_url TEXT,
      publication_date TEXT,
      topic_tags TEXT NOT NULL DEFAULT '[]',
      evidence_summary TEXT NOT NULL,
      limitations TEXT,
      verification_status TEXT NOT NULL DEFAULT 'unverified',
      last_checked TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS toolkit_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      suitable_for TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      doc_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      version INTEGER NOT NULL DEFAULT 1,
      previous_version_id TEXT,
      approved_at TEXT,
      approved_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      case_id TEXT,
      title TEXT NOT NULL,
      input_params TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_log_entries (
      id TEXT PRIMARY KEY,
      log_id TEXT NOT NULL REFERENCES activity_logs(id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payer_workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      config TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS health_history (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      medical_history TEXT NOT NULL DEFAULT '[]',
      surgical_history TEXT NOT NULL DEFAULT '[]',
      current_medications TEXT NOT NULL DEFAULT '[]',
      allergies TEXT NOT NULL DEFAULT '[]',
      immunizations TEXT NOT NULL DEFAULT '[]',
      functional_status TEXT,
      cognitive_status TEXT,
      communication_status TEXT,
      nutritional_status TEXT,
      prior_therapy_history TEXT NOT NULL DEFAULT '[]',
      family_history TEXT,
      social_history TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS episodes (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      episode_number INTEGER NOT NULL DEFAULT 1,
      start_date TEXT NOT NULL,
      end_date TEXT,
      certification_period TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      primary_diagnosis TEXT,
      physician_name TEXT,
      physician_npi TEXT,
      frequency TEXT,
      duration TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      episode_id TEXT NOT NULL REFERENCES episodes(id),
      case_id TEXT NOT NULL REFERENCES cases(id),
      order_type TEXT NOT NULL,
      description TEXT NOT NULL,
      physician_name TEXT,
      signed_date TEXT,
      expiration_date TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS billing_records (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      episode_id TEXT REFERENCES episodes(id),
      session_id TEXT REFERENCES sessions(id),
      service_date TEXT NOT NULL,
      cpt_code TEXT,
      units INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'unbilled',
      payer TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function logAudit(db: Database.Database, entityType: string, entityId: string, action: string, actor: string = 'system') {
  db.prepare(
    'INSERT INTO audit_log (id, entity_type, entity_id, action, actor, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(nanoid(), entityType, entityId, action, actor, new Date().toISOString());
}

function seedData(db: Database.Database) {
  const now = new Date().toISOString();

  // Seed resources
  const resourceIds = {
    feedingApproaches: nanoid(),
    oralMotor: nanoid(),
    sensoryFeeding: nanoid(),
    behavioralFeeding: nanoid(),
    parentCoaching: nanoid(),
  };

  const resources = [
    {
      id: resourceIds.feedingApproaches,
      title: 'Responsive Feeding Approaches in Pediatric Practice',
      author_or_org: 'Pediatric Feeding Association',
      source_type: 'published_evidence',
      citation_or_url: null,
      publication_date: '2023',
      topic_tags: JSON.stringify(['feeding', 'pediatric', 'responsive feeding']),
      evidence_summary: 'Overview of responsive feeding approaches emphasizing child-led pacing and caregiver-child interaction during mealtimes.',
      limitations: 'Seed resource — citation is a placeholder. Verify against actual publication before clinical use.',
      verification_status: 'unverified',
      last_checked: null,
    },
    {
      id: resourceIds.oralMotor,
      title: 'Oral Motor Intervention Strategies for Pediatric Feeding Disorders',
      author_or_org: 'Journal of Pediatric Rehabilitation',
      source_type: 'published_evidence',
      citation_or_url: null,
      publication_date: '2022',
      topic_tags: JSON.stringify(['oral motor', 'feeding disorders', 'pediatric']),
      evidence_summary: 'Review of oral motor exercises and their application in pediatric feeding therapy, including jaw stability and tongue lateralization techniques.',
      limitations: 'Seed resource — citation is a placeholder. Verify against actual publication before clinical use.',
      verification_status: 'unverified',
      last_checked: null,
    },
    {
      id: resourceIds.sensoryFeeding,
      title: 'Sensory-Based Feeding Interventions: A Clinical Guide',
      author_or_org: 'Clinical Sensory Processing Institute',
      source_type: 'published_evidence',
      citation_or_url: null,
      publication_date: '2021',
      topic_tags: JSON.stringify(['sensory processing', 'feeding', 'food selectivity']),
      evidence_summary: 'Describes sensory desensitization hierarchies for children with food aversions and limited food repertoires.',
      limitations: 'Seed resource — citation is a placeholder. Individual responses to sensory interventions vary widely.',
      verification_status: 'unverified',
      last_checked: null,
    },
    {
      id: resourceIds.behavioralFeeding,
      title: 'Behavioral Strategies for Mealtime Management',
      author_or_org: 'Behavioral Pediatrics Review',
      source_type: 'published_evidence',
      citation_or_url: null,
      publication_date: '2023',
      topic_tags: JSON.stringify(['behavioral', 'mealtime', 'pediatric', 'food refusal']),
      evidence_summary: 'Approaches to managing food refusal including structured mealtime routines, positive reinforcement, and escape extinction considerations.',
      limitations: 'Seed resource — citation is a placeholder. Behavioral approaches must be individualized and monitored.',
      verification_status: 'unverified',
      last_checked: null,
    },
    {
      id: resourceIds.parentCoaching,
      title: 'Caregiver Coaching in Pediatric Feeding Therapy',
      author_or_org: 'Family-Centered Practice Network',
      source_type: 'published_evidence',
      citation_or_url: null,
      publication_date: '2022',
      topic_tags: JSON.stringify(['caregiver coaching', 'parent training', 'feeding', 'home program']),
      evidence_summary: 'Strategies for coaching caregivers to implement feeding techniques at home, including modeling, guided practice, and reflection.',
      limitations: 'Seed resource — citation is a placeholder. Effectiveness depends on caregiver readiness and session frequency.',
      verification_status: 'unverified',
      last_checked: null,
    },
  ];

  const insertResource = db.prepare(
    'INSERT INTO resources (id, title, author_or_org, source_type, citation_or_url, publication_date, topic_tags, evidence_summary, limitations, verification_status, last_checked, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  for (const r of resources) {
    insertResource.run(r.id, r.title, r.author_or_org, r.source_type, r.citation_or_url, r.publication_date, r.topic_tags, r.evidence_summary, r.limitations, r.verification_status, r.last_checked, now, now);
    logAudit(db, 'resource', r.id, 'create');
  }

  // Seed toolkit items
  const toolkitData = [
    { id: nanoid(), name: 'Textured spoons (maroon)', category: 'utensils', description: 'Spoons with textured surfaces for oral sensory input during feeding trials.', suitable_for: JSON.stringify({ age_bands: ['1-2', '2-3', '3-4'], settings: ['outpatient_clinic', 'home_health'], domains: ['feeding'] }) },
    { id: nanoid(), name: 'Chewy tubes (various sizes)', category: 'oral motor', description: 'Hollow tubes for jaw strengthening exercises and safe chewing practice.', suitable_for: JSON.stringify({ age_bands: ['2-3', '3-4', '4-5', '5-7'], settings: ['outpatient_clinic', 'school', 'home_health'], domains: ['feeding', 'oral motor'] }) },
    { id: nanoid(), name: 'Food play kit', category: 'sensory', description: 'Non-toxic food-safe items for sensory exploration including rollers, cutters, and molds.', suitable_for: JSON.stringify({ age_bands: ['1-2', '2-3', '3-4', '4-5'], settings: ['outpatient_clinic', 'home_health', 'aba_center'], domains: ['feeding', 'sensory'] }) },
    { id: nanoid(), name: 'Visual mealtime schedule cards', category: 'visual supports', description: 'Picture cards showing mealtime steps for children who benefit from visual structure.', suitable_for: JSON.stringify({ age_bands: ['2-3', '3-4', '4-5', '5-7'], settings: ['outpatient_clinic', 'home_health', 'school', 'aba_center'], domains: ['feeding', 'communication'] }) },
    { id: nanoid(), name: 'Weighted lap pad', category: 'sensory', description: 'Provides proprioceptive input to support seated posture and calm during mealtimes.', suitable_for: JSON.stringify({ age_bands: ['2-3', '3-4', '4-5', '5-7'], settings: ['outpatient_clinic', 'school'], domains: ['feeding', 'sensory'] }) },
    { id: nanoid(), name: 'Mirror (table-top)', category: 'visual feedback', description: 'For modeling and self-monitoring of oral movements during feeding exercises.', suitable_for: JSON.stringify({ age_bands: ['2-3', '3-4', '4-5', '5-7', '7-12'], settings: ['outpatient_clinic', 'home_health'], domains: ['feeding', 'oral motor', 'articulation'] }) },
  ];

  const insertToolkit = db.prepare(
    'INSERT INTO toolkit_items (id, name, category, description, suitable_for, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const t of toolkitData) {
    insertToolkit.run(t.id, t.name, t.category, t.description, t.suitable_for, now);
    logAudit(db, 'toolkit_item', t.id, 'create');
  }

  // Seed Case 1: Toddler with food selectivity
  const case1Id = nanoid();
  db.prepare(
    'INSERT INTO cases (id, display_name, age_band, diagnoses, setting, session_length_minutes, equipment_available, precautions, caregiver_participation, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    case1Id, 'Patient A', '2-3',
    JSON.stringify(['pediatric feeding disorder', 'food selectivity']),
    'outpatient_clinic', 45,
    JSON.stringify(['textured spoons', 'chewy tubes', 'food play kit', 'visual schedule cards']),
    JSON.stringify(['no known allergies documented', 'no history of aspiration — verify with medical team']),
    JSON.stringify({ present_mode: 'in-person', stated_priorities: ['increase food variety', 'reduce mealtime stress'], session_attendance_rate: '3 of last 4 sessions' }),
    'active', now, now
  );
  logAudit(db, 'case', case1Id, 'create');

  // Case 1 context observations
  const obs1Id = nanoid();
  db.prepare(
    'INSERT INTO context_observations (id, case_id, observation, source, observed_date, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(obs1Id, case1Id, 'Accepts 5 foods consistently: crackers, plain pasta, applesauce, yogurt, milk. Gags on new textures.', 'caregiver report', '2026-09-15', 'therapist_experience', now, now);
  logAudit(db, 'context_observation', obs1Id, 'create');

  const obs2Id = nanoid();
  db.prepare(
    'INSERT INTO context_observations (id, case_id, observation, source, observed_date, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(obs2Id, case1Id, 'Attended 3 of last 4 sessions. Caregiver reports following home program for sensory play 2-3 times per week.', 'session observation', '2026-09-22', 'therapist_experience', now, now);
  logAudit(db, 'context_observation', obs2Id, 'create');

  // Case 1 goals
  const goal1Id = nanoid();
  db.prepare(
    'INSERT INTO goals (id, case_id, description, target_value, target_unit, baseline_value, baseline_unit, status, domain, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(goal1Id, case1Id, 'Increase accepted food variety across texture categories', '12', 'foods accepted', '5', 'foods accepted', 'active', 'feeding', 'therapist_experience', now, now);
  logAudit(db, 'goal', goal1Id, 'create');

  const goal2Id = nanoid();
  db.prepare(
    'INSERT INTO goals (id, case_id, description, target_value, target_unit, baseline_value, baseline_unit, status, domain, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(goal2Id, case1Id, 'Tolerate new food on plate without distress for 3 consecutive meals', '3', 'consecutive meals', '0', 'consecutive meals', 'active', 'feeding', 'therapist_experience', now, now);
  logAudit(db, 'goal', goal2Id, 'create');

  // Case 1 sessions
  const session1Id = nanoid();
  db.prepare(
    'INSERT INTO sessions (id, case_id, session_date, duration_minutes, setting, caregiver_present, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(session1Id, case1Id, '2026-09-15', 45, 'outpatient_clinic', 1, 'Introduced food play with banana slices. Child touched and smelled banana but did not taste. No distress observed.', now, now);
  logAudit(db, 'session', session1Id, 'create');

  const session2Id = nanoid();
  db.prepare(
    'INSERT INTO sessions (id, case_id, session_date, duration_minutes, setting, caregiver_present, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(session2Id, case1Id, '2026-09-22', 45, 'outpatient_clinic', 1, 'Continued sensory hierarchy with banana. Child licked banana and accepted small piece on tongue briefly. Caregiver practiced modeling.', now, now);
  logAudit(db, 'session', session2Id, 'create');

  // Case 1 interventions
  const int1Id = nanoid();
  db.prepare(
    'INSERT INTO interventions (id, session_id, goal_id, name, description, rationale, resource_ids, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(int1Id, session1Id, goal1Id, 'Sensory food exploration', 'Structured food play with banana slices: touch, smell, kiss, lick, taste hierarchy.', 'Graded exposure reduces aversion by building positive associations with new foods at the child\'s pace.', JSON.stringify([resourceIds.sensoryFeeding]), 'therapist_experience', now, now);
  logAudit(db, 'intervention', int1Id, 'create');

  const int2Id = nanoid();
  db.prepare(
    'INSERT INTO interventions (id, session_id, goal_id, name, description, rationale, resource_ids, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(int2Id, session2Id, goal1Id, 'Caregiver-modeled tasting', 'Caregiver demonstrated eating banana while describing taste and texture. Child given opportunity to imitate.', 'Modeling by a trusted caregiver normalizes the food experience and leverages social learning.', JSON.stringify([resourceIds.parentCoaching]), 'therapist_experience', now, now);
  logAudit(db, 'intervention', int2Id, 'create');

  // Case 1 outcomes
  const out1Id = nanoid();
  db.prepare(
    'INSERT INTO outcomes (id, session_id, goal_id, metric, value, unit, assistance_level, measurement_method, context, outcome_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(out1Id, session1Id, goal1Id, 'Steps completed in sensory hierarchy', '3', 'steps (touch, smell, kiss)', 'moderate verbal encouragement', 'direct observation', 'First exposure to banana in clinic setting', '2026-09-15', now, now);
  logAudit(db, 'outcome', out1Id, 'create');

  const out2Id = nanoid();
  db.prepare(
    'INSERT INTO outcomes (id, session_id, goal_id, metric, value, unit, assistance_level, measurement_method, context, outcome_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(out2Id, session2Id, goal1Id, 'Steps completed in sensory hierarchy', '5', 'steps (touch, smell, kiss, lick, brief taste)', 'minimal verbal encouragement', 'direct observation', 'Second exposure to banana; caregiver modeling present', '2026-09-22', now, now);
  logAudit(db, 'outcome', out2Id, 'create');

  // Case 1 barriers
  const bar1Id = nanoid();
  db.prepare(
    'INSERT INTO barriers (id, session_id, case_id, goal_id, description, category, impact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(bar1Id, session1Id, case1Id, goal2Id, 'Child became upset when banana was placed on plate at mealtime (not during play)', 'patient', 'Distress response limits ability to practice tolerance during structured meals vs. play context', now, now);
  logAudit(db, 'barrier', bar1Id, 'create');

  // Case 2: Preschooler with oral motor difficulties
  const case2Id = nanoid();
  db.prepare(
    'INSERT INTO cases (id, display_name, age_band, diagnoses, setting, session_length_minutes, equipment_available, precautions, caregiver_participation, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    case2Id, 'Patient B', '4-5',
    JSON.stringify(['oral motor dysfunction', 'pediatric feeding disorder']),
    'home_health', 30,
    JSON.stringify(['chewy tubes', 'mirror', 'textured spoons']),
    JSON.stringify(['history of gagging on mixed textures — proceed with caution', 'no aspiration risk documented — verify with medical team']),
    JSON.stringify({ present_mode: 'in-person', stated_priorities: ['improve chewing safety', 'transition from pureed to soft solids'], session_attendance_rate: '4 of last 4 sessions' }),
    'active', now, now
  );
  logAudit(db, 'case', case2Id, 'create');

  const goal3Id = nanoid();
  db.prepare(
    'INSERT INTO goals (id, case_id, description, target_value, target_unit, baseline_value, baseline_unit, status, domain, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(goal3Id, case2Id, 'Demonstrate rotary chew pattern with soft solids', '80', 'percent of trials', '20', 'percent of trials', 'active', 'feeding', 'therapist_experience', now, now);
  logAudit(db, 'goal', goal3Id, 'create');

  const session3Id = nanoid();
  db.prepare(
    'INSERT INTO sessions (id, case_id, session_date, duration_minutes, setting, caregiver_present, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(session3Id, case2Id, '2026-09-20', 30, 'home_health', 1, 'Practiced jaw stability exercises with chewy tube. Trialed soft banana pieces with verbal cues for lateral tongue movement.', now, now);
  logAudit(db, 'session', session3Id, 'create');

  const int3Id = nanoid();
  db.prepare(
    'INSERT INTO interventions (id, session_id, goal_id, name, description, rationale, resource_ids, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(int3Id, session3Id, goal3Id, 'Jaw stability exercises', 'Sustained bite on chewy tube for 5-second holds, 10 repetitions. Followed by soft food trials.', 'Jaw stability is prerequisite for safe rotary chew; chewy tube provides graded resistance.', JSON.stringify([resourceIds.oralMotor]), 'therapist_experience', now, now);
  logAudit(db, 'intervention', int3Id, 'create');

  const out3Id = nanoid();
  db.prepare(
    'INSERT INTO outcomes (id, session_id, goal_id, metric, value, unit, assistance_level, measurement_method, context, outcome_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(out3Id, session3Id, goal3Id, 'Rotary chew trials successful', '35', 'percent of trials', 'hand-over-hand jaw support on 4 of 10 trials', 'direct observation with trial count', 'Home setting, familiar foods, caregiver present', '2026-09-20', now, now);
  logAudit(db, 'outcome', out3Id, 'create');

  // Case 3: School-age child with food refusal
  const case3Id = nanoid();
  db.prepare(
    'INSERT INTO cases (id, display_name, age_band, diagnoses, setting, session_length_minutes, equipment_available, precautions, caregiver_participation, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    case3Id, 'Patient C', '5-7',
    JSON.stringify(['food refusal', 'anxiety-related feeding avoidance']),
    'school', 30,
    JSON.stringify(['visual schedule cards', 'food play kit']),
    JSON.stringify(['anxiety triggers around new foods', 'no medical feeding restrictions documented']),
    JSON.stringify({ present_mode: 'phone', stated_priorities: ['eat school lunch with peers', 'try one new food per week'], session_attendance_rate: '2 of last 4 sessions' }),
    'active', now, now
  );
  logAudit(db, 'case', case3Id, 'create');

  const goal4Id = nanoid();
  db.prepare(
    'INSERT INTO goals (id, case_id, description, target_value, target_unit, baseline_value, baseline_unit, status, domain, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(goal4Id, case3Id, 'Sit at lunch table and eat from packed lunch for duration of lunch period', '5', 'days per week', '1', 'days per week', 'active', 'feeding', 'therapist_experience', now, now);
  logAudit(db, 'goal', goal4Id, 'create');

  const session4Id = nanoid();
  db.prepare(
    'INSERT INTO sessions (id, case_id, session_date, duration_minutes, setting, caregiver_present, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(session4Id, case3Id, '2026-09-18', 30, 'school', 0, 'Worked on mealtime routine using visual schedule. Child sat for 12 minutes before requesting to leave. Ate crackers and yogurt from lunch.', now, now);
  logAudit(db, 'session', session4Id, 'create');

  const int4Id = nanoid();
  db.prepare(
    'INSERT INTO interventions (id, session_id, goal_id, name, description, rationale, resource_ids, knowledge_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(int4Id, session4Id, goal4Id, 'Visual mealtime routine', 'Used visual schedule cards to outline mealtime steps: sit, open lunch, choose food, eat, clean up. Reinforced with verbal praise for each completed step.', 'Visual supports provide predictability, which reduces anxiety-related avoidance.', JSON.stringify([resourceIds.behavioralFeeding]), 'therapist_experience', now, now);
  logAudit(db, 'intervention', int4Id, 'create');

  const out4Id = nanoid();
  db.prepare(
    'INSERT INTO outcomes (id, session_id, goal_id, metric, value, unit, assistance_level, measurement_method, context, outcome_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(out4Id, session4Id, goal4Id, 'Minutes seated at lunch table', '12', 'minutes', 'visual schedule plus verbal prompts', 'direct observation with timer', 'School cafeteria, peers present, no caregiver', '2026-09-18', now, now);
  logAudit(db, 'outcome', out4Id, 'create');

  const bar2Id = nanoid();
  db.prepare(
    'INSERT INTO barriers (id, session_id, case_id, goal_id, description, category, impact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(bar2Id, session4Id, case3Id, goal4Id, 'Noisy cafeteria environment increases anxiety; child covers ears during peak times', 'environmental', 'Sensory overload limits duration of mealtime participation in school setting', now, now);
  logAudit(db, 'barrier', bar2Id, 'create');

  // Care coordination entry
  const ccId = nanoid();
  db.prepare(
    'INSERT INTO care_coordination_log (id, case_id, contact_role, summary, coordination_date, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(ccId, case3Id, 'classroom teacher', 'Discussed seating arrangement at lunch. Teacher will place child at end of table near quieter area. Will report on lunch participation 2x/week.', '2026-09-19', now);
  logAudit(db, 'care_coordination', ccId, 'create');

  // Health history records
  const hh1Id = nanoid();
  db.prepare(
    'INSERT INTO health_history (id, case_id, medical_history, surgical_history, current_medications, allergies, immunizations, functional_status, cognitive_status, communication_status, nutritional_status, prior_therapy_history, family_history, social_history, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    hh1Id, case1Id,
    JSON.stringify(['premature birth (34 weeks)', 'recurrent ear infections']),
    JSON.stringify([]),
    JSON.stringify([]),
    JSON.stringify(['no known allergies']),
    JSON.stringify(['up to date']),
    'Age-appropriate gross and fine motor skills',
    'Age-appropriate cognitive development',
    'Expressive language within normal limits; receptive language within normal limits',
    'Limited diet of 5 accepted foods; weight tracking within normal range',
    JSON.stringify(['OT since 18 months for sensory processing']),
    'No significant family history of feeding disorders',
    'Lives with both parents; attends daycare 3 days/week',
    now, now
  );
  logAudit(db, 'health_history', hh1Id, 'create');

  const hh2Id = nanoid();
  db.prepare(
    'INSERT INTO health_history (id, case_id, medical_history, surgical_history, current_medications, allergies, immunizations, functional_status, cognitive_status, communication_status, nutritional_status, prior_therapy_history, family_history, social_history, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    hh2Id, case2Id,
    JSON.stringify(['tonsillectomy age 3', 'gastroesophageal reflux']),
    JSON.stringify(['tonsillectomy (2024)']),
    JSON.stringify(['reflux medication (omeprazole)']),
    JSON.stringify(['no known allergies']),
    JSON.stringify(['up to date']),
    'Mild delays in fine motor coordination',
    'Age-appropriate cognitive development',
    'Mild speech sound errors; language within normal limits',
    'Primarily pureed diet; transitioning to soft solids',
    JSON.stringify(['feeding therapy since age 2', 'OT for fine motor since age 3']),
    'Older sibling had speech delay',
    'Lives with mother and older sibling; attends pre-K full time',
    now, now
  );
  logAudit(db, 'health_history', hh2Id, 'create');

  const hh3Id = nanoid();
  db.prepare(
    'INSERT INTO health_history (id, case_id, medical_history, surgical_history, current_medications, allergies, immunizations, functional_status, cognitive_status, communication_status, nutritional_status, prior_therapy_history, family_history, social_history, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    hh3Id, case3Id,
    JSON.stringify(['generalized anxiety disorder', 'sensory processing differences']),
    JSON.stringify([]),
    JSON.stringify(['none currently']),
    JSON.stringify(['tree nuts']),
    JSON.stringify(['up to date']),
    'Age-appropriate motor skills',
    'Above average cognitive abilities; high anxiety impacts performance',
    'Age-appropriate receptive and expressive language',
    'Severely restricted food repertoire (fewer than 10 foods); adequate caloric intake through accepted foods',
    JSON.stringify(['CBT for anxiety (ongoing)', 'OT for sensory processing (discharged)']),
    'Mother has history of anxiety',
    'Lives with both parents; attends first grade; no siblings',
    now, now
  );
  logAudit(db, 'health_history', hh3Id, 'create');

  // Episodes (Plan of Care)
  const ep1Id = nanoid();
  db.prepare(
    'INSERT INTO episodes (id, case_id, episode_number, start_date, end_date, status, primary_diagnosis, physician_name, frequency, duration, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    ep1Id, case1Id, 1, '2026-09-01', null, 'active',
    'Pediatric feeding disorder with food selectivity',
    'Dr. Sarah Chen', '2x/week', '12 weeks',
    'Initial episode focused on expanding food repertoire through sensory-based approach.',
    now, now
  );
  logAudit(db, 'episode', ep1Id, 'create');

  const ep2Id = nanoid();
  db.prepare(
    'INSERT INTO episodes (id, case_id, episode_number, start_date, end_date, status, primary_diagnosis, physician_name, frequency, duration, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    ep2Id, case2Id, 1, '2026-09-15', null, 'active',
    'Oral motor dysfunction with pediatric feeding disorder',
    'Dr. Michael Torres', '2x/week', '8 weeks',
    'Initial episode targeting jaw stability and transition from purees to soft solids.',
    now, now
  );
  logAudit(db, 'episode', ep2Id, 'create');

  const ep3Id = nanoid();
  db.prepare(
    'INSERT INTO episodes (id, case_id, episode_number, start_date, end_date, status, primary_diagnosis, physician_name, frequency, duration, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    ep3Id, case3Id, 1, '2026-09-10', null, 'active',
    'Anxiety-related feeding avoidance with food refusal',
    'Dr. Lisa Park', '1x/week', '16 weeks',
    'Initial episode focused on reducing mealtime anxiety and increasing participation in school lunch.',
    now, now
  );
  logAudit(db, 'episode', ep3Id, 'create');

  console.log('Seed data loaded successfully.');
  console.log(`  - ${resources.length} resources`);
  console.log(`  - ${toolkitData.length} toolkit items`);
  console.log('  - 3 cases with goals, sessions, interventions, outcomes, barriers, health history, and episodes');
}

function main() {
  console.log('Setting up DPOP database...');
  ensureDataDir();

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables(db);
  console.log('Tables created.');

  const rowCount = db.prepare('SELECT COUNT(*) as count FROM cases').get() as { count: number };
  if (rowCount.count === 0) {
    seedData(db);
  } else {
    console.log('Database already contains data. Skipping seed.');
  }

  db.close();
  console.log('Setup complete. Database at:', DB_PATH);
}

main();
