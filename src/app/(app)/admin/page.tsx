import { requireRole } from "@/lib/auth/require-role";

export default async function AdminPage() {
  await requireRole("admin");
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-500">Administración</p>
        <h1 className="text-3xl font-semibold">Panel administrativo</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Líderes", "Clanes y Ágapes", "Reglas de seguimiento", "Configuración", "Auditoría", "Exportaciones"].map((item) => (
          <div key={item} className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="font-medium">{item}</p>
            <p className="mt-1 text-sm text-zinc-500">Gestionar este módulo.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
