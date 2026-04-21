import { requireSession } from '@/lib/session';
import { PortalNav } from '@/components/portal/portal-nav';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalNav
        partnerName={session.partnerName}
        vat={session.vat}
        sessionType={session.type}
        sessionRole={session.role}
        companyId={session.companyId}
        companyName={session.companyName}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
