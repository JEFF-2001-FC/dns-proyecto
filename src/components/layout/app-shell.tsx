import Link from "next/link";
import { Bell, CalendarDays, ClipboardCheck, LayoutDashboard, LogOut, Settings, ShieldAlert, Users, UsersRound } from "lucide-react";
import { signOut } from "@/features/auth/actions";

const nav = [
  ["/inicio", "Inicio", LayoutDashboard],
  ["/adolescentes", "Adolescentes", Users],
  ["/reuniones", "Reuniones", ClipboardCheck],
  ["/alertas", "Seguimiento", ShieldAlert],
  ["/calendario", "Calendario", CalendarDays],
  ["/eventos", "Eventos", CalendarDays],
  ["/clanes", "Clanes", UsersRound],
  ["/reportes", "Reportes", Settings]
] as const;

export function AppShell({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-100 px-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-xs font-black text-white">DNS</div>
          <div>
            <p className="font-semibold">DNS</p>
            <p className="text-[11px] text-zinc-500">Ministerio</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950">
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <Link href="/perfil" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100">
            <Settings className="h-4 w-4" /> Perfil
          </Link>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-100 p-4">
          <p className="truncate text-xs text-zinc-500">{userEmail}</p>
          <form action={signOut} className="mt-3">
            <button className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950">
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/90 px-5 backdrop-blur">
          <div className="font-semibold lg:hidden">DNS</div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/alertas" className="rounded-xl p-2 hover:bg-zinc-100" aria-label="Alertas"><Bell className="h-5 w-5" /></Link>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">Ministerio de Adolescentes</p>
              <p className="text-xs text-zinc-500">{userEmail}</p>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
