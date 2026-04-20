'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PaymentBadge } from '@/components/portal/payment-badge';

interface Invoice {
  id: number;
  name: string;
  invoice_date: string | false;
  amount_total: number;
  amount_residual: number;
  payment_state: string;
  l10n_latam_document_type_id: [number, string] | false;
  l10n_latam_document_number: string | false;
  currency_id: [number, string];
  ref: string | false;
}

function formatCurrency(amount: number, currency: string = 'CLP'): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | false): string {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3.5">
        <div className="h-4 bg-slate-200 rounded w-28" />
        <div className="h-3 bg-slate-100 rounded w-20 mt-1.5" />
      </td>
      <td className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded w-24" /></td>
      <td className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded w-20" /></td>
      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 rounded w-24 ml-auto" /></td>
      <td className="px-4 py-3.5"><div className="h-4 bg-slate-100 rounded w-24 ml-auto" /></td>
      <td className="px-4 py-3.5"><div className="h-5 bg-slate-100 rounded-md w-20 mx-auto" /></td>
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 bg-slate-200 rounded w-28" />
        <div className="h-5 bg-slate-100 rounded-md w-20" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-20 mb-3" />
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="h-5 bg-slate-200 rounded w-24" />
        <div className="h-3 bg-slate-100 rounded w-16" />
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (searchQuery) params.set('q', searchQuery);
    if (paymentFilter) params.set('paymentState', paymentFilter);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);

    try {
      const res = await fetch(`/api/invoices?${params}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error('Error al cargar facturas');
      }

      const data = await res.json();
      setInvoices(data.invoices);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError('No se pudieron cargar las facturas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, paymentFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const hasActiveFilters = searchQuery || paymentFilter || dateFrom || dateTo;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Mis Facturas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {loading ? (
              <span className="inline-block h-4 w-32 bg-slate-200 rounded animate-pulse align-middle" />
            ) : (
              <>
                {total} factura{total !== 1 ? 's' : ''} encontrada
                {total !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export XLSX button */}
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (searchQuery) params.set('q', searchQuery);
              if (paymentFilter) params.set('paymentState', paymentFilter);
              if (dateFrom) params.set('dateFrom', dateFrom);
              if (dateTo) params.set('dateTo', dateTo);
              window.location.href = `/api/invoices/export?${params}`;
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="hidden sm:inline">Exportar XLSX</span>
            <span className="sm:hidden">XLSX</span>
          </button>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-sky-500" />
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por numero de factura o referencia..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 ${filtersOpen ? 'block' : 'hidden sm:block'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Estado de Pago
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
            >
              <option value="">Todos</option>
              <option value="paid">Pagada</option>
              <option value="not_paid">No Pagada</option>
              <option value="partial">Pago Parcial</option>
              <option value="in_payment">En Proceso</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
            />
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setPaymentFilter('');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium ring-1 ring-red-100 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Desktop Table - hidden on mobile */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Documento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        ) : invoices.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <svg
              className="mx-auto w-12 h-12 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-slate-900">
              No se encontraron facturas
            </p>
            <p className="mt-1 text-sm text-slate-500">
              No hay facturas que coincidan con los filtros seleccionados.
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setPaymentFilter('');
                  setDateFrom('');
                  setDateTo('');
                  setPage(1);
                }}
                className="mt-4 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monto Total
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => {
                const currencyCode =
                  inv.currency_id?.[1]?.split(' ')?.[0] || 'CLP';

                return (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/portal/invoices/${inv.id}`}
                        className="text-slate-900 group-hover:text-sky-700 font-semibold text-sm transition-colors"
                      >
                        {inv.l10n_latam_document_number || inv.name}
                      </Link>
                      {inv.ref && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {inv.ref}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-500">
                      {inv.l10n_latam_document_type_id
                        ? inv.l10n_latam_document_type_id[1]
                        : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-500 tabular-nums">
                      {formatDate(inv.invoice_date)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-900 text-right font-semibold tabular-nums">
                      {formatCurrency(inv.amount_total, currencyCode)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-right tabular-nums">
                      <span
                        className={
                          inv.amount_residual > 0
                            ? 'text-red-600 font-semibold'
                            : 'text-emerald-600 font-medium'
                        }
                      >
                        {formatCurrency(inv.amount_residual, currencyCode)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <PaymentBadge state={inv.payment_state} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination - desktop */}
        {pages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Pagina {page} de {pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-white hover:border-slate-300 transition-colors text-slate-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-white hover:border-slate-300 transition-colors text-slate-700"
              >
                Siguiente
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : invoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-12 px-4 text-center">
            <svg
              className="mx-auto w-10 h-10 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <p className="mt-3 text-sm font-medium text-slate-900">
              No se encontraron facturas
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Intente ajustar los filtros.
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setPaymentFilter('');
                  setDateFrom('');
                  setDateTo('');
                  setPage(1);
                }}
                className="mt-3 text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          invoices.map((inv) => {
            const currencyCode =
              inv.currency_id?.[1]?.split(' ')?.[0] || 'CLP';

            return (
              <Link
                key={inv.id}
                href={`/portal/invoices/${inv.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all active:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {inv.l10n_latam_document_number || inv.name}
                    </p>
                    {inv.ref && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {inv.ref}
                      </p>
                    )}
                  </div>
                  <PaymentBadge state={inv.payment_state} />
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {formatDate(inv.invoice_date)}
                  </span>
                  {inv.l10n_latam_document_type_id && (
                    <span className="text-slate-300">|</span>
                  )}
                  {inv.l10n_latam_document_type_id && (
                    <span className="truncate">
                      {inv.l10n_latam_document_type_id[1]}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-base font-bold text-slate-900 tabular-nums">
                    {formatCurrency(inv.amount_total, currencyCode)}
                  </p>
                  {inv.amount_residual > 0 && (
                    <p className="text-xs font-semibold text-red-600 tabular-nums">
                      Saldo: {formatCurrency(inv.amount_residual, currencyCode)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })
        )}

        {/* Pagination - mobile */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors text-slate-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Anterior
            </button>
            <span className="text-sm text-slate-500 font-medium">
              {page} / {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-colors text-slate-700"
            >
              Siguiente
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
