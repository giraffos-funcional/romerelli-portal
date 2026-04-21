'use client';

import { useState, useEffect, use } from 'react';
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
  state: string;
  createdAt: string;
}

interface Container {
  id: number;
  guideName: string;
  containerNumber: string;
  sealNumber: string;
  netWeight: number;
  tareWeight: number;
  createdAt: string;
}

const STATE_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Borrador', className: 'bg-slate-100 text-slate-600' },
  active: { label: 'Activo', className: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Cerrado', className: 'bg-amber-100 text-amber-700' },
};

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/export-shipments/${resolvedParams.id}`)
      .then((r) => r.json())
      .then((data) => {
        setShipment(data.shipment || null);
        setContainers(data.containers || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Cargando...</div>;
  }

  if (!shipment) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Embarque no encontrado</p>
        <Link href="/portal/dispatch/export-shipments" className="text-sky-600 hover:underline text-sm mt-2 inline-block">
          Volver a embarques
        </Link>
      </div>
    );
  }

  const badge = STATE_BADGES[shipment.state] || STATE_BADGES.draft;

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

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {shipment.name}
        </h1>
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Shipment info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
          Informacion del Embarque
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoField label="N DUS" value={shipment.dus} />
          <InfoField label="N Despacho" value={shipment.despacho} />
          <InfoField label="N Booking" value={shipment.booking} />
          <InfoField label="Orden de Venta" value={shipment.saleOrderName} />
          <InfoField label="Agencia de Aduana" value={shipment.customsAgencyName} />
          <InfoField
            label="Contenedores"
            value={`${shipment.containersUsed} / ${shipment.containerLimit}`}
          />
          <InfoField label="Fecha Creacion" value={shipment.createdAt} />
        </div>
      </div>

      {/* Containers */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
          Contenedores Registrados ({containers.length})
        </h2>

        {containers.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-400">No hay contenedores registrados en este embarque</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Guia</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">N Contenedor</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">N Sello</th>
                  <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Peso Neto (kg)</th>
                  <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tara (kg)</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {containers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{c.guideName}</td>
                    <td className="px-4 py-2.5 text-slate-600 font-mono text-xs">{c.containerNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600">{c.sealNumber}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">{c.netWeight.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">{c.tareWeight.toLocaleString('es-CL')}</td>
                    <td className="px-4 py-2.5 text-slate-500">{c.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}
