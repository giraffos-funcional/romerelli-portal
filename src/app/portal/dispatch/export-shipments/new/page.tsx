'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SearchSelect } from '@/components/dispatch/search-select';

export default function NewExportShipmentPage() {
  const router = useRouter();
  const [dus, setDus] = useState('');
  const [despacho, setDespacho] = useState('');
  const [booking, setBooking] = useState('');
  const [saleOrder, setSaleOrder] = useState<{ id: number; name: string } | null>(null);
  const [customsAgency, setCustomsAgency] = useState<{ id: number; name: string } | null>(null);
  const [containerLimit, setContainerLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!saleOrder || !customsAgency) {
      setError('Debe seleccionar Orden de Venta y Agencia de Aduana');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/export-shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dus: dus.trim(),
          despacho: despacho.trim(),
          booking: booking.trim(),
          saleOrderId: saleOrder.id,
          customsAgencyId: customsAgency.id,
          containerLimit: parseInt(containerLimit, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push('/portal/dispatch/export-shipments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear embarque');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/portal/dispatch/export-shipments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-6 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a embarques
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
        Nuevo Embarque de Exportacion
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Datos del Embarque
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                N DUS <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={dus}
                onChange={(e) => setDus(e.target.value)}
                placeholder="DUS-2026-XXXX"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                N Despacho <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={despacho}
                onChange={(e) => setDespacho(e.target.value)}
                placeholder="DESP-XXXXX"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                N Booking <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={booking}
                onChange={(e) => setBooking(e.target.value)}
                placeholder="BK-XXX-2026-XXX"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Limite Contenedores <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={containerLimit}
                onChange={(e) => setContainerLimit(e.target.value)}
                placeholder="Ej: 5"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
              />
            </div>

            <SearchSelect
              label="Orden de Venta"
              placeholder="Buscar OV..."
              apiUrl="/api/sale-orders"
              value={saleOrder}
              onChange={setSaleOrder}
              required
            />

            <SearchSelect
              label="Agencia de Aduana"
              placeholder="Buscar agencia..."
              apiUrl="/api/partners"
              value={customsAgency}
              onChange={setCustomsAgency}
              secondaryField="vat"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ring-1 ring-red-100">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Link
            href="/portal/dispatch/export-shipments"
            className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 active:bg-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando...
              </>
            ) : (
              'Crear Embarque'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
