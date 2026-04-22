'use client';

import { useState, useRef, useEffect } from 'react';

interface Company {
  id: number;
  name: string;
}

interface CompanySwitcherProps {
  currentCompanyId?: number;
  currentCompanyName?: string;
}

export function CompanySwitcher({ currentCompanyId, currentCompanyName }: CompanySwitcherProps) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open || companies.length > 0) return;
    fetch('/api/auth/companies')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.companies)) setCompanies(data.companies);
      })
      .catch(() => {});
  }, [open, companies.length]);

  async function switchCompany(companyId: number) {
    if (companyId === currentCompanyId) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    try {
      const res = await fetch('/api/auth/switch-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      // ignore
    } finally {
      setSwitching(false);
      setOpen(false);
    }
  }

  const displayName = currentCompanyName || 'Romerelli SpA';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={switching}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        aria-label="Cambiar empresa"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
        </svg>
        <span className="hidden lg:inline truncate max-w-[160px]">{displayName}</span>
        <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cambiar empresa
            </p>
          </div>
          {companies.length === 0 && (
            <div className="px-3 py-3 text-xs text-slate-400">Cargando empresas...</div>
          )}
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => switchCompany(company.id)}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center justify-between ${
                company.id === currentCompanyId
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {company.name}
              {company.id === currentCompanyId && (
                <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
