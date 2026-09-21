import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { AdolescentRegisterForm } from "@/features/adolescents/components/adolescent-register-form";

export const metadata = { title: "Registrar adolescente · DNS" };

export default async function NuevoAdolescentePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [clansResult, relationshipsResult] = await Promise.all([
    supabase.from("clans").select("id, name").eq("active", true).order("sort_order"),
    supabase.from("guardian_relationships").select("id, name").eq("active", true).order("sort_order"),
  ]);
  const agapes = user.role === "admin"
    ? ((await supabase.from("agapes").select("id, name").eq("active", true).order("name")).data ?? [])
    : ((await supabase.from("v_my_context").select("agape_id, agape_name").not("agape_id", "is", null)).data ?? []).flatMap((item) => item.agape_id && item.agape_name ? [{ id: item.agape_id, name: item.agape_name }] : []);
  return <div className="space-y-6"><PageHeader eyebrow="Adolescentes" title="Registrar adolescente" description={user.role === "admin" ? "El registro creado por administración queda activo de inmediato." : "El registro se enviará al administrador para su aprobación."} /><AdolescentRegisterForm agapes={agapes} clans={clansResult.data ?? []} relationships={relationshipsResult.data ?? []} /></div>;
}
