import { DNS_LOGO_PATH } from "./dns-logo";

/** SVG completo (fondo negro redondeado + logo blanco) como data URI, para íconos generados. */
export function dnsIconDataUri(): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 20 840 840">` +
    `<rect x="60" y="20" width="840" height="840" rx="180" fill="#000"/>` +
    `<g transform="translate(0,960) scale(0.1,-0.1)" fill="#fff"><path d="${DNS_LOGO_PATH}"/></g></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
