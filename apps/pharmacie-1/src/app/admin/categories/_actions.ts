"use server";

import {
  CategoryNotEmptyError,
  ReparentCycleError,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@pharmacie/core/modules/catalog";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "../_lib/form-state";

function revalidateCategories(): void {
  revalidatePath("/admin/categories");
  revalidatePath("/"); // la home (CategoryGrid) reflète les catégories
}

export async function createCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "") || null;
  if (!name) return { error: "Le nom est requis." };

  try {
    await createCategory({ name, parentId });
  } catch (error) {
    if (error instanceof ReparentCycleError) return { error: error.message };
    throw error;
  }
  revalidateCategories();
  redirect("/admin/categories");
}

export async function updateCategoryAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "") || null;
  if (!id) return { error: "Identifiant manquant." };
  if (!name) return { error: "Le nom est requis." };

  try {
    await updateCategory(id, { name, parentId });
  } catch (error) {
    if (error instanceof ReparentCycleError) return { error: error.message };
    throw error;
  }
  revalidateCategories();
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await deleteCategory(id);
  } catch (error) {
    if (error instanceof CategoryNotEmptyError) {
      redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
  revalidateCategories();
  redirect("/admin/categories");
}
