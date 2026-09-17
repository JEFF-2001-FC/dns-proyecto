import { requireRole } from "@/lib/auth/require-role";

export const metadata = { title: "Líderes · DNS" };

export default async function LideresPage() {
  await requireRole("admin"); // un líder que entre por URL vuelve a /inicio

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Administración
        </p>
        <h1 className="text-2xl font-bold text-zinc-900">Líderes</h1>
        <p className="text-sm text-zinc-500">
          Gestión de líderes y colaboradores del ministerio.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
        <h2 className="text-base font-semibold text-zinc-900">
          Módulo de administración
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Solo visible para administradores.
        </p>
      </div>
    </div>
  );
}
