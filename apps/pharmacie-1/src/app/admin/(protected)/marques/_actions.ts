"use server";

import { requireStaff } from "@/lib/auth-guard";
import { createBrand, deleteBrand, updateBrand } from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "../_lib/form-state";

export async function createBrandAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.brands.errors");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: t("nameRequired") };

  await createBrand({ name });
  revalidatePath("/admin/marques");
  redirect("/admin/marques");
}

export async function updateBrandAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.brands.errors");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { error: t("idMissing") };
  if (!name) return { error: t("nameRequired") };

  await updateBrand(id, { name });
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
