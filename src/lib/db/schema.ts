import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const cases = sqliteTable('cases', {
  id: text('id').primaryKey(),
  displayName: text('display_name'),
  ageBand: text('age_band').notNull(),
  diagnoses: text('diagnoses').notNull().default('[]'),
  setting: text('setting').notNull(),
  sessionLengthMinutes: integer('session_length_minutes').notNull(),
  equipmentAvailable: text('equipment_available').notNull().default('[]'),
  precautions: text('precautions').notNull().default('[]'),
  caregiverParticipation: text('caregiver_participation').notNull().default('{}'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const contextObservations = sqliteTable('context_observations', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id),
  observation: text('observation').notNull(),
  source: text('source').notNull(),
  observedDate: text('observed_date').notNull(),
  knowledgeType: text('knowledge_type').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id),
  description: text('description').notNull(),
  targetValue: text('target_value'),
  targetUnit: text('target_unit'),
  baselineValue: text('baseline_value'),
  baselineUnit: text('baseline_unit'),
  status: text('status').notNull().default('active'),
  domain: text('domain').notNull(),
  version: integer('version').notNull().default(1),
  previousVersionId: text('previous_version_id'),
  knowledgeType: text('knowledge_type').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id),
  sessionDate: text('session_date').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  setting: text('setting').notNull(),
  caregiverPresent: integer('caregiver_present', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const interventions = sqliteTable('interventions', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  goalId: text('goal_id').notNull().references(() => goals.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  rationale: text('rationale'),
  resourceIds: text('resource_ids').notNull().default('[]'),
  knowledgeType: text('knowledge_type').notNull(),
  version: integer('version').notNull().default(1),
  previousVersionId: text('previous_version_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const outcomes = sqliteTable('outcomes', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  goalId: text('goal_id').notNull().references(() => goals.id),
  metric: text('metric').notNull(),
  value: text('value').notNull(),
  unit: text('unit').notNull(),
  assistanceLevel: text('assistance_level'),
  measurementMethod: text('measurement_method'),
  context: text('context'),
  outcomeDate: text('outcome_date').notNull(),
  version: integer('version').notNull().default(1),
  previousVersionId: text('previous_version_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const barriers = sqliteTable('barriers', {
  id: text('id').primaryKey(),
  sessionId: text('session_id'),
  caseId: text('case_id').notNull().references(() => cases.id),
  goalId: text('goal_id'),
  description: text('description').notNull(),
  category: text('category').notNull(),
  impact: text('impact'),
  resolution: text('resolution'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const careCoordinationLog = sqliteTable('care_coordination_log', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id),
  contactRole: text('contact_role').notNull(),
  summary: text('summary').notNull(),
  coordinationDate: text('coordination_date').notNull(),
  createdAt: text('created_at').notNull(),
});

export const resources = sqliteTable('resources', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  authorOrOrg: text('author_or_org').notNull(),
  sourceType: text('source_type').notNull(),
  citationOrUrl: text('citation_or_url'),
  publicationDate: text('publication_date'),
  topicTags: text('topic_tags').notNull().default('[]'),
  evidenceSummary: text('evidence_summary').notNull(),
  limitations: text('limitations'),
  verificationStatus: text('verification_status').notNull().default('unverified'),
  lastChecked: text('last_checked'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const toolkitItems = sqliteTable('toolkit_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  suitableFor: text('suitable_for').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id),
  docType: text('doc_type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: text('status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  previousVersionId: text('previous_version_id'),
  approvedAt: text('approved_at'),
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  actor: text('actor').notNull(),
  details: text('details'),
  createdAt: text('created_at').notNull(),
});

export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  caseId: text('case_id'),
  title: text('title').notNull(),
  inputParams: text('input_params').notNull(),
  createdAt: text('created_at').notNull(),
});

export const activityLogEntries = sqliteTable('activity_log_entries', {
  id: text('id').primaryKey(),
  logId: text('log_id').notNull().references(() => activityLogs.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export const payerWorkflows = sqliteTable('payer_workflows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  config: text('config').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
});

export const healthHistory = sqliteTable('health_history', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id),
  medicalHistory: text('medical_history').notNull().default('[]'),
  surgicalHistory: text('surgical_history').notNull().default('[]'),
  currentMedications: text('current_medications').notNull().default('[]'),
  allergies: text('allergies').notNull().default('[]'),
  immunizations: text('immunizations').notNull().default('[]'),
  functionalStatus: text('functional_status'),
  cognitiveStatus: text('cognitive_status'),
  communicationStatus: text('communication_status'),
  nutritionalStatus: text('nutritional_status'),
  priorTherapyHistory: text('prior_therapy_history').notNull().default('[]'),
  familyHistory: text('family_history'),
  socialHistory: text('social_history'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const episodes = sqliteTable('episodes', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id),
  episodeNumber: integer('episode_number').notNull().default(1),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  certificationPeriod: text('certification_period'),
  status: text('status').notNull().default('active'),
  primaryDiagnosis: text('primary_diagnosis'),
  physicianName: text('physician_name'),
  physicianNpi: text('physician_npi'),
  frequency: text('frequency'),
  duration: text('duration'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  episodeId: text('episode_id').notNull().references(() => episodes.id),
  caseId: text('case_id').notNull().references(() => cases.id),
  orderType: text('order_type').notNull(),
  description: text('description').notNull(),
  physicianName: text('physician_name'),
  signedDate: text('signed_date'),
  expirationDate: text('expiration_date'),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const billingRecords = sqliteTable('billing_records', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id),
  episodeId: text('episode_id').references(() => episodes.id),
  sessionId: text('session_id').references(() => sessions.id),
  serviceDate: text('service_date').notNull(),
  cptCode: text('cpt_code'),
  units: integer('units').notNull().default(1),
  status: text('status').notNull().default('unbilled'),
  payer: text('payer'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
