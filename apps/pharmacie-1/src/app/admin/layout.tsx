import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { IconProvider } from "@pharmacie/ui";
import { hanken } from "@/lib/fonts";

// Racine de rendu du back-office. Le storefront vit sous `app/[locale]` (préfixé) ; l'admin
// reste hors de l'arbre de locale (non préfixé). La langue est une PRÉFÉRENCE utilisateur
// résolue par cookie (`NEXT_LOCALE`, cf. `i18n/request.ts`), exposée au sous-arbre client via
// `NextIntlClientProvider`. Back-office `noindex` : aucun référencement (story i18n 05).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

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
