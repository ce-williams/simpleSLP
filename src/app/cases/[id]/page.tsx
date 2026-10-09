'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SourceBadge } from '@/components/source-badge';
import { PiiWarning, usePiiGuard } from '@/components/pii-warning';

interface CaseData {
  id: string;
  display_name: string | null;
  age_band: string;
  diagnoses: string;
  setting: string;
  status: string;
  session_length_minutes: number;
  equipment_available: string;
  precautions: string;
  caregiver_participation: string;
  goals: GoalRow[];
  sessions: SessionRow[];
  observations: ObservationRow[];
  barriers: BarrierRow[];
  coordination: CoordinationRow[];
  documents: DocumentRow[];
  health_history: HealthHistoryRow | null;
  episodes: EpisodeRow[];
  activities: ActivityRow[];
}

interface GoalRow { id: string; description: string; target_value: string; target_unit: string; baseline_value: string; baseline_unit: string; status: string; domain: string; knowledge_type: string; }
interface SessionRow { id: string; session_date: string; duration_minutes: number; setting: string; caregiver_present: number; notes: string; }
interface ObservationRow { id: string; observation: string; source: string; observed_date: string; knowledge_type: string; }
interface BarrierRow { id: string; description: string; category: string; impact: string; resolution: string; session_id: string; goal_id: string; }
interface CoordinationRow { id: string; contact_role: string; summary: string; coordination_date: string; }
interface DocumentRow { id: string; doc_type: string; title: string; status: string; version: number; created_at: string; }
interface HealthHistoryRow { id: string; medical_history: string; surgical_history: string; current_medications: string; allergies: string; immunizations: string; functional_status: string; cognitive_status: string; communication_status: string; nutritional_status: string; prior_therapy_history: string; family_history: string; social_history: string; }
interface EpisodeRow { id: string; episode_number: number; start_date: string; end_date: string | null; status: string; primary_diagnosis: string; physician_name: string; frequency: string; duration: string; notes: string; }
interface ActivityRow { id: string; title: string; created_at: string; }

type Tab = 'overview' | 'goals' | 'visits' | 'observations' | 'barriers' | 'coordination' | 'documents' | 'health_history' | 'episodes' | 'activities';

