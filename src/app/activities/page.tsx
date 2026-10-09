'use client';

import { useState, useEffect } from 'react';
import { SourceBadge } from '@/components/source-badge';
import { PicklistSelect } from '@/components/picklist-select';
import { PiiReviewModal, usePiiReview } from '@/components/pii-review-modal';
import { GOAL_DOMAINS, SETTINGS, DEVELOPMENTAL_LEVELS, EQUIPMENT } from '@/lib/picklists';

interface PatientOption {
  id: string;
  display_name: string | null;
  age_band: string;
}

interface ActivityOutput {
  name: string;
  premise: string;
  target_goal: string;
  why_it_fits: string;
  materials: Array<{ item: string; alternatives: string[] }>;
  prep_steps: string[];
  instructions: string[];
  grading: { up: string[]; down: string[] };
  measurement: string;
  safety_notes: string[];
  stop_criteria: string[];
  provenance: string;
  knowledge_type: string;
}

interface LogEntry {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  title: string;
  input_params: string;
  entries: LogEntry[];
  created_at: string;
}

export default function ActivityStudioPage() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [form, setForm] = useState({
    target_goal: '',
    patient_interests: '',
    developmental_level: 'early childhood',
    setting: 'outpatient_clinic',
    time_available: 30,
    available_tools: '',
    accessibility_needs: '',
  });
  const [activity, setActivity] = useState<ActivityOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [refinement, setRefinement] = useState('');
  const [refining, setRefining] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  const [savedLogs, setSavedLogs] = useState<ActivityLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingLog, setViewingLog] = useState<ActivityLog | null>(null);

  const pii = usePiiReview();

  useEffect(() => {
    fetch('/api/activity-logs')
      .then(r => r.json())
      .then(data => setSavedLogs(data))
      .catch(() => {});
    fetch('/api/cases')
      .then(r => r.json())
      .then((data: PatientOption[]) => {
        setPatients(data);
        const params = new URLSearchParams(window.location.search);
        const caseParam = params.get('case');
        if (caseParam) setSelectedCaseId(caseParam);
      })
      .catch(() => {});
  }, []);

  function doGenerate() {
    setLoading(true);
    setError('');
    fetch('/api/ai/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        patient_interests: form.patient_interests.split(',').map(s => s.trim()).filter(Boolean),
        available_tools: form.available_tools.split(',').map(s => s.trim()).filter(Boolean),
        accessibility_needs: form.accessibility_needs.split(',').map(s => s.trim()).filter(Boolean),
      }),
    })
      .then(r => { if (!r.ok) throw new Error('Failed to generate activity'); return r.json(); })
      .then(async (result: ActivityOutput) => {
        setActivity(result);
        const logRes = await fetch('/api/activity-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: selectedCaseId || null,
            title: result.name,
            input_params: form,
            activity: result,
          }),
        });
        if (logRes.ok) {
          const { id } = await logRes.json();
          setCurrentLogId(id);
          setLogEntries([{ id: 'initial', role: 'generated', content: JSON.stringify(result), created_at: new Date().toISOString() }]);
          fetch('/api/activity-logs').then(r => r.json()).then(d => setSavedLogs(d)).catch(() => {});
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    const textFields = [
      { name: 'Target Goal', value: form.target_goal },
      { name: 'Patient Interests', value: form.patient_interests },
      { name: 'Accessibility Needs', value: form.accessibility_needs },
    ].filter(f => f.value);

    await pii.reviewAndSubmit(textFields, doGenerate);
  }

  async function submitRefinement() {
    if (!refinement.trim() || !currentLogId) return;
    setRefining(true);

    await fetch('/api/activity-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_entry',
        log_id: currentLogId,
        role: 'clinician',
        content: refinement.trim(),
      }),
    });

    try {
      const res = await fetch('/api/ai/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          patient_interests: form.patient_interests.split(',').map(s => s.trim()).filter(Boolean),
          available_tools: form.available_tools.split(',').map(s => s.trim()).filter(Boolean),
          accessibility_needs: form.accessibility_needs.split(',').map(s => s.trim()).filter(Boolean),
          refinement_request: refinement.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const revised: ActivityOutput = await res.json();
      setActivity(revised);

      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_entry',
          log_id: currentLogId,
          role: 'revised',
          content: revised,
        }),
      });

      const logsRes = await fetch('/api/activity-logs');
      const allLogs = await logsRes.json();
      setSavedLogs(allLogs);
      const current = allLogs.find((l: ActivityLog) => l.id === currentLogId);
      if (current) setLogEntries(current.entries);
    } catch {
      setError('Failed to refine activity');
    } finally {
      setRefining(false);
      setRefinement('');
    }
  }

  function viewLog(log: ActivityLog) {
    setViewingLog(log);
    const lastGenerated = [...log.entries].reverse().find(e => e.role === 'generated' || e.role === 'revised');
    if (lastGenerated) {
      try { setActivity(JSON.parse(lastGenerated.content)); } catch { /* ignore */ }
    }
    setCurrentLogId(log.id);
    setLogEntries(log.entries);
    setShowHistory(false);
  }

  return (
    <div>
      {pii.showModal && (
        <PiiReviewModal fieldFindings={pii.fieldFindings} onConfirm={pii.confirm} onCancel={pii.cancel} />
      )}

      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Activity Studio</h1>
          <p className="page-subtitle">Generate therapy activities tailored to patient goals and interests</p>
        </div>
        {savedLogs.length > 0 && (
          <button onClick={() => setShowHistory(!showHistory)} className={showHistory ? 'btn-secondary' : 'btn-ghost'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            {showHistory ? 'Hide History' : `History (${savedLogs.length})`}
          </button>
        )}
      </div>

      {showHistory && (
        <div className="card p-5 mb-6 space-y-2">
          <h3 className="section-title mb-3">Activity Log History</h3>
          {savedLogs.map(log => (
            <button key={log.id} onClick={() => viewLog(log)} className="w-full text-left p-3 rounded-xl hover:bg-canopy-highlight transition-colors flex items-center justify-between group">
              <div>
                <span className="text-sm font-medium text-canopy-text">{log.title}</span>
                <span className="text-2xs text-canopy-faint ml-2">{log.entries.length} {log.entries.length === 1 ? 'entry' : 'entries'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xs text-canopy-faint">{log.created_at?.slice(0, 10)}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage-400 group-hover:text-forest-900"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </div>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={generate} className="card p-7 mb-6 space-y-4 no-print">
        {patients.length > 0 && (
          <div>
            <label className="label">Link to Patient (optional)</label>
            <select value={selectedCaseId} onChange={e => setSelectedCaseId(e.target.value)} className="input-field">
              <option value="">No patient selected</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.display_name || 'Patient'} — Age {p.age_band}</option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Target Goal</label>
            <input value={form.target_goal} onChange={e => setForm({...form, target_goal: e.target.value})} required placeholder="e.g. Increase food variety across textures" className="input-field" /></div>
          <div><label className="label">Patient Interests (comma-separated)</label>
            <input value={form.patient_interests} onChange={e => setForm({...form, patient_interests: e.target.value})} placeholder="e.g. dinosaurs, trucks, animals" className="input-field" /></div>
          <PicklistSelect label="Developmental Level" options={DEVELOPMENTAL_LEVELS} value={form.developmental_level} onChange={v => setForm({...form, developmental_level: v})} />
          <PicklistSelect label="Setting" options={SETTINGS} value={form.setting} onChange={v => setForm({...form, setting: v})} />
          <div><label className="label">Time Available (min)</label>
            <input type="number" value={form.time_available} onChange={e => setForm({...form, time_available: parseInt(e.target.value)})} className="input-field" /></div>
          <div><label className="label">Available Tools (comma-separated)</label>
            <input value={form.available_tools} onChange={e => setForm({...form, available_tools: e.target.value})} placeholder="e.g. chewy tubes, textured spoons" className="input-field" /></div>
        </div>
        <div><label className="label">Accessibility Needs (comma-separated)</label>
          <input value={form.accessibility_needs} onChange={e => setForm({...form, accessibility_needs: e.target.value})} placeholder="e.g. seated positioning, visual supports" className="input-field" /></div>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-forest-950/30 border-t-forest-950 rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
              Generate Activity
            </>
          )}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      {activity && (
        <div className="card p-7 space-y-6">
          <div className="bg-lime-50 border border-lime-200 rounded-2xl p-5 flex items-start gap-3 no-print">
            <span className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-canopy-text text-sm">Clinician Review Required</p>
              <div className="mt-1"><SourceBadge type="ai_generated" /></div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-canopy-text" style={{ letterSpacing: '-0.02em' }}>{activity.name}</h2>
            <p className="text-sm text-canopy-subtle mt-1 leading-relaxed">{activity.premise}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-canopy-highlight">
              <span className="section-title">Target Goal</span>
              <p className="text-sm text-canopy-muted mt-1">{activity.target_goal}</p>
            </div>
            <div className="p-4 rounded-xl bg-canopy-highlight">
              <span className="section-title">Why It Fits</span>
              <p className="text-sm text-canopy-muted mt-1">{activity.why_it_fits}</p>
            </div>
          </div>

          <div>
            <h3 className="section-title mb-3">Materials</h3>
            <div className="space-y-2">{activity.materials.map((m, i) => (
              <div key={i} className="flex items-baseline gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-forest-900 shrink-0 mt-1.5" />
                <div>
                  <span className="font-medium text-canopy-text">{m.item}</span>
                  {m.alternatives.length > 0 && <span className="text-canopy-faint text-2xs ml-1.5">alt: {m.alternatives.join(', ')}</span>}
                </div>
              </div>
            ))}</div>
          </div>

          <div>
            <h3 className="section-title mb-3">Prep Steps</h3>
            <ol className="space-y-1.5">{activity.prep_steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-canopy-muted">
                <span className="font-mono text-2xs text-canopy-faint w-4 text-right shrink-0 mt-0.5">{i + 1}</span>
                {s}
              </li>
            ))}</ol>
          </div>

          <div>
            <h3 className="section-title mb-3">Instructions</h3>
            <ol className="space-y-2">{activity.instructions.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-canopy-muted">
                <span className="w-6 h-6 rounded-full bg-canopy-highlight text-forest-900 text-2xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="mt-0.5">{s}</span>
              </li>
            ))}</ol>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-canopy-highlight border border-sage-200">
              <h3 className="section-title mb-2">Grade Up</h3>
              <ul className="space-y-1.5">{activity.grading.up.map((s, i) => (
                <li key={i} className="text-sm text-forest-800 flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F7A55" strokeWidth="2" className="shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>
                  {s}
                </li>
              ))}</ul>
            </div>
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
              <h3 className="section-title text-blue-600 mb-2">Grade Down</h3>
              <ul className="space-y-1.5">{activity.grading.down.map((s, i) => (
                <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                  {s}
                </li>
              ))}</ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-canopy-highlight">
            <h3 className="section-title mb-1">Measurement</h3>
            <p className="text-sm text-canopy-muted">{activity.measurement}</p>
          </div>

          <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100">
            <h3 className="section-title text-red-600 mb-2">Safety Notes &amp; Stop Criteria</h3>
            <ul className="space-y-1.5 mb-3">{activity.safety_notes.map((s, i) => (
              <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                {s}
              </li>
            ))}</ul>
            <p className="text-sm font-medium text-red-800 mb-1.5">Stop if:</p>
            <ul className="space-y-1.5">{activity.stop_criteria.map((s, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                {s}
              </li>
            ))}</ul>
          </div>

          {/* Refinement thread */}
          {currentLogId && (
            <div className="border-t border-sage-200 pt-5 no-print">
              <h3 className="section-title mb-3">Refine This Activity</h3>

              {logEntries.filter(e => e.role === 'clinician').length > 0 && (
                <div className="space-y-2 mb-4">
                  {logEntries.map((entry, i) => {
                    if (entry.role === 'generated' && i === 0) return null;
                    let content: string;
                    try { const parsed = JSON.parse(entry.content); content = typeof parsed === 'string' ? parsed : (parsed.name ? `Revised: ${parsed.name}` : 'Revised activity generated'); } catch { content = entry.content; }
                    return (
                      <div key={entry.id || i} className={`p-3 rounded-xl text-sm ${entry.role === 'clinician' ? 'bg-canopy-highlight text-canopy-text ml-8' : 'bg-sage-50 text-canopy-muted mr-8'}`}>
                        <span className="font-mono text-2xs text-canopy-faint uppercase tracking-widest">{entry.role === 'clinician' ? 'You' : 'AI'}</span>
                        <p className="mt-1">{content}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={refinement}
                  onChange={e => setRefinement(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitRefinement(); } }}
                  placeholder="e.g. Make it shorter, add a sensory component, adjust for home setting..."
                  className="input-field flex-1"
                  disabled={refining}
                />
                <button
                  type="button"
                  onClick={submitRefinement}
                  disabled={refining || !refinement.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  {refining ? (
                    <div className="w-4 h-4 border-2 border-forest-950/30 border-t-forest-950 rounded-full animate-spin" />
                  ) : 'Refine'}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-2xs text-canopy-faint italic">{activity.provenance}</p>
            <button onClick={() => window.print()} className="btn-secondary no-print">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
              Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
