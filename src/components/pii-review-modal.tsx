'use client';

import { useState, useCallback } from 'react';
import type { PiiMatch } from '@/lib/pii/guard';

interface FieldFinding {
  fieldName: string;
  text: string;
  findings: PiiMatch[];
}

interface PiiReviewModalProps {
  fieldFindings: FieldFinding[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function PiiReviewModal({ fieldFindings, onConfirm, onCancel }: PiiReviewModalProps) {
  const totalFindings = fieldFindings.reduce((sum, f) => sum + f.findings.length, 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-elevated">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </span>
            <div>
              <h3 className="font-semibold text-canopy-text text-sm">PII Review Required</h3>
              <p className="text-2xs text-canopy-subtle mt-0.5">
                {totalFindings} potential identifier{totalFindings !== 1 ? 's' : ''} found across {fieldFindings.length} field{fieldFindings.length !== 1 ? 's' : ''}. Review before saving.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {fieldFindings.map((ff, idx) => (
              <div key={idx} className="bg-orange-50/50 border border-orange-100 rounded-xl p-4">
                <p className="section-title text-orange-600 mb-2">{ff.fieldName}</p>
                <div className="text-sm text-canopy-muted leading-relaxed">
                  <HighlightedText text={ff.text} findings={ff.findings} />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ff.findings.map((f, i) => (
                    <span key={i} className="pill bg-orange-200/60 text-orange-800">
                      {f.type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-canopy-highlight rounded-xl p-4 mb-5">
            <p className="text-2xs text-canopy-subtle">
              <span className="font-semibold text-canopy-text">HIPAA reminder:</span> Do not store real patient names, dates of birth, Social Security numbers, medical record numbers, or other identifiers. Use age bands, initials, or synthetic identifiers instead.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={onCancel} className="btn-secondary">Go Back &amp; Edit</button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors"
            >
              Confirm — Data is Synthetic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HighlightedText({ text, findings }: { text: string; findings: PiiMatch[] }) {
  const sorted = [...findings].sort((a, b) => a.start - b.start);
  const parts: Array<{ text: string; highlighted: boolean }> = [];
  let last = 0;
  for (const f of sorted) {
    if (f.start > last) parts.push({ text: text.slice(last, f.start), highlighted: false });
    parts.push({ text: text.slice(f.start, f.end), highlighted: true });
    last = f.end;
  }
  if (last < text.length) parts.push({ text: text.slice(last), highlighted: false });

  return (
    <>
      {parts.map((p, i) =>
        p.highlighted
          ? <mark key={i} className="bg-orange-200/60 px-0.5 rounded">{p.text}</mark>
          : <span key={i}>{p.text}</span>
      )}
    </>
  );
}

export function usePiiReview() {
  const [fieldFindings, setFieldFindings] = useState<FieldFinding[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const reviewAndSubmit = useCallback(async (
    fields: Array<{ name: string; value: string }>,
    onClean: () => void
  ) => {
    const { detectPii } = await import('@/lib/pii/patterns');
    const hits: FieldFinding[] = [];

    for (const field of fields) {
      if (!field.value) continue;
      const findings = detectPii(field.value);
      if (findings.length > 0) {
        hits.push({ fieldName: field.name, text: field.value, findings });
      }
    }

    if (hits.length === 0) {
      onClean();
    } else {
      setFieldFindings(hits);
      setPendingAction(() => onClean);
      setShowModal(true);
    }
  }, []);

  const confirm = useCallback(() => {
    setShowModal(false);
    pendingAction?.();
  }, [pendingAction]);

  const cancel = useCallback(() => {
    setShowModal(false);
    setPendingAction(null);
  }, []);

  return { fieldFindings, showModal, reviewAndSubmit, confirm, cancel };
}
