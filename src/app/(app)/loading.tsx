export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-zinc-200" />
        <div className="h-8 w-56 rounded-lg bg-zinc-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-zinc-200 bg-white" />
        ))}
      </div>
      <div className="h-64 rounded-2xl border border-zinc-200 bg-white" />
    </div>
  );
}
