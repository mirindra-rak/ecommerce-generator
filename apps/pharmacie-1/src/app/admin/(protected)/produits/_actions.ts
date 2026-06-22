"use server";

import {
  createProduct,
  deleteProduct,
  updateProduct,
  productRepository,
  DuplicateProductFieldError,
  InvalidProductAttributesError,
  PrimaryCategoryNotAssignedError,
  ProductRequiresVariantError,
  type ProductVariantInput,
} from "@pharmacie/core/modules/catalog";
import { TaxRateNotFoundError } from "@pharmacie/core/modules/pricing";
import {
  adjust,
  updateSettings,
  setLowStockNotifier,
  emailNotifier,
  type OutOfStockBehavior,
  type StockMovementReason,
} from "@pharmacie/core/modules/inventory";
import { requireStaff } from "@/lib/auth-guard";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "../_lib/form-state";

setLowStockNotifier(emailNotifier);

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

interface MediaInput {
  storageKey: string;
  alt?: string | null;
  position: number;
}

function readMedia(formData: FormData): MediaInput[] {
  let items: unknown[];
  try {
    items = JSON.parse(String(formData.get("media") ?? "[]"));
  } catch {
    return [];
  }
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, index) => ({
      storageKey: String(item.key ?? ""),
      alt: typeof item.alt === "string" ? item.alt || null : null,
      position: index,
    }))
    .filter((m) => m.storageKey !== "");
}

function readBase(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    productType: String(formData.get("productType") ?? "OTHER"),
    description: text(formData, "description"),
    active: formData.get("active") === "on",
    taxRateId: String(formData.get("taxRateId") ?? "").trim() || undefined,
    brandId: String(formData.get("brandId") ?? "") || null,
    categoryIds: formData.getAll("categoryIds").map(String),
    primaryCategoryId: String(formData.get("primaryCategoryId") ?? "") || null,
    attributes: readAttributes(formData),
    facetValueIds: formData.getAll("facetValueIds").map(String),
  };
}

// Clé de message d'erreur (namespace `admin.products.errors`) + label optionnel pour les
// erreurs interpolées (déclinaison concernée). La traduction est faite par l'action.
type VariantError = {
  errorKey:
    | "variantsUnreadable"
    | "variantsRequired"
    | "variantInvalid"
    | "priceInvalid"
    | "stockInvalid";
  label?: string;
};

// Lit les déclinaisons (champ caché JSON). Prix saisi en EUROS → stocké en CENTIMES.
// `noReferenceLabel` est la traduction du repli « sans référence » (injectée par l'action,
// pour rester découplé de l'i18n).
function readVariants(
  formData: FormData,
  noReferenceLabel: string,
): ProductVariantInput[] | VariantError {
  let rows: unknown;
  try {
    rows = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    return { errorKey: "variantsUnreadable" };
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return { errorKey: "variantsRequired" };
  }

  const variants: ProductVariantInput[] = [];
  for (const row of rows) {
    if (typeof row !== "object" || row === null) return { errorKey: "variantInvalid" };
    const r = row as Record<string, unknown>;

    const sku = String(r.sku ?? "").trim() || null;
    const volume = String(r.volume ?? "").trim() || null;
    const label = sku ?? volume ?? noReferenceLabel;

    const priceEuros = Number.parseFloat(
      String(r.price ?? "")
        .replace(",", ".")
        .trim(),
    );
    if (!Number.isFinite(priceEuros) || priceEuros <= 0) {
      return { errorKey: "priceInvalid", label };
    }
    const stock = Number.parseInt(String(r.stock ?? "0").trim(), 10);
    if (!Number.isInteger(stock) || stock < 0) {
      return { errorKey: "stockInvalid", label };
    }

    const id = typeof r.id === "string" && r.id ? r.id : undefined;
    const ean = String(r.ean ?? "").trim() || null;
    variants.push({ id, sku, ean, priceExclTax: Math.round(priceEuros * 100), stock, volume });
  }
  return variants;
}

