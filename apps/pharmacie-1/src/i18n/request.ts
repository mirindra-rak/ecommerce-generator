import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { resolveLocale } from "./locale";

// Configuration par requête : résout la locale active et charge le catalogue de messages
// correspondant.
// - Storefront : la locale vient du segment `[locale]` (`requestLocale`).
// - Back-office `/admin` (hors arbre `[locale]`) : `requestLocale` est absent → on lit le
//   cookie de préférence `NEXT_LOCALE`.
// `cookies()` n'est appelé QUE pour l'admin (requestLocale absent) afin de préserver le
// rendu statique du storefront (l'accès aux cookies rendrait les routes `[locale]` dynamiques).
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const cookieLocale = requested ? null : (await cookies()).get("NEXT_LOCALE")?.value;
  const locale = resolveLocale(requested, cookieLocale);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
