import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserRoundCheck,
  CalendarDays,
  AlertCircle,
  Check,
} from "lucide-react";
import { LogoutButton } from "@/components/shared/logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  // Comprobación de rol
  const isAdmin = user.role === "admin";

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
              {/* Etiqueta de Rol */}
              <span className="inline-block mt-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 capitalize">
                Rol: {user.role}
              </span>
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
              href="/asistencia"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <Check className="h-4 w-4" /> Asistencia
            </Link>

            <Link
              href="/adolescentes"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <Users className="h-4 w-4" /> Adolescentes
            </Link>

            {/* Módulos Exclusivos para Administradores */}
            {isAdmin && (
              <Link
                href="/lideres"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                <UserRoundCheck className="h-4 w-4" /> Líderes
              </Link>
            )}

            <Link
              href="/eventos"
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            >
              <CalendarDays className="h-4 w-4" /> Eventos
            </Link>

            {isAdmin && (
              <Link
                href="/alertas"
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              >
                <AlertCircle className="h-4 w-4" /> Alertas
              </Link>
            )}
          </nav>
        </div>

        <div className="border-t border-zinc-100 pt-4">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content & Mobile Navbar */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
              DNS
            </div>
            <span className="font-semibold text-zinc-900">DNS App</span>
          </div>
          <div className="w-32">
            <LogoutButton />
          </div>
        </header>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
