import { requireRole } from "@/lib/auth/require-role";

export const metadata = { title: "Alertas · DNS" };

export default async function AlertasPage() {
  await requireRole("admin"); // un líder que entre por URL vuelve a /inicio

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-500">Administración</p>
        <h1 className="text-3xl font-semibold tracking-tight">Alertas</h1>
        <p className="mt-2 text-zinc-500">
          Revisa alertas generadas por patrones de inasistencia.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <p className="font-medium">Módulo preparado</p>
        <p className="mt-1 text-sm text-zinc-500">
          La base de datos y la arquitectura ya contemplan este dominio.
        </p>
      </div>
    </div>
  );
}
