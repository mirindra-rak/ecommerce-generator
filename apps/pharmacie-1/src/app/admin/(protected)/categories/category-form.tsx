"use client";

import { Button, Card, Field, Input, Select, Textarea } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import type { FormState } from "../_lib/form-state";

export interface ParentOption {
  id: string;
  label: string;
}

interface CategoryFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  parentOptions: ParentOption[];
  category?: {
    id: string;
    name: string;
    parentId: string | null;
    active?: boolean;
    description?: string | null;
    additionalInfo?: string | null;
    shortDescription?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string[];
  };
}

// Carte de section : titre + aide contextuelle + corps (aligné sur le formulaire produit).
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

// Champ texte/zone avec compteur de caractères (utile pour les limites SEO).
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
  return (
    <Field label={label} htmlFor={htmlFor} hint={hint}>
      {multiline ? (
        <Textarea
          id={htmlFor}
          name={name}
          rows={2}
          defaultValue={defaultValue}
          onChange={(e) => setCount(e.target.value.length)}
        />
      ) : (
        <Input
          id={htmlFor}
          name={name}
          defaultValue={defaultValue}
          onChange={(e) => setCount(e.target.value.length)}
        />
      )}
      <p className={`text-right text-xs ${count > max ? "text-danger-text" : "text-muted"}`}>
        {count}/{max}
      </p>
    </Field>
  );
}

export function CategoryForm({ action, parentOptions, category }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const t = useTranslations("admin.categories.form");
  const tCommon = useTranslations("admin.common");

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {category && <input type="hidden" name="id" value={category.id} />}

      <FormSection title={t("sectionIdentity")} description={t("sectionIdentityDesc")}>
        <div className="space-y-5">
          <Field label={t("name")} htmlFor="name">
            <Input id="name" name="name" required defaultValue={category?.name} />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="active"
              defaultChecked={category?.active ?? true}
              className="h-4 w-4"
            />
            {t("visible")}
          </label>

          <Field label={t("parent")} htmlFor="parentId">
            <Select
              id="parentId"
              name="parentId"
              defaultValue={category?.parentId ?? ""}
              options={[
                { value: "", label: t("parentRoot") },
                ...parentOptions.map((option) => ({ value: option.id, label: option.label })),
              ]}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("sectionContent")} description={t("sectionContentDesc")}>
        <div className="space-y-5">
          <Field label={t("shortDescription")} htmlFor="shortDescription">
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={category?.shortDescription ?? ""}
            />
          </Field>
          <Field label={t("description")} htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={category?.description ?? ""}
            />
          </Field>
          <Field label={t("additionalInfo")} htmlFor="additionalInfo">
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={3}
              defaultValue={category?.additionalInfo ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("sectionSeo")} description={t("sectionSeoDesc")}>
        <div className="space-y-5">
          <CountedField
            label={t("metaTitle")}
            htmlFor="metaTitle"
            name="metaTitle"
            max={70}
            hint={t("metaTitleHint")}
            defaultValue={category?.metaTitle ?? ""}
          />
          <CountedField
            label={t("metaDescription")}
            htmlFor="metaDescription"
            name="metaDescription"
            max={160}
            hint={t("metaDescriptionHint")}
            defaultValue={category?.metaDescription ?? ""}
            multiline
          />
          <Field label={t("metaKeywords")} htmlFor="metaKeywords" hint={t("metaKeywordsHint")}>
            <Input
              id="metaKeywords"
              name="metaKeywords"
              defaultValue={category?.metaKeywords?.join(", ") ?? ""}
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
        <Link href="/admin/categories" className="text-sm text-muted hover:underline">
          {tCommon("cancel")}
        </Link>
      </div>
    </form>
  );
}
