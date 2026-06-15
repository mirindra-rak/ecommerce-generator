"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { LanguageSwitcher as LanguageSwitcherPrimitive } from "@pharmacie/ui";
import { usePathname, useRouter } from "@/i18n/navigation";
import { siteConfig } from "@/lib/site";
import { localeLabel } from "@/lib/locale-label";

// Adaptateur storefront : câble la primitive `@pharmacie/ui` à next-intl. Au switch, on
// conserve la PAGE COURANTE — chemin (sans préfixe de locale, fourni par `@/i18n`) ET la
// querystring (facettes de catégorie). La locale n'est qu'un paramètre de navigation : le
// middleware (story 01) persiste le choix via le cookie `NEXT_LOCALE`.
export function LanguageSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const options = siteConfig.locale.supportedLocales.map((code) => ({
    value: code,
    label: localeLabel(code),
  }));

  function switchLocale(next: string) {
    if (next === locale) return;
    // `usePathname` (@/i18n) porte les segments dynamiques résolus, sans préfixe de locale ;
    // `searchParams` réinjecte les filtres (facettes catégorie) absents du pathname.
    const query = searchParams.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    startTransition(() => {
      router.replace(href, { locale: next });
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
