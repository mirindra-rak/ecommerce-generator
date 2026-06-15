import { Hanken_Grotesk } from "next/font/google";

// Typographie unique : Hanken Grotesk (grotesque variable, corps + titres). Self-hosted via
// next/font (pas d'appel CDN au runtime). Instanciation partagée pour être consommée par les
// deux racines de rendu (storefront `[locale]` et back-office `admin`) sans double déclaration.
export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});
