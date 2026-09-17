"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, UserRound, X } from "lucide-react";
import { LogoutButton } from "@/components/shared/logout-button";
import type { SessionUser } from "@/lib/auth/require-user";
import { canSee, isActivePath, navForRole, ROLE_LABEL } from "./nav-config";
import { DnsLogo } from "@/components/shared/dns-logo";

type Props = {
  children: React.ReactNode;
  user: Pick<SessionUser, "email" | "full_name" | "role">;
  openAlerts: number;
};

export function AppShell({ children, user, openAlerts }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const items = navForRole(user.role);
  const showAlerts = canSee(user.role, "/alertas");

  const current = items.find((i) => isActivePath(pathname, i.href));
  const displayName = user.full_name || user.email || "Usuario";

  // Cerrar con Escape y bloquear el scroll de fondo mientras el menú móvil está abierto
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);
  const alertsLabel = openAlerts > 99 ? "99+" : String(openAlerts);

  return (
    <div className="min-h-screen bg-zinc-50">
      {isOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar: fijo en escritorio, deslizable en móvil */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">
          <Link
            href="/inicio"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-950 text-xs font-black text-white">
              DNS
            </span>
            <span>
              <span className="block text-sm font-semibold text-zinc-900">
                Ministerio DNS
              </span>
              <span className="block text-[11px] text-zinc-500">
                Adolescentes
              </span>
            </span>
          </Link>
          <button
            onClick={closeMenu}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Principal" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {items.map(({ href, label, icon: Icon, badge }) => {
              const active = isActivePath(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-zinc-900 font-medium text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex-1">{label}</span>
                    {badge === "alerts" && openAlerts > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          active
                            ? "bg-white text-zinc-900"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {alertsLabel}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-1 border-t border-zinc-100 p-3">
          <Link
            href="/perfil"
            onClick={closeMenu}
            aria-current={
              isActivePath(pathname, "/perfil") ? "page" : undefined
            }
            className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-zinc-100"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600">
              <UserRound className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-zinc-900">
                {displayName}
              </span>
              <span className="block text-xs text-zinc-500">
                {ROLE_LABEL[user.role]}
              </span>
            </span>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={isOpen}
            aria-controls="app-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <p className="truncate font-semibold text-zinc-900 lg:hidden">
            {current?.label ?? "DNS"}
          </p>

          <div className="ml-auto flex items-center gap-2">
            {showAlerts && (
              <Link
                href="/alertas"
                className="relative rounded-xl p-2 text-zinc-600 hover:bg-zinc-100"
                aria-label={
                  openAlerts > 0 ? `Alertas: ${openAlerts} abiertas` : "Alertas"
                }
              >
                <Bell className="h-5 w-5" aria-hidden />
                {openAlerts > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {alertsLabel}
                  </span>
                )}
              </Link>
            )}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-900">{displayName}</p>
              <p className="text-xs text-zinc-500">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
