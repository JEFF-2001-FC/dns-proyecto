export const TIMEZONE = "America/Lima";

/** Fecha de hoy en Lima como AAAA-MM-DD (sirve igual en servidor UTC y en el celular). */
export function todayLima(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

/** Suma días a una fecha AAAA-MM-DD sin depender de la zona horaria del equipo. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isIsoDate(value: string | undefined | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
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
