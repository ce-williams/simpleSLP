'use client';

const BADGE_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  published_evidence: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Published Evidence' },
  therapist_experience: { bg: 'bg-canopy-highlight', text: 'text-forest-900', dot: 'bg-forest-900', label: 'Therapist Experience' },
  ai_generated: { bg: 'bg-lime-50', text: 'text-forest-950', dot: 'bg-lime', label: 'AI Generated' },
};

export function SourceBadge({ type }: { type: string }) {
  const style = BADGE_STYLES[type] || { bg: 'bg-sage-100', text: 'text-canopy-subtle', dot: 'bg-sage-600', label: type };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export function VerificationBadge({ status }: { status: string }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-medium bg-canopy-highlight text-forest-900">
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm2.854 4.646a.5.5 0 0 0-.708 0L7 8.793 5.854 7.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0 0-.708Z"/></svg>
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-medium bg-orange-50 text-orange-600">
      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 3a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 4Zm0 7a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"/></svg>
      Unverified
    </span>
  );
}
