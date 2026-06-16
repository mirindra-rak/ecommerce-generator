import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { IconProvider } from "@pharmacie/ui";
import { routing } from "@/i18n/routing";
import { hanken } from "@/lib/fonts";
import { siteConfig, siteUrl } from "@/lib/site";

// Racine de rendu du storefront localisé. Émet le `<html lang>` dynamique et expose les
// messages au sous-arbre client via NextIntlClientProvider. `generateStaticParams` +
// `setRequestLocale` activent le rendu statique par locale.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  // Base absolue des URLs de métadonnées (canoniques/alternates relatives résolues contre
  // l'origin du site, dérivé de la config — story i18n 04).
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.brand.name,
    template: `%s · ${siteConfig.brand.name}`,
  },
  description: `${siteConfig.brand.name} — parapharmacie en ligne.`,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={hanken.variable}>
      <body>
        <NextIntlClientProvider>
          <IconProvider weight="duotone">{children}</IconProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
