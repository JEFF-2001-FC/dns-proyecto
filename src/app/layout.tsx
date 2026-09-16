import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DNS | Ministerio de Adolescentes",
  description: "Gestión del Ministerio de Adolescentes DNS"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
