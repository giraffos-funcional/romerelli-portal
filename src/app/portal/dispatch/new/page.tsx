'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SearchSelect } from '@/components/dispatch/search-select';
import { ProductLines, type ProductLine } from '@/components/dispatch/product-lines';
import { TransportFields, type TransportData } from '@/components/dispatch/transport-fields';

const TYPE_CONFIG: Record<string, { title: string; showPrice: boolean; fixedPrice?: number }> = {
  transfer: { title: 'Guía Sin Valor / Solo Traslado', showPrice: false },
  national: { title: 'Guía Venta Nacional', showPrice: true },
  export: { title: 'Guía de Exportación', showPrice: true },
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

  // National specific
  const [useFixedPrice, setUseFixedPrice] = useState(false);

  // Export specific
  const [saleOrder, setSaleOrder] = useState<{ id: number; name: string } | null>(null);
  const [customsAgency, setCustomsAgency] = useState<{ id: number; name: string } | null>(null);
  const [destinationCountry, setDestinationCountry] = useState('');
  const [incoterm, setIncoterm] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) {
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

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideType,
          partnerId: partner.id,
          dateDispatch,
          notes,
          peso: parseFloat(transport.peso),
          patente: transport.patente.trim(),
          chofer: transport.chofer.trim(),
          tipoMaterial: transport.tipoMaterial,
          referencia: transport.referencia.trim(),
          lines: lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            priceUnit: l.priceUnit,
            description: l.productName,
            uomId: 1,
          })),
          ...(guideType === 'national' && { useFixedPrice }),
          ...(guideType === 'export' && {
            saleOrderId: saleOrder?.id,
            customsAgencyId: customsAgency?.id,
            destinationCountry,
            incoterm,
          }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/portal/dispatch/success?name=${encodeURIComponent(data.guide?.name || 'GD')}&type=${guideType}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la guía');
    } finally {
      setLoading(false);
    }
  }

  const fixedPriceValue = useFixedPrice ? 50 : undefined;

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
        Volver a tipos de guía
      </Link>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-6">
        {config.title}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Información General
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <SearchSelect
              label="Destinatario"
              placeholder="Buscar por nombre o RUT..."
              apiUrl="/api/partners"
              value={partner}
              onChange={setPartner}
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
              placeholder="Notas adicionales para la guía..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 placeholder:text-slate-300 resize-none"
            />
          </div>
        </div>

        {/* Transport data — all guide types */}
        <TransportFields values={transport} onChange={setTransport} />

        {/* Export-specific fields */}
        {guideType === 'export' && (
          <div className="bg-white rounded-xl border border-emerald-200 p-5 sm:p-6 space-y-5">
            <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
              </svg>
              Datos de Exportación
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  País de Destino <span className="text-red-400">*</span>
                </label>
                <select
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
                >
                  <option value="">Seleccionar...</option>
                  <option value="US">Estados Unidos</option>
                  <option value="DE">Alemania</option>
                  <option value="CN">China</option>
                  <option value="JP">Japón</option>
                  <option value="KR">Corea del Sur</option>
                  <option value="IN">India</option>
                  <option value="BR">Brasil</option>
                  <option value="PE">Perú</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Incoterm <span className="text-red-400">*</span>
                </label>
                <select
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
                >
                  <option value="">Seleccionar...</option>
                  <option value="FOB">FOB - Free on Board</option>
                  <option value="CIF">CIF - Cost, Insurance & Freight</option>
                  <option value="CFR">CFR - Cost and Freight</option>
                  <option value="EXW">EXW - Ex Works</option>
                  <option value="FCA">FCA - Free Carrier</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* National-specific: fixed price toggle */}
        {guideType === 'national' && (
          <div className="bg-white rounded-xl border border-sky-200 p-5 sm:p-6">
            <h2 className="text-sm font-bold text-sky-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Configuración de Precios
            </h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={useFixedPrice}
                  onChange={(e) => {
                    setUseFixedPrice(e.target.checked);
                    if (e.target.checked) {
                      setLines(lines.map((l) => ({ ...l, priceUnit: 50 })));
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-sky-500 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Usar precio fijo ($50 por unidad)</span>
                <p className="text-xs text-slate-400">Aplica un precio fijo de $50 CLP a todos los productos</p>
              </div>
            </label>
          </div>
        )}

        {/* Product lines */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
          <ProductLines
            lines={lines}
            onChange={setLines}
            showPrice={config.showPrice}
            fixedPrice={fixedPriceValue}
          />
        </div>

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
              'Crear Guía de Despacho'
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
