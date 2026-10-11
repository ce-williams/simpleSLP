export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        header.no-print, footer.no-print { display: none !important; }
        main { padding: 0 !important; max-width: none !important; }
      `}</style>
      {children}
    </>
  );
}
