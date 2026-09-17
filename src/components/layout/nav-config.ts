import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Shield,
  ShieldAlert,
  UserRoundCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "@/lib/auth/require-user";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: AppRole[]; // sin roles = visible para todos
  badge?: "alerts";
};

export type NavGroup = { title: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { href: "/inicio", label: "Inicio", icon: LayoutDashboard },
      { href: "/asistencia", label: "Asistencia", icon: ClipboardCheck },
      { href: "/adolescentes", label: "Adolescentes", icon: Users },
      { href: "/reuniones", label: "Reuniones", icon: ClipboardList },
      { href: "/alertas", label: "Seguimiento", icon: ShieldAlert, badge: "alerts" },
    ],
  },
  {
    title: "Agenda",
    items: [
      { href: "/eventos", label: "Eventos", icon: CalendarRange },
      { href: "/calendario", label: "Calendario", icon: CalendarDays },
    ],
  },
  {
    title: "Ministerio",
    items: [
      { href: "/clanes", label: "Clanes", icon: UsersRound },
      { href: "/reportes", label: "Reportes", icon: BarChart3 },
    ],
  },
  {
    title: "Administración",
    items: [
      { href: "/admin", label: "Panel admin", icon: Shield, roles: ["admin"] },
      { href: "/lideres", label: "Líderes", icon: UserRoundCheck, roles: ["admin"] },
    ],
  },
];

export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrador",
  leader: "Líder",
};

export function navForRole(role: AppRole): NavGroup[] {
  return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.roles || i.roles.includes(role)) })).filter(
    (g) => g.items.length > 0,
  );
}

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
