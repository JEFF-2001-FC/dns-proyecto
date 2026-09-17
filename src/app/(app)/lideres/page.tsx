import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";

export default async function LideresPage() {
  const user = await requireUser();

  // Si no es admin, lo rebota a inicio
  if (user?.role !== "admin") {
    redirect("/inicio");
  }

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
          Módulo de Administración
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Solo visible para usuarios administradores.
        </p>
      </div>
    </div>
  );
}
