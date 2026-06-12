import { productRepository } from "@pharmacie/core/modules/catalog";
import Link from "next/link";
import { ProduitsTable } from "../_components/produits-table";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await productRepository.findMany();

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Produits</h1>
          <p className="mt-0.5 text-sm text-muted">{products.length} au total</p>
        </div>
        <Link
          href="/admin/produits/new"
          className="rounded-sm bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          + Nouveau produit
        </Link>
      </div>

      <ProduitsTable initialData={products} />
    </div>
  );
}
