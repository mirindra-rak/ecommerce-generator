// Helpers SEO multilingue (story i18n 04). Centralise la construction des alternances de
// langue pour que le HTML (`hreflang` via `generateMetadata`) et le `sitemap.ts` partagent
// EXACTEMENT la même source — garantit la réciprocité et la cohérence exigées par le ticket.
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site";

// Construit le chemin préfixé par la locale. `routing.localePrefix` est verrouillé à
// "always" (cf. story 01) → toute URL est préfixée ; la racine devient `/<locale>`.
function localizedPath(pathname: string, locale: string): string {
  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export interface LocalizedAlternates {
  /** Canonique auto-référente : URL absolue de la page dans la locale courante. */
  canonical: string;
  /** `hreflang` : une URL absolue par locale supportée + `x-default`. */
  languages: Record<string, string>;
}

/**
 * Construit les alternances de langue d'une page à partir de son chemin logique
 * (sans préfixe de locale, ex. `/categorie/visage`). `localePrefix: "always"` ⇒ aucune URL
 * non préfixée n'existe : `x-default` pointe donc vers la `defaultLocale` préfixée.
 *
 * Assignable tel quel à `Metadata["alternates"]` (Next) et à `alternates` d'une entrée de
 * sitemap.
 */
export function alternatesFor(pathname: string, locale: string): LocalizedAlternates {
  const absolute = (loc: string) => `${siteUrl}${localizedPath(pathname, loc)}`;

  const languages: Record<string, string> = {};
  for (const loc of routing.locales) languages[loc] = absolute(loc);
  languages["x-default"] = absolute(routing.defaultLocale);

  return { canonical: absolute(locale), languages };
}
