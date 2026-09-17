import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { ImportWizard } from "@/features/adolescents/import/components/import-wizard";

export const metadata = { title: "Importar adolescentes · DNS" };

export default async function ImportarAdolescentesPage() {
  await requireUser();
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) redirect("/adolescentes");

  const [agapes, clans, relationships, courses] = await Promise.all([
    supabase.from("agapes").select("name").eq("active", true).order("name"),
    supabase.from("clans").select("name, slug").eq("active", true).order("sort_order"),
    supabase.from("guardian_relationships").select("name").eq("active", true).order("sort_order"),
    supabase.from("bible_school_courses").select("name").eq("active", true).order("sort_order"),
  ]);

  const catalogs = {
    agapes: (agapes.data ?? []).map((a) => a.name),
    clans: clans.data ?? [],
    relationships: (relationships.data ?? []).map((r) => r.name),
    courses: (courses.data ?? []).map((c) => c.name),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/adolescentes" className="text-sm text-zinc-500 underline-offset-4 hover:underline">Adolescentes</Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Importar desde Excel</h1>
        <p className="mt-2 max-w-prose text-zinc-500">
          Revisa la vista previa antes de importar. Los importados quedan activos con su ágape, clan y apoderado.
        </p>
      </div>

      {catalogs.agapes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <p className="font-medium">Primero crea los ágapes</p>
          <p className="mt-1 text-sm text-zinc-500">El Excel debe indicar un ágape existente para cada adolescente.</p>
        </div>
      ) : (
        <ImportWizard catalogs={catalogs} />
      )}
    </div>
  );
}
