export default function Dashboard() {
  return (
    <div>
      <section className="bg-forest-950 text-forest-100 rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-8 sm:py-12 mb-8 sm:mb-10 overflow-hidden relative">
        <div className="relative max-w-[640px]">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-lime border border-lime/30 px-3 py-1.5 rounded-full mb-6">
            Clinical Workspace
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold text-forest-50 mb-4" style={{ letterSpacing: '-0.035em', lineHeight: '1.05' }}>
            Better outcomes,<br />
            <span className="text-lime">less overgrowth.</span>
          </h1>
          <p className="text-base text-canopy-faint max-w-[480px] leading-relaxed">
            SimpleSLP brings patient records, treatment plans, visits, and evidence into one calm workspace — so you spend less time on paperwork and more time with patients.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/cases"
          className="group bg-forest-950 border border-forest-950 rounded-2xl p-7 transition-all duration-200"
        >
          <span className="w-11 h-11 rounded-xl bg-lime flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </span>
          <h2 className="text-lg font-semibold text-forest-50 mb-1.5" style={{ letterSpacing: '-0.02em' }}>Patients</h2>
          <p className="text-sm text-canopy-faint leading-relaxed">
            Manage patient records, episodes of care, treatment goals, and visit outcomes in one place.
          </p>
        </a>

        <a
          href="/resources"
          className="group bg-forest-950 border border-forest-950 rounded-2xl p-7 transition-all duration-200"
        >
          <span className="w-11 h-11 rounded-xl bg-lime flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </span>
          <h2 className="text-lg font-semibold text-forest-50 mb-1.5" style={{ letterSpacing: '-0.02em' }}>Resources</h2>
          <p className="text-sm text-canopy-faint leading-relaxed">
            Browse and organize evidence-based resources, clinical references, and therapy materials.
          </p>
        </a>

        <a
          href="/activities"
          className="group bg-forest-950 border border-forest-950 rounded-2xl p-7 transition-all duration-200"
        >
          <span className="w-11 h-11 rounded-xl bg-lime flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </span>
          <h2 className="text-lg font-semibold text-forest-50 mb-1.5" style={{ letterSpacing: '-0.02em' }}>Activity Studio</h2>
          <p className="text-sm text-canopy-faint leading-relaxed">
            Generate and refine therapy activities tailored to patient goals, interests, and developmental level.
          </p>
        </a>

        <a
          href="https://www.openevidence.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-forest-950 border border-forest-950 rounded-2xl p-7 transition-all duration-200"
        >
          <span className="w-11 h-11 rounded-xl bg-lime flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </span>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-lg font-semibold text-forest-50" style={{ letterSpacing: '-0.02em' }}>OpenEvidence</h2>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8F169" strokeWidth="2" className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          </div>
          <p className="text-sm text-canopy-faint leading-relaxed">
            Search clinical evidence, guidelines, and peer-reviewed research with AI-summarized medical literature. Free access.
          </p>
        </a>
      </div>
    </div>
  );
}
