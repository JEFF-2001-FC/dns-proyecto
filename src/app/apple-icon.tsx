import { ImageResponse } from "next/og";
import { DNS_LOGO_PATH } from "@/components/shared/dns-logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="60 20 840 840" width="180" height="180">
        <rect x="60" y="20" width="840" height="840" rx="180" fill="#000" />
        <g transform="translate(0,960) scale(0.1,-0.1)" fill="#fff">
          <path d={DNS_LOGO_PATH} />
        </g>
      </svg>
    ),
    size,
  );
}
