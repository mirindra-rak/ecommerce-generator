"use client";

import { Button, Card, Field, Input, MultiSelect, Select, type SelectOption } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useRef, useState, type ReactNode } from "react";
import type { FormState } from "../_lib/form-state";
import { useUnsavedChanges } from "../_lib/use-unsaved-changes";

interface RuleData {
  id: string;
  name: string;
  active: boolean;
  discountType: string;
  discountValue: number;
  targetType: string;
  targetIds: string[];
  floorPrice: number | null;
  customerLabel: string | null;
  showStrikethrough: boolean;
  startDate: string | null;
  endDate: string | null;
  priority: number;
}

interface RuleFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  rule?: RuleData;
  categories: SelectOption[];
  products: SelectOption[];
  brands: SelectOption[];
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card as="section" className="p-6">
      <header className="mb-5">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </header>
      {children}
    </Card>
  );
}

function toDateParts(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "00:00" };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

const DISCOUNT_TYPE_OPTIONS: SelectOption[] = [
  { value: "PERCENTAGE", label: "" },
  { value: "FIXED_AMOUNT", label: "" },
];

const TARGET_TYPE_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "" },
  { value: "CATEGORY", label: "" },
  { value: "PRODUCT", label: "" },
  { value: "BRAND", label: "" },
];

export function RuleForm({ action, rule, categories, products, brands }: RuleFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const t = useTranslations("admin.promotions.form");
  const tCommon = useTranslations("admin.common");
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedChanges(formRef);

  const [discountType, setDiscountType] = useState(rule?.discountType ?? "PERCENTAGE");
  const [targetType, setTargetType] = useState(rule?.targetType ?? "ALL");
  const [targetIds, setTargetIds] = useState<string[]>(rule?.targetIds ?? []);

  const startParts = toDateParts(rule?.startDate ?? null);
  const endParts = toDateParts(rule?.endDate ?? null);
  const [startDate, setStartDate] = useState(startParts.date);
  const [startTime, setStartTime] = useState(startParts.time);
  const [endDate, setEndDate] = useState(endParts.date);
  const [endTime, setEndTime] = useState(endParts.time);

  const discountTypeOptions = DISCOUNT_TYPE_OPTIONS.map((o) => ({
    ...o,
    label: o.value === "PERCENTAGE" ? t("discountTypePercentage") : t("discountTypeFixed"),
  }));

  const targetTypeOptions = TARGET_TYPE_OPTIONS.map((o) => ({
    ...o,
    label:
      o.value === "ALL"
        ? t("targetTypeAll")
        : o.value === "CATEGORY"
          ? t("targetTypeCategory")
          : o.value === "PRODUCT"
            ? t("targetTypeProduct")
            : t("targetTypeBrand"),
  }));

  const targetOptions =
    targetType === "CATEGORY"
      ? categories
      : targetType === "PRODUCT"
        ? products
        : targetType === "BRAND"
          ? brands
          : [];

  return (
    <form ref={formRef} action={formAction} className="max-w-3xl space-y-6">
      {rule && <input type="hidden" name="id" value={rule.id} />}

      <FormSection title={t("sectionIdentity")} description={t("sectionIdentityDesc")}>
        <div className="space-y-5">
          <Field label={t("name")} htmlFor="name">
            <Input id="name" name="name" required defaultValue={rule?.name} />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="active"
              defaultChecked={rule?.active ?? true}
              className="h-4 w-4"
            />
            {t("active")}
          </label>

          <Field label={t("customerLabel")} htmlFor="customerLabel" hint={t("customerLabelHint")}>
            <Input
              id="customerLabel"
              name="customerLabel"
              defaultValue={rule?.customerLabel ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("sectionDiscount")} description={t("sectionDiscountDesc")}>
        <div className="space-y-5">
          <Field label={t("discountType")} htmlFor="discountType">
            <Select
              id="discountType"
              name="discountType"
              options={discountTypeOptions}
              value={discountType}
              onValueChange={setDiscountType}
            />
          </Field>

          <Field
            label={t("discountValue")}
            htmlFor="discountValue"
            hint={
              discountType === "PERCENTAGE"
                ? t("discountValueHintPercent")
                : t("discountValueHintFixed")
            }
          >
            <Input
              id="discountValue"
              name="discountValue"
              type="number"
              min={0}
              max={discountType === "PERCENTAGE" ? 10000 : undefined}
              required
              defaultValue={rule?.discountValue ?? ""}
            />
          </Field>

          <Field label={t("floorPrice")} htmlFor="floorPrice" hint={t("floorPriceHint")}>
            <Input
              id="floorPrice"
              name="floorPrice"
              type="number"
              min={0}
              defaultValue={rule?.floorPrice ?? ""}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="showStrikethrough"
              defaultChecked={rule?.showStrikethrough ?? true}
              className="h-4 w-4"
            />
            {t("showStrikethrough")}
          </label>
        </div>
      </FormSection>

      <FormSection title={t("sectionTarget")} description={t("sectionTargetDesc")}>
        <div className="space-y-5">
          <Field label={t("targetType")} htmlFor="targetType">
            <Select
              id="targetType"
              name="targetType"
              options={targetTypeOptions}
              value={targetType}
              onValueChange={(v) => {
                setTargetType(v);
                setTargetIds([]);
              }}
            />
          </Field>

          {targetType !== "ALL" && (
            <Field label={t("targetIds")} htmlFor="targetIds">
              <MultiSelect
                id="targetIds"
                name="targetIds"
                options={targetOptions}
                value={targetIds}
                onValueChange={setTargetIds}
                placeholder={t("targetIdsPlaceholder")}
              />
            </Field>
          )}
        </div>
      </FormSection>

      <FormSection title={t("sectionSchedule")} description={t("sectionScheduleDesc")}>
        <div className="space-y-5">
          <input
            type="hidden"
            name="startDate"
            value={startDate ? `${startDate}T${startTime}` : ""}
          />
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">{t("startDate")}</legend>
            <div className="flex items-center gap-2">
              <Input
                id="startDateDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1"
              />
              <Input
                id="startDateTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-28"
              />
            </div>
          </fieldset>

          <input type="hidden" name="endDate" value={endDate ? `${endDate}T${endTime}` : ""} />
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">{t("endDate")}</legend>
            <div className="flex items-center gap-2">
              <Input
                id="endDateDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1"
              />
              <Input
                id="endDateTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-28"
              />
            </div>
          </fieldset>

          <Field label={t("priority")} htmlFor="priority" hint={t("priorityHint")}>
            <Input
              id="priority"
              name="priority"
              type="number"
              min={0}
              defaultValue={rule?.priority ?? 0}
            />
          </Field>
        </div>
      </FormSection>

      {state.error && (
        <p className="rounded-sm border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger-text">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? tCommon("saving") : tCommon("save")}
        </Button>
        <Link href="/admin/promotions" className="text-sm text-muted hover:underline">
          {tCommon("cancel")}
        </Link>
      </div>
    </form>
  );
}
