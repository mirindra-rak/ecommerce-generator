import { categoryRepository } from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import { createCategoryAction } from "../_actions";
import { CategoryForm } from "../category-form";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const categories = await categoryRepository.findMany();
  const parentOptions = categories.map((c) => ({ id: c.id, label: c.name }));
  const t = await getTranslations("admin.categories");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t("new.title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("new.subtitle")}</p>
      <div className="mt-6">
        <CategoryForm action={createCategoryAction} parentOptions={parentOptions} />
      </div>
    </div>
  );
}
