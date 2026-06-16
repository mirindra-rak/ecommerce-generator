"use server";

import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

// Persiste la préférence de langue du back-office (cookie `NEXT_LOCALE`, partagé avec le
// dispositif next-intl). Aucune URL préfixée pour l'admin : la langue est une préférence.
// Locale strictement whitelistée (pas d'écriture de cookie arbitraire).
export async function setAdminLocale(locale: string): Promise<void> {
  if (!hasLocale(routing.locales, locale)) return;
  (await cookies()).set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 an
    sameSite: "lax",
  });
}
