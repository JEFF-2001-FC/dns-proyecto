"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { signOut } from "@/features/auth/actions";

const nav = [
  ["/inicio", "Inicio", LayoutDashboard],
  ["/adolescentes", "Adolescentes", Users],
  ["/reuniones", "Reuniones", ClipboardCheck],
  ["/alertas", "Seguimiento", ShieldAlert],
  ["/calendario", "Calendario", CalendarDays],
  ["/eventos", "Eventos", CalendarDays],
  ["/clanes", "Clanes", UsersRound],
  ["/reportes", "Reportes", Settings],
] as const;

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Overlay oscuro para pantallas móviles al abrir el menú */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar deslizable en móvil / fijo en escritorio */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-xs font-black text-white">
              DNS
            </div>
            <div>
              <p className="font-semibold">DNS</p>
              <p className="text-[11px] text-zinc-500">Ministerio</p>
            </div>
          </div>
          {/* Botón para cerrar menú en móvil */}
          <button
            onClick={closeMenu}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <Link
            href="/perfil"
            onClick={closeMenu}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
          >
            <Settings className="h-4 w-4" /> Perfil
          </Link>
        </nav>

        <div className="border-t border-zinc-100 p-4">
          <p className="truncate text-xs text-zinc-500">{userEmail}</p>
          <form action={signOut} className="mt-3">
            <button className="flex w-full items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950">
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Ámbito principal y header */}
      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/90 px-5 backdrop-blur">
          <div className="flex items-center gap-3 lg:hidden">
            {/* Botón hamburguesa exclusivo para móvil */}
            <button
              onClick={() => setIsOpen(true)}
              className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-semibold text-zinc-900">DNS</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/alertas"
              className="rounded-xl p-2 hover:bg-zinc-100"
              aria-label="Alertas"
            >
              <Bell className="h-5 w-5" />
            </Link>
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
