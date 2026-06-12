import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { IconProvider } from "@pharmacie/ui";
import { siteConfig } from "@/lib/site";
import "./globals.css";

// Typographie unique : Hanken Grotesk (grotesque variable, corps + titres).
// Self-hosted via next/font (pas d'appel CDN au runtime). Exposée en variable CSS,
// consommée par les tokens --font-sans / --font-display.
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: siteConfig.brand.name,
    template: `%s · ${siteConfig.brand.name}`,
  },
  description: `${siteConfig.brand.name} — parapharmacie en ligne.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={hanken.variable}>
      <body>
        <IconProvider weight="duotone">{children}</IconProvider>
      </body>
    </html>
  );
}
