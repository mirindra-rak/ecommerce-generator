import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategoryFilters, getCategoryWithProducts } from "@/lib/catalog";
import { CategoryFilters } from "../../_components/category-filters";
import { ProductCard } from "../../_components/product-card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const [data, t] = await Promise.all([
    getCategoryWithProducts(slug),
    getTranslations({ locale, namespace: "categoryPage" }),
  ]);
  if (!data) return { title: t("notFound") };
  return {
    title: data.metaTitle ?? data.name,
    description: data.metaDescription ?? undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("categoryPage");
  const sp = await searchParams;

  // Filtres bruts depuis l'URL (toute clé = facette potentielle, valeurs en CSV).
  const rawFilters: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(sp)) {
    const value = Array.isArray(val) ? val.join(",") : val;
    const codes = value ? value.split(",").filter(Boolean) : [];
    if (codes.length) rawFilters[key] = codes;
  }

  // Facettes + compteurs drill-down (les filtres inconnus sont ignorés en interne).
  const facets = await getCategoryFilters(slug, rawFilters);

  // Filtres restreints aux facettes réellement présentes pour la requête produits.
  const validCodes = new Set(facets.map((facet) => facet.code));
  const filters = Object.fromEntries(
    Object.entries(rawFilters).filter(([code]) => validCodes.has(code)),
  );

  const data = await getCategoryWithProducts(slug, filters);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <nav className="text-sm text-muted">
        <span>{t("breadcrumbHome")}</span> <span className="px-1">/</span>{" "}
        <span className="text-foreground">{data.name}</span>
      </nav>
      {/* Bandeau de couverture (placeholder CSS tant que l'upload d'images n'est pas branché) */}
      <div className="relative mt-3 flex h-40 items-end overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-slate-100 p-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{data.name}</h1>
      </div>

      {data.description && (
        // Rendu en texte échappé (pas de dangerouslySetInnerHTML) — sanitization riche = lot 9.4.
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {data.description}
        </p>
      )}

      <div className="mt-8 lg:flex lg:gap-8">
        {facets.length > 0 && (
          <aside className="mb-6 lg:mb-0 lg:w-64 lg:shrink-0">
            <CategoryFilters facets={facets} />
          </aside>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted">{t("productCount", { count: data.products.length })}</p>

          {data.products.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-muted">
              {t("empty")}
            </p>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
              {data.products.map((product) => (
                <li key={product.slug}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
