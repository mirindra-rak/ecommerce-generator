"use server";

import {
  CategoryNotEmptyError,
  type CategoryContentInput,
  InvalidCategoryFieldError,
  ReparentCycleError,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@pharmacie/core/modules/catalog";
import { requireStaff } from "@/lib/auth-guard";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "../_lib/form-state";

function revalidateCategories(): void {
  revalidatePath("/admin/categories");
  revalidatePath("/"); // la home (CategoryGrid) reflète les catégories
}

// Lit les champs de contenu/SEO du formulaire (images/douane = migration-only, absents ici).
function readContentFields(formData: FormData): CategoryContentInput {
  const text = (key: string): string | null => {
    const value = String(formData.get(key) ?? "").trim();
    return value === "" ? null : value;
  };
  const metaKeywords = String(formData.get("metaKeywords") ?? "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    active: formData.get("active") === "on",
    description: text("description"),
    additionalInfo: text("additionalInfo"),
    shortDescription: text("shortDescription"),
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    metaKeywords,
  };
}

export async function createCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.categories.errors");
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "") || null;
  if (!name) return { error: t("nameRequired") };

  try {
    await createCategory({ name, parentId, ...readContentFields(formData) });
  } catch (error) {
    if (error instanceof ReparentCycleError) {
      return { error: t("reparentCycle") };
    }
    if (error instanceof InvalidCategoryFieldError) {
      return { error: t("invalidField") };
    }
    throw error;
  }
  revalidateCategories();
  redirect("/admin/categories");
}

export async function updateCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.categories.errors");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "") || null;
  if (!id) return { error: t("idMissing") };
  if (!name) return { error: t("nameRequired") };

  try {
    await updateCategory(id, { name, parentId, ...readContentFields(formData) });
  } catch (error) {
    if (error instanceof ReparentCycleError) {
      return { error: t("reparentCycle") };
    }
    if (error instanceof InvalidCategoryFieldError) {
      return { error: t("invalidField") };
    }
    throw error;
  }
  revalidateCategories();
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await deleteCategory(id);
  } catch (error) {
    if (error instanceof CategoryNotEmptyError) {
      const t = await getTranslations("admin.categories.errors");
      redirect(`/admin/categories?error=${encodeURIComponent(t("notEmpty"))}`);
    }
    throw error;
  }
  revalidateCategories();
  redirect("/admin/categories");
}
