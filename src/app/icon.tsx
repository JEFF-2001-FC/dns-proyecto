import { ImageResponse } from "next/og";
import { dnsIconDataUri } from "@/components/shared/dns-logo-svg";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon generado desde el SVG del logo: no depende de ningún archivo de imagen. */
export default function Icon() {
  return new ImageResponse(<img src={dnsIconDataUri()} width={64} height={64} alt="" />, size);
}