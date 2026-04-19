const PAYMENT_STATE_MAP: Record<string, { label: string; className: string; dotColor: string }> = {
  not_paid: {
    label: 'No Pagada',
    className: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    dotColor: 'bg-red-500',
  },
  in_payment: {
    label: 'En Proceso',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    dotColor: 'bg-amber-500',
  },
  paid: {
    label: 'Pagada',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    dotColor: 'bg-emerald-500',
  },
  partial: {
    label: 'Pago Parcial',
    className: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
    dotColor: 'bg-orange-500',
  },
  reversed: {
    label: 'Reversada',
    className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/20',
    dotColor: 'bg-slate-400',
  },
  invoicing_legacy: {
    label: 'Legacy',
    className: 'bg-slate-50 text-slate-500 ring-1 ring-slate-400/20',
    dotColor: 'bg-slate-400',
  },
};

export function PaymentBadge({ state }: { state: string }) {
  const config = PAYMENT_STATE_MAP[state] || {
    label: state,
    className: 'bg-slate-50 text-slate-500 ring-1 ring-slate-400/20',
    dotColor: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${config.className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotColor}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}
