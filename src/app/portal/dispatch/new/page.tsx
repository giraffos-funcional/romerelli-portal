'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchSelect } from '@/components/dispatch/search-select';
import { ProductLines, type ProductLine } from '@/components/dispatch/product-lines';
import { TransportFields, type TransportData } from '@/components/dispatch/transport-fields';
import { ContainerFields, type ContainerData } from '@/components/dispatch/container-fields';
import { ShipmentSelect } from '@/components/dispatch/shipment-select';

interface ShipmentOption {
  id: number;
  name: string;
  dus: string;
  containerLimit: number;
  containersUsed: number;
  state: string;
}

interface WarehouseOption {
  id: number;
  name: string;
}

interface CostCenterOption {
  id: number;
  name: string;
}

const TYPE_CONFIG: Record<string, { title: string; showPrice: boolean }> = {
  transfer: { title: 'Guia Sin Valor / Solo Traslado', showPrice: false },
  national: { title: 'Guia Venta Nacional', showPrice: true },
  export: { title: 'Guia de Exportacion', showPrice: true },
};

function DispatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const guideType = searchParams.get('type') || 'transfer';
  const config = TYPE_CONFIG[guideType] || TYPE_CONFIG.transfer;

  const [partner, setPartner] = useState<{ id: number; name: string } | null>(null);
  const [dateDispatch, setDateDispatch] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<ProductLine[]>([]);
  const [transport, setTransport] = useState<TransportData>({
    peso: '',
    patente: '',
    chofer: '',
    tipoMaterial: '',
    referencia: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Per-client fixed pricing for national type
  const [clientFixedPrice, setClientFixedPrice] = useState<number | undefined>(undefined);

  // Export specific
  const [selectedShipment, setSelectedShipment] = useState<ShipmentOption | null>(null);
  const [containerData, setContainerData] = useState<ContainerData>({
    containerNumber: '',
    sealNumber: '',
    netWeight: '',
    tareWeight: '',
  });

  // Transfer specific — warehouses and cost centers
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterOption[]>([]);
  const [warehouseOriginId, setWarehouseOriginId] = useState('');
  const [warehouseDestId, setWarehouseDestId] = useState('');
  const [costCenterId, setCostCenterId] = useState('');

  // Fetch warehouses and cost centers for transfer type
  useEffect(() => {
    if (guideType === 'transfer') {
      fetch('/api/warehouses')
        .then((r) => r.json())
        .then((data) => setWarehouses(Array.isArray(data) ? data : []))
        .catch(() => {});
      fetch('/api/cost-centers')
        .then((r) => r.json())
        .then((data) => setCostCenters(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [guideType]);

  // Check per-client fixed pricing when partner changes
  const handlePartnerChange = useCallback((newPartner: { id: number; name: string } | null) => {
    setPartner(newPartner);
    if (newPartner && guideType === 'national') {
      // Fetch the full partner to check for fixedPrice
      fetch(`/api/partners?q=${encodeURIComponent(newPartner.name)}`)
        .then((r) => r.json())
        .then((partners: Array<{ id: number; fixedPrice?: number }>) => {
          const found = partners.find((p) => p.id === newPartner.id);
          if (found?.fixedPrice) {
            setClientFixedPrice(found.fixedPrice);
            setLines((prev) => prev.map((l) => ({ ...l, priceUnit: found.fixedPrice as number })));
          } else {
            setClientFixedPrice(undefined);
          }
        })
        .catch(() => setClientFixedPrice(undefined));
    } else {
      setClientFixedPrice(undefined);
    }
  }, [guideType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (guideType !== 'export' && lines.length === 0) {
      setError('Debe agregar al menos un producto');
      return;
    }
    if (!partner) {
      setError('Debe seleccionar un destinatario');
      return;
    }
    if (!transport.peso || parseFloat(transport.peso) <= 0) {
      setError('Debe ingresar el peso');
      return;
    }
    if (!transport.patente.trim()) {
      setError('Debe ingresar la patente');
      return;
    }
    if (!transport.chofer.trim()) {
      setError('Debe ingresar el nombre del chofer');
      return;
    }
    if (!transport.tipoMaterial) {
      setError('Debe seleccionar el tipo de material');
      return;
    }

    // Export validations
    if (guideType === 'export') {
      if (!selectedShipment) {
        setError('Debe seleccionar un embarque de exportacion');
        return;
      }
      if (!containerData.containerNumber.trim()) {
        setError('Debe ingresar el numero de contenedor');
        return;
      }
      if (!containerData.sealNumber.trim()) {
        setError('Debe ingresar el numero de sello');
        return;
      }
      if (!containerData.netWeight || parseFloat(containerData.netWeight) <= 0) {
        setError('Debe ingresar el peso neto del contenedor');
        return;
      }
      if (!containerData.tareWeight || parseFloat(containerData.tareWeight) <= 0) {
        setError('Debe ingresar la tara del contenedor');
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        guideType,
        partnerId: partner.id,
        dateDispatch,
        notes,
        peso: parseFloat(transport.peso),
        patente: transport.patente.trim(),
        chofer: transport.chofer.trim(),
        tipoMaterial: transport.tipoMaterial,
        referencia: transport.referencia.trim(),
        lines: guideType === 'export'
          ? [{ productId: 107, quantity: parseFloat(containerData.netWeight) || 0, priceUnit: 0, description: 'Export container', uomId: 1 }]
          : lines.map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              priceUnit: l.priceUnit,
              description: l.productName,
              uomId: 1,
            })),
      };

      if (guideType === 'national' && clientFixedPrice) {
        payload.useFixedPrice = true;
      }

      if (guideType === 'export') {
        payload.shipmentId = selectedShipment?.id;
        payload.containerNumber = containerData.containerNumber.trim();
        payload.sealNumber = containerData.sealNumber.trim();
        payload.netWeight = parseFloat(containerData.netWeight);
        payload.tareWeight = parseFloat(containerData.tareWeight);
      }

      if (guideType === 'transfer') {
        payload.warehouseOriginId = warehouseOriginId ? parseInt(warehouseOriginId, 10) : undefined;
        payload.warehouseDestId = warehouseDestId ? parseInt(warehouseDestId, 10) : undefined;
        payload.costCenterId = costCenterId ? parseInt(costCenterId, 10) : undefined;
      }

      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/portal/dispatch/success?name=${encodeURIComponent(data.guide?.name || 'GD')}&type=${guideType}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la guia');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Back + Title */}
      <Link
        href="/portal/dispatch"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 mb-6 transition-colors group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a tipos de guia
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
        {config.title}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Informacion General
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SearchSelect
              label="Destinatario"
              placeholder="Buscar por nombre o RUT..."
              apiUrl="/api/partners"
              value={partner}
              onChange={handlePartnerChange}
              secondaryField="vat"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Fecha de Despacho <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={dateDispatch}
                onChange={(e) => setDateDispatch(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Observaciones
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas adicionales para la guia..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 placeholder:text-slate-300 resize-none"
            />
          </div>
        </div>

        {/* Transport data — all guide types */}
        <TransportFields values={transport} onChange={setTransport} />

        {/* Transfer-specific: warehouses + cost center */}
        {guideType === 'transfer' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
              </svg>
              Bodegas y Centro de Costo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Bodega Origen
                </label>
                <select
                  value={warehouseOriginId}
                  onChange={(e) => setWarehouseOriginId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
                >
                  <option value="">Seleccionar...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Bodega Destino
                </label>
                <select
                  value={warehouseDestId}
                  onChange={(e) => setWarehouseDestId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
                >
                  <option value="">Seleccionar...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Centro de Costo
                </label>
                <select
                  value={costCenterId}
                  onChange={(e) => setCostCenterId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
                >
                  <option value="">Seleccionar...</option>
                  {costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>{cc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Export-specific: shipment selector + container fields */}
        {guideType === 'export' && (
          <>
            <div className="bg-white rounded-xl border border-emerald-200 p-5 sm:p-6 space-y-5">
              <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                </svg>
                Embarque de Exportacion
              </h2>
              <ShipmentSelect
                value={selectedShipment}
                onChange={setSelectedShipment}
                required
              />
            </div>
            <ContainerFields values={containerData} onChange={setContainerData} />
          </>
        )}

        {/* National-specific: per-client fixed price info */}
        {guideType === 'national' && clientFixedPrice && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-800">
                Precio fijo: ${clientFixedPrice}/kg (configurado para este cliente)
              </p>
              <p className="text-xs text-sky-600 mt-0.5">
                El precio se aplica automaticamente a todos los productos
              </p>
            </div>
          </div>
        )}

        {/* Product lines — not for export (export uses container) */}
        {guideType !== 'export' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
            <ProductLines
              lines={lines}
              onChange={setLines}
              showPrice={config.showPrice}
              fixedPrice={clientFixedPrice}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ring-1 ring-red-100">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Link
            href="/portal/dispatch"
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
              'Crear Guia de Despacho'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewDispatchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Cargando...</div>}>
      <DispatchForm />
    </Suspense>
  );
}
