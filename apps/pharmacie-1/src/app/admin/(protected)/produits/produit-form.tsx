"use client";

import { Button, Card, Field, Input, MultiSelect, Select, Textarea } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import type { FormState } from "../_lib/form-state";
import { VariantsEditor, type VariantRow } from "./variants-editor";

export interface Option {
  id: string;
  label: string;
}

export interface FacetOption {
  id: string;
  name: string;
  values: { id: string; label: string }[];
}

export interface ProductFormValue {
  id: string;
  name: string;
  productType: string;
  description: string | null;
  active: boolean;
  brandId: string | null;
  categoryIds: string[];
  primaryCategoryId: string | null;
  inci: string | null;
  precautions: string | null;
  variants: VariantRow[];
}

interface ProductFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  productTypes: readonly string[];
  brandOptions: Option[];
  categoryOptions: Option[];
  facets: FacetOption[];
  selectedFacetValueIds?: string[];
  product?: ProductFormValue;
}

// Carte de section : titre + aide contextuelle + corps.
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

export function ProductForm({
  action,
  productTypes,
  brandOptions,
  categoryOptions,
  facets,
  selectedFacetValueIds = [],
  product,
}: ProductFormProps) {
  const t = useTranslations("admin.products");
  const tc = useTranslations("admin.common");
  const [state, formAction, pending] = useActionState(action, {});
  const selected = new Set(selectedFacetValueIds);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <FormSection title={t("form.sectionIdentity")} description={t("form.sectionIdentityDesc")}>
        <div className="space-y-5">
          <Field label={t("form.name")} htmlFor="name">
            <Input id="name" name="name" required defaultValue={product?.name} />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product?.active ?? true}
              className="h-4 w-4"
            />
            {t("form.active")}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("form.type")} htmlFor="productType">
              <Select
                id="productType"
                name="productType"
                defaultValue={product?.productType ?? "OTHER"}
                options={productTypes.map((type) => ({
                  value: type,
                  label: t(`typesLong.${type}` as "typesLong.COSMETIC"),
                }))}
              />
            </Field>

            <Field label={t("form.brand")} htmlFor="brandId">
              <Select
                id="brandId"
                name="brandId"
                defaultValue={product?.brandId ?? ""}
                options={[
                  { value: "", label: t("form.brandNone") },
                  ...brandOptions.map((option) => ({ value: option.id, label: option.label })),
                ]}
              />
            </Field>
          </div>

          <Field label={t("form.categories")} htmlFor="categoryIds">
            <MultiSelect
              id="categoryIds"
              name="categoryIds"
              defaultValue={product?.categoryIds ?? []}
              placeholder={t("form.categoriesPlaceholder")}
              options={categoryOptions.map((option) => ({ value: option.id, label: option.label }))}
            />
          </Field>

          <Field
            label={t("form.primaryCategory")}
            htmlFor="primaryCategoryId"
            hint={t("form.primaryCategoryHint")}
          >
            <Select
              id="primaryCategoryId"
              name="primaryCategoryId"
              defaultValue={product?.primaryCategoryId ?? ""}
              options={[
                { value: "", label: t("form.primaryCategoryNone") },
                ...categoryOptions.map((option) => ({ value: option.id, label: option.label })),
              ]}
            />
          </Field>

          <Field label={t("form.description")} htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product?.description ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("form.sectionVariants")} description={t("form.sectionVariantsDesc")}>
        <VariantsEditor initial={product?.variants ?? []} />
      </FormSection>

      <FormSection
        title={t("form.sectionAttributes")}
        description={t("form.sectionAttributesDesc")}
      >
        <div className="space-y-5">
          <Field label={t("form.inci")} htmlFor="inci">
            <Input id="inci" name="inci" defaultValue={product?.inci ?? ""} />
          </Field>
          <Field label={t("form.precautions")} htmlFor="precautions">
            <Textarea
              id="precautions"
              name="precautions"
              rows={2}
              defaultValue={product?.precautions ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      {facets.length > 0 && (
        <FormSection title={t("form.sectionFacets")} description={t("form.sectionFacetsDesc")}>
          <div className="space-y-4">
            {facets.map((facet) => (
              <div key={facet.id}>
                <p className="text-sm font-medium text-foreground">{facet.name}</p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                  {facet.values.map((value) => (
                    <label key={value.id} className="flex items-center gap-2 text-sm text-muted">
                      <input
                        type="checkbox"
                        name="facetValueIds"
                        value={value.id}
                        defaultChecked={selected.has(value.id)}
                        className="h-4 w-4"
                      />
                      {value.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      )}

      {state.error && (
        <p className="rounded-sm border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger-text">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? tc("saving") : tc("save")}
        </Button>
        <Link href="/admin/produits" className="text-sm text-muted hover:underline">
          {tc("cancel")}
        </Link>
      </div>
    </form>
  );
}
