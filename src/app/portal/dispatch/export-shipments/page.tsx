'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Shipment {
  id: number;
  name: string;
  dus: string;
  despacho: string;
  booking: string;
  saleOrderName: string;
  customsAgencyName: string;
  containerLimit: number;
  containersUsed: number;
  state: 'draft' | 'active' | 'closed';
  createdAt: string;
}

const STATE_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Borrador', className: 'bg-slate-100 text-slate-600' },
  active: { label: 'Activo', className: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Cerrado', className: 'bg-amber-100 text-amber-700' },
};

export default function ExportShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterCapacity, setFilterCapacity] = useState<string>('all');

  useEffect(() => {
    fetch('/api/export-shipments')
      .then((r) => r.json())
      .then((data) => setShipments(data.shipments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visibleShipments = shipments.filter((s) => {
    if (filterState !== 'all' && s.state !== filterState) return false;
    if (filterCapacity === 'available' && s.containersUsed >= s.containerLimit) return false;
    if (filterCapacity === 'full' && s.containersUsed < s.containerLimit) return false;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      const hay = [s.name, s.dus, s.booking, s.despacho, s.saleOrderName, s.customsAgencyName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/portal/dispatch"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-3 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Volver
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Embarques de Exportacion
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestion de embarques y contenedores para exportacion
          </p>
        </div>
        <Link
          href="/portal/dispatch/export-shipments/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/25"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Embarque
        </Link>
      </div>

      {/* Filters */}
      {!loading && shipments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Buscar
            </label>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="DUS, booking, OV, agencia..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 placeholder:text-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Estado
            </label>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
            >
              <option value="all">Todos</option>
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Capacidad
            </label>
            <select
              value={filterCapacity}
              onChange={(e) => setFilterCapacity(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
            >
              <option value="all">Todas</option>
              <option value="available">Con cupo</option>
              <option value="full">Llenos</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : visibleShipments.length === 0 && shipments.length > 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-400">Ning&uacute;n embarque coincide con los filtros.</p>
          <button
            onClick={() => { setFilterQuery(''); setFilterState('all'); setFilterCapacity('all'); }}
            className="mt-2 text-xs font-semibold text-sky-600 hover:text-sky-700"
          >
            Limpiar filtros
          </button>
        </div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">No hay embarques registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Embarque</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">DUS</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Booking</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">OV</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Agencia</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contenedores</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleShipments.map((s) => {
                  const badge = STATE_BADGES[s.state] || STATE_BADGES.draft;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/portal/dispatch/export-shipments/${s.id}`} className="font-semibold text-sky-600 hover:text-sky-700">
                          {s.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{s.dus}</td>
                      <td className="px-4 py-3 text-slate-600">{s.booking}</td>
                      <td className="px-4 py-3 text-slate-600">{s.saleOrderName}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{s.customsAgencyName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-slate-700">{s.containersUsed}</span>
                        <span className="text-slate-400">/{s.containerLimit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
