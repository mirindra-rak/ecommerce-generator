"use client";

import { Button, Card, Field, ImageUpload, Input, Textarea } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useRef, useState, type ReactNode } from "react";
import type { FormState } from "../_lib/form-state";
import { useUnsavedChanges } from "../_lib/use-unsaved-changes";

interface BrandFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  brand?: {
    id: string;
    name: string;
    active?: boolean;
    shortDescription?: string | null;
    description?: string | null;
    logoKey?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  };
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

async function uploadFile(file: File): Promise<{ key: string; url: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

function imageUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  return `/uploads/${key}`;
}

export function BrandForm({ action, brand }: BrandFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const t = useTranslations("admin.brands.form");
  const tCommon = useTranslations("admin.common");
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedChanges(formRef);

  const [logoKey, setLogoKey] = useState(brand?.logoKey ?? "");

  return (
    <form ref={formRef} action={formAction} className="max-w-3xl space-y-6">
      {brand && <input type="hidden" name="id" value={brand.id} />}
      <input type="hidden" name="logoKey" value={logoKey} />

      <FormSection title={t("sectionIdentity")} description={t("sectionIdentityDesc")}>
        <div className="space-y-5">
          <Field label={t("name")} htmlFor="name">
            <Input id="name" name="name" required defaultValue={brand?.name} />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="active"
              defaultChecked={brand?.active ?? true}
              className="h-4 w-4"
            />
            {t("visible")}
          </label>
        </div>
      </FormSection>

      <FormSection title={t("sectionLogo")} description={t("sectionLogoDesc")}>
        <ImageUpload
          label={t("logo")}
          hint={t("logoHint")}
          currentUrl={imageUrl(brand?.logoKey)}
          uploadLabel={t("imageUpload")}
          uploadingLabel={t("imageUploading")}
          removeLabel={t("imageRemove")}
          errorLabel={t("imageError")}
          onUpload={uploadFile}
          onChange={(result) => setLogoKey(result?.key ?? "")}
        />
      </FormSection>

      <FormSection title={t("sectionContent")} description={t("sectionContentDesc")}>
        <div className="space-y-5">
          <Field label={t("shortDescription")} htmlFor="shortDescription">
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={brand?.shortDescription ?? ""}
            />
          </Field>
          <Field label={t("description")} htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={brand?.description ?? ""}
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
            defaultValue={brand?.metaTitle ?? ""}
          />
          <CountedField
            label={t("metaDescription")}
            htmlFor="metaDescription"
            name="metaDescription"
            max={160}
            hint={t("metaDescriptionHint")}
            defaultValue={brand?.metaDescription ?? ""}
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
          {pending ? tCommon("saving") : tCommon("save")}
        </Button>
        <Link href="/admin/marques" className="text-sm text-muted hover:underline">
          {tCommon("cancel")}
        </Link>
      </div>
    </form>
  );
}
