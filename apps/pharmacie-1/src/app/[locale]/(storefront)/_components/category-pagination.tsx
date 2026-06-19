"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";

interface CategoryPaginationProps {
  page: number;
  totalPages: number;
}

/** Fenêtre de pages autour de la page courante (±2), bornée à `[1, totalPages]`. */
function pageWindow(page: number, totalPages: number): number[] {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages: number[] = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
}

// Pagination du listing pilotée par l'URL. Liens crawlables (`<a>` via Link locale-aware) qui
// PRÉSERVENT le tri et les filtres actifs. Masquée s'il n'y a qu'une seule page.
export function CategoryPagination({ page, totalPages }: CategoryPaginationProps) {
  const t = useTranslations("categoryPage");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete("page");
    else params.set("page", String(target));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-sm border border-line px-3 text-sm text-foreground hover:bg-brand-50";
  const disabledClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-sm border border-line px-3 text-sm text-muted/40";

  return (
    <nav aria-label={t("pagPage", { page, total: totalPages })} className="mt-10">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} scroll={false} className={linkClass} rel="prev">
              {t("pagPrevious")}
            </Link>
          ) : (
            <span className={disabledClass} aria-disabled>
              {t("pagPrevious")}
            </span>
          )}
        </li>

        {pageWindow(page, totalPages).map((p) => (
          <li key={p}>
            {p === page ? (
              <span aria-current="page" className={`${linkClass} bg-brand-600 text-white`}>
                {p}
              </span>
            ) : (
              <Link href={hrefFor(p)} scroll={false} className={linkClass}>
                {p}
              </Link>
            )}
          </li>
        ))}

        <li>
          {page < totalPages ? (
            <Link href={hrefFor(page + 1)} scroll={false} className={linkClass} rel="next">
              {t("pagNext")}
            </Link>
          ) : (
            <span className={disabledClass} aria-disabled>
              {t("pagNext")}
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
