import { ImageResponse } from "next/og";
import { dnsIconDataUri } from "@/components/shared/dns-logo-svg";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ícono para "Agregar a pantalla de inicio" en el celular. */
export default function AppleIcon() {
  return new ImageResponse(<img src={dnsIconDataUri()} width={180} height={180} alt="" />, size);
}