'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { SourceBadge } from '@/components/source-badge';

interface DocData {
  id: string;
  case_id: string;
  doc_type: string;
  title: string;
  content: string;
  status: string;
  version: number;
  previous_version_id: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Section {
  heading: string;
  content: string;
  source_records?: string[];
}

interface NoteContent {
  sections: Section[];
  unsupported_content?: Array<{ text: string; reason: string }>;
  knowledge_type: string;
}

export default function DocumentEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = params.id as string;
  const docId = searchParams.get('doc');
  const [doc, setDoc] = useState<DocData | null>(null);
  const [documents, setDocuments] = useState<DocData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [sessions, setSessions] = useState<Array<{ id: string; session_date: string; duration_minutes: number }>>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (docId) {
      fetch(`/api/documents?id=${docId}`)
        .then(r => r.json())
        .then(data => {
          setDoc(data);
          const content = JSON.parse(data.content);
          setSections(content.sections || [content]);
          setTitle(data.title);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch(`/api/documents?case_id=${caseId}`)
        .then(r => r.json())
        .then(data => { setDocuments(data); setLoading(false); })
        .catch(() => setLoading(false));

      fetch(`/api/cases/${caseId}`)
        .then(r => r.json())
        .then(data => setSessions(data.sessions || []))
        .catch(() => {});
    }
  }, [docId, caseId]);

