'use client';

import { useEffect, useState } from 'react';
import { PicklistSelect, MultiPicklist } from '@/components/picklist-select';
import { PiiReviewModal, usePiiReview } from '@/components/pii-review-modal';
import { DIAGNOSES, SETTINGS, AGE_BANDS, PRECAUTIONS, EQUIPMENT, SESSION_LENGTHS, getLabel } from '@/lib/picklists';

interface Case {
  id: string;
  display_name: string | null;
  age_band: string;
  diagnoses: string;
  setting: string;
  status: string;
  session_length_minutes: number;
  created_at: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    display_name: '',
    age_band: '',
    diagnoses: [] as string[],
    setting: 'outpatient_clinic',
    session_length_minutes: 30,
    precautions: [] as string[],
    equipment_available: [] as string[],
  });
  const pii = usePiiReview();

  useEffect(() => {
    fetch('/api/cases')
      .then((r) => r.json())
      .then((data) => { setCases(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function submitCreate() {
    fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(r => r.json())
      .then(created => {
        setCases(prev => [created, ...prev]);
        setShowForm(false);
        setForm({ display_name: '', age_band: '', diagnoses: [], setting: 'outpatient_clinic', session_length_minutes: 30, precautions: [], equipment_available: [] });
      });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const textFields = [
      ...form.diagnoses.filter(d => !DIAGNOSES.some(o => o.value === d)).map(d => ({ name: `Custom Diagnosis: "${d}"`, value: d })),
      ...form.precautions.filter(p => !PRECAUTIONS.some(o => o.value === p)).map(p => ({ name: `Custom Precaution: "${p}"`, value: p })),
    ];

    if (textFields.length > 0) {
      await pii.reviewAndSubmit(textFields, submitCreate);
    } else {
      submitCreate();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-sage-200 border-t-forest-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {pii.showModal && (
        <PiiReviewModal fieldFindings={pii.fieldFindings} onConfirm={pii.confirm} onCancel={pii.cancel} />
      )}

      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{cases.length} active {cases.length === 1 ? 'patient' : 'patients'} — manage records, episodes, and visits</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? 'Cancel' : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              New Patient
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-6 space-y-4">
          <div>
            <label className="label">Patient Name</label>
            <input value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} required placeholder="e.g. Patient A" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <PicklistSelect label="Age Band" options={AGE_BANDS} value={form.age_band} onChange={v => setForm({...form, age_band: v})} required placeholder="Select age band..." />
            <PicklistSelect label="Setting" options={SETTINGS} value={form.setting} onChange={v => setForm({...form, setting: v})} required />
            <PicklistSelect
              label="Session Length"
              options={SESSION_LENGTHS}
              value={String(form.session_length_minutes)}
              onChange={v => setForm({...form, session_length_minutes: parseInt(v) || 30})}
              required
            />
          </div>
          <MultiPicklist label="Diagnoses" options={DIAGNOSES} values={form.diagnoses} onChange={v => setForm({...form, diagnoses: v})} placeholder="Add diagnosis..." />
          <MultiPicklist label="Precautions" options={PRECAUTIONS} values={form.precautions} onChange={v => setForm({...form, precautions: v})} placeholder="Add precaution..." />
          <MultiPicklist label="Equipment Available" options={EQUIPMENT} values={form.equipment_available} onChange={v => setForm({...form, equipment_available: v})} placeholder="Add equipment..." />
          <button type="submit" className="btn-primary">Create Case</button>
        </form>
      )}

      {cases.length === 0 ? (
        <div className="text-center py-16 card">
          <span className="w-12 h-12 rounded-2xl bg-canopy-highlight flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F7A55" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </span>
          <p className="text-sm text-canopy-muted mb-1">No patients yet</p>
          <p className="text-2xs text-canopy-subtle">Add your first patient to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const diagnoses = JSON.parse(c.diagnoses || '[]');
            return (
              <a key={c.id} href={`/cases/${c.id}`} className="block card p-5 group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-canopy-text">{c.display_name || 'Patient'} — Age {c.age_band}</span>
                      <span className="pill bg-sage-100 text-canopy-subtle">
                        {getLabel(SETTINGS, c.setting)}
                      </span>
                      <span className={`pill ${c.status === 'active' ? 'bg-canopy-highlight text-forest-900' : 'bg-sage-100 text-canopy-subtle'}`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {diagnoses.map((d: string, i: number) => (
                        <span key={i} className="pill bg-forest-200 text-forest-800">
                          {getLabel(DIAGNOSES, d)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-2xs text-canopy-faint">{c.session_length_minutes} min</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage-400 group-hover:text-forest-900 transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
