'use client';

import { useState, useEffect } from 'react';

export interface ProductLine {
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  uomName: string;
  priceUnit: number;
}

interface ProductLinesProps {
  lines: ProductLine[];
  onChange: (lines: ProductLine[]) => void;
  showPrice: boolean;
  fixedPrice?: number;
}

interface Product {
  id: number;
  name: string;
  default_code: string | false;
  uom_id: [number, string];
}

export function ProductLines({ lines, onChange, showPrice, fixedPrice }: ProductLinesProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  function addProduct(product: Product) {
    const existing = lines.find((l) => l.productId === product.id);
    if (existing) {
      onChange(
        lines.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l
        )
      );
    } else {
      onChange([
        ...lines,
        {
          productId: product.id,
          productName: product.name,
          productCode: product.default_code || '',
          quantity: 1,
          uomName: product.uom_id[1],
          priceUnit: fixedPrice ?? 0,
        },
      ]);
    }
    setShowSearch(false);
    setSearchQuery('');
  }

  function updateLine(index: number, field: keyof ProductLine, value: number) {
    onChange(lines.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Productos <span className="text-red-400">*</span>
        </label>
        <button
          type="button"
          onClick={() => setShowSearch(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar Producto
        </button>
      </div>

      {/* Product search dropdown */}
      {showSearch && (
        <div className="mb-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full border border-sky-300 rounded-lg px-3 py-2.5 text-sm bg-sky-50/30 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            autoFocus
          />
          <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-lg max-h-48 overflow-y-auto">
            {products.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400">Sin resultados</div>
            ) : (
              products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                >
                  <span className="text-sm font-medium text-slate-800">{p.name}</span>
                  {p.default_code && (
                    <span className="text-xs text-slate-400 ml-2">[{p.default_code}]</span>
                  )}
                  <span className="text-xs text-slate-400 ml-2">({p.uom_id[1]})</span>
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Lines */}
      {lines.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
          <svg className="mx-auto w-10 h-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="text-sm text-slate-400">Agregue productos a la guía</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div
              key={`${line.productId}-${idx}`}
              className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 sm:p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{line.productName}</p>
                  {line.productCode && (
                    <p className="text-xs text-slate-400">[{line.productCode}]</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  className="shrink-0 text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
              <div className={`grid gap-3 ${showPrice ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Cantidad ({line.uomName})</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={line.quantity}
                    onChange={(e) => updateLine(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>
                {showPrice && (
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">
                      Precio Unit. {fixedPrice !== undefined && '(fijo)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={line.priceUnit}
                      onChange={(e) => updateLine(idx, 'priceUnit', parseFloat(e.target.value) || 0)}
                      disabled={fixedPrice !== undefined}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                )}
                {showPrice && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[11px] text-slate-400 mb-1 block">Subtotal</label>
                    <div className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-100 text-slate-600 font-medium">
                      ${(line.quantity * line.priceUnit).toLocaleString('es-CL')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
