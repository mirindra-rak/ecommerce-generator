import {
  brandRepository,
  categoryRepository,
  facetRepository,
  parseAttributes,
  productRepository,
  PRODUCT_TYPES,
} from "@pharmacie/core/modules/catalog";
import { inventoryRepository, getMovementHistory } from "@pharmacie/core/modules/inventory";
import { taxRateRepository } from "@pharmacie/core/modules/pricing";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { updateProductAction } from "../_actions";
import { ProductForm } from "../produit-form";
import { ProductEditTabs } from "./product-edit-tabs";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await productRepository.findByIdWithRelations(id);
  if (!product) notFound();
  if (product.variants.length === 0) notFound();

  const [brands, categories, facets, taxRates] = await Promise.all([
    brandRepository.findMany(),
    categoryRepository.findMany(),
    facetRepository.findAllWithValues(),
    taxRateRepository.findActive(),
  ]);
  const attributes = parseAttributes(product.productType, product.attributes);

  const stockVariants = await Promise.all(
    product.variants.map(async (v) => {
      const stock = await inventoryRepository.getVariantStock(v.id);
      const history = await getMovementHistory(v.id, { page: 1, perPage: 10 });
      return {
        id: v.id,
        sku: v.sku,
        volume: v.volume,
        stock: stock?.stock ?? v.stock,
        minOrderQty: stock?.minOrderQty ?? 1,
        stockLocation: stock?.stockLocation ?? null,
        lowStockThreshold: stock?.lowStockThreshold ?? null,
        lowStockAlert: stock?.lowStockAlert ?? false,
        outOfStockBehavior: (stock?.outOfStockBehavior ?? "DEFAULT") as
          | "DENY"
          | "ALLOW"
          | "DEFAULT",
        movements: history.items.map((m) => ({
          id: m.id,
          delta: m.delta,
          stockAfter: m.stockAfter,
          reason: m.reason,
          note: m.note,
          createdAt: m.createdAt.toISOString(),
        })),
      };
    }),
  );

  const t = await getTranslations("admin.products.edit");

  const productForm = (
    <ProductForm
      action={updateProductAction}
      productTypes={PRODUCT_TYPES}
      taxRateOptions={taxRates.map((taxRate) => ({
        id: taxRate.id,
        label: `${taxRate.name} (${(taxRate.rateBps / 100).toFixed(2).replace(".", ",")} %)`,
      }))}
      brandOptions={brands.map((b) => ({ id: b.id, label: b.name }))}
      categoryOptions={categories.map((c) => ({ id: c.id, label: c.name }))}
      facets={facets.map((f) => ({
        id: f.id,
        name: f.name,
        values: f.values.map((v) => ({ id: v.id, label: v.label })),
      }))}
      selectedFacetValueIds={product.facetValues.map((fv) => fv.facetValueId)}
      product={{
        id: product.id,
        name: product.name,
        productType: product.productType,
        description: product.description,
        active: product.active,
        taxRateId: product.taxRateId,
        brandId: product.brandId,
        categoryIds: product.categories.map((c) => c.id),
        primaryCategoryId: product.primaryCategoryId,
        inci: attributes.inci ?? null,
        precautions: attributes.precautions ?? null,
        variants: product.variants.map((v) => ({
          id: v.id,
          volume: v.volume ?? "",
          sku: v.sku ?? "",
          ean: v.ean ?? "",
          price: (v.priceExclTax / 100).toFixed(2),
          stock: String(v.stock),
        })),
        media: product.media.map((m) => ({
          key: m.storageKey,
          url: `/uploads/${m.storageKey}`,
          alt: m.alt ?? undefined,
        })),
      }}
    />
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-foreground">{t("title", { name: product.name })}</h1>
      <div className="mt-6">
        <ProductEditTabs productForm={productForm} stockVariants={stockVariants} />
      </div>
    </div>
  );
}
