'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { CompanySwitcher } from './company-switcher';

interface PortalNavProps {
  partnerName: string;
  vat: string;
  sessionType?: 'vendor' | 'dispatch';
  sessionRole?: 'cajera' | 'admin_comex';
  companyId?: number;
  companyName?: string;
}

interface NavLink {
  href: string;
  label: string;
  exact: boolean;
}

function getNavLinks(sessionType?: string, sessionRole?: string): NavLink[] {
  const links: NavLink[] = [
    { href: '/portal', label: 'Inicio', exact: true },
  ];

  if (!sessionType || sessionType === 'vendor') {
    // Supplier users see invoices only
    links.push({ href: '/portal/invoices', label: 'Mis Facturas', exact: false });
  }

  if (!sessionType || sessionType === 'dispatch' || sessionType === 'vendor') {
    // Dispatch users (both cajera and admin) see dispatch
    if (sessionType === 'dispatch' || sessionType === 'vendor' || !sessionType) {
      links.push({ href: '/portal/dispatch', label: 'Guias de Despacho', exact: false });
    }
  }

  if (sessionType === 'dispatch' && sessionRole === 'admin_comex') {
    links.push({ href: '/portal/dispatch/export-shipments', label: 'Embarques', exact: false });
  }

  // Vendors that aren't dispatch also get dispatch (for demo compatibility)
  if (sessionType === 'vendor') {
    // Already added above
  }

  return links;
}

const MOBILE_ICONS: Record<string, React.ReactNode> = {
  '/portal': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  '/portal/invoices': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  '/portal/dispatch': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75" />
    </svg>
  ),
  '/portal/dispatch/export-shipments': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
};

export function PortalNav({ partnerName, vat, sessionType, sessionRole, companyId, companyName }: PortalNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = getNavLinks(sessionType, sessionRole);
  const showCompanySwitcher = sessionType === 'dispatch';

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (sessionType === 'dispatch') {
      router.push('/login/dispatch');
    } else {
      router.push('/login');
    }
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo + desktop nav */}
          <div className="flex items-center gap-8">
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <svg
                  className="w-4.5 h-4.5 text-sky-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Romerelli
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href, link.exact);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'text-white bg-slate-800'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop user info */}
          <div className="hidden sm:flex items-center gap-4">
            {showCompanySwitcher && (
              <>
                <CompanySwitcher
                  currentCompanyId={companyId}
                  currentCompanyName={companyName}
                />
                <div className="w-px h-8 bg-slate-700" />
              </>
            )}
            <div className="text-right">
              <p className="text-sm font-medium text-white leading-tight">
                {partnerName}
              </p>
              {vat && <p className="text-xs text-slate-400">{vat}</p>}
              {sessionRole && (
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {sessionRole === 'admin_comex' ? 'Admin Comex' : 'Cajera'}
                </p>
              )}
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors font-medium flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              Salir
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-700/50 bg-slate-800/50">
          <div className="px-4 py-4 space-y-1">
            {/* User info */}
            <div className="pb-3 mb-2 border-b border-slate-700/50">
              <p className="text-sm font-semibold text-white">{partnerName}</p>
              {vat && <p className="text-xs text-slate-400 mt-0.5">{vat}</p>}
              {showCompanySwitcher && companyName && (
                <p className="text-xs text-sky-400 mt-1">{companyName}</p>
              )}
            </div>

            {/* Nav links */}
            {navLinks.map((link) => {
              const active = isActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-white bg-slate-700/70'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {MOBILE_ICONS[link.href] || MOBILE_ICONS['/portal']}
                  {link.label}
                </Link>
              );
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 text-slate-400 hover:text-red-400 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 text-sm font-medium transition-colors w-full text-left mt-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Cerrar Sesion
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
