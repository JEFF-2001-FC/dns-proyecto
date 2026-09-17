export type AttendanceStatus = "present" | "late" | "absent" | "justified";

export const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string; short: string }[] = [
  { value: "present", label: "Presente", short: "P" },
  { value: "late", label: "Tarde", short: "T" },
  { value: "absent", label: "Falta", short: "F" },
  { value: "justified", label: "Justificado", short: "J" },
];

export type Option = { id: string; name: string };
export type ClanOption = Option & { color: string };

export type RosterItem = {
  id: string;
  fullName: string;
  lastName: string;
  status: "pending" | "active";
  clanId: string | null;
  clanName: string | null;
  clanColor: string | null;
  attendance: AttendanceStatus | null;
  isProvisional: boolean;
};

export type AttendanceContext = {
  isAdmin: boolean;
  agapes: Option[];
  meetingTypes: Option[];
  clans: ClanOption[];
  correctionDays: number;
};

export type ActionResult<T = undefined> =
  | { ok: true; message: string; data: T }
  | { ok: false; message: string };
