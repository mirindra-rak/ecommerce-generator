"use client";

import {
  Button,
  Card,
  Field,
  Input,
  MultiImageUpload,
  MultiSelect,
  Select,
  Textarea,
  type MediaItem,
} from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  useActionState,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import type { FormState } from "../_lib/form-state";
import { useUnsavedChanges } from "../_lib/use-unsaved-changes";
import { VariantsEditor, type VariantRow } from "./variants-editor";

export interface Option {
  id: string;
  label: string;
  rateBps?: number;
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
  taxRateId: string;
  brandId: string | null;
  categoryIds: string[];
  primaryCategoryId: string | null;
  inci: string | null;
  precautions: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  variants: VariantRow[];
  media: MediaItem[];
}

interface ProductFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  productTypes: readonly string[];
  taxRateOptions: Option[];
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

function CountedField({
  label,
  htmlFor,
  hint,
  max,
  defaultValue,
  multiline,
  name,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  max: number;
  defaultValue: string;
  multiline?: boolean;
  name: string;
}) {
  const [count, setCount] = useState(defaultValue.length);
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
  }, []);
  return (
    <Field label={label} htmlFor={htmlFor} hint={hint}>
      {multiline ? (
        <Textarea
          id={htmlFor}
          name={name}
          rows={2}
          defaultValue={defaultValue}
          onChange={onChange}
        />
      ) : (
        <Input id={htmlFor} name={name} defaultValue={defaultValue} onChange={onChange} />
      )}
      <p className={`text-right text-xs ${count > max ? "text-danger-text" : "text-muted"}`}>
        {count}/{max}
      </p>
    </Field>
  );
}

async function uploadFile(file: File): Promise<{ key: string; url: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

function imageUrl(key: string): string {
  return `/uploads/${key}`;
}

export function ProductForm({
  action,
  productTypes,
  taxRateOptions,
  brandOptions,
  categoryOptions,
  facets,
  selectedFacetValueIds = [],
  product,
}: ProductFormProps) {
  const t = useTranslations("admin.products");
  const tc = useTranslations("admin.common");
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedChanges(formRef);

  const defaultTaxRateId = product?.taxRateId ?? taxRateOptions[0]?.id ?? "";
  const [selectedTaxRateId, setSelectedTaxRateId] = useState(defaultTaxRateId);
  const selectedRateBps = useMemo(() => {
    const found = taxRateOptions.find((o) => o.id === selectedTaxRateId);
    return found?.rateBps ?? 0;
  }, [taxRateOptions, selectedTaxRateId]);

  const initialMedia: MediaItem[] = useMemo(
    () =>
      (product?.media ?? []).map((m) => ({
        key: m.key,
        url: m.url ?? imageUrl(m.key),
        alt: m.alt,
      })),
    [product?.media],
  );
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia);
  const handleMediaChange = useCallback((items: MediaItem[]) => {
    setMediaItems(items);
  }, []);

  const selectedByFacet = useMemo(() => {
    const selected = new Set(selectedFacetValueIds);
    return new Map(
      facets.map((facet) => [
        facet.id,
        facet.values.filter((value) => selected.has(value.id)).map((value) => value.id),
      ]),
    );
  }, [facets, selectedFacetValueIds]);

  return (
    <form ref={formRef} action={formAction} className="max-w-3xl space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="media" value={JSON.stringify(mediaItems)} />

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

          <Field label={t("form.taxRate")} htmlFor="taxRateId" hint={t("form.taxRateHint")}>
            <Select
              id="taxRateId"
              name="taxRateId"
              value={selectedTaxRateId}
              onValueChange={setSelectedTaxRateId}
              options={taxRateOptions.map((option) => ({ value: option.id, label: option.label }))}
            />
          </Field>

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

      <FormSection title={t("form.sectionImages")} description={t("form.sectionImagesDesc")}>
        <MultiImageUpload
          label={t("form.imagesLabel")}
          hint={t("form.imagesHint")}
          primaryLabel={t("form.imagePrimary")}
          uploadLabel={t("form.imageUpload")}
          uploadingLabel={t("form.imageUploading")}
          removeLabel={t("form.imageRemove")}
          errorLabel={t("form.imageError")}
          altLabel={t("form.imageAlt")}
          items={mediaItems}
          onUpload={uploadFile}
          onChange={handleMediaChange}
        />
      </FormSection>

      <FormSection title={t("form.sectionVariants")} description={t("form.sectionVariantsDesc")}>
        <VariantsEditor initial={product?.variants ?? []} rateBps={selectedRateBps} />
      </FormSection>

      <FormSection
        title={t("form.sectionAttributes")}
        description={t("form.sectionAttributesDesc")}
      >
        <div className="space-y-5">
          <Field label={t("form.inci")} htmlFor="inci">
            <Textarea id="inci" name="inci" rows={4} defaultValue={product?.inci ?? ""} />
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
              <Field key={facet.id} label={facet.name} htmlFor={`facet-${facet.id}`}>
                <MultiSelect
                  id={`facet-${facet.id}`}
                  name="facetValueIds"
                  defaultValue={selectedByFacet.get(facet.id) ?? []}
                  options={facet.values.map((value) => ({ value: value.id, label: value.label }))}
                />
              </Field>
            ))}
          </div>
        </FormSection>
      )}

      <FormSection title={t("form.sectionSeo")} description={t("form.sectionSeoDesc")}>
        <div className="space-y-5">
          <CountedField
            label={t("form.metaTitle")}
            htmlFor="metaTitle"
            name="metaTitle"
            max={70}
            hint={t("form.metaTitleHint")}
            defaultValue={product?.metaTitle ?? ""}
          />
          <CountedField
            label={t("form.metaDescription")}
            htmlFor="metaDescription"
            name="metaDescription"
            max={160}
            hint={t("form.metaDescriptionHint")}
            defaultValue={product?.metaDescription ?? ""}
            multiline
          />
        </div>
      </FormSection>

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
