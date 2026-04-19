export default function PortalLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="w-10 h-10 rounded-full border-[3px] border-slate-200" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-[3px] border-transparent border-t-sky-500 animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">Cargando...</p>
      </div>
    </div>
  );
}
