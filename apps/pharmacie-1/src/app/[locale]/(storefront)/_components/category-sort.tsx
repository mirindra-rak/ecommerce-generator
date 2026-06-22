"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { SortKey } from "@/lib/category-listing";

// Sélecteur de tri du listing, piloté par l'URL (même pattern que `CategoryFilters`).
// Changer le tri remet `page` à 1 (sinon page hors borne) et préserve les filtres actifs.
const SORT_OPTIONS: {
  value: SortKey;
  key: "sortNew" | "sortPriceAsc" | "sortPriceDesc" | "sortName";
}[] = [
  { value: "new", key: "sortNew" },
  { value: "price-asc", key: "sortPriceAsc" },
  { value: "price-desc", key: "sortPriceDesc" },
  { value: "name", key: "sortName" },
];

export function CategorySort() {
  const t = useTranslations("categoryPage");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectId = useId();

  const current = searchParams.get("sort") ?? "new";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "new") params.delete("sort");
    else params.set("sort", value);
    params.delete("page"); // retour à la page 1 au changement de tri
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={selectId} className="text-sm text-muted">
        {t("sortLabel")}
      </label>
      <select
        id={selectId}
        value={current}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-sm border border-line bg-surface px-3 py-1.5 text-sm text-foreground"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.key)}
          </option>
        ))}
      </select>
    </div>
  );
}
