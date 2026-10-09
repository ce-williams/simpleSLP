'use client';

import { useEffect, useState } from 'react';
import { SourceBadge, VerificationBadge } from '@/components/source-badge';

interface Resource {
  id: string;
  title: string;
  author_or_org: string;
  source_type: string;
  citation_or_url: string | null;
  publication_date: string | null;
  topic_tags: string;
  evidence_summary: string;
  limitations: string | null;
  verification_status: string;
  last_checked: string | null;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', author_or_org: '', source_type: 'published_evidence',
    citation_or_url: '', publication_date: '', topic_tags: '',
    evidence_summary: '', limitations: '',
  });

  function loadResources() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sourceFilter) params.set('source_type', sourceFilter);
    fetch(`/api/resources?${params}`)
      .then(r => r.json())
      .then(data => { setResources(data); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadResources(); }, [search, sourceFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        topic_tags: form.topic_tags.split(',').map(t => t.trim()).filter(Boolean),
        citation_or_url: form.citation_or_url || null,
        publication_date: form.publication_date || null,
        limitations: form.limitations || null,
      }),
    });
    if (res.ok) { setShowForm(false); loadResources(); }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-sage-200 border-t-forest-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="page-title">Resource Library</h1>
          <p className="page-subtitle">{resources.length} {resources.length === 1 ? 'resource' : 'resources'}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? 'Cancel' : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add Resource
            </>
          )}
        </button>
      </div>

      <div className="bg-forest-950 rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-forest-50">OpenEvidence (Free Tier)</p>
            <p className="text-2xs text-canopy-faint mt-0.5">Search clinical evidence, guidelines, and peer-reviewed research. Free access to AI-summarized medical literature.</p>
          </div>
        </div>
        <a
          href="https://www.openevidence.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-forest-950 bg-lime rounded-full hover:bg-lime/90 transition-colors shrink-0"
        >
          Open
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
        </a>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-canopy-faint">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="input-field pl-10" />
        </div>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="input-field w-auto">
          <option value="">All sources</option>
          <option value="published_evidence">Published Evidence</option>
          <option value="therapist_experience">Therapist Experience</option>
          <option value="ai_generated">AI Generated</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="input-field" /></div>
            <div><label className="label">Author / Organization</label><input value={form.author_or_org} onChange={e => setForm({...form, author_or_org: e.target.value})} required className="input-field" /></div>
            <div><label className="label">Source Type</label>
              <select value={form.source_type} onChange={e => setForm({...form, source_type: e.target.value})} className="input-field">
                <option value="published_evidence">Published Evidence</option><option value="therapist_experience">Therapist Experience</option>
              </select></div>
            <div><label className="label">Publication Date</label><input value={form.publication_date} onChange={e => setForm({...form, publication_date: e.target.value})} placeholder="e.g. 2023" className="input-field" /></div>
          </div>
          <div><label className="label">Topic Tags (comma-separated)</label><input value={form.topic_tags} onChange={e => setForm({...form, topic_tags: e.target.value})} className="input-field" /></div>
          <div><label className="label">Evidence Summary</label><textarea value={form.evidence_summary} onChange={e => setForm({...form, evidence_summary: e.target.value})} required className="input-field" rows={3} /></div>
          <div><label className="label">Limitations</label><textarea value={form.limitations} onChange={e => setForm({...form, limitations: e.target.value})} className="input-field" rows={2} /></div>
          <p className="text-2xs text-canopy-faint">New resources are marked as &quot;unverified&quot; by default. Do not fabricate citations or URLs.</p>
          <button type="submit" className="btn-primary">Save Resource</button>
        </form>
      )}

      {resources.length === 0 ? (
        <div className="text-center py-16 card">
          <span className="w-12 h-12 rounded-2xl bg-canopy-highlight flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F7A55" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </span>
          <p className="text-sm text-canopy-subtle">No resources found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map(r => {
            const tags = JSON.parse(r.topic_tags || '[]');
            return (
              <div key={r.id} className="card p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-canopy-text">{r.title}</h3>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <SourceBadge type={r.source_type} />
                    <VerificationBadge status={r.verification_status} />
                  </div>
                </div>
                <p className="text-2xs text-canopy-faint mb-2">{r.author_or_org}{r.publication_date ? ` (${r.publication_date})` : ''}</p>
                <p className="text-sm text-canopy-muted leading-relaxed mb-2">{r.evidence_summary}</p>
                {r.limitations && (
                  <p className="text-2xs text-orange-500 mb-2 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                    {r.limitations}
                  </p>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">{tags.map((t: string, i: number) => (
                    <span key={i} className="pill bg-sage-100 text-canopy-subtle">{t}</span>
                  ))}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
