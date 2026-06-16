import {
  brandRepository,
  categoryRepository,
  facetRepository,
  PRODUCT_TYPES,
} from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import { createProductAction } from "../_actions";
import { ProductForm } from "../produit-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [t, brands, categories, facets] = await Promise.all([
    getTranslations("admin.products.new"),
    brandRepository.findMany(),
    categoryRepository.findMany(),
    facetRepository.findAllWithValues(),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-0.5 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-6">
        <ProductForm
          action={createProductAction}
          productTypes={PRODUCT_TYPES}
          brandOptions={brands.map((b) => ({ id: b.id, label: b.name }))}
          categoryOptions={categories.map((c) => ({ id: c.id, label: c.name }))}
          facets={facets.map((f) => ({
            id: f.id,
            name: f.name,
            values: f.values.map((v) => ({ id: v.id, label: v.label })),
          }))}
        />
      </div>
    </div>
  );
}
