import { defineRouting } from "next-intl/routing";
import { siteConfig } from "@/lib/site";

// Configuration du routing par locale. Les locales et la locale par défaut viennent
// de la config du site (`site.config.ts`) — cohérent Silo : un site = une config, jamais
// de locale en base. `localePrefix: "always"` → URLs uniformes (/fr/..., /en/...), requis
// pour des `hreflang` symétriques (story 04).
export const routing = defineRouting({
  locales: siteConfig.locale.supportedLocales,
  defaultLocale: siteConfig.locale.defaultLocale,
  localePrefix: "always",
});