  async function generateProgressNote() {
    if (!selectedSession) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/progress-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, sessionId: selectedSession }),
      });
      if (!res.ok) throw new Error('Failed to generate');
      const note = await res.json() as NoteContent;

      const saveRes = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          doc_type: 'progress_note',
          title: `Progress Note — ${sessions.find(s => s.id === selectedSession)?.session_date || 'Session'}`,
          content: note,
        }),
      });
      if (saveRes.ok) {
        const saved = await saveRes.json();
        window.location.href = `/cases/${caseId}/documents?doc=${saved.id}`;
      }
    } catch {
      setMessage('Failed to generate progress note');
    } finally {
      setGenerating(false);
    }
  }

  async function saveDoc() {
    if (!doc) return;
    setSaving(true);
    const content = { sections, knowledge_type: 'ai_generated' };
    const res = await fetch('/api/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc.id, title, content }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDoc(updated);
      setMessage('Saved');
      setTimeout(() => setMessage(''), 2000);
    }
    setSaving(false);
  }

  async function approveDoc() {
    if (!doc) return;
    setSaving(true);
    const content = { sections, knowledge_type: 'ai_generated' };
    const res = await fetch('/api/documents', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc.id, title, content, action: 'approve' }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDoc(updated);
      setMessage('Document approved');
    }
    setSaving(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-sage-200 border-t-forest-900 rounded-full animate-spin" />
    </div>
  );

  if (!docId) {
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <a href="/cases" className="text-2xs text-canopy-faint hover:text-forest-900 transition-colors">Patients</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-300"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          <a href={`/cases/${caseId}`} className="text-2xs text-canopy-faint hover:text-forest-900 transition-colors">Patient {caseId.slice(0, 8)}</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-300"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          <span className="text-2xs text-canopy-subtle">Documents</span>
        </div>

        <div className="page-header">
          <h1 className="page-title">Documents</h1>
        </div>

        <div className="card p-6 mb-6">
          <h3 className="section-title mb-3">Generate Progress Note</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="label">Select Session</label>
              <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} className="input-field">
                <option value="">Choose session...</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.session_date} ({s.duration_minutes} min)</option>)}
              </select>
            </div>
            <button onClick={generateProgressNote} disabled={!selectedSession || generating} className="btn-primary disabled:opacity-50">
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-forest-950/30 border-t-forest-950 rounded-full animate-spin" />
                  Generating...
                </>
              ) : 'Generate Note'}
            </button>
          </div>
          {message && <p className="text-sm text-red-600 mt-2">{message}</p>}
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 card">
            <p className="text-sm text-canopy-faint">No documents yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(d => (
              <a key={d.id} href={`/cases/${caseId}/documents?doc=${d.id}`}
                className="block card p-6 group">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-canopy-text">{d.title}</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="pill bg-sage-100 text-canopy-subtle">{d.doc_type.replace('_', ' ')}</span>
                      <span className={`pill ${d.status === 'approved' ? 'bg-canopy-highlight text-forest-900' : d.status === 'locked' ? 'bg-blue-50 text-blue-600' : 'bg-lime-50 text-forest-950'}`}>{d.status}</span>
                      <span className="text-2xs text-canopy-faint">v{d.version}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-canopy-faint">{d.created_at?.slice(0, 10)}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sage-400 group-hover:text-forest-900 transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!doc) return <div className="card p-6 text-sm text-canopy-faint">Document not found.</div>;

  const isLocked = doc.status === 'locked';

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <a href={`/cases/${caseId}/documents`} className="text-2xs text-canopy-faint hover:text-forest-900 transition-colors">Documents</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-300"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        <span className="text-2xs text-canopy-subtle">{doc.title}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          {isLocked ? (
            <h1 className="page-title">{doc.title}</h1>
          ) : (
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="text-xl font-semibold text-canopy-text tracking-tight border-b border-transparent focus:border-forest-900 outline-none w-full bg-transparent" style={{ letterSpacing: '-0.02em' }} />
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="pill bg-sage-100 text-canopy-subtle">{doc.doc_type.replace('_', ' ')}</span>
            <span className={`pill ${doc.status === 'approved' ? 'bg-canopy-highlight text-forest-900' : doc.status === 'locked' ? 'bg-blue-50 text-blue-600' : 'bg-lime-50 text-forest-950'}`}>{doc.status}</span>
            <span className="text-2xs text-canopy-faint">v{doc.version}</span>
            <SourceBadge type="ai_generated" />
          </div>
        </div>
        {!isLocked && (
          <div className="flex gap-2 no-print">
            <button onClick={saveDoc} disabled={saving} className="btn-secondary disabled:opacity-50">Save Draft</button>
            <button onClick={approveDoc} disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-forest-900 text-white rounded-full hover:bg-forest-800 transition-colors disabled:opacity-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              Approve
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="flex items-center gap-2 text-sm text-forest-900 mb-4 no-print">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          {message}
        </div>
      )}

      {isLocked && (
        <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 mb-5 flex items-start gap-3 no-print">
          <span className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </span>
          <p className="text-sm text-blue-700">
            This document is locked. Approved on {doc.approved_at?.slice(0, 10)} by {doc.approved_by}. Editing creates a new version.
          </p>
        </div>
      )}

      <div className="bg-lime-50 border border-lime-200 rounded-2xl p-5 mb-6 flex items-start gap-3 no-print">
        <span className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </span>
        <p className="text-2xs text-canopy-subtle">AI-generated draft. All content requires clinician review before clinical use.</p>
      </div>

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="card p-6">
            <h3 className="section-title mb-2">{section.heading}</h3>
            {isLocked ? (
              <p className="text-sm text-canopy-muted leading-relaxed whitespace-pre-wrap">{section.content}</p>
            ) : (
              <textarea
                value={section.content}
                onChange={e => {
                  const updated = [...sections];
                  updated[idx] = { ...section, content: e.target.value };
                  setSections(updated);
                }}
                className="input-field"
                rows={Math.max(3, section.content.split('\n').length + 1)}
              />
            )}
            {section.source_records && section.source_records.length > 0 && (
              <p className="text-2xs text-canopy-faint mt-2">Sources: {section.source_records.join(', ')}</p>
            )}
          </div>
        ))}
      </div>

      {doc.previous_version_id && (
        <div className="mt-6 text-2xs text-canopy-faint no-print">
          Previous version: <a href={`/cases/${caseId}/documents?doc=${doc.previous_version_id}`} className="text-forest-900 hover:underline">{doc.previous_version_id.slice(0, 8)}</a>
        </div>
      )}
    </div>
  );
}
