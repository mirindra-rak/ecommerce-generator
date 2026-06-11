import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.brand.name,
    template: `%s · ${siteConfig.brand.name}`,
  },
  description: `${siteConfig.brand.name} — parapharmacie en ligne.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
