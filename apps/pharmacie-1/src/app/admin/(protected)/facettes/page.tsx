import { facetRepository } from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { FacettesTable } from "../_components/facettes-table";

export const dynamic = "force-dynamic";

export default async function FacetsPage() {
  const [facets, productCounts, t] = await Promise.all([
    facetRepository.findAllWithValues(),
    facetRepository.countProductsByFacet(),
    getTranslations("admin.facets"),
  ]);

  const data = facets.map((f) => ({
    id: f.id,
    name: f.name,
    code: f.code,
    valuesCount: f.values.length,
    productsCount: productCounts.get(f.id) ?? 0,
  }));

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("pageTitle")}</h1>
          <p className="mt-0.5 text-sm text-muted">{t("total", { count: facets.length })}</p>
        </div>
        <Link
          href="/admin/facettes/new"
          className="rounded-sm bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
        >
          + {t("new.title")}
        </Link>
      </div>

      <FacettesTable initialData={data} />
    </div>
  );
}
