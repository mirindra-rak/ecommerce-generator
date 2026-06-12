import {
  brandRepository,
  categoryRepository,
  facetRepository,
  parseAttributes,
  productRepository,
  PRODUCT_TYPES,
} from "@pharmacie/core/modules/catalog";
import { notFound } from "next/navigation";
import { updateProductAction } from "../_actions";
import { ProductForm } from "../produit-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await productRepository.findByIdWithRelations(id);
  if (!product) notFound();
  // Invariant « tout est déclinaison » : un produit en a toujours au moins une.
  if (product.variants.length === 0) notFound();

  const [brands, categories, facets] = await Promise.all([
    brandRepository.findMany(),
    categoryRepository.findMany(),
    facetRepository.findAllWithValues(),
  ]);
  const attributes = parseAttributes(product.productType, product.attributes);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-foreground">Éditer « {product.name} »</h1>
      <div className="mt-6">
        <ProductForm
          action={updateProductAction}
          productTypes={PRODUCT_TYPES}
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
          }}
        />
      </div>
    </div>
  );
}
