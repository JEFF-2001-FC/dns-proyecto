import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserRoundCheck,
  CalendarDays,
  AlertCircle,
  Menu,
} from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 border-r border-zinc-200 bg-white p-6 md:flex md:flex-col md:justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 font-bold text-white">
              DNS
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-semibold text-zinc-900 truncate">
                Ministerio DNS
              </h2>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              href="/inicio"
              className="flex items-center gap-3 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900"
            >
              <LayoutDashboard className="h-4 w-4" /> Inicio
            </Link>
            <Link
              href="/adolescentes"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <Users className="h-4 w-4" /> Adolescentes
            </Link>
            <Link
              href="/lideres"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <UserRoundCheck className="h-4 w-4" /> Líderes
            </Link>
            <Link
              href="/eventos"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <CalendarDays className="h-4 w-4" /> Eventos
            </Link>
            <Link
              href="/alertas"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <AlertCircle className="h-4 w-4" /> Alertas
            </Link>
          </nav>
        </div>
      </aside>

      {/* Content & Mobile Bar */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
              DNS
            </div>
            <span className="font-semibold text-zinc-900">DNS App</span>
          </div>
          <button className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
