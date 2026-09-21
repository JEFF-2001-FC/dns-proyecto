"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { DnsLogo } from "@/components/shared/dns-logo";
import { LogoutButton } from "@/components/shared/logout-button";
import { RouteProgress } from "@/components/ui/top-progress";
import { ToastOnMount } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import type { SessionUser } from "@/lib/auth/require-user";
import { WELCOME_COOKIE } from "@/features/auth/constants";
import { AccountSheet } from "./account-sheet";
import {
  canSee,
  initials,
  isActivePath,
  navForRole,
  ROLE_LABEL,
} from "./nav-config";

type Props = {
  children: React.ReactNode;
  user: Pick<SessionUser, "email" | "full_name" | "role">;
  subtitle?: string;
  openAlerts: number;
  unreadNotifications: number;
  welcomeName?: string | null;
};

export function AppShell({
  children,
  user,
  subtitle,
  openAlerts,
  unreadNotifications,
  welcomeName,
}: Props) {
  const pathname = usePathname();
  const items = navForRole(user.role);
  const mobileItems = items.filter((i) => i.mobile);
  const extraItems = items.filter((i) => !i.mobile);
  const showAlerts = canSee(user.role, "/alertas");

  const displayName = user.full_name || user.email || "Usuario";
  const account = {
    name: displayName,
    email: user.email,
    subtitle: subtitle ?? ROLE_LABEL[user.role],
    initials: initials(displayName),
  };
  const alertsLabel = openAlerts > 99 ? "99+" : String(openAlerts);
  const notificationLabel = unreadNotifications > 99 ? "99+" : String(unreadNotifications);

  return (
    <div className="min-h-dvh bg-paper">
      <RouteProgress />
      {welcomeName !== undefined && welcomeName !== null && (
        <ToastOnMount
          title={welcomeName ? `¡Bienvenido, ${welcomeName}!` : "¡Bienvenido!"}
          description="Ya puedes empezar."
          clearCookie={WELCOME_COOKIE}
        />
      )}

      {/* ---------- Escritorio: barra lateral oscura ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink px-3.5 py-5 text-white lg:flex">
        <Link href="/inicio" className="flex items-center gap-3 px-2 pb-6">
          <DnsLogo className="h-11 w-11 text-white" title={null} />
          <span>
            <span className="block font-display text-[26px] font-extrabold leading-none">
              DNS
            </span>
            <span className="block text-xs text-[#A8A49C]">
              Ministerio de Adolescentes
            </span>
          </span>
        </Link>

        <nav aria-label="Principal" className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon, badge }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                  active
                    ? "bg-white font-semibold text-ink"
                    : "text-[#D6D3CC] hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                <span className="flex-1">{label}</span>
                {badge === "alerts" && openAlerts > 0 && (
                  <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-flame px-1.5 text-xs font-bold text-ink">
                    {alertsLabel}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-ink-soft pt-3.5">
          <Link
            href="/perfil"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-white/10"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-soft text-[13px] font-bold">
              {account.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {displayName}
              </span>
              <span className="block truncate text-xs text-[#A8A49C]">
                {account.subtitle}
              </span>
            </span>
          </Link>
          <LogoutButton user={account} />
        </div>
      </aside>

      {/* ---------- Celular: cabecera oscura ---------- */}
      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between bg-ink px-4 pt-[env(safe-area-inset-top)] text-white lg:hidden">
        <Link href="/inicio" className="flex items-center gap-2.5">
          <DnsLogo className="h-[34px] w-[34px] text-white" title={null} />
          <span className="font-display text-[22px] font-extrabold">DNS</span>
        </Link>
        <div className="flex items-center gap-2">
          {
            <Link
              href="/notificaciones"
              aria-label={
                unreadNotifications > 0 ? `Notificaciones: ${unreadNotifications} sin leer` : "Notificaciones"
              }
              className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"
            >
              <Bell className="h-5 w-5" aria-hidden />
              {unreadNotifications > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 text-[10px] font-bold text-ink">
                  {notificationLabel}
                </span>
              )}
            </Link>
          }
          <AccountSheet user={account} extraItems={extraItems} />
        </div>
      </header>

      {/* ---------- Escritorio: barra superior ---------- */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 hidden h-16 items-center justify-end gap-3 border-b border-line bg-paper/90 px-8 backdrop-blur lg:flex">
          {
            <Link
              href="/notificaciones"
              aria-label={
                unreadNotifications > 0 ? `Notificaciones: ${unreadNotifications} sin leer` : "Notificaciones"
              }
              className="relative grid h-11 w-11 place-items-center rounded-xl border border-line bg-white hover:bg-paper"
            >
              <Bell className="h-5 w-5" aria-hidden />
              {unreadNotifications > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-flame-dark px-1 text-[11px] font-bold text-white">
                  {notificationLabel}
                </span>
              )}
            </Link>
          }
        </div>

        <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 md:px-8 lg:pb-10 lg:pt-7">
          {children}
        </main>
      </div>

      {/* ---------- Celular: navegación inferior ---------- */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-line bg-white px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
        style={{
          gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))`,
        }}
      >
        {mobileItems.map(({ href, label, icon: Icon, badge }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-[72px] flex-col items-center justify-center gap-1 text-xs",
                active ? "font-bold text-ink" : "text-muted",
              )}
            >
              <span
                className={cn(
                  "relative grid h-[30px] w-[52px] place-items-center rounded-full transition-colors",
                  active && "bg-ink text-white",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {badge === "alerts" && openAlerts > 0 && (
                  <span className="absolute -top-1 right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-flame px-1 text-[10px] font-bold text-ink">
                    {alertsLabel}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
