import { requireSession } from '@/lib/session';
import Link from 'next/link';
import { DEMO_INVOICES } from '@/lib/demo-data';

const DEMO_PARTNER_ID = 9999;

async function getStats(partnerId: number) {
  if (partnerId === DEMO_PARTNER_ID) {
    const total = DEMO_INVOICES.length;
    const pending = DEMO_INVOICES.filter(
      (inv) => inv.payment_state !== 'paid'
    ).length;
    const totalPending = DEMO_INVOICES.filter(
      (inv) => inv.payment_state !== 'paid'
    ).reduce((sum, inv) => sum + inv.amount_residual, 0);
    const paid = DEMO_INVOICES.filter(
      (inv) => inv.payment_state === 'paid'
    ).length;
    return { total, pending, paid, totalPending };
  }
  // TODO: fetch from Odoo
  return { total: 0, pending: 0, paid: 0, totalPending: 0 };
}

function formatCLP(amount: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function PortalHome() {
  const session = await requireSession();
  const stats = await getStats(session.partnerId);

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Bienvenido, {session.partnerName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Portal de Proveedores — Romerelli SpA
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Facturas
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pendientes
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pagadas
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
            {stats.paid}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Saldo Pendiente
          </p>
          <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
            {formatCLP(stats.totalPending)}
          </p>
        </div>
      </div>

      {/* Module blocks */}
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
        Módulos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Facturas block */}
        <Link
          href="/portal/invoices"
          className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-sky-100 text-sky-600 mb-4 group-hover:scale-110 transition-transform">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-sky-700 transition-colors">
            Mis Facturas
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Consulta tus facturas, filtra por estado de pago y revisa los
            detalles de cada documento.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {stats.total} documentos
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Ver facturas
              <svg
                className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </div>
        </Link>

        {/* Guías de Despacho block */}
        <Link
          href="/portal/dispatch"
          className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75M3.375 14.25h1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors">
            Guías de Despacho
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Genera guías de despacho para traslados, ventas nacionales o
            exportaciones directamente desde el portal.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              3 tipos disponibles
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Crear guía
              <svg
                className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </div>
        </Link>

        {/* Estado de Cuenta block (coming soon) */}
        <div className="relative bg-white rounded-xl border border-slate-200 p-6 opacity-60">
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
              Próximamente
            </span>
          </div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-violet-100 text-violet-600 mb-4">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Estado de Cuenta
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Visualiza tu estado de cuenta consolidado, antigüedad de saldos y
            proyecciones de pago.
          </p>
          <span className="text-xs font-semibold text-slate-400">
            En desarrollo
          </span>
        </div>
      </div>
    </div>
  );
}