const SETTING_LABELS: Record<string, string> = {
  home_health: 'Home Health', aba_center: 'ABA Center', outpatient_clinic: 'Outpatient Clinic',
  school: 'School', nursing_home: 'Nursing Home', hospital: 'Hospital',
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'health_history', label: 'Health History' },
  { key: 'episodes', label: 'Episodes' },
  { key: 'goals', label: 'Goals' },
  { key: 'visits', label: 'Visits' },
  { key: 'activities', label: 'Activities' },
  { key: 'observations', label: 'Context' },
  { key: 'barriers', label: 'Barriers' },
  { key: 'coordination', label: 'Coordination' },
  { key: 'documents', label: 'Documents' },
];

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('overview');

  const loadCase = () => {
    fetch(`/api/cases/${caseId}`)
      .then((r) => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then((data) => { setCaseData(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadCase(); }, [caseId]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-sage-200 border-t-forest-900 rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="card p-6 text-red-600 text-sm">Error: {error}</div>;
  if (!caseData) return <div className="card p-6 text-canopy-subtle text-sm">Case not found.</div>;

  const diagnoses = JSON.parse(caseData.diagnoses || '[]');
  const precautions = JSON.parse(caseData.precautions || '[]');
  const equipment = JSON.parse(caseData.equipment_available || '[]');
  const caregiverInfo = JSON.parse(caseData.caregiver_participation || '{}');

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-1.5 mb-3">
          <a href="/cases" className="text-2xs text-canopy-faint hover:text-forest-900 transition-colors">Patients</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-300"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          <span className="text-2xs text-canopy-subtle">{caseData.display_name || `Patient ${caseData.id.slice(0, 8)}`}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="page-title">{caseData.display_name || 'Patient'} — Age {caseData.age_band}</h1>
          <span className="pill bg-sage-100 text-canopy-subtle">{SETTING_LABELS[caseData.setting] || caseData.setting}</span>
          <span className={`pill ${caseData.status === 'active' ? 'bg-canopy-highlight text-forest-900' : 'bg-sage-100 text-canopy-subtle'}`}>{caseData.status}</span>
        </div>
      </div>

      <div className="border-b border-sage-200 mb-6">
        <nav className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
                tab === t.key
                  ? 'text-forest-950 bg-white border border-sage-200 border-b-white -mb-px'
                  : 'text-canopy-faint hover:text-forest-900 hover:bg-canopy-highlight/50'
              }`}
            >
              {t.label}
              {t.key === 'goals' && caseData.goals.length > 0 && <span className="ml-1.5 text-2xs px-1.5 py-0.5 rounded-full bg-sage-100 text-canopy-subtle">{caseData.goals.length}</span>}
              {t.key === 'visits' && caseData.sessions.length > 0 && <span className="ml-1.5 text-2xs px-1.5 py-0.5 rounded-full bg-sage-100 text-canopy-subtle">{caseData.sessions.length}</span>}
              {t.key === 'episodes' && caseData.episodes?.length > 0 && <span className="ml-1.5 text-2xs px-1.5 py-0.5 rounded-full bg-sage-100 text-canopy-subtle">{caseData.episodes.length}</span>}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <PatientSummaryCard caseId={caseId} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-6">
            <h3 className="section-title mb-3">Diagnoses</h3>
            <div className="flex flex-wrap gap-1.5">{diagnoses.map((d: string, i: number) => (
              <span key={i} className="pill bg-forest-200 text-forest-800">{d}</span>
            ))}</div>
          </div>
          <div className="card p-6">
            <h3 className="section-title mb-3">Session Details</h3>
            <p className="text-sm text-canopy-muted">{caseData.session_length_minutes} minutes &middot; {SETTING_LABELS[caseData.setting]}</p>
          </div>
          <div className="card p-6">
            <h3 className="section-title mb-3">Precautions</h3>
            {precautions.length === 0 ? (
              <p className="text-sm text-canopy-faint">None recorded</p>
            ) : (
              <ul className="space-y-1.5">{precautions.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 px-3.5 py-2.5 rounded-xl">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  {p}
                </li>
              ))}</ul>
            )}
          </div>
          <div className="card p-6">
            <h3 className="section-title mb-3">Caregiver Participation</h3>
            {caregiverInfo.present_mode && <p className="text-sm text-canopy-muted mb-1">Contact mode: {caregiverInfo.present_mode}</p>}
            {caregiverInfo.session_attendance_rate && <p className="text-sm text-canopy-muted mb-1">Attendance: {caregiverInfo.session_attendance_rate}</p>}
            {caregiverInfo.stated_priorities && (
              <div className="mt-2">
                <p className="text-2xs text-canopy-faint mb-1.5">Stated priorities</p>
                <ul className="space-y-1">{caregiverInfo.stated_priorities.map((p: string, i: number) => (
                  <li key={i} className="text-sm text-canopy-muted">{p}</li>
                ))}</ul>
              </div>
            )}
          </div>
          <div className="card p-6">
            <h3 className="section-title mb-3">Equipment Available</h3>
            {equipment.length === 0 ? (
              <p className="text-sm text-canopy-faint">None recorded</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">{equipment.map((e: string, i: number) => (
                <span key={i} className="pill bg-sage-100 text-canopy-muted">{e}</span>
              ))}</div>
            )}
          </div>
          <div className="bg-forest-950 rounded-2xl p-6 text-forest-100">
            <h3 className="font-mono text-xs uppercase tracking-widest text-lime mb-3">Quick Actions</h3>
            <div className="flex flex-col gap-2.5">
              <a href={`/cases/${caseId}/plan`} className="btn-primary text-sm w-fit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                Generate Treatment Plan
              </a>
              <a href={`/activities?case=${caseId}`} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-forest-100 rounded-full border border-forest-800 hover:bg-white/[0.08] transition-colors w-fit">Create Activity</a>
            </div>
          </div>
        </div>
        </div>
      )}

      {tab === 'health_history' && <HealthHistoryTab caseId={caseId} history={caseData.health_history} />}
      {tab === 'episodes' && <EpisodesTab episodes={caseData.episodes || []} />}
      {tab === 'goals' && <GoalsTab caseId={caseId} goals={caseData.goals} onRefresh={loadCase} />}
      {tab === 'visits' && <SessionsTab caseId={caseId} caseData={caseData} onRefresh={loadCase} />}
      {tab === 'activities' && <ActivitiesTab caseId={caseId} activities={caseData.activities || []} patientName={caseData.display_name} />}
      {tab === 'observations' && <ObservationsTab caseId={caseId} observations={caseData.observations} onRefresh={loadCase} />}
      {tab === 'barriers' && <BarriersTab caseId={caseId} barriers={caseData.barriers} goals={caseData.goals} onRefresh={loadCase} />}
      {tab === 'coordination' && <CoordinationTab caseId={caseId} entries={caseData.coordination} onRefresh={loadCase} />}
      {tab === 'documents' && <DocumentsTab caseId={caseId} documents={caseData.documents} />}
    </div>
  );
}

interface PatientSummary {
  patient_snapshot: string;
  treatment_summary: string;
  recent_outcomes: string;
  active_barriers: string;
  next_steps: string;
  limitations: string[];
  knowledge_type: string;
  requires_clinician_review: boolean;
}

function PatientSummaryCard({ caseId }: { caseId: string }) {
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  function loadSummary() {
    setLoading(true);
    setError('');
    fetch(`/api/cases/${caseId}/summary`)
      .then(r => { if (!r.ok) throw new Error('Failed to generate summary'); return r.json(); })
      .then(data => { setSummary(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }

  if (!summary && !loading && !error) {
    return (
      <div className="card p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </span>
        </div>
        <p className="text-sm text-canopy-muted mb-3">Generate an AI summary of this patient&apos;s info, recent treatment, and outcomes.</p>
        <button onClick={loadSummary} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          Generate Summary
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card p-6 flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-sage-200 border-t-forest-900 rounded-full animate-spin" />
        <span className="text-sm text-canopy-muted">Generating patient summary...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button onClick={loadSummary} className="btn-secondary">Retry</button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="card overflow-hidden">
      <div className="bg-lime-50 border-b border-lime-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          <span className="text-sm font-semibold text-canopy-text">Patient Summary</span>
          <SourceBadge type="ai_generated" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadSummary} className="btn-ghost text-2xs" title="Refresh summary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" /></svg>
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="btn-ghost text-2xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${collapsed ? '' : 'rotate-180'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-5 space-y-4">
          <div className="bg-lime-50 border border-lime-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="2" className="shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <p className="text-2xs text-canopy-subtle">Clinician review required. AI-generated draft — verify all content before clinical use.</p>
          </div>

          <div>
            <h4 className="font-mono text-2xs uppercase tracking-widest text-canopy-faint mb-1.5">Patient Snapshot</h4>
            <p className="text-sm text-canopy-muted leading-relaxed">{summary.patient_snapshot}</p>
          </div>

          <div>
            <h4 className="font-mono text-2xs uppercase tracking-widest text-canopy-faint mb-1.5">Treatment Activity</h4>
            <p className="text-sm text-canopy-muted leading-relaxed">{summary.treatment_summary}</p>
          </div>

          <div>
            <h4 className="font-mono text-2xs uppercase tracking-widest text-canopy-faint mb-1.5">Recent Outcomes</h4>
            <p className="text-sm text-canopy-muted leading-relaxed">{summary.recent_outcomes}</p>
          </div>

          {summary.active_barriers && summary.active_barriers !== 'No unresolved barriers documented.' && (
            <div>
              <h4 className="font-mono text-2xs uppercase tracking-widest text-canopy-faint mb-1.5">Active Barriers</h4>
              <p className="text-sm text-canopy-muted leading-relaxed">{summary.active_barriers}</p>
            </div>
          )}

          <div>
            <h4 className="font-mono text-2xs uppercase tracking-widest text-canopy-faint mb-1.5">Next Steps</h4>
            <p className="text-sm text-canopy-muted leading-relaxed">{summary.next_steps}</p>
          </div>

          <div className="border-t border-sage-100 pt-3">
            <p className="text-2xs text-canopy-faint leading-relaxed">{summary.limitations.join(' ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function GoalsTab({ caseId, goals, onRefresh }: { caseId: string; goals: GoalRow[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', target_value: '', target_unit: '', baseline_value: '', baseline_unit: '', domain: 'feeding', knowledge_type: 'therapist_experience' });
  const [outcomes, setOutcomes] = useState<Record<string, { latest_value: string; latest_unit: string; latest_date: string }>>({});

  useEffect(() => {
    for (const g of goals) {
      fetch(`/api/outcomes?goal_id=${g.id}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => {
          if (data.length > 0) {
            const latest = data[0];
            setOutcomes(prev => ({ ...prev, [g.id]: { latest_value: latest.value, latest_unit: latest.unit, latest_date: latest.outcome_date } }));
          }
        })
        .catch(() => {});
    }
  }, [goals]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId, ...form }),
    });
    if (res.ok) { setShowForm(false); onRefresh(); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-canopy-text">Goals</h2>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? 'Cancel' : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Goal
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-5 space-y-4">
          <div><label className="label">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className="input-field" rows={2} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Baseline Value</label><input value={form.baseline_value} onChange={e => setForm({...form, baseline_value: e.target.value})} className="input-field" /></div>
            <div><label className="label">Baseline Unit</label><input value={form.baseline_unit} onChange={e => setForm({...form, baseline_unit: e.target.value})} className="input-field" /></div>
            <div><label className="label">Target Value</label><input value={form.target_value} onChange={e => setForm({...form, target_value: e.target.value})} className="input-field" /></div>
            <div><label className="label">Target Unit</label><input value={form.target_unit} onChange={e => setForm({...form, target_unit: e.target.value})} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Domain</label>
              <select value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} className="input-field">
                <option value="feeding">Feeding</option><option value="swallowing">Swallowing</option><option value="communication">Communication</option><option value="oral motor">Oral Motor</option>
              </select></div>
            <div><label className="label">Knowledge Type</label>
              <select value={form.knowledge_type} onChange={e => setForm({...form, knowledge_type: e.target.value})} className="input-field">
                <option value="therapist_experience">Therapist Experience</option><option value="published_evidence">Published Evidence</option>
              </select></div>
          </div>
          <button type="submit" className="btn-primary">Save Goal</button>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-12 card"><p className="text-sm text-canopy-faint">No goals recorded yet.</p></div>
      ) : (
        <div className="space-y-3">
          {goals.map(g => {
            const o = outcomes[g.id];
            return (
              <div key={g.id} className="card p-6">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={`pill ${g.status === 'active' ? 'bg-canopy-highlight text-forest-900' : g.status === 'met' ? 'bg-blue-50 text-blue-600' : 'bg-sage-100 text-canopy-subtle'}`}>{g.status}</span>
                  <span className="pill bg-forest-200 text-forest-800">{g.domain}</span>
                  <SourceBadge type={g.knowledge_type} />
                </div>
                <p className="text-sm text-canopy-text leading-relaxed mb-3">{g.description}</p>
                {(g.baseline_value || g.target_value) && (
                  <div className="flex gap-6 text-2xs">
                    {g.baseline_value && (
                      <div className="flex flex-col">
                        <span className="font-mono uppercase tracking-widest text-canopy-faint">Baseline</span>
                        <span className="text-canopy-muted font-medium mt-0.5">{g.baseline_value} {g.baseline_unit}</span>
                      </div>
                    )}
                    {o && (
                      <div className="flex flex-col">
                        <span className="font-mono uppercase tracking-widest text-canopy-faint">Latest</span>
                        <span className="text-canopy-muted font-medium mt-0.5">{o.latest_value} {o.latest_unit} <span className="text-canopy-faint font-normal">({o.latest_date})</span></span>
                      </div>
                    )}
                    {g.target_value && (
                      <div className="flex flex-col">
                        <span className="font-mono uppercase tracking-widest text-canopy-faint">Target</span>
                        <span className="text-forest-900 font-medium mt-0.5">{g.target_value} {g.target_unit}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SessionsTab({ caseId, caseData, onRefresh }: { caseId: string; caseData: CaseData; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ session_date: '', duration_minutes: 30, setting: '', caregiver_present: false, notes: '' });
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<Record<string, { interventions: any[]; outcomes: any[] }>>({});
  const pii = usePiiGuard();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (form.notes) {
      const safe = await pii.checkText(form.notes);
      if (!safe) return;
    }
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId, ...form, setting: form.setting || caseData.setting }),
    });
    if (res.ok) { setShowForm(false); onRefresh(); }
  }

  async function loadSessionDetails(sessionId: string) {
    if (sessionDetails[sessionId]) { setExpandedSession(expandedSession === sessionId ? null : sessionId); return; }
    const [intRes, outRes] = await Promise.all([
      fetch(`/api/interventions?session_id=${sessionId}`),
      fetch(`/api/outcomes?session_id=${sessionId}`),
    ]);
    const interventions = intRes.ok ? await intRes.json() : [];
    const outcomes = outRes.ok ? await outRes.json() : [];
    setSessionDetails(prev => ({ ...prev, [sessionId]: { interventions, outcomes } }));
    setExpandedSession(sessionId);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-canopy-text">Visits</h2>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? 'Cancel' : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Log Visit
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Date</label><input type="date" value={form.session_date} onChange={e => setForm({...form, session_date: e.target.value})} required className="input-field" /></div>
            <div><label className="label">Duration (min)</label><input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value)})} required className="input-field" /></div>
            <div><label className="label">Caregiver Present</label>
              <select value={form.caregiver_present ? 'yes' : 'no'} onChange={e => setForm({...form, caregiver_present: e.target.value === 'yes'})} className="input-field">
                <option value="no">No</option><option value="yes">Yes</option>
              </select></div>
          </div>
          <div><label className="label">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field" rows={3} />
            {pii.showWarning && <PiiWarning text={pii.pendingText} findings={pii.findings} onEdit={() => pii.dismiss()} onConfirm={() => { pii.dismiss(); }} />}
          </div>
          <button type="submit" className="btn-primary">Save Session</button>
        </form>
      )}

      {caseData.sessions.length === 0 ? (
        <div className="text-center py-12 card"><p className="text-sm text-canopy-faint">No visits recorded yet.</p></div>
      ) : (
        <div className="space-y-3">
          {caseData.sessions.map(s => (
            <div key={s.id} className="card overflow-hidden">
              <button onClick={() => loadSessionDetails(s.id)} className="w-full text-left p-5 hover:bg-sage-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-canopy-text">{s.session_date}</span>
                    <span className="text-2xs text-canopy-faint">{s.duration_minutes} min</span>
                    <span className="pill bg-sage-100 text-canopy-subtle">{SETTING_LABELS[s.setting] || s.setting}</span>
                    {s.caregiver_present ? <span className="pill bg-canopy-highlight text-forest-900">Caregiver present</span> : null}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-sage-400 transition-transform ${expandedSession === s.id ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
                {s.notes && <p className="text-sm text-canopy-subtle mt-2 leading-relaxed">{s.notes}</p>}
              </button>
              {expandedSession === s.id && sessionDetails[s.id] && (
                <div className="border-t border-sage-100 bg-sage-50/30 p-5 space-y-5">
                  <div>
                    <h4 className="section-title mb-3">Interventions ({sessionDetails[s.id].interventions.length})</h4>
                    {sessionDetails[s.id].interventions.length === 0 ? (
                      <p className="text-2xs text-canopy-faint">None recorded</p>
                    ) : sessionDetails[s.id].interventions.map((int: any) => (
                      <div key={int.id} className="mb-2.5 p-3.5 bg-white rounded-xl border border-sage-200">
                        <div className="flex items-center gap-2 mb-1"><span className="text-sm font-medium text-canopy-text">{int.name}</span><SourceBadge type={int.knowledge_type} /></div>
                        <p className="text-2xs text-canopy-subtle leading-relaxed">{int.description}</p>
                        {int.rationale && <p className="text-2xs text-canopy-faint mt-1 italic">{int.rationale}</p>}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="section-title mb-3">Outcomes ({sessionDetails[s.id].outcomes.length})</h4>
                    {sessionDetails[s.id].outcomes.length === 0 ? (
                      <p className="text-2xs text-canopy-faint">None recorded</p>
                    ) : sessionDetails[s.id].outcomes.map((out: any) => (
                      <div key={out.id} className="mb-2.5 p-3.5 bg-white rounded-xl border border-sage-200">
                        <div className="text-sm"><span className="font-medium text-canopy-text">{out.metric}:</span> <span className="text-canopy-muted">{out.value} {out.unit}</span></div>
                        {out.assistance_level && <p className="text-2xs text-canopy-faint mt-1">Assistance: {out.assistance_level}</p>}
                        {out.measurement_method && <p className="text-2xs text-canopy-faint">Method: {out.measurement_method}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ObservationsTab({ caseId, observations, onRefresh }: { caseId: string; observations: ObservationRow[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ observation: '', source: '', observed_date: '', knowledge_type: 'therapist_experience' });
  const pii = usePiiGuard();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const safe = await pii.checkText(form.observation);
    if (!safe) return;
    const res = await fetch('/api/context-observations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId, ...form }),
    });
    if (res.ok) { setShowForm(false); onRefresh(); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-canopy-text">Context Observations</h2>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? 'Cancel' : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Observation
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-5 space-y-4">
          <div><label className="label">Observation</label>
            <textarea value={form.observation} onChange={e => setForm({...form, observation: e.target.value})} required className="input-field" rows={3} placeholder="Observable facts only — no character judgments" />
            {pii.showWarning && <PiiWarning text={pii.pendingText} findings={pii.findings} onEdit={() => pii.dismiss()} onConfirm={() => pii.dismiss()} />}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Source</label><input value={form.source} onChange={e => setForm({...form, source: e.target.value})} required placeholder="e.g. caregiver report" className="input-field" /></div>
            <div><label className="label">Date Observed</label><input type="date" value={form.observed_date} onChange={e => setForm({...form, observed_date: e.target.value})} required className="input-field" /></div>
            <div><label className="label">Knowledge Type</label>
              <select value={form.knowledge_type} onChange={e => setForm({...form, knowledge_type: e.target.value})} className="input-field">
                <option value="therapist_experience">Therapist Experience</option><option value="published_evidence">Published Evidence</option>
              </select></div>
          </div>
          <button type="submit" className="btn-primary">Save</button>
        </form>
      )}

      {observations.length === 0 ? (
        <div className="text-center py-12 card"><p className="text-sm text-canopy-faint">No observations recorded yet.</p></div>
      ) : (
        <div className="space-y-3">
          {observations.map(o => (
            <div key={o.id} className="card p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xs text-canopy-faint">{o.observed_date}</span>
                <span className="text-2xs text-sage-300">&middot;</span>
                <span className="text-2xs text-canopy-faint">{o.source}</span>
                <SourceBadge type={o.knowledge_type} />
              </div>
              <p className="text-sm text-canopy-muted leading-relaxed">{o.observation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BarriersTab({ caseId, barriers, goals, onRefresh }: { caseId: string; barriers: BarrierRow[]; goals: GoalRow[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', category: 'patient', impact: '', goal_id: '' });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/barriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId, ...form, goal_id: form.goal_id || null }),
    });
    if (res.ok) { setShowForm(false); onRefresh(); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-canopy-text">Barriers</h2>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? 'Cancel' : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Barrier
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-5 space-y-4">
          <div><label className="label">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className="input-field" rows={2} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                <option value="patient">Patient</option><option value="environmental">Environmental</option><option value="systemic">Systemic</option><option value="caregiver">Caregiver</option><option value="equipment">Equipment</option>
              </select></div>
            <div><label className="label">Related Goal</label>
              <select value={form.goal_id} onChange={e => setForm({...form, goal_id: e.target.value})} className="input-field">
                <option value="">None</option>{goals.map(g => <option key={g.id} value={g.id}>{g.description.slice(0, 50)}</option>)}
              </select></div>
            <div><label className="label">Impact</label><input value={form.impact} onChange={e => setForm({...form, impact: e.target.value})} className="input-field" /></div>
          </div>
          <button type="submit" className="btn-primary">Save Barrier</button>
        </form>
      )}

      {barriers.length === 0 ? (
        <div className="text-center py-12 card"><p className="text-sm text-canopy-faint">No barriers recorded yet.</p></div>
      ) : (
        <div className="space-y-3">
          {barriers.map(b => (
            <div key={b.id} className="card p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="pill bg-red-50 text-red-600">{b.category}</span>
              </div>
              <p className="text-sm text-canopy-muted leading-relaxed">{b.description}</p>
              {b.impact && <p className="text-2xs text-canopy-faint mt-1.5">Impact: {b.impact}</p>}
              {b.resolution && <p className="text-2xs text-forest-900 mt-1">Resolved: {b.resolution}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CoordinationTab({ caseId, entries, onRefresh }: { caseId: string; entries: CoordinationRow[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contact_role: '', summary: '', coordination_date: '' });
  const pii = usePiiGuard();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const safe = await pii.checkText(form.summary);
    if (!safe) return;
    const res = await fetch('/api/care-coordination', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseId, ...form }),
    });
    if (res.ok) { setShowForm(false); onRefresh(); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-canopy-text">Care Coordination</h2>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? 'Cancel' : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Log Contact
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Contact Role</label><input value={form.contact_role} onChange={e => setForm({...form, contact_role: e.target.value})} required placeholder="e.g. OT, pediatrician, teacher" className="input-field" /></div>
            <div><label className="label">Date</label><input type="date" value={form.coordination_date} onChange={e => setForm({...form, coordination_date: e.target.value})} required className="input-field" /></div>
          </div>
          <div><label className="label">Summary</label>
            <textarea value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} required className="input-field" rows={3} />
            {pii.showWarning && <PiiWarning text={pii.pendingText} findings={pii.findings} onEdit={() => pii.dismiss()} onConfirm={() => pii.dismiss()} />}
          </div>
          <button type="submit" className="btn-primary">Save</button>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-12 card"><p className="text-sm text-canopy-faint">No coordination entries yet.</p></div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => (
            <div key={e.id} className="card p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-canopy-text">{e.contact_role}</span>
                <span className="text-2xs text-canopy-faint">{e.coordination_date}</span>
              </div>
              <p className="text-sm text-canopy-muted leading-relaxed">{e.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ caseId, documents }: { caseId: string; documents: DocumentRow[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-canopy-text">Documents</h2>
        <a href={`/cases/${caseId}/plan`} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          Generate Draft
        </a>
      </div>
      {documents.length === 0 ? (
        <div className="text-center py-12 card"><p className="text-sm text-canopy-faint">No documents yet. Generate a treatment plan or progress note draft.</p></div>
      ) : (
        <div className="space-y-3">
          {documents.map(d => (
            <div key={d.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-canopy-text">{d.title}</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="pill bg-sage-100 text-canopy-subtle">{d.doc_type.replace('_', ' ')}</span>
                    <span className={`pill ${d.status === 'approved' ? 'bg-canopy-highlight text-forest-900' : d.status === 'locked' ? 'bg-blue-50 text-blue-600' : 'bg-lime-50 text-forest-950'}`}>{d.status}</span>
                    <span className="text-2xs text-canopy-faint">v{d.version}</span>
                  </div>
                </div>
                <a href={`/cases/${caseId}/documents?doc=${d.id}`} className="btn-ghost text-sm">
                  View
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HealthHistoryTab({ caseId, history }: { caseId: string; history: HealthHistoryRow | null }) {
  if (!history) {
    return (
      <div className="text-center py-12 card">
        <p className="text-sm text-canopy-faint">No health history recorded yet.</p>
        <p className="text-2xs text-canopy-subtle mt-1">Health history will appear here once added via the API or seed data.</p>
      </div>
    );
  }

  const medical = JSON.parse(history.medical_history || '[]');
  const surgical = JSON.parse(history.surgical_history || '[]');
  const meds = JSON.parse(history.current_medications || '[]');
  const allergies = JSON.parse(history.allergies || '[]');
  const immunizations = JSON.parse(history.immunizations || '[]');
  const therapy = JSON.parse(history.prior_therapy_history || '[]');

  function renderList(items: string[], emptyMsg: string) {
    if (items.length === 0) return <p className="text-sm text-canopy-faint">{emptyMsg}</p>;
    return (
      <ul className="space-y-1">{items.map((item, i) => (
        <li key={i} className="text-sm text-canopy-muted flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-600 shrink-0 mt-1.5" />
          {item}
        </li>
      ))}</ul>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-canopy-text">Health History</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="section-title mb-3">Medical History</h3>
          {renderList(medical, 'None recorded')}
        </div>
        <div className="card p-6">
          <h3 className="section-title mb-3">Surgical History</h3>
          {renderList(surgical, 'None recorded')}
        </div>
        <div className="card p-6">
          <h3 className="section-title mb-3">Current Medications</h3>
          {renderList(meds, 'None reported')}
        </div>
        <div className="card p-6">
          <h3 className="section-title mb-3">Allergies</h3>
          {renderList(allergies, 'No known allergies')}
        </div>
        <div className="card p-6">
          <h3 className="section-title mb-3">Immunizations</h3>
          {renderList(immunizations, 'None recorded')}
        </div>
        <div className="card p-6">
          <h3 className="section-title mb-3">Prior Therapy History</h3>
          {renderList(therapy, 'None recorded')}
        </div>
        {(history.functional_status || history.cognitive_status || history.communication_status || history.nutritional_status) && (
          <div className="card p-6 md:col-span-2">
            <h3 className="section-title mb-3">Functional Status</h3>
            <div className="grid grid-cols-2 gap-4">
              {history.functional_status && <div><span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">Functional</span><p className="text-sm text-canopy-muted mt-0.5">{history.functional_status}</p></div>}
              {history.cognitive_status && <div><span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">Cognitive</span><p className="text-sm text-canopy-muted mt-0.5">{history.cognitive_status}</p></div>}
              {history.communication_status && <div><span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">Communication</span><p className="text-sm text-canopy-muted mt-0.5">{history.communication_status}</p></div>}
              {history.nutritional_status && <div><span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">Nutritional</span><p className="text-sm text-canopy-muted mt-0.5">{history.nutritional_status}</p></div>}
            </div>
          </div>
        )}
        {(history.family_history || history.social_history) && (
          <div className="card p-6 md:col-span-2">
            <h3 className="section-title mb-3">Family &amp; Social History</h3>
            {history.family_history && <p className="text-sm text-canopy-muted mb-2"><span className="font-medium">Family:</span> {history.family_history}</p>}
            {history.social_history && <p className="text-sm text-canopy-muted"><span className="font-medium">Social:</span> {history.social_history}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function EpisodesTab({ episodes }: { episodes: EpisodeRow[] }) {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-12 card">
        <p className="text-sm text-canopy-faint">No episodes of care recorded yet.</p>
        <p className="text-2xs text-canopy-subtle mt-1">Episodes represent certification periods in a plan of care.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-canopy-text">Episodes / Plan of Care</h2>
      </div>
      <div className="space-y-3">
        {episodes.map(ep => (
          <div key={ep.id} className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-canopy-text">Episode {ep.episode_number}</span>
              <span className={`pill ${ep.status === 'active' ? 'bg-canopy-highlight text-forest-900' : 'bg-sage-100 text-canopy-subtle'}`}>{ep.status}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">Start Date</span>
                <p className="text-canopy-muted mt-0.5">{ep.start_date}</p>
              </div>
              {ep.end_date && (
                <div>
                  <span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">End Date</span>
                  <p className="text-canopy-muted mt-0.5">{ep.end_date}</p>
                </div>
              )}
              {ep.frequency && (
                <div>
                  <span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">Frequency</span>
                  <p className="text-canopy-muted mt-0.5">{ep.frequency}</p>
                </div>
              )}
              {ep.duration && (
                <div>
                  <span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">Duration</span>
                  <p className="text-canopy-muted mt-0.5">{ep.duration}</p>
                </div>
              )}
              {ep.primary_diagnosis && (
                <div>
                  <span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">Primary Dx</span>
                  <p className="text-canopy-muted mt-0.5">{ep.primary_diagnosis}</p>
                </div>
              )}
              {ep.physician_name && (
                <div>
                  <span className="text-2xs text-canopy-faint uppercase font-mono tracking-widest">Physician</span>
                  <p className="text-canopy-muted mt-0.5">{ep.physician_name}</p>
                </div>
              )}
            </div>
            {ep.notes && <p className="text-sm text-canopy-subtle mt-3 leading-relaxed">{ep.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitiesTab({ caseId, activities, patientName }: { caseId: string; activities: ActivityRow[]; patientName: string | null }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base font-semibold text-canopy-text">Activities</h2>
        <a href={`/activities?case=${caseId}`} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          Generate Activity
        </a>
      </div>
      {activities.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-sm text-canopy-faint">No activities generated for {patientName || 'this patient'} yet.</p>
          <p className="text-2xs text-canopy-subtle mt-1">Use the Activity Studio to generate therapy activities linked to this patient.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(a => (
            <div key={a.id} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-canopy-text">{a.title}</span>
                <span className="text-2xs text-canopy-faint">{a.created_at?.slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
