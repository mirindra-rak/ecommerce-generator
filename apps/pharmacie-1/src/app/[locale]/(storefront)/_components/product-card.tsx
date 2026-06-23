import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProductCardVM } from "@/lib/catalog";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product }: { product: ProductCardVM }) {
  const t = useTranslations();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface transition-shadow hover:shadow-md">
      <Link
        href={`/produit/${product.slug}`}
        className="relative block aspect-square bg-gradient-to-br from-brand-50 to-slate-100"
      >
        <span className="absolute inset-0 grid place-items-center text-4xl font-bold text-brand-600/20">
          {(product.brandName ?? product.name).charAt(0)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.brandName && (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {product.brandName}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 flex-1 text-sm font-medium text-foreground">
          <Link href={`/produit/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        <div className="mt-3 flex items-end justify-between">
          <div className="leading-none">
            {product.from && (
              <span className="mr-1 text-xs text-muted">{t("common.priceFrom")}</span>
            )}
            <span className="text-lg font-bold text-foreground">{product.priceLabel}</span>
          </div>
          {product.defaultVariantId && (
            <AddToCartButton
              variantId={product.defaultVariantId}
              variant="icon"
              productName={product.name}
            />
          )}
        </div>
      </div>
    </article>
  );
}
