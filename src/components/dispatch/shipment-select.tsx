'use client';

import { useState, useEffect, useRef } from 'react';

interface ShipmentOption {
  id: number;
  name: string;
  dus: string;
  containerLimit: number;
  containersUsed: number;
  state: string;
}

interface ShipmentSelectProps {
  value: ShipmentOption | null;
  onChange: (item: ShipmentOption | null) => void;
  required?: boolean;
}

export function ShipmentSelect({ value, onChange, required = false }: ShipmentSelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ShipmentOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/export-shipments');
        const data = await res.json();
        const shipments: ShipmentOption[] = (data.shipments || []).filter(
          (s: ShipmentOption) =>
            s.state === 'active' &&
            s.containersUsed < s.containerLimit &&
            (query === '' ||
              s.name.toLowerCase().includes(query.toLowerCase()) ||
              s.dus.toLowerCase().includes(query.toLowerCase()))
        );
        setResults(shipments);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open]);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        Embarque de Exportacion {required && <span className="text-red-400">*</span>}
      </label>

      {value ? (
        <div className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50">
          <div>
            <span className="text-sm font-medium text-slate-800">{value.name}</span>
            <span className="text-xs text-slate-400 ml-2">{value.dus}</span>
            <span className="text-xs text-emerald-600 ml-2">
              ({value.containerLimit - value.containersUsed} disponible{value.containerLimit - value.containersUsed !== 1 ? 's' : ''})
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Buscar embarque por nombre o DUS..."
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 placeholder:text-slate-300"
          required={required && !value}
        />
      )}

      {open && !value && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-slate-400">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">Sin embarques activos con capacidad</div>
          ) : (
            results.map((item) => {
              const remaining = item.containerLimit - item.containersUsed;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item);
                    setQuery('');
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{item.name}</span>
                      <span className="text-xs text-slate-400 ml-2">{item.dus}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">
                      {remaining}/{item.containerLimit}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
