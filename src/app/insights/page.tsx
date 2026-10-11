'use client';

import { useEffect, useState } from 'react';

interface InsightsData {
  overview: {
    totalPatients: number;
    activePatients: number;
    totalGoals: number;
    totalSessions: number;
    totalOutcomes: number;
  };
  goalsByStatus: Record<string, number>;
  goalsByDomain: Record<string, number>;
  sessionsByMonth: Record<string, number>;
  barriersByCategory: Record<string, number>;
  topInterventions: { name: string; count: number }[];
  caseSummaries: {
    id: string;
    displayName: string;
    ageBand: string;
    setting: string;
    status: string;
    totalGoals: number;
    activeGoals: number;
    metGoals: number;
    totalSessions: number;
    totalBarriers: number;
    goalCompletionRate: number;
  }[];
}

const SETTING_LABELS: Record<string, string> = {
  home_health: 'Home Health', aba_center: 'ABA Center', outpatient_clinic: 'Outpatient Clinic',
  school: 'School', nursing_home: 'Nursing Home', hospital: 'Hospital',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  met: 'bg-green-100 text-green-800',
  discontinued: 'bg-gray-100 text-gray-600',
  modified: 'bg-amber-100 text-amber-800',
};

const PROGRESS_COLORS: Record<string, string> = {
  significant_progress: 'bg-green-500',
  moderate_progress: 'bg-lime-400',
  minimal_progress: 'bg-amber-400',
  maintained: 'bg-blue-400',
  regression: 'bg-red-400',
};

const BARRIER_COLORS: Record<string, string> = {
  patient: '#ef4444',
  environmental: '#f59e0b',
  systemic: '#6366f1',
  caregiver: '#06b6d4',
  equipment: '#8b5cf6',
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="text-2xs font-mono uppercase tracking-widest text-canopy-faint mb-1">{label}</p>
      <p className="text-2xl font-semibold text-canopy-text tracking-tight">{value}</p>
      {sub && <p className="text-2xs text-canopy-subtle mt-0.5">{sub}</p>}
    </div>
  );
}

function BarChart({ data, colorMap }: { data: Record<string, number>; colorMap?: Record<string, string> }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="space-y-2">
      {entries.map(([label, value]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="text-2xs text-canopy-subtle w-28 sm:w-36 truncate capitalize">{label.replace(/_/g, ' ')}</span>
          <div className="flex-1 bg-sage-100 rounded-full h-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(value / max) * 100}%`,
                backgroundColor: colorMap?.[label] || '#C8F169',
                minWidth: value > 0 ? '8px' : '0',
              }}
            />
          </div>
          <span className="text-sm font-medium text-canopy-text w-8 text-right">{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/insights')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-sage-200 border-t-forest-900 rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="card p-6 text-canopy-subtle text-sm">Unable to load insights.</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Outcome Intelligence</h1>
        <p className="page-subtitle">Cross-patient analytics and clinical insights across your caseload</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <StatCard label="Patients" value={data.overview.totalPatients} sub={`${data.overview.activePatients} active`} />
        <StatCard label="Goals" value={data.overview.totalGoals} />
        <StatCard label="Sessions" value={data.overview.totalSessions} />
        <StatCard label="Outcomes" value={data.overview.totalOutcomes} />
        <StatCard label="Avg Completion" value={`${data.caseSummaries.length > 0 ? Math.round(data.caseSummaries.reduce((s, c) => s + c.goalCompletionRate, 0) / data.caseSummaries.length) : 0}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Goals by Status */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Goals by Status</h2>
          <BarChart data={data.goalsByStatus} colorMap={{ active: '#3b82f6', met: '#22c55e', discontinued: '#9ca3af', modified: '#f59e0b' }} />
        </div>

        {/* Goals by Domain */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Goals by Domain</h2>
          <BarChart data={data.goalsByDomain} />
        </div>

        {/* Barriers */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Barriers by Category</h2>
          {Object.keys(data.barriersByCategory).length > 0 ? (
            <BarChart data={data.barriersByCategory} colorMap={BARRIER_COLORS} />
          ) : (
            <p className="text-sm text-canopy-faint">No barriers documented.</p>
          )}
        </div>

        {/* Top Interventions */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Top Interventions</h2>
          {data.topInterventions.length > 0 ? (
            <div className="space-y-2">
              {data.topInterventions.map((int, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-sage-100 last:border-0">
                  <span className="text-sm text-canopy-text truncate pr-3">{int.name}</span>
                  <span className="pill bg-sage-100 text-canopy-subtle shrink-0">{int.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-canopy-faint">No interventions recorded.</p>
          )}
        </div>
      </div>

      {/* Session Volume */}
      {Object.keys(data.sessionsByMonth).length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="section-title mb-4">Session Volume by Month</h2>
          <div className="flex items-end gap-1 sm:gap-2 h-32">
            {Object.entries(data.sessionsByMonth).map(([month, count]) => {
              const max = Math.max(...Object.values(data.sessionsByMonth), 1);
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-2xs font-medium text-canopy-text">{count}</span>
                  <div
                    className="w-full bg-lime rounded-t-md transition-all duration-500"
                    style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                  />
                  <span className="text-2xs text-canopy-faint truncate w-full text-center">{month.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Patient Comparison Table */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Patient Comparison</h2>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sage-200">
                <th className="text-left py-2 pr-4 text-2xs font-mono uppercase tracking-widest text-canopy-faint">Patient</th>
                <th className="text-left py-2 pr-4 text-2xs font-mono uppercase tracking-widest text-canopy-faint">Setting</th>
                <th className="text-center py-2 pr-4 text-2xs font-mono uppercase tracking-widest text-canopy-faint">Goals</th>
                <th className="text-center py-2 pr-4 text-2xs font-mono uppercase tracking-widest text-canopy-faint">Sessions</th>
                <th className="text-center py-2 text-2xs font-mono uppercase tracking-widest text-canopy-faint">Completion</th>
              </tr>
            </thead>
            <tbody>
              {data.caseSummaries.map(c => (
                <tr key={c.id} className="border-b border-sage-100 last:border-0">
                  <td className="py-2.5 pr-4">
                    <a href={`/cases/${c.id}`} className="text-forest-900 hover:text-forest-950 font-medium">
                      {c.displayName}
                    </a>
                    <span className="block text-2xs text-canopy-faint">Age {c.ageBand}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-canopy-subtle">{SETTING_LABELS[c.setting] || c.setting}</td>
                  <td className="py-2.5 pr-4 text-center">
                    <span className="text-canopy-text">{c.activeGoals}</span>
                    <span className="text-canopy-faint">/{c.totalGoals}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-center text-canopy-text">{c.totalSessions}</td>
                  <td className="py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-sage-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-lime transition-all"
                          style={{ width: `${c.goalCompletionRate}%` }}
                        />
                      </div>
                      <span className="text-2xs text-canopy-subtle w-8">{c.goalCompletionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-2 text-2xs text-canopy-faint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        <p>These analytics are derived from recorded session data and do not imply causation. Goal completion rates reflect documented status changes, not validated clinical outcomes. Always apply clinical judgment when interpreting trends.</p>
      </div>
    </div>
  );
}
