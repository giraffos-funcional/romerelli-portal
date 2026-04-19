'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PaymentBadge } from '@/components/portal/payment-badge';

interface InvoiceLine {
  id: number;
  name: string;
  product_id: [number, string] | false;
  quantity: number;
  price_unit: number;
  price_subtotal: number;
  price_total: number;
  display_type: string;
}

interface InvoiceDetail {
  id: number;
  name: string;
  invoice_date: string | false;
  amount_total: number;
  amount_residual: number;
  amount_untaxed: number;
  amount_tax: number;
  payment_state: string;
  l10n_latam_document_type_id: [number, string] | false;
  l10n_latam_document_number: string | false;
  currency_id: [number, string];
  ref: string | false;
  lines: InvoiceLine[];
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

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 bg-slate-200 rounded w-32 mb-6" />

      {/* Header skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-7 bg-slate-200 rounded w-48" />
            <div className="h-4 bg-slate-100 rounded w-32 mt-2" />
          </div>
          <div className="h-6 bg-slate-100 rounded-md w-24" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="h-3 bg-slate-100 rounded w-16 mb-3" />
            <div className="h-6 bg-slate-200 rounded w-24" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80">
          <div className="h-4 bg-slate-200 rounded w-36" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="px-4 py-4 border-b border-slate-100 flex justify-between">
            <div className="h-4 bg-slate-100 rounded w-48" />
            <div className="h-4 bg-slate-200 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${params.id}`);
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (!res.ok) throw new Error('Error al cargar factura');
        const data = await res.json();
        setInvoice(data);
      } catch {
        setError('No se pudo cargar el detalle de la factura.');
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [params.id, router]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !invoice) {
    return (
      <div className="py-16 text-center">
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
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <p className="mt-4 text-sm font-medium text-slate-900">
          {error || 'Factura no encontrada'}
        </p>
        <Link
          href="/portal/invoices"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a Mis Facturas
        </Link>
      </div>
    );
  }

  const currencyCode = invoice.currency_id?.[1]?.split(' ')?.[0] || 'CLP';
  const productLines = invoice.lines.filter(
    (l) => l.display_type === 'product' || !l.display_type
  );

  return (
    <div>
      {/* Back link */}
      <Link
        href="/portal/invoices"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-6 transition-colors group"
      >
        <svg
          className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a Mis Facturas
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {invoice.l10n_latam_document_number || invoice.name}
              </h1>
              <PaymentBadge state={invoice.payment_state} />
            </div>
            {invoice.l10n_latam_document_type_id && (
              <p className="text-sm text-slate-500 mt-1">
                {invoice.l10n_latam_document_type_id[1]}
              </p>
            )}
            {invoice.ref && (
              <p className="text-sm text-slate-400 mt-0.5">
                Ref: {invoice.ref}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fecha
            </p>
          </div>
          <p className="text-lg font-bold text-slate-900 tabular-nums">
            {formatDate(invoice.invoice_date)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Neto
            </p>
          </div>
          <p className="text-lg font-bold text-slate-900 tabular-nums">
            {formatCurrency(invoice.amount_untaxed, currencyCode)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total
            </p>
          </div>
          <p className="text-lg font-bold text-slate-900 tabular-nums">
            {formatCurrency(invoice.amount_total, currencyCode)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Saldo Pendiente
            </p>
          </div>
          <p
            className={`text-lg font-bold tabular-nums ${
              invoice.amount_residual > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(invoice.amount_residual, currencyCode)}
          </p>
        </div>
      </div>

      {/* Line items - Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-slate-700 px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Detalle de Productos
        </h2>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Precio Unit.
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productLines.map((line) => (
              <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3.5 text-sm text-slate-900">
                  {line.product_id ? line.product_id[1] : line.name}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 text-right tabular-nums">
                  {line.quantity}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 text-right tabular-nums">
                  {formatCurrency(line.price_unit, currencyCode)}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-900 text-right font-semibold tabular-nums">
                  {formatCurrency(line.price_subtotal, currencyCode)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/80">
            <tr className="border-t border-slate-200">
              <td colSpan={3} className="px-5 py-2.5 text-sm text-right text-slate-500">
                Neto
              </td>
              <td className="px-5 py-2.5 text-sm text-right font-semibold text-slate-900 tabular-nums">
                {formatCurrency(invoice.amount_untaxed, currencyCode)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-5 py-2.5 text-sm text-right text-slate-500">
                Impuestos
              </td>
              <td className="px-5 py-2.5 text-sm text-right font-semibold text-slate-900 tabular-nums">
                {formatCurrency(invoice.amount_tax, currencyCode)}
              </td>
            </tr>
            <tr className="border-t border-slate-300">
              <td
                colSpan={3}
                className="px-5 py-3.5 text-sm text-right font-bold text-slate-700"
              >
                Total
              </td>
              <td className="px-5 py-3.5 text-right font-bold text-slate-900 text-base tabular-nums">
                {formatCurrency(invoice.amount_total, currencyCode)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Line items - Mobile Cards */}
      <div className="md:hidden">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Detalle de Productos
        </h2>
        <div className="space-y-3">
          {productLines.map((line) => (
            <div
              key={line.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {line.product_id ? line.product_id[1] : line.name}
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Cant.
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5 tabular-nums">
                    {line.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    P. Unit.
                  </p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5 tabular-nums">
                    {formatCurrency(line.price_unit, currencyCode)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Subtotal
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 tabular-nums">
                    {formatCurrency(line.price_subtotal, currencyCode)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Totals card - mobile */}
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-slate-300">Neto</span>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(invoice.amount_untaxed, currencyCode)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-slate-300">Impuestos</span>
              <span className="text-sm font-semibold tabular-nums">
                {formatCurrency(invoice.amount_tax, currencyCode)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-700">
              <span className="text-base font-bold">Total</span>
              <span className="text-lg font-bold tabular-nums">
                {formatCurrency(invoice.amount_total, currencyCode)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
