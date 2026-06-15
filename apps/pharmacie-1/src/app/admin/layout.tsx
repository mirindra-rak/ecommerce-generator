import { IconProvider } from "@pharmacie/ui";
import { hanken } from "@/lib/fonts";

// Racine de rendu du back-office. Le storefront vit sous `app/[locale]` (préfixé) ; l'admin
// reste hors de l'arbre de locale (non préfixé, `noindex`). En V1 la langue est figée à FR ;
// l'internationalisation de l'admin (next-intl + sélecteur, sans préfixe) est la story 05.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={hanken.variable}>
      <body>
        <IconProvider weight="duotone">{children}</IconProvider>
      </body>
    </html>
  );
}
