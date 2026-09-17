export const TIMEZONE = "America/Lima";

/** Fecha de hoy en Lima como AAAA-MM-DD (sirve igual en servidor UTC y en el celular). */
export function todayLima(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(
    new Date(),
  );
}

/** Suma días a una fecha AAAA-MM-DD sin depender de la zona horaria del equipo. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isIsoDate(value: string | undefined | null): value is string {
  return (
    !!value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T12:00:00Z`))
  );
}

export function formatLongDate(isoDate: string): string {
  const text = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Hora actual (0–23) en Lima. */
export function hourLima(): number {
  return (
    Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: TIMEZONE,
      }).format(new Date()),
    ) % 24
  );
}

/** "Buenos días" / "Buenas tardes" / "Buenas noches" según la hora de Lima. */
export function greetingLima(): string {
  const h = hourLima();
  if (h >= 5 && h < 12) return "Buenos días";
  if (h >= 12 && h < 19) return "Buenas tardes";
  return "Buenas noches";
}

/** Día de la semana (0 = domingo) de una fecha AAAA-MM-DD. */
export function weekdayOf(isoDate: string): number {
  return new Date(`${isoDate}T12:00:00Z`).getUTCDay();
}

export const WEEKDAYS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

/** "17:00:00" → "5:00 p. m." */
export function formatTime(time: string | null | undefined): string | null {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("es-PE", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
}
