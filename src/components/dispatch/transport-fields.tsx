'use client';

import { useEffect, useState } from 'react';

export interface TransportData {
  peso: string;
  patente: string;
  chofer: string;
  tipoMaterial: string;
  referencia: string;
}

interface TransportFieldsProps {
  values: TransportData;
  onChange: (values: TransportData) => void;
}

interface MaterialType {
  id: string;
  name: string;
}

export function TransportFields({ values, onChange }: TransportFieldsProps) {
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);

  useEffect(() => {
    fetch('/api/material-types')
      .then((r) => r.json())
      .then((data) => setMaterialTypes(data))
      .catch(() => {});
  }, []);

  function update(field: keyof TransportData, value: string) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-5 sm:p-6 space-y-5">
      <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75M3.375 14.25h1.5" />
        </svg>
        Datos de Transporte
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Peso */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Peso (kg) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={values.peso}
            onChange={(e) => update('peso', e.target.value)}
            placeholder="0"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 tabular-nums"
          />
        </div>

        {/* Patente */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Patente <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={values.patente}
            onChange={(e) => update('patente', e.target.value.toUpperCase())}
            placeholder="AA-BB-12"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 uppercase"
          />
        </div>

        {/* Chofer */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Chofer <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={values.chofer}
            onChange={(e) => update('chofer', e.target.value)}
            placeholder="Nombre del conductor"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
          />
        </div>

        {/* Tipo de Material */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Tipo de Material <span className="text-red-400">*</span>
          </label>
          <select
            value={values.tipoMaterial}
            onChange={(e) => update('tipoMaterial', e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
          >
            <option value="">Seleccionar...</option>
            {materialTypes.map((mt) => (
              <option key={mt.id} value={mt.id}>
                {mt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Referencia / N° Ticket */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Referencia (N° Ticket)
          </label>
          <input
            type="text"
            value={values.referencia}
            onChange={(e) => update('referencia', e.target.value)}
            placeholder="Ej: TKT-001"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
