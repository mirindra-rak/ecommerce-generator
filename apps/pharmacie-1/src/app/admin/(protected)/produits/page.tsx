import { productRepository } from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ProduitsTable } from "../_components/produits-table";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const t = await getTranslations("admin.products");
  const products = await productRepository.findMany();

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("pageTitle")}</h1>
          <p className="mt-0.5 text-sm text-muted">{t("total", { count: products.length })}</p>
        </div>
        <Link
          href="/admin/produits/new"
          className="rounded-sm bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          + {t("new.title")}
        </Link>
      </div>

      <ProduitsTable initialData={products} />
    </div>
  );
}
