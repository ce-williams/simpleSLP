'use client';

import { useState } from 'react';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-canopy-faint hover:text-forest-100 transition-colors"
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {open ? (
            <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>
          ) : (
            <><path d="M4 8h16" /><path d="M4 16h16" /></>
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute top-14 left-0 right-0 bg-forest-950 border-t border-white/10 pb-3 px-4">
          <a href="/cases" className="block px-3 py-2.5 text-sm text-canopy-faint hover:text-forest-100 transition-colors">Patients</a>
          <a href="/resources" className="block px-3 py-2.5 text-sm text-canopy-faint hover:text-forest-100 transition-colors">Resources</a>
          <a href="/activities" className="block px-3 py-2.5 text-sm text-canopy-faint hover:text-forest-100 transition-colors">Activities</a>
          <a href="/insights" className="block px-3 py-2.5 text-sm text-canopy-faint hover:text-forest-100 transition-colors">Insights</a>
        </div>
      )}
    </div>
  );
}
