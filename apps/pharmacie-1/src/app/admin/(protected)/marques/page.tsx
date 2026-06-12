import { brandRepository } from "@pharmacie/core/modules/catalog";
import Link from "next/link";
import { MarquesTable } from "../_components/marques-table";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await brandRepository.findMany();

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Marques</h1>
          <p className="mt-0.5 text-sm text-muted">{brands.length} au total</p>
        </div>
        <Link
          href="/admin/marques/new"
          className="rounded-sm bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
        >
          + Nouvelle marque
        </Link>
      </div>

      <MarquesTable initialData={brands} />
    </div>
  );
}
