"use client";

import { slugify } from "@pharmacie/core";
import {
  Button,
  Card,
  Field,
  ImageUpload,
  Input,
  ResetIcon,
  Select,
  Textarea,
} from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useCallback, useRef, useState, type ReactNode } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import type { FormState } from "../_lib/form-state";
import { useUnsavedChanges } from "../_lib/use-unsaved-changes";

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
    slug: string;
    parentId: string | null;
    active?: boolean;
    description?: string | null;
    additionalInfo?: string | null;
    shortDescription?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string[];
    coverImageKey?: string | null;
    thumbnailKey?: string | null;
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

export function CategoryForm({ action, parentOptions, category }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const t = useTranslations("admin.categories.form");
  const tCommon = useTranslations("admin.common");
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedChanges(formRef);

  // Slug auto-sync state
  const isEditing = !!category;
  const [slugValue, setSlugValue] = useState(category?.slug ?? "");
  const [slugManual, setSlugManual] = useState(isEditing);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!slugManual) {
        setSlugValue(slugify(e.target.value));
      }
    },
    [slugManual],
  );

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManual(true);
    setSlugValue(slugify(e.target.value));
  }, []);

  const handleSlugSync = useCallback(() => {
    const name = nameRef.current?.value ?? "";
    setSlugValue(slugify(name));
    setSlugManual(false);
  }, []);

  // Image state
  const [coverKey, setCoverKey] = useState(category?.coverImageKey ?? "");
  const [thumbKey, setThumbKey] = useState(category?.thumbnailKey ?? "");

  return (
    <form ref={formRef} action={formAction} className="max-w-3xl space-y-6">
      {category && <input type="hidden" name="id" value={category.id} />}
      <input type="hidden" name="coverImageKey" value={coverKey} />
      <input type="hidden" name="thumbnailKey" value={thumbKey} />

      <FormSection title={t("sectionIdentity")} description={t("sectionIdentityDesc")}>
        <div className="space-y-5">
          <Field label={t("name")} htmlFor="name">
            <Input
              ref={nameRef}
              id="name"
              name="name"
              required
              defaultValue={category?.name}
              onChange={handleNameChange}
            />
          </Field>

          <Field label={t("slug")} htmlFor="slug" hint={t("slugHint")}>
            <div className="flex gap-2">
              <Input id="slug" name="slug" value={slugValue} onChange={handleSlugChange} />
              <button
                type="button"
                onClick={handleSlugSync}
                title={t("slugSync")}
                className="flex shrink-0 items-center justify-center rounded-sm border border-line px-2.5 text-muted transition-colors hover:bg-bg-subtle hover:text-foreground"
              >
                <ResetIcon className="h-4 w-4" />
              </button>
            </div>
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
                ...parentOptions.map((option) => ({
                  value: option.id,
                  label: option.label,
                })),
              ]}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title={t("sectionImages")} description={t("sectionImagesDesc")}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ImageUpload
            label={t("coverImage")}
            hint={t("coverImageHint")}
            currentUrl={imageUrl(category?.coverImageKey)}
            uploadLabel={t("imageUpload")}
            uploadingLabel={t("imageUploading")}
            removeLabel={t("imageRemove")}
            errorLabel={t("imageError")}
            onUpload={uploadFile}
            onChange={(result) => setCoverKey(result?.key ?? "")}
          />
          <ImageUpload
            label={t("thumbnail")}
            hint={t("thumbnailHint")}
            currentUrl={imageUrl(category?.thumbnailKey)}
            uploadLabel={t("imageUpload")}
            uploadingLabel={t("imageUploading")}
            removeLabel={t("imageRemove")}
            errorLabel={t("imageError")}
            onUpload={uploadFile}
            onChange={(result) => setThumbKey(result?.key ?? "")}
          />
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
          <RichTextEditor
            label={t("description")}
            htmlFor="description"
            name="description"
            defaultValue={category?.description ?? ""}
          />
          <RichTextEditor
            label={t("additionalInfo")}
            htmlFor="additionalInfo"
            name="additionalInfo"
            defaultValue={category?.additionalInfo ?? ""}
          />
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
