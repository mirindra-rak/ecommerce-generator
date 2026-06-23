import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { searchStorefront } from "@/lib/search";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ locale }, sp] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "searchPage" });
  const query = getSingleParam(sp.q)?.trim() ?? "";

  return {
    title: query.length > 0 ? t("titleWithQuery", { query }) : t("title"),
  };
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const q = getSingleParam(sp.q)?.trim() ?? "";
  const [result, t, tCommon] = await Promise.all([
    searchStorefront({ query: q }),
    getTranslations("searchPage"),
    getTranslations("common"),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
          {q.length > 0 ? t("titleWithQuery", { query: q }) : t("title")}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {q.length > 0 ? t("resultCount", { count: result.total }) : t("emptyQueryHint")}
        </p>
      </div>

      {result.items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-line bg-surface px-6 py-10">
          <p className="text-lg font-semibold text-foreground">{t("emptyTitle")}</p>
          <p className="mt-2 max-w-2xl text-sm text-muted">{t("emptyBody")}</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-4">
          {result.items.map((item) => (
            <Link
              key={item.slug}
              href={`/produit/${item.slug}`}
              className="flex flex-col gap-3 rounded-3xl border border-line bg-paper px-6 py-5 transition-colors hover:border-brand-300 hover:bg-brand-50/30 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 truncate text-sm text-muted">
                  {item.brandName ?? t("productFallback")}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {item.priceLabel && (
                  <p className="text-lg font-semibold text-foreground">
                    {item.from && (
                      <span className="mr-1 text-sm font-normal text-muted">
                        {tCommon("priceFrom")}
                      </span>
                    )}
                    {item.priceLabel}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
