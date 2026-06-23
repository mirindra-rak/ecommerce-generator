"use server";

import { requireStaff } from "@/lib/auth-guard";
import {
  catalogPriceRuleRepository,
  type CreateCatalogPriceRuleInput,
  type UpdateCatalogPriceRuleInput,
  InvalidDiscountValueError,
  InvalidFloorPriceError,
  MissingTargetIdsError,
} from "@pharmacie/core/modules/promotions";
import type { DiscountType, TargetType } from "@pharmacie/core/modules/promotions";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "../_lib/form-state";

function revalidate(): void {
  revalidatePath("/admin/promotions");
  revalidatePath("/");
}

function extractFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const active = formData.has("active");
  const discountType = String(formData.get("discountType") ?? "PERCENTAGE") as DiscountType;
  const discountValue = Number(formData.get("discountValue") ?? 0);
  const targetType = String(formData.get("targetType") ?? "ALL") as TargetType;
  const targetIds = formData.getAll("targetIds").map(String).filter(Boolean);
  const floorPriceRaw = String(formData.get("floorPrice") ?? "").trim();
  const floorPrice = floorPriceRaw === "" ? null : Number(floorPriceRaw);
  const customerLabelRaw = String(formData.get("customerLabel") ?? "").trim();
  const customerLabel = customerLabelRaw === "" ? null : customerLabelRaw;
  const showStrikethrough = formData.has("showStrikethrough");
  const startDateRaw = String(formData.get("startDate") ?? "").trim();
  const startDate = startDateRaw === "" ? null : new Date(startDateRaw);
  const endDateRaw = String(formData.get("endDate") ?? "").trim();
  const endDate = endDateRaw === "" ? null : new Date(endDateRaw);
  const priority = Number(formData.get("priority") ?? 0);

  return {
    name,
    active,
    discountType,
    discountValue,
    targetType,
    targetIds,
    floorPrice,
    customerLabel,
    showStrikethrough,
    startDate,
    endDate,
    priority,
  };
}

function validate(
  fields: ReturnType<typeof extractFields>,
  t: Awaited<ReturnType<typeof getTranslations<"admin.promotions.errors">>>,
): string | null {
  if (!fields.name) return t("nameRequired");
  if (
    fields.discountType === "PERCENTAGE" &&
    (fields.discountValue < 0 || fields.discountValue > 10000)
  ) {
    return t("invalidDiscountValue");
  }
  if (fields.discountType === "FIXED_AMOUNT" && fields.discountValue < 0) {
    return t("invalidDiscountValue");
  }
  if (fields.targetType !== "ALL" && fields.targetIds.length === 0) {
    return t("missingTargets");
  }
  return null;
}

export async function createRuleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.promotions.errors");
  const fields = extractFields(formData);
  const error = validate(fields, t);
  if (error) return { error };

  try {
    await catalogPriceRuleRepository.create(fields as CreateCatalogPriceRuleInput);
  } catch (err) {
    if (err instanceof InvalidDiscountValueError) return { error: t("invalidDiscountValue") };
    if (err instanceof InvalidFloorPriceError) return { error: t("invalidDiscountValue") };
    if (err instanceof MissingTargetIdsError) return { error: t("missingTargets") };
    throw err;
  }
  revalidate();
  redirect("/admin/promotions");
}

export async function updateRuleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireStaff();
  const t = await getTranslations("admin.promotions.errors");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: t("idMissing") };

  const fields = extractFields(formData);
  const error = validate(fields, t);
  if (error) return { error };

  try {
    await catalogPriceRuleRepository.update(id, fields as UpdateCatalogPriceRuleInput);
  } catch (err) {
    if (err instanceof InvalidDiscountValueError) return { error: t("invalidDiscountValue") };
    if (err instanceof InvalidFloorPriceError) return { error: t("invalidDiscountValue") };
    if (err instanceof MissingTargetIdsError) return { error: t("missingTargets") };
    throw err;
  }
  revalidate();
  redirect("/admin/promotions");
}

export async function deleteRuleAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await catalogPriceRuleRepository.remove(id);
  revalidate();
}

export async function toggleRuleAction(formData: FormData): Promise<void> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const rule = await catalogPriceRuleRepository.findById(id);
  if (!rule) return;
  await catalogPriceRuleRepository.update(id, { active: !rule.active });
  revalidate();
}
