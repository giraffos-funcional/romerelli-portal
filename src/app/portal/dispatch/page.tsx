'use client';

import Link from 'next/link';

const GUIDE_TYPES = [
  {
    id: 'transfer',
    name: 'Sin Valor / Solo Traslado',
    description: 'Movimiento de mercaderia sin transaccion comercial. No incluye precios.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75M3.375 14.25h1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
    color: 'bg-slate-100 text-slate-600',
  },
  {
    id: 'national',
    name: 'Venta Nacional',
    description: 'Despacho con precio real o precio fijo segun el cliente.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    color: 'bg-sky-100 text-sky-600',
  },
  {
    id: 'export',
    name: 'Exportacion',
    description: 'Guia para envio al exterior. Se enlaza con embarque y contenedor.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    color: 'bg-emerald-100 text-emerald-600',
  },
];

export default function DispatchPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Guias de Despacho
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Seleccione el tipo de guia que desea generar
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {GUIDE_TYPES.map((type) => (
          <Link
            key={type.id}
            href={`/portal/dispatch/new?type=${type.id}`}
            className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-md transition-all duration-200"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${type.color} mb-4 group-hover:scale-110 transition-transform`}>
              {type.icon}
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
              {type.name}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {type.description}
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Crear guia
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Admin section: Export Shipments */}
      <div className="mt-10 pt-8 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
          Administracion
        </h2>
        <Link
          href="/portal/dispatch/export-shipments"
          className="group inline-flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
        >
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Embarques Export
            </h3>
            <p className="text-xs text-slate-500">
              Gestionar embarques y contenedores de exportacion
            </p>
          </div>
          <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
