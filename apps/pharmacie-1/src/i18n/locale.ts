import { hasLocale } from "next-intl";
import { routing } from "./routing";

// Résolution de la locale active, partagée par les deux contextes de rendu :
// - storefront : la locale vient du segment d'URL `[locale]` (`requested`) ;
// - back-office `/admin` (hors arbre `[locale]`) : elle vient du cookie de préférence.
// Toute valeur hors `supportedLocales` retombe sur la locale par défaut (fallback
// déterministe — jamais de rendu d'une locale non supportée). Fonction pure → testable.
export function resolveLocale(requested?: string | null, cookie?: string | null): string {
  if (hasLocale(routing.locales, requested)) return requested;
  if (hasLocale(routing.locales, cookie)) return cookie;
  return routing.defaultLocale;
}
