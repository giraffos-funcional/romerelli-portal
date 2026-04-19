'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const TYPE_LABELS: Record<string, string> = {
  transfer: 'Traslado',
  national: 'Venta Nacional',
  export: 'Exportación',
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const guideName = searchParams.get('name') || 'GD-XXXXX';
  const guideType = searchParams.get('type') || 'transfer';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Guía Creada Exitosamente
        </h1>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6 inline-block">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Número de Guía</p>
          <p className="text-xl font-bold text-slate-900 tracking-wide">{guideName}</p>
          <p className="text-sm text-slate-500 mt-1">Tipo: {TYPE_LABELS[guideType] || guideType}</p>
        </div>

        <p className="text-sm text-slate-500 mb-8">
          La guía de despacho ha sido registrada en el sistema. Puede generar otra guía o volver al menú principal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/portal/dispatch"
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/25"
          >
            Crear Otra Guía
          </Link>
          <Link
            href="/portal"
            className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
