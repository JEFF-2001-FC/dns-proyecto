import {
  CalendarRange,
  ClipboardCheck,
  HeartHandshake,
  Bell,
  History,
  ListChecks,
  FolderDown,
  ChartNoAxesCombined,
  House,
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
  /** true = aparece en la barra inferior del celular; false = en el menú "Mi cuenta". */
  mobile: boolean;
  badge?: "alerts";
};

const ALL: AppRole[] = ["admin", "leader"];
const ADMIN: AppRole[] = ["admin"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/inicio", label: "Inicio", icon: House, roles: ALL, mobile: true },
  {
    href: "/asistencia",
    label: "Asistencia",
    icon: ClipboardCheck,
    roles: ALL,
    mobile: true,
  },
  {
    href: "/adolescentes",
    label: "Adolescentes",
    icon: Users,
    roles: ALL,
    mobile: true,
  },
  {
    href: "/lideres",
    label: "Líderes",
    icon: UserRoundCheck,
    roles: ADMIN,
    mobile: false,
  },
  {
    href: "/eventos",
    label: "Eventos",
    icon: CalendarRange,
    roles: ALL,
    mobile: true,
  },
  {
    href: "/alertas",
    label: "Alertas",
    icon: ShieldAlert,
    roles: ADMIN,
    mobile: true,
    badge: "alerts",
  },
  {
    href: "/reuniones",
    label: "Reuniones",
    icon: ListChecks,
    roles: ALL,
    mobile: false,
  },
  { href: "/materiales", label: "Materiales", icon: FolderDown, roles: ALL, mobile: false },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell, roles: ALL, mobile: false },
  { href: "/reportes", label: "Reportes", icon: ChartNoAxesCombined, roles: ADMIN, mobile: false },
  { href: "/auditoria", label: "Auditoría", icon: History, roles: ADMIN, mobile: false },
  {
    href: "/conexion",
    label: "Conexión",
    icon: HeartHandshake,
    roles: ADMIN,
    mobile: false,
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

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (
    (parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")
  ).toUpperCase();
}
