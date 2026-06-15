import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Configuration par requête : résout la locale active et charge le catalogue de messages
// correspondant. Une locale hors `supportedLocales` retombe sur la locale par défaut
// (fallback déterministe, jamais de rendu d'une locale non supportée).
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
