"use server";

import { requireStaff } from "@/lib/auth-guard";
import { createBrand, deleteBrand, updateBrand } from "@pharmacie/core/modules/catalog";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "../_lib/form-state";

export async function createBrandAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Le nom est requis." };

  await createBrand({ name });
  revalidatePath("/admin/marques");
  redirect("/admin/marques");
}

export async function updateBrandAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { error: "Identifiant manquant." };
  if (!name) return { error: "Le nom est requis." };

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
