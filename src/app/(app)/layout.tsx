import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { WELCOME_COOKIE } from "@/features/auth/constants";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser(); // sin sesión, sin perfil o inactivo → /login
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Aviso de bienvenida (cookie creada al iniciar sesión; el navegador la borra al mostrarlo)
  const welcomeRaw = cookieStore.get(WELCOME_COOKIE)?.value;
  const welcomeName =
    welcomeRaw === undefined ? null : decodeURIComponent(welcomeRaw);

  // Solo el admin ve Alertas; al líder se le muestra su ágape bajo el nombre
  let openAlerts = 0;
  let unreadNotifications = 0;
  let subtitle: string | undefined;

  if (user.role === "admin") {
    const { count } = await supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]);
    openAlerts = count ?? 0;
  } else {
    const { data } = await supabase
      .from("leaders")
      .select(
        "assignments:leader_agape_assignments(ended_on, agape:agapes(name))",
      )
      .eq("profile_id", user.id)
      .maybeSingle();
    const agape = data?.assignments?.find((a) => a.ended_on === null)?.agape
      ?.name;
    subtitle = agape ? `Líder · ${agape}` : "Líder";
  }
  const { count: unreadCount } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null);
  unreadNotifications = unreadCount ?? 0;

  return (
    <AppShell
      user={{ email: user.email, full_name: user.full_name, role: user.role }}
      subtitle={subtitle}
      openAlerts={openAlerts}
      unreadNotifications={unreadNotifications}
      welcomeName={welcomeName}
    >
      {children}
    </AppShell>
  );
}
