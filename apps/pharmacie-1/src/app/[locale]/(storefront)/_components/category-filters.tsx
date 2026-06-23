"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { FilterFacetVM } from "@/lib/catalog";

interface CategoryFiltersProps {
  facets: FilterFacetVM[];
}

// Sidebar de filtres à facettes pilotée par l'URL (ET entre facettes, OU à l'intérieur).
export function CategoryFilters({ facets }: CategoryFiltersProps) {
  const t = useTranslations("categoryFilters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (facets.length === 0) return null;

  const selectedCodes = (facetCode: string): string[] =>
    searchParams.get(facetCode)?.split(",").filter(Boolean) ?? [];

  const hasActive = facets.some((facet) => selectedCodes(facet.code).length > 0);

  function toggle(facetCode: string, valueCode: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = selectedCodes(facetCode);
    const next = current.includes(valueCode)
      ? current.filter((code) => code !== valueCode)
      : [...current, valueCode];
    if (next.length) params.set(facetCode, next.join(","));
    else params.delete(facetCode);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const content = (
    <div className="space-y-6">
      {facets.map((facet) => (
        <div key={facet.code}>
          <p className="text-sm font-semibold text-foreground">{facet.name}</p>
          <ul className="mt-2 space-y-1.5">
            {facet.values.map((value) => {
              const checked = selectedCodes(facet.code).includes(value.code);
              // Valeur sans résultat (compte tenu des autres filtres) et non cochée → inerte.
              const disabled = value.count === 0 && !checked;
              return (
                <li key={value.code}>
                  <label
                    className={`flex items-center gap-2 text-sm ${
                      disabled ? "cursor-not-allowed text-muted/50" : "cursor-pointer text-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(facet.code, value.code)}
                      className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="flex-1">{value.label}</span>
                    <span className="text-xs tabular-nums text-muted/70">{value.count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {hasActive && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="cursor-pointer text-sm font-medium text-brand-700 hover:underline"
        >
          {t("reset")}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile : repliable */}
      <details className="rounded-sm border border-line p-4 lg:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          {t("title")}
        </summary>
        <div className="mt-4">{content}</div>
      </details>
      {/* Desktop : sidebar fixe */}
      <div className="hidden lg:block">{content}</div>
    </>
  );
}
