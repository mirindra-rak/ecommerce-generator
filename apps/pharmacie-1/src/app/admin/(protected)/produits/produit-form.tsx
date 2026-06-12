"use client";

import { Button, Card, Field, Input, MultiSelect, Select, Textarea } from "@pharmacie/ui";
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

const TYPE_LABELS: Record<string, string> = {
  COSMETIC: "Cosmétique",
  SUPPLEMENT: "Complément alimentaire",
  DEVICE: "Dispositif médical",
  OTHER: "Autre",
};

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
  const [state, formAction, pending] = useActionState(action, {});
  const selected = new Set(selectedFacetValueIds);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <FormSection title="Identité" description="Informations éditoriales affichées sur la fiche.">
        <div className="space-y-5">
          <Field label="Nom" htmlFor="name">
            <Input id="name" name="name" required defaultValue={product?.name} />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product?.active ?? true}
              className="h-4 w-4"
            />
            Actif (visible sur la boutique)
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Type" htmlFor="productType">
              <Select
                id="productType"
                name="productType"
                defaultValue={product?.productType ?? "OTHER"}
                options={productTypes.map((type) => ({
                  value: type,
                  label: TYPE_LABELS[type] ?? type,
                }))}
              />
            </Field>

            <Field label="Marque" htmlFor="brandId">
              <Select
                id="brandId"
                name="brandId"
                defaultValue={product?.brandId ?? ""}
                options={[
                  { value: "", label: "— Aucune —" },
                  ...brandOptions.map((option) => ({ value: option.id, label: option.label })),
                ]}
              />
            </Field>
          </div>

          <Field label="Catégories" htmlFor="categoryIds">
            <MultiSelect
              id="categoryIds"
              name="categoryIds"
              defaultValue={product?.categoryIds ?? []}
              placeholder="Sélectionner des catégories…"
              options={categoryOptions.map((option) => ({ value: option.id, label: option.label }))}
            />
          </Field>

          <Field
            label="Catégorie principale"
            htmlFor="primaryCategoryId"
            hint="URL canonique et fil d'Ariane. Doit faire partie des catégories sélectionnées."
          >
            <Select
              id="primaryCategoryId"
              name="primaryCategoryId"
              defaultValue={product?.primaryCategoryId ?? ""}
              options={[
                { value: "", label: "— Aucune —" },
                ...categoryOptions.map((option) => ({ value: option.id, label: option.label })),
              ]}
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product?.description ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Déclinaisons"
        description="Le vendable : chaque déclinaison a son code, son prix et son stock."
      >
        <VariantsEditor initial={product?.variants ?? []} />
      </FormSection>

      <FormSection
        title="Attributs descriptifs"
        description="Informations libres, non utilisées pour le filtrage."
      >
        <div className="space-y-5">
          <Field label="INCI" htmlFor="inci">
            <Input id="inci" name="inci" defaultValue={product?.inci ?? ""} />
          </Field>
          <Field label="Précautions" htmlFor="precautions">
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
        <FormSection
          title="Filtres / Caractéristiques"
          description="Critères de filtrage proposés sur la boutique."
        >
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
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Link href="/admin/produits" className="text-sm text-muted hover:underline">
          Annuler
        </Link>
      </div>
    </form>
  );
}
