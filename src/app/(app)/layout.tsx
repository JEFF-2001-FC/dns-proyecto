import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(); // redirige si no hay sesión, perfil o está inactivo

  // RLS limita el conteo: el líder solo cuenta las alertas de su ágape
  const supabase = await createClient();
  const { count } = await supabase
    .from("alerts")
    .select("id", { count: "exact", head: true })
    .in("status", ["open", "in_progress"]);

  return (
    <AppShell user={{ email: user.email, full_name: user.full_name, role: user.role }} openAlerts={count ?? 0}>
      {children}
    </AppShell>
  );
}
