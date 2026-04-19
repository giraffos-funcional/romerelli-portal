'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchSelectProps {
  label: string;
  placeholder: string;
  apiUrl: string;
  value: { id: number; name: string } | null;
  onChange: (item: { id: number; name: string } | null) => void;
  displayField?: string;
  secondaryField?: string;
  required?: boolean;
}

export function SearchSelect({
  label,
  placeholder,
  apiUrl,
  value,
  onChange,
  displayField = 'name',
  secondaryField,
  required = false,
}: SearchSelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<Record<string, unknown>>>([]);
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
        const res = await fetch(`${apiUrl}?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open, apiUrl]);

  function handleSelect(item: Record<string, unknown>) {
    const name = typeof item[displayField] === 'string'
      ? item[displayField] as string
      : Array.isArray(item[displayField])
        ? (item[displayField] as [number, string])[1]
        : String(item[displayField]);

    onChange({ id: item.id as number, name });
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {value ? (
        <div className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50/50">
          <span className="text-sm font-medium text-slate-800">{value.name}</span>
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
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 placeholder:text-slate-300"
          required={required && !value}
        />
      )}

      {open && !value && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-slate-400">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">Sin resultados</div>
          ) : (
            results.map((item) => {
              const mainText = typeof item[displayField] === 'string'
                ? item[displayField] as string
                : Array.isArray(item[displayField])
                  ? (item[displayField] as [number, string])[1]
                  : String(item[displayField]);
              const subText = secondaryField && item[secondaryField]
                ? String(item[secondaryField])
                : null;

              return (
                <button
                  key={item.id as number}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <span className="text-sm font-medium text-slate-800">{mainText}</span>
                  {subText && (
                    <span className="text-xs text-slate-400 ml-2">{subText}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
