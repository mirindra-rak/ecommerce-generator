import {
  brandRepository,
  categoryRepository,
  productRepository,
} from "@pharmacie/core/modules/catalog";
import Link from "next/link";
import { KpiCards } from "./_components/kpi-cards";
import { WeeklyChart } from "./_components/weekly-chart";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [categories, brands, products] = await Promise.all([
    categoryRepository.findMany(),
    brandRepository.findMany(),
    productRepository.findActive(),
  ]);

  const recentCategories = categories.slice(0, 5);
  const recentBrands = brands.slice(0, 4);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-muted">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* KPI cards */}
      <KpiCards categories={categories.length} brands={brands.length} products={products.length} />

      {/* Chart + Activity */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>

        {/* Recent activity */}
        <div className="rounded-sm border border-line bg-surface p-5">
          <p className="text-sm font-semibold text-foreground">Activité récente</p>
          <p className="mt-0.5 text-xs text-muted">Derniers éléments ajoutés</p>

          <div className="mt-4 space-y-1">
            {recentCategories.map((c) => (
              <Link
                key={c.id}
                href={`/admin/categories/${c.id}`}
                className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-bg-subtle"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span className="flex-1 truncate text-sm text-foreground">{c.name}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted">cat.</span>
              </Link>
            ))}

            {recentCategories.length > 0 && recentBrands.length > 0 && (
              <div className="my-2 h-px bg-line" />
            )}

            {recentBrands.map((b) => (
              <Link
                key={b.id}
                href={`/admin/marques/${b.id}`}
                className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-bg-subtle"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                <span className="flex-1 truncate text-sm text-foreground">{b.name}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted">marque</span>
              </Link>
            ))}

            {recentCategories.length === 0 && recentBrands.length === 0 && (
              <p className="py-4 text-center text-sm text-muted">
                {"Aucun contenu pour l'instant."}
              </p>
            )}
          </div>

          <div className="mt-4 border-t border-line pt-3">
            <div className="flex gap-3">
              <Link
                href="/admin/categories/new"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                + Catégorie
              </Link>
              <Link
                href="/admin/marques/new"
                className="text-xs font-medium text-accent-600 hover:underline"
              >
                + Marque
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Categories summary */}
        <div className="rounded-sm border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Catégories</p>
            <Link
              href="/admin/categories/new"
              className="rounded-sm bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Ajouter
            </Link>
          </div>
          {categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Aucune catégorie.</p>
          ) : (
            <ul className="space-y-1">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/categories/${c.id}`}
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-bg-subtle"
                  >
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-muted">/{c.slug}</span>
                  </Link>
                </li>
              ))}
              {categories.length > 6 && (
                <li className="px-2 py-1.5 text-xs text-muted">
                  +{categories.length - 6} autres →{" "}
                  <Link
                    href="/admin/categories"
                    className="font-medium text-brand-700 hover:underline"
                  >
                    tout voir
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Brands summary */}
        <div className="rounded-sm border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Marques</p>
            <Link
              href="/admin/marques/new"
              className="rounded-sm bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-700"
            >
              Ajouter
            </Link>
          </div>
          {brands.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Aucune marque.</p>
          ) : (
            <ul className="space-y-1">
              {brands.slice(0, 6).map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/marques/${b.id}`}
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-bg-subtle"
                  >
                    <span className="flex-1 truncate">{b.name}</span>
                    <span className="text-xs text-muted">/{b.slug}</span>
                  </Link>
                </li>
              ))}
              {brands.length > 6 && (
                <li className="px-2 py-1.5 text-xs text-muted">
                  +{brands.length - 6} autres →{" "}
                  <Link
                    href="/admin/marques"
                    className="font-medium text-accent-600 hover:underline"
                  >
                    tout voir
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
