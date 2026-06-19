"use server";

import { requireStaff } from "@/lib/auth-guard";
import {
  createFacet,
  createFacetValue,
  deleteFacet,
  deleteFacetValue,
  DuplicateFacetCodeError,
  DuplicateFacetValueCodeError,
  reorderFacets,
  reorderFacetValues,
  updateFacet,
  updateFacetValue,
} from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "../_lib/form-state";

function revalidate(): void {
  revalidatePath("/admin/facettes");
  revalidatePath("/");
}

export async function createFacetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.facets.errors");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: t("nameRequired") };

  try {
    await createFacet({ name });
  } catch (error) {
    if (error instanceof DuplicateFacetCodeError) return { error: t("duplicateCode") };
    throw error;
  }
  revalidate();
  redirect("/admin/facettes");
}

export async function updateFacetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.facets.errors");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { error: t("idMissing") };
  if (!name) return { error: t("nameRequired") };

  await updateFacet(id, { name });
  revalidate();
  redirect("/admin/facettes");
}

export async function deleteFacetAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteFacet(id);
  revalidate();
}

export async function reorderFacetsAction(formData: FormData): Promise<void> {
  await requireStaff();
  const ids = JSON.parse(String(formData.get("ids") ?? "[]")) as string[];
  await reorderFacets(ids);
  revalidate();
}

// ── Valeurs ───────────────────────────────────────────────────────────

export async function createFacetValueAction(formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.facets.errors");
  const facetId = String(formData.get("facetId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  if (!facetId) return { error: t("idMissing") };
  if (!label) return { error: t("labelRequired") };

  try {
    await createFacetValue(facetId, { label });
  } catch (error) {
    if (error instanceof DuplicateFacetValueCodeError) return { error: t("duplicateValueCode") };
    throw error;
  }
  revalidate();
  revalidatePath(`/admin/facettes/${facetId}`);
  return {};
}

export async function updateFacetValueAction(formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.facets.errors");
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  if (!id) return { error: t("idMissing") };
  if (!label) return { error: t("labelRequired") };

  await updateFacetValue(id, { label });
  revalidate();
  return {};
}

export async function deleteFacetValueAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteFacetValue(id);
  revalidate();
}

export async function reorderFacetValuesAction(formData: FormData): Promise<void> {
  await requireStaff();
  const facetId = String(formData.get("facetId") ?? "");
  const ids = JSON.parse(String(formData.get("ids") ?? "[]")) as string[];
  await reorderFacetValues(facetId, ids);
  revalidate();
}
