'use client';

export interface ContainerData {
  containerNumber: string;
  sealNumber: string;
  netWeight: string;
  tareWeight: string;
}

interface ContainerFieldsProps {
  values: ContainerData;
  onChange: (values: ContainerData) => void;
}

export function ContainerFields({ values, onChange }: ContainerFieldsProps) {
  function update(field: keyof ContainerData, value: string) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="bg-white rounded-xl border border-emerald-200 p-5 sm:p-6 space-y-5">
      <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        Datos del Contenedor
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            N Contenedor <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={values.containerNumber}
            onChange={(e) => update('containerNumber', e.target.value.toUpperCase())}
            placeholder="Ej: MSCU-1234567"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 uppercase font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            N Sello <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={values.sealNumber}
            onChange={(e) => update('sealNumber', e.target.value.toUpperCase())}
            placeholder="Ej: SL-001122"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Peso Neto (kg) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={values.netWeight}
            onChange={(e) => update('netWeight', e.target.value)}
            placeholder="0"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 tabular-nums"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Tara Contenedor (kg) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={values.tareWeight}
            onChange={(e) => update('tareWeight', e.target.value)}
            placeholder="0"
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50/50 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-slate-700 tabular-nums"
          />
        </div>
      </div>
    </div>
  );
}