function isVariantsError(v: ProductVariantInput[] | VariantError): v is VariantError {
  return "errorKey" in v;
}

// Mappe une erreur de domaine connue vers sa clé de message (le domaine reste agnostique de
// la locale). Retourne null si l'erreur n'est pas reconnue (à propager).
function domainErrorKey(error: unknown): string | null {
  if (error instanceof InvalidProductAttributesError) return "invalidAttributes";
  if (error instanceof DuplicateProductFieldError) return "duplicateField";
  if (error instanceof ProductRequiresVariantError) return "requiresVariant";
  if (error instanceof PrimaryCategoryNotAssignedError) return "primaryCategoryNotAssigned";
  if (error instanceof TaxRateNotFoundError) return "taxRateInvalid";
  return null;
}

export async function createProductAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.products.errors");
  const base = readBase(formData);
  if (!base.name) return { error: t("nameRequired") };
  const variants = readVariants(formData, t("noReference"));
  if (isVariantsError(variants)) {
    return { error: t(variants.errorKey as "priceInvalid", { label: variants.label ?? "" }) };
  }

  const media = readMedia(formData);
  try {
    const created = await createProduct({ ...base, variants });
    if (media.length > 0) {
      await productRepository.reconcileMedia(created.id, media);
    }
  } catch (error) {
    const key = domainErrorKey(error);
    if (key) return { error: t(key as "invalidAttributes") };
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
  const t = await getTranslations("admin.products.errors");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: t("idMissing") };
  const base = readBase(formData);
  if (!base.name) return { error: t("nameRequired") };
  const variants = readVariants(formData, t("noReference"));
  if (isVariantsError(variants)) {
    return { error: t(variants.errorKey as "priceInvalid", { label: variants.label ?? "" }) };
  }

  const media = readMedia(formData);
  try {
    await updateProduct(id, { ...base, variants });
    await productRepository.reconcileMedia(id, media);
  } catch (error) {
    const key = domainErrorKey(error);
    if (key) return { error: t(key as "invalidAttributes") };
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

export async function adjustStockAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.products.stock.errors");
  const variantId = String(formData.get("variantId") ?? "");
  const deltaRaw = String(formData.get("delta") ?? "").trim();
  if (!deltaRaw) return { error: t("deltaRequired") };
  const delta = Number.parseInt(deltaRaw, 10);
  if (!Number.isInteger(delta) || delta === 0) return { error: t("deltaInvalid") };
  const note = String(formData.get("note") ?? "").trim() || undefined;

  try {
    await adjust({
      variantId,
      delta,
      reason: "MANUAL_ADJUSTMENT" as StockMovementReason,
      note,
    });
  } catch {
    return { error: t("adjustFailed") };
  }
  revalidateProducts();
  return {};
}

export async function updateInventorySettingsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.products.stock.errors");
  const variantId = String(formData.get("variantId") ?? "");
  const minOrderQty = Number.parseInt(String(formData.get("minOrderQty") ?? "1"), 10);
  const stockLocation = String(formData.get("stockLocation") ?? "").trim() || null;
  const lowStockAlert = formData.get("lowStockAlert") === "on";
  const thresholdRaw = String(formData.get("lowStockThreshold") ?? "").trim();
  const lowStockThreshold = thresholdRaw ? Number.parseInt(thresholdRaw, 10) : null;
  const outOfStockBehavior = String(
    formData.get("outOfStockBehavior") ?? "DEFAULT",
  ) as OutOfStockBehavior;

  try {
    await updateSettings(variantId, {
      minOrderQty: Number.isFinite(minOrderQty) ? minOrderQty : 1,
      stockLocation,
      lowStockAlert,
      lowStockThreshold,
      outOfStockBehavior,
    });
  } catch {
    return { error: t("settingsFailed") };
  }
  revalidateProducts();
  return {};
}
