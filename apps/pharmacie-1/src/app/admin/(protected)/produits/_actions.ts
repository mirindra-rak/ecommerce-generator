"use server";

import {
  createProduct,
  deleteProduct,
  updateProduct,
  DuplicateProductFieldError,
  InvalidProductAttributesError,
  PrimaryCategoryNotAssignedError,
  ProductRequiresVariantError,
  type ProductVariantInput,
} from "@pharmacie/core/modules/catalog";
import { requireStaff } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "../_lib/form-state";

function revalidateProducts(): void {
  revalidatePath("/admin/produits");
  revalidatePath("/"); // FeaturedProducts sur la home
}

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

// Attributs descriptifs parapharmacie (jsonb). Champs vides → non envoyés.
function readAttributes(formData: FormData): Record<string, string> {
  const attributes: Record<string, string> = {};
  const inci = text(formData, "inci");
  const precautions = text(formData, "precautions");
  if (inci) attributes.inci = inci;
  if (precautions) attributes.precautions = precautions;
  return attributes;
}

function readBase(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    productType: String(formData.get("productType") ?? "OTHER"),
    description: text(formData, "description"),
    active: formData.get("active") === "on",
    brandId: String(formData.get("brandId") ?? "") || null,
    categoryIds: formData.getAll("categoryIds").map(String),
    primaryCategoryId: String(formData.get("primaryCategoryId") ?? "") || null,
    attributes: readAttributes(formData),
    facetValueIds: formData.getAll("facetValueIds").map(String),
  };
}

// Lit les déclinaisons (champ caché JSON). Prix saisi en EUROS → stocké en CENTIMES.
function readVariants(formData: FormData): ProductVariantInput[] | { error: string } {
  let rows: unknown;
  try {
    rows = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    return { error: "Déclinaisons illisibles." };
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "Au moins une déclinaison est requise." };
  }

  const variants: ProductVariantInput[] = [];
  for (const row of rows) {
    if (typeof row !== "object" || row === null) return { error: "Déclinaison invalide." };
    const r = row as Record<string, unknown>;

    const sku = String(r.sku ?? "").trim() || null;
    const volume = String(r.volume ?? "").trim() || null;
    const label = sku ?? volume ?? "sans référence";

    const priceEuros = Number.parseFloat(
      String(r.price ?? "")
        .replace(",", ".")
        .trim(),
    );
    if (!Number.isFinite(priceEuros) || priceEuros <= 0) {
      return { error: `Prix invalide pour la déclinaison « ${label} ».` };
    }
    const stock = Number.parseInt(String(r.stock ?? "0").trim(), 10);
    if (!Number.isInteger(stock) || stock < 0) {
      return { error: `Stock invalide pour la déclinaison « ${label} ».` };
    }

    const id = typeof r.id === "string" && r.id ? r.id : undefined;
    const ean = String(r.ean ?? "").trim() || null;
    variants.push({ id, sku, ean, priceExclTax: Math.round(priceEuros * 100), stock, volume });
  }
  return variants;
}

function isVariantsError(v: ProductVariantInput[] | { error: string }): v is { error: string } {
  return "error" in v;
}

function isKnownError(error: unknown): boolean {
  return (
    error instanceof InvalidProductAttributesError ||
    error instanceof DuplicateProductFieldError ||
    error instanceof ProductRequiresVariantError ||
    error instanceof PrimaryCategoryNotAssignedError
  );
}

export async function createProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStaff();
  const base = readBase(formData);
  if (!base.name) return { error: "Le nom est requis." };
  const variants = readVariants(formData);
  if (isVariantsError(variants)) return { error: variants.error };

  try {
    await createProduct({ ...base, variants });
  } catch (error) {
    if (isKnownError(error)) return { error: (error as Error).message };
    throw error;
  }
  revalidateProducts();
  redirect("/admin/produits");
}

export async function updateProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Identifiant manquant." };
  const base = readBase(formData);
  if (!base.name) return { error: "Le nom est requis." };
  const variants = readVariants(formData);
  if (isVariantsError(variants)) return { error: variants.error };

  try {
    await updateProduct(id, { ...base, variants });
  } catch (error) {
    if (isKnownError(error)) return { error: (error as Error).message };
    throw error;
  }
  revalidateProducts();
  redirect("/admin/produits");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteProduct(id);
  revalidateProducts();
  redirect("/admin/produits");
}
