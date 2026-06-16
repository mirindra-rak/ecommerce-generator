// Ré-export de la config du site pour un import propre via l'alias `@/lib/site`.
import siteConfig from "../../site.config";

export { siteConfig };

// Origin absolu du site (Silo : dérivé du domaine de la config, jamais d'une donnée en base).
// Surchargé par `NEXT_PUBLIC_SITE_URL` pour les environnements de préprod/staging. Sert de
// base aux canoniques, `hreflang` et au sitemap (story i18n 04).
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${siteConfig.brand.domain}`
).replace(/\/$/, "");
