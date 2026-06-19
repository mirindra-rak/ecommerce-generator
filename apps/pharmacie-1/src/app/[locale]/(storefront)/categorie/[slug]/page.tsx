import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategoryFilters, getCategoryWithProducts } from "@/lib/catalog";
import { parseSort } from "@/lib/category-listing";
import { alternatesFor } from "@/lib/seo";
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
        <span>{t("breadcrumbHome")}</span> <span className="px-1">/</span>{" "}
        <span className="text-foreground">{data.name}</span>
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
