import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const plexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SimpleSLP — Clinical Workspace',
  description: 'Clinical workspace for speech-language pathologists',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-forest-950 sticky top-0 z-50 no-print">
            <nav className="flex items-center justify-between max-w-[1240px] mx-auto px-6 h-16">
              <a href="/" className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-lime flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0C2B20" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21V11" /><path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7z" /><path d="M12 14c0-3-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-forest-100 tracking-tight">SimpleSLP</span>
              </a>
              <div className="flex items-center gap-1">
                <a href="/cases" className="px-4 py-2 text-sm text-canopy-faint rounded-full hover:bg-white/[0.08] hover:text-forest-100 transition-colors">Patients</a>
                <a href="/resources" className="px-4 py-2 text-sm text-canopy-faint rounded-full hover:bg-white/[0.08] hover:text-forest-100 transition-colors">Resources</a>
                <a href="/activities" className="px-4 py-2 text-sm text-canopy-faint rounded-full hover:bg-white/[0.08] hover:text-forest-100 transition-colors">Activities</a>
              </div>
            </nav>
          </header>
          <main className="flex-1 max-w-[1240px] mx-auto w-full px-6 py-8">
            {children}
          </main>
          <footer className="border-t border-sage-200 bg-sage-100 py-6 px-6 no-print">
            <div className="max-w-[1240px] mx-auto">
              <div className="flex items-start gap-3 bg-white/60 border border-sage-200 rounded-xl px-5 py-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-canopy-faint shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                <p className="text-2xs text-canopy-faint leading-relaxed">
                  <span className="font-semibold text-canopy-subtle">Prototype Only — Not for Clinical Use.</span>{' '}
                  SimpleSLP is a demonstration and prototyping application. It is not a medical device, is not FDA-cleared, and has not been validated for clinical decision-making. Do not enter real patient data or protected health information (PHI). This software is provided &ldquo;as is&rdquo; without warranty of any kind and shall not be used for diagnosis, treatment, or any other clinical purpose. The developers assume no liability for any use of this application. Always rely on licensed clinical judgment and approved clinical systems for patient care.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
