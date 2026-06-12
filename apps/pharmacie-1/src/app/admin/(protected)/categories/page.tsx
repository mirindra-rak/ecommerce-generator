import { categoryRepository } from "@pharmacie/core/modules/catalog";
import Link from "next/link";
import { deleteCategoryAction } from "./_actions";

export const dynamic = "force-dynamic";

// Type de catégorie inféré depuis le repository (évite d'importer @prisma/client,
// qui est une dépendance de core et non de l'app).
type Category = Awaited<ReturnType<typeof categoryRepository.findMany>>[number];

interface TreeNode {
  id: string;
  name: string;
  slug: string;
  children: TreeNode[];
}

function buildTree(categories: Category[]): TreeNode[] {
  const byParent = new Map<string | null, Category[]>();
  for (const category of categories) {
    const siblings = byParent.get(category.parentId) ?? [];
    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }
  const build = (parentId: string | null): TreeNode[] =>
    (byParent.get(parentId) ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      children: build(c.id),
    }));
  return build(null);
}

function CategoryTree({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="space-y-1.5">
      {nodes.map((node) => (
        <li key={node.id}>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-surface px-3 py-2">
            <span className="font-medium text-foreground">{node.name}</span>
            <span className="text-xs text-muted">/{node.slug}</span>
            <div className="ml-auto flex items-center gap-3">
              <Link
                href={`/admin/categories/${node.id}`}
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Éditer
              </Link>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={node.id} />
                <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
                  Supprimer
                </button>
              </form>
            </div>
          </div>
          {node.children.length > 0 && (
            <div className="ml-5 mt-1.5 border-l border-slate-200 pl-3">
              <CategoryTree nodes={node.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const categories = await categoryRepository.findMany();
  const tree = buildTree(categories);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
          <p className="mt-1 text-sm text-muted">{categories.length} au total</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Nouvelle catégorie
        </Link>
      </div>

      {error && <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6">
        {tree.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-muted">
            Aucune catégorie. Créez-en une pour commencer.
          </p>
        ) : (
          <CategoryTree nodes={tree} />
        )}
      </div>
    </div>
  );
}
