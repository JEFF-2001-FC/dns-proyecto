export default function LideresPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          DNS
        </p>
        <h1 className="text-2xl font-bold text-zinc-900">Líderes</h1>
        <p className="text-sm text-zinc-500">
          Gestión de líderes y colaboradores del ministerio.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
        <h3 className="text-base font-semibold text-zinc-900">
          Módulo preparado
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          La base de datos y la arquitectura ya contemplan este módulo.
        </p>
      </div>
    </div>
  );
}
