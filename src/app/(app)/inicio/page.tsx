import { requireUser } from "@/lib/auth/require-user";
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
    return <AdminDashboard data={await getAdminDashboard()} />;
  }

  return <LeaderDashboard data={await getLeaderDashboard(user.id)} />;
}
