'use client';

import { useState, useCallback } from 'react';

interface PiiMatch {
  type: string;
  start: number;
  end: number;
  matchedText: string;
}

interface PiiWarningProps {
  text: string;
  findings: PiiMatch[];
  onEdit: () => void;
  onConfirm: () => void;
}

export function PiiWarning({ text, findings, onEdit, onConfirm }: PiiWarningProps) {
  if (findings.length === 0) return null;

  const parts: Array<{ text: string; highlighted: boolean; type?: string }> = [];
  let lastEnd = 0;
  for (const f of findings) {
    if (f.start > lastEnd) {
      parts.push({ text: text.slice(lastEnd, f.start), highlighted: false });
    }
    parts.push({ text: text.slice(f.start, f.end), highlighted: true, type: f.type });
    lastEnd = f.end;
  }
  if (lastEnd < text.length) {
    parts.push({ text: text.slice(lastEnd), highlighted: false });
  }

  return (
    <div className="border border-orange-200 bg-orange-50/50 rounded-2xl p-5 mt-3">
      <div className="flex items-start gap-3 mb-3">
        <span className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-canopy-text text-sm">Possible PII detected</p>
          <p className="text-2xs text-canopy-subtle mt-0.5">
            Review the highlighted text below. Edit to remove PII or confirm this is synthetic data.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-3.5 text-sm border border-orange-100 mb-4 leading-relaxed">
        {parts.map((p, i) =>
          p.highlighted ? (
            <mark key={i} className="bg-orange-200/60 px-0.5 rounded" title={p.type?.replace(/_/g, ' ')}>
              {p.text}
            </mark>
          ) : (
            <span key={i}>{p.text}</span>
          )
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="btn-secondary text-sm">
          Edit text
        </button>
        <button
          onClick={onConfirm}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors"
        >
          Confirm synthetic data
        </button>
      </div>
    </div>
  );
}

export function usePiiGuard() {
  const [findings, setFindings] = useState<PiiMatch[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingText, setPendingText] = useState('');

  const checkText = useCallback(async (text: string): Promise<boolean> => {
    const { detectPii } = await import('@/lib/pii/patterns');
    const matches = detectPii(text);
    if (matches.length > 0) {
      setFindings(matches);
      setPendingText(text);
      setShowWarning(true);
      return false;
    }
    setFindings([]);
    setShowWarning(false);
    return true;
  }, []);

  const dismiss = useCallback(() => {
    setShowWarning(false);
    setFindings([]);
  }, []);

  return { findings, showWarning, pendingText, checkText, dismiss };
}
