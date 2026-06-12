import Link from "next/link";
import type { ProductCardVM } from "@/lib/catalog";
import { CartIcon } from "./icons";

// Vignette produit partagée (home + listing catégorie). Présentational : reçoit un
// view-model déjà calculé. Placeholder visuel CSS (pas d'asset image à ce stade).
export function ProductCard({ product }: { product: ProductCardVM }) {
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
            {product.from && <span className="mr-1 text-xs text-muted">dès</span>}
            <span className="text-lg font-bold text-foreground">{product.priceLabel}</span>
          </div>
          <button
            type="button"
            aria-label={`Ajouter ${product.name} au panier`}
            className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700"
          >
            <CartIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
