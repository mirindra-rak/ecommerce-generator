import { getCategoryFilters, getCategoryWithProducts } from "@/lib/catalog";
import { parseSort } from "@/lib/category-listing";
import { RichTextContent } from "@/components/rich-text-content";
import { Link } from "@/i18n/navigation";
import { alternatesFor } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CategoryFilters } from "../../_components/category-filters";
import { CategoryPagination } from "../../_components/category-pagination";
import { CategorySort } from "../../_components/category-sort";
import { ProductCard } from "../../_components/product-card";

export const dynamic = "force-dynamic";

// Paramètres d'URL réservés à l'état du listing (pas des codes de facette).
const RESERVED_PARAMS = new Set(["sort", "page"]);

/** Lit un numéro de page depuis l'URL (≥ 1) ; toute valeur invalide → page 1. */
function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(page) && page > 1 ? page : 1;
}

function categoryCoverUrl(coverImageKey: string | null): string | null {
  return coverImageKey ? `/uploads/${coverImageKey}` : null;
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const [data, t, sp] = await Promise.all([
    getCategoryWithProducts(slug),
    getTranslations({ locale, namespace: "categoryPage" }),
    searchParams,
  ]);
  // Canonique paginée (page conservée) mais SANS tri ni filtres (consolidation des signaux).
  const alternates = alternatesFor(`/categorie/${slug}`, locale, parsePage(sp.page));
  if (!data) return { title: t("notFound"), alternates };
  return {
    title: data.metaTitle ?? data.name,
    description: data.metaDescription ?? undefined,
    alternates,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("categoryPage");
  const sp = await searchParams;

  // Filtres bruts depuis l'URL (toute clé = facette potentielle, valeurs en CSV) ; on exclut
  // les paramètres réservés à l'état du listing (tri, pagination).
  const rawFilters: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(sp)) {
    if (RESERVED_PARAMS.has(key)) continue;
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

  const sort = parseSort(Array.isArray(sp.sort) ? sp.sort[0] : sp.sort);
  const page = parsePage(sp.page);

  const data = await getCategoryWithProducts(slug, { filters, sort, page });
  if (!data) notFound();
  const coverUrl = categoryCoverUrl(data.coverImageKey);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <nav className="text-sm text-muted">
        <Link href="/">{t("breadcrumbHome")}</Link>
        {data.breadcrumbs.map((category) => (
          <span key={category.slug}>
            {" "}
            <span className="px-1">/</span>{" "}
            <Link href={`/categorie/${category.slug}`}>{category.label}</Link>
          </span>
        ))}{" "}
        <span className="px-1">/</span> <span className="text-foreground">{data.name}</span>
      </nav>

      <div className="relative mt-3 flex h-40 items-end overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-brand-50 to-slate-100 p-6">
        {coverUrl && (
          <>
            <Image
              src={coverUrl}
              alt={data.name}
              fill
              priority
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-transparent" />
          </>
        )}
        <h1 className="relative text-3xl font-bold tracking-tight text-white drop-shadow-sm">
          {data.name}
        </h1>
      </div>

      {data.childCategories.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t("childCategoriesLabel")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {data.childCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/categorie/${category.slug}`}
                className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {data.description && <RichTextContent content={data.description} className="mt-4" />}

      <div className="mt-8 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
        {facets.length > 0 && (
          <aside className="mb-6 lg:mb-0 lg:sticky lg:top-50 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
            <CategoryFilters facets={facets} />
          </aside>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Compteur = total global de la catégorie (après filtres), pas la page courante. */}
            <p className="text-sm text-muted">{t("productCount", { count: data.total })}</p>
            <CategorySort />
          </div>

          {data.products.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-muted">
              {t("empty")}
            </p>
          ) : (
            <>
              <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
                {data.products.map((product) => (
                  <li key={product.slug}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
              <CategoryPagination page={data.page} totalPages={data.totalPages} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
