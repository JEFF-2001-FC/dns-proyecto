const tz = "America/Lima";

export const fmtDate = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeZone: tz,
});
export const fmtDateTime = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: tz,
});
