import "./globals.css";

// Root layout volontairement minimal (passthrough). Le `<html>`/`<body>` est rendu par les
// sous-racines : `app/[locale]/layout.tsx` (storefront localisé, `lang` dynamique) et
// `app/admin/layout.tsx` (back-office, FR). L'import de `globals.css` ici applique les
// styles globalement aux deux arbres. Voir story i18n 01 (topologie des layouts).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
