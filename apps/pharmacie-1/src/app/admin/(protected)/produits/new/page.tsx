import {
  brandRepository,
  categoryRepository,
  facetRepository,
  PRODUCT_TYPES,
} from "@pharmacie/core/modules/catalog";
import { taxRateRepository } from "@pharmacie/core/modules/pricing";
import { getTranslations } from "next-intl/server";
import { createProductAction } from "../_actions";
import { ProductForm } from "../produit-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [t, brands, categories, facets, taxRates] = await Promise.all([
    getTranslations("admin.products.new"),
    brandRepository.findMany(),
    categoryRepository.findMany(),
    facetRepository.findAllWithValues(),
    taxRateRepository.findActive(),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-0.5 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-6">
        <ProductForm
          action={createProductAction}
          productTypes={PRODUCT_TYPES}
          taxRateOptions={taxRates.map((taxRate) => ({
            id: taxRate.id,
            label: `${taxRate.name} (${(taxRate.rateBps / 100).toFixed(2).replace(".", ",")} %)`,
            rateBps: taxRate.rateBps,
          }))}
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
