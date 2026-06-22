import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProductDetail } from "@/lib/catalog";
import { alternatesFor } from "@/lib/seo";
import { AddToCartButton } from "../../_components/add-to-cart-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Type de produit (enum domaine) → clé de message. Repli neutre sur `typeOther`.
const PRODUCT_TYPE_KEY = {
  COSMETIC: "typeCosmetic",
  SUPPLEMENT: "typeSupplement",
  DEVICE: "typeDevice",
  OTHER: "typeOther",
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const [product, t] = await Promise.all([
    getProductDetail(slug),
    getTranslations({ locale, namespace: "productPage" }),
  ]);
  return {
    title: product?.name ?? t("notFound"),
    alternates: alternatesFor(`/produit/${slug}`, locale),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [product, t, tCommon] = await Promise.all([
    getProductDetail(slug),
    getTranslations("productPage"),
    getTranslations("common"),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Galerie (placeholder visuel CSS) */}
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-slate-100">
          <span className="absolute inset-0 grid place-items-center text-8xl font-bold text-brand-600/20">
            {(product.brandName ?? product.name).charAt(0)}
          </span>
        </div>

        {/* Informations */}
        <div>
          <span className="inline-block rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
            {t(
              PRODUCT_TYPE_KEY[product.productType as keyof typeof PRODUCT_TYPE_KEY] ?? "typeOther",
            )}
          </span>

          {product.brandName && (
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand-700">
              {product.brandName}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>

          <p className="mt-4 text-3xl font-bold text-foreground">
            {product.from && (
              <span className="mr-1 align-middle text-sm text-muted">{tCommon("priceFrom")}</span>
            )}
            {product.priceLabel}
            <span className="ml-2 align-middle text-sm font-normal text-muted">
              {t("priceSuffix")}
            </span>
          </p>
          {product.taxLabel && (
            <p className="mt-2 text-sm text-muted">{t("taxRate", { rate: product.taxLabel })}</p>
          )}

          {product.description && (
            <p className="mt-5 leading-relaxed text-slate-600">{product.description}</p>
          )}

          {/* Variantes */}
          {product.options.map((option) => (
            <div key={option.name} className="mt-6">
              <p className="text-sm font-semibold text-foreground">{option.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {option.values.map((value) => (
                  <span
                    key={value}
                    className="rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-700"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {product.variants[0] && <AddToCartButton variantId={product.variants[0].id} />}

          {/* Détails réglementaires */}
          <dl className="mt-10 space-y-4 border-t border-slate-200 pt-6 text-sm">
            <div>
              <dt className="font-semibold text-foreground">{t("references")}</dt>
              <dd className="mt-1 text-muted">
                {product.variants
                  .map((v) => v.sku)
                  .filter((sku): sku is string => Boolean(sku))
                  .join(" · ") || "—"}
              </dd>
            </div>
            {product.inci && (
              <div>
                <dt className="font-semibold text-foreground">{t("inci")}</dt>
                <dd className="mt-1 text-muted">{product.inci}</dd>
              </div>
            )}
            {product.precautions && (
              <div>
                <dt className="font-semibold text-foreground">{t("precautions")}</dt>
                <dd className="mt-1 text-muted">{product.precautions}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
