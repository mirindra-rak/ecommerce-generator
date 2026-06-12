import { brandRepository } from "@pharmacie/core/modules/catalog";
import Link from "next/link";
import { deleteBrandAction } from "./_actions";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await brandRepository.findMany();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marques</h1>
          <p className="mt-1 text-sm text-muted">{brands.length} au total</p>
        </div>
        <Link
          href="/admin/marques/new"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Nouvelle marque
        </Link>
      </div>

      <div className="mt-6">
        {brands.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-muted">
            Aucune marque. Créez-en une pour commencer.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {brands.map((brand) => (
              <li
                key={brand.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-surface px-3 py-2"
              >
                <span className="font-medium text-foreground">{brand.name}</span>
                <span className="text-xs text-muted">/{brand.slug}</span>
                <div className="ml-auto flex items-center gap-3">
                  <Link
                    href={`/admin/marques/${brand.id}`}
                    className="text-sm font-medium text-brand-700 hover:underline"
                  >
                    Éditer
                  </Link>
                  <form action={deleteBrandAction}>
                    <input type="hidden" name="id" value={brand.id} />
                    <button
                      type="submit"
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
