import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser(); // sin sesión, sin perfil o inactivo → /login

  // Solo el admin ve Alertas: al líder no se le consulta ni se le muestra el contador
  let openAlerts = 0;
  if (user.role === "admin") {
    const supabase = await createClient();
    const { count } = await supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]);
    openAlerts = count ?? 0;
  }

  return (
    <AppShell
      user={{ email: user.email, full_name: user.full_name, role: user.role }}
      openAlerts={openAlerts}
    >
      {children}
    </AppShell>
  );
}
