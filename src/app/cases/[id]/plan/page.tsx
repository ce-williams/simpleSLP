'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SourceBadge } from '@/components/source-badge';

interface PlanOutput {
  clinical_summary: string;
  missing_information: string[];
  clarifying_questions: string[];
  proposed_goals: Array<{ description: string; rationale: string; measurement_method: string; knowledge_type: string }>;
  suggested_interventions: Array<{ name: string; description: string; rationale: string; resource_ids: string[]; knowledge_type: string }>;
  safety_considerations: string[];
  alternatives: Array<{ description: string; rationale: string }>;
  citations: Array<{ resource_id: string; context: string }>;
  limitations: string[];
  precaution_conflicts: Array<{ precaution: string; conflicting_suggestion: string; resolution: string }>;
  requires_clinician_review: boolean;
}

interface SimilarCase {
  caseId: string;
  ageBand: string;
  setting: string;
  matchedFields: string[];
  matchedGoalDomains: string[];
  sessionCount: number;
  progressRecordedSessions: number;
  summary: string;
  caveats: string[];
}

export default function TreatmentPlanPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [plan, setPlan] = useState<PlanOutput | null>(null);
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/similar-cases?case_id=${caseId}`)
      .then(r => r.json())
      .then(data => setSimilarCases(data))
      .catch(() => {});
  }, [caseId]);

  async function generatePlan() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/treatment-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate plan');
      }
      setPlan(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function savePlan() {
    if (!plan) return;
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        case_id: caseId,
        doc_type: 'treatment_plan',
        title: 'Treatment Plan Draft',
        content: plan,
      }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <a href="/cases" className="text-2xs text-canopy-faint hover:text-forest-900 transition-colors">Patients</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-300"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        <a href={`/cases/${caseId}`} className="text-2xs text-canopy-faint hover:text-forest-900 transition-colors">Patient {caseId.slice(0, 8)}</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-300"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        <span className="text-2xs text-canopy-subtle">Treatment Plan</span>
      </div>

      <div className="page-header">
        <h1 className="page-title">Treatment Plan Builder</h1>
      </div>

      {similarCases.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="section-title mb-3">Similar Patients ({similarCases.length})</h3>
          <div className="space-y-2.5">
            {similarCases.map(sc => (
              <div key={sc.caseId} className="p-4 bg-canopy-highlight rounded-xl">
                <div className="flex gap-2 mb-1.5 items-center">
                  <span className="text-sm font-medium text-canopy-text">Age {sc.ageBand}</span>
                  <span className="pill bg-sage-100 text-canopy-subtle">{sc.setting.replace(/_/g, ' ')}</span>
                  <span className="pill bg-forest-200 text-forest-800">Matched: {sc.matchedFields.join(', ')}</span>
                </div>
                <p className="text-2xs text-canopy-subtle leading-relaxed">{sc.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!plan && (
        <div className="text-center py-16 card">
          <span className="w-14 h-14 rounded-2xl bg-lime flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </span>
          <p className="text-sm text-canopy-muted mb-5 max-w-sm mx-auto leading-relaxed">
            Generate a treatment plan based on case data, goals, outcomes, and similar cases.
          </p>
          <button onClick={generatePlan} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-forest-950/30 border-t-forest-950 rounded-full animate-spin" />
                Generating...
              </>
            ) : 'Generate Treatment Plan'}
          </button>
          {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
        </div>
      )}

      {plan && (
        <div className="space-y-5">
          <div className="bg-lime-50 border border-lime-200 rounded-2xl p-5 flex items-start gap-3">
            <span className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-canopy-text text-sm">Clinician Review Required</p>
              <p className="text-2xs text-canopy-subtle mt-0.5">AI-generated draft. All content requires review, modification, and approval before clinical use.</p>
              <div className="mt-1.5"><SourceBadge type="ai_generated" /></div>
            </div>
          </div>

          {plan.precaution_conflicts.length > 0 && (
            <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6">
              <h3 className="section-title text-red-600 mb-3">Precaution Conflicts Detected</h3>
              {plan.precaution_conflicts.map((pc, i) => (
                <div key={i} className="mb-3 last:mb-0 text-sm space-y-1">
                  <p className="text-red-700"><span className="font-medium">Precaution:</span> {pc.precaution}</p>
                  <p className="text-red-600"><span className="font-medium">Conflict:</span> {pc.conflicting_suggestion}</p>
                  <p className="text-red-800"><span className="font-medium">Resolution:</span> {pc.resolution}</p>
                </div>
              ))}
            </div>
          )}

          <div className="card p-6">
            <h3 className="section-title mb-2">Clinical Summary</h3>
            <p className="text-sm text-canopy-muted leading-relaxed">{plan.clinical_summary}</p>
          </div>

          {plan.missing_information.length > 0 && (
            <div className="bg-orange-50/30 border border-orange-200 rounded-2xl p-6">
              <h3 className="section-title text-orange-600 mb-2">Missing Information</h3>
              <ul className="space-y-1.5">{plan.missing_information.map((m, i) => (
                <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                  {m}
                </li>
              ))}</ul>
            </div>
          )}

          <div className="card p-6">
            <h3 className="section-title mb-3">Proposed Goals</h3>
            <div className="space-y-2.5">{plan.proposed_goals.map((g, i) => (
              <div key={i} className="p-4 bg-canopy-highlight rounded-xl">
                <div className="flex items-center gap-2 mb-1"><span className="text-sm font-medium text-canopy-text">{g.description}</span><SourceBadge type={g.knowledge_type} /></div>
                <p className="text-2xs text-canopy-subtle leading-relaxed">{g.rationale}</p>
                <p className="text-2xs text-canopy-faint mt-1">Measurement: {g.measurement_method}</p>
              </div>
            ))}</div>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-3">Suggested Interventions</h3>
            <div className="space-y-2.5">{plan.suggested_interventions.map((int, i) => (
              <div key={i} className="p-4 bg-canopy-highlight rounded-xl">
                <div className="flex items-center gap-2 mb-1"><span className="text-sm font-medium text-canopy-text">{int.name}</span><SourceBadge type={int.knowledge_type} /></div>
                <p className="text-2xs text-canopy-subtle leading-relaxed">{int.description}</p>
                <p className="text-2xs text-canopy-faint mt-1 italic">{int.rationale}</p>
              </div>
            ))}</div>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-2">Safety Considerations</h3>
            <ul className="space-y-1.5">{plan.safety_considerations.map((s, i) => (
              <li key={i} className="text-sm text-canopy-muted flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-forest-900 shrink-0 mt-1.5" />
                {s}
              </li>
            ))}</ul>
          </div>

          <div className="card p-6">
            <h3 className="section-title mb-2">Limitations</h3>
            <ul className="space-y-1.5">{plan.limitations.map((l, i) => (
              <li key={i} className="text-sm text-orange-600 flex items-start gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                {l}
              </li>
            ))}</ul>
          </div>

          <div className="flex gap-3 pt-2">
            {!saved ? (
              <button onClick={savePlan} className="btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Save as Draft
              </button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-forest-900">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="font-medium">Saved as draft. <a href={`/cases/${caseId}`} className="underline hover:no-underline">Return to case</a></span>
              </div>
            )}
            <button onClick={() => { setPlan(null); setSaved(false); }} className="btn-secondary">Regenerate</button>
          </div>
        </div>
      )}
    </div>
  );
}
