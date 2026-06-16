"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LanguageSwitcher as LanguageSwitcherPrimitive } from "@pharmacie/ui";
import { siteConfig } from "@/lib/site";
import { localeLabel } from "@/lib/locale-label";
import { setAdminLocale } from "../_actions/locale-action";

// Adaptateur back-office : câble la primitive `@pharmacie/ui` au mode « préférence » (pas de
// changement d'URL, contrairement au sélecteur storefront). Au switch, on persiste le cookie
// via la server action puis on rafraîchit les Server Components pour appliquer la locale.
export function AdminLanguageSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const options = siteConfig.locale.supportedLocales.map((code) => ({
    value: code,
    label: localeLabel(code),
  }));

  function switchLocale(next: string) {
    if (next === locale) return;
    startTransition(async () => {
      await setAdminLocale(next);
      router.refresh();
    });
  }

  return (
    <LanguageSwitcherPrimitive
      options={options}
      value={locale}
      onValueChange={switchLocale}
      ariaLabel={t("ariaLabel")}
      disabled={isPending}
    />
  );
}
