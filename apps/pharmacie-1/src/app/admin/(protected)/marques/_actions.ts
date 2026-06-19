"use server";

import { requireStaff } from "@/lib/auth-guard";
import { createBrand, deleteBrand, updateBrand } from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "../_lib/form-state";

function extractBrandFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    active: formData.has("active"),
    shortDescription: String(formData.get("shortDescription") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    logoKey: String(formData.get("logoKey") ?? "").trim() || null,
    metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
    metaDescription: String(formData.get("metaDescription") ?? "").trim() || null,
  };
}

export async function createBrandAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.brands.errors");
  const fields = extractBrandFields(formData);
  if (!fields.name) return { error: t("nameRequired") };

  await createBrand(fields);
  revalidatePath("/admin/marques");
  redirect("/admin/marques");
}

export async function updateBrandAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.brands.errors");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: t("idMissing") };

  const fields = extractBrandFields(formData);
  if (!fields.name) return { error: t("nameRequired") };

  await updateBrand(id, fields);
  revalidatePath("/admin/marques");
  redirect("/admin/marques");
}

export async function deleteBrandAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await deleteBrand(id);
  revalidatePath("/admin/marques");
  redirect("/admin/marques");
}
