import { categoryRepository } from "@pharmacie/core/modules/catalog";
import Link from "next/link";
import { CategoriesTable } from "../_components/categories-table";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await categoryRepository.findManyWithProductCounts();

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Catégories</h1>
          <p className="mt-0.5 text-sm text-muted">{categories.length} au total</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-sm bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          + Nouvelle catégorie
        </Link>
      </div>

      <CategoriesTable initialData={categories} />
    </div>
  );
}
