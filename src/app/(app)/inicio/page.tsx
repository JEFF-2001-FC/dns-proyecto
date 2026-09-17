import { requireUser } from "@/lib/auth/require-user";
import { greetingLima } from "@/lib/dates";
import {
  getAdminDashboard,
  getLeaderDashboard,
} from "@/features/dashboard/queries";
import { AdminDashboard } from "@/features/dashboard/components/admin-dashboard";
import { LeaderDashboard } from "@/features/dashboard/components/leader-dashboard";

export const metadata = { title: "Inicio · DNS" };

export default async function InicioPage() {
  const user = await requireUser();

  if (user.role === "admin") {
    const firstName = (user.full_name ?? "").trim().split(/\s+/)[0] ?? "";
    return (
      <AdminDashboard
        data={await getAdminDashboard()}
        greeting={greetingLima()}
        firstName={firstName}
      />
    );
  }

  return <LeaderDashboard data={await getLeaderDashboard(user.id)} />;
}
