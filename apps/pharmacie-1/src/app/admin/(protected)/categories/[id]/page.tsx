import { categoryRepository } from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { updateCategoryAction } from "../_actions";
import { CategoryForm } from "../category-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await categoryRepository.findById(id);
  if (!category) notFound();

  const t = await getTranslations("admin.categories");

  // Exclure la catégorie elle-même et ses descendants des parents possibles (anti-cycle).
  const [all, descendants] = await Promise.all([
    categoryRepository.findMany(),
    categoryRepository.findDescendants(id),
  ]);
  const excluded = new Set<string>([id, ...descendants.map((d) => d.id)]);
  const parentOptions = all
    .filter((c) => !excluded.has(c.id))
    .map((c) => ({ id: c.id, label: c.name }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">
        {t("edit.title", { name: category.name })}
      </h1>
      <div className="mt-6">
        <CategoryForm
          action={updateCategoryAction}
          parentOptions={parentOptions}
          category={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            parentId: category.parentId,
            active: category.active,
            description: category.description,
            additionalInfo: category.additionalInfo,
            shortDescription: category.shortDescription,
            metaTitle: category.metaTitle,
            metaDescription: category.metaDescription,
            metaKeywords: category.metaKeywords,
            coverImageKey: category.coverImageKey,
            thumbnailKey: category.thumbnailKey,
          }}
        />
      </div>
    </div>
  );
}
