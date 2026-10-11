'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface PortalData {
  patientName: string;
  ageBand: string;
  setting: string;
  activeGoals: {
    description: string;
    domain: string;
    status: string;
    target: string | null;
    baseline: string | null;
  }[];
  recentVisits: {
    date: string;
    duration: number;
    setting: string;
  }[];
  recentOutcomes: {
    metric: string;
    value: string;
    unit: string;
    date: string;
    assistanceLevel: string | null;
  }[];
  homePractice: {
    goal: string;
    domain: string;
    currentProgress: string;
    target: string;
    suggestions: string[];
  }[];
  nextVisitInfo: {
    frequency: string;
    duration: string;
  } | null;
}

const SETTING_LABELS: Record<string, string> = {
  home_health: 'Home Health', aba_center: 'ABA Center', outpatient_clinic: 'Outpatient Clinic',
  school: 'School', nursing_home: 'Nursing Home', hospital: 'Hospital',
};

function GoalProgressRing({ label, current, target }: { label: string; current: string; target: string }) {
  const currentVal = parseFloat(current);
  const targetVal = parseFloat(target);
  const pct = !isNaN(currentVal) && !isNaN(targetVal) && targetVal > 0
    ? Math.min(Math.round((currentVal / targetVal) * 100), 100)
    : null;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-sage-200">
      {pct !== null ? (
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              stroke="#C8F169" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${pct * 0.974} 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-canopy-text">{pct}%</span>
        </div>
      ) : (
        <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-canopy-text leading-snug">{label}</p>
        <p className="text-2xs text-canopy-faint mt-0.5">
          {current} → {target}
        </p>
      </div>
    </div>
  );
}

export default function CaregiverPortalPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/portal/${caseId}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [caseId]);

  if (loading) return (
    <div className="min-h-screen bg-sage-100 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-sage-200 border-t-forest-900 rounded-full animate-spin" />
    </div>
  );
  if (error || !data) return (
    <div className="min-h-screen bg-sage-100 flex items-center justify-center p-6">
      <div className="card p-8 text-center max-w-md">
        <h1 className="text-lg font-semibold text-canopy-text mb-2">Portal Unavailable</h1>
        <p className="text-sm text-canopy-subtle">This patient portal link may be invalid or expired.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 via-forest-950 to-sage-100">
      {/* Header */}
      <header className="px-4 sm:px-6 pt-8 pb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21V11" /><path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7z" /><path d="M12 14c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-forest-100">SimpleSLP</span>
        </div>
        <h1 className="text-2xl font-semibold text-forest-50 mb-1">{data.patientName}</h1>
        <p className="text-sm text-canopy-faint">
          Age {data.ageBand} · {SETTING_LABELS[data.setting] || data.setting}
        </p>
        <p className="font-mono text-2xs uppercase tracking-widest text-lime/80 mt-3">Caregiver Portal</p>
      </header>

      {/* Content */}
      <div className="px-4 sm:px-6 pb-8 max-w-xl mx-auto space-y-6">

        {/* Active Goals */}
        <section className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-900"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>
            Current Goals
          </h2>
          <div className="space-y-3">
            {data.activeGoals.length > 0 ? data.activeGoals.map((g, i) => (
              <GoalProgressRing
                key={i}
                label={g.description}
                current={data.homePractice[i]?.currentProgress || 'In progress'}
                target={g.target || 'Target TBD'}
              />
            )) : (
              <p className="text-sm text-canopy-faint">No active goals at this time.</p>
            )}
          </div>
        </section>

        {/* Home Practice */}
        {data.homePractice.length > 0 && (
          <section className="card p-5">
            <h2 className="section-title mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-900"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
              Home Practice
            </h2>
            <div className="space-y-4">
              {data.homePractice.map((hp, i) => (
                <div key={i} className="bg-canopy-highlight/30 rounded-xl p-4">
                  <p className="text-sm font-medium text-canopy-text mb-2">{hp.goal}</p>
                  <p className="pill bg-sage-100 text-canopy-subtle mb-3 capitalize">{hp.domain}</p>
                  <ul className="space-y-1.5">
                    {hp.suggestions.map((s, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-canopy-subtle">
                        <span className="text-lime mt-0.5">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Visits */}
        <section className="card p-5">
          <h2 className="section-title mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest-900"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
            Recent Visits
          </h2>
          {data.recentVisits.length > 0 ? (
            <div className="space-y-2">
              {data.recentVisits.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-sage-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-canopy-text">
                      {new Date(v.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-2xs text-canopy-faint capitalize">{(v.setting || '').replace(/_/g, ' ')}</p>
                  </div>
                  <span className="pill bg-sage-100 text-canopy-subtle">{v.duration} min</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-canopy-faint">No recent visits.</p>
          )}
        </section>

        {/* Visit Schedule */}
        {data.nextVisitInfo && (
          <section className="card p-5">
            <h2 className="section-title mb-3">Visit Schedule</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-lime/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-canopy-text">{data.nextVisitInfo.frequency}</p>
                <p className="text-2xs text-canopy-faint">{data.nextVisitInfo.duration} per session</p>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-2xs text-canopy-faint">
            This portal is for informational purposes only. Always follow the guidance of your child&apos;s therapist.
          </p>
          <p className="text-2xs text-canopy-faint mt-1 opacity-60">Powered by SimpleSLP</p>
        </div>
      </div>
    </div>
  );
}
