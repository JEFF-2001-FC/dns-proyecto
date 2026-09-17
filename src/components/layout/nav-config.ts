import {
  CalendarRange,
  ClipboardCheck,
  LayoutDashboard,
  ShieldAlert,
  UserRoundCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/lib/auth/require-user";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles que ven el enlace. Debe coincidir con el requireRole() de la página. */
  roles: AppRole[];
  badge?: "alerts";
};

const ALL: AppRole[] = ["admin", "leader"];
const ADMIN: AppRole[] = ["admin"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/inicio", label: "Inicio", icon: LayoutDashboard, roles: ALL },
  {
    href: "/asistencia",
    label: "Asistencia",
    icon: ClipboardCheck,
    roles: ALL,
  },
  { href: "/adolescentes", label: "Adolescentes", icon: Users, roles: ALL },
  { href: "/lideres", label: "Líderes", icon: UserRoundCheck, roles: ADMIN },
  { href: "/eventos", label: "Eventos", icon: CalendarRange, roles: ALL },
  {
    href: "/alertas",
    label: "Alertas",
    icon: ShieldAlert,
    roles: ADMIN,
    badge: "alerts",
  },
];

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador",
  leader: "Líder",
};

export function navForRole(role: AppRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function canSee(role: AppRole, href: string): boolean {
  return navForRole(role).some((item) => item.href === href);
}

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
