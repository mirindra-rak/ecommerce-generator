"use client";

import { slugify } from "@pharmacie/core";
import { Button, Card, Field, Input } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState, useCallback, useRef, useState } from "react";
import type { FormState } from "../_lib/form-state";
import { useUnsavedChanges } from "../_lib/use-unsaved-changes";

interface FacetFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  facet?: { id: string; name: string; code: string };
}

export function FacetForm({ action, facet }: FacetFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const t = useTranslations("admin.facets.form");
  const tCommon = useTranslations("admin.common");
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedChanges(formRef);

  const isEditing = !!facet;
  const [codePreview, setCodePreview] = useState(facet?.code ?? "");

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isEditing) {
        setCodePreview(slugify(e.target.value));
      }
    },
    [isEditing],
  );

  return (
    <form ref={formRef} action={formAction} className="max-w-lg space-y-6">
      {facet && <input type="hidden" name="id" value={facet.id} />}

      <Card as="section" className="p-6">
        <div className="space-y-5">
          <Field label={t("name")} htmlFor="name">
            <Input
              id="name"
              name="name"
              required
              defaultValue={facet?.name}
              onChange={handleNameChange}
            />
          </Field>

          <Field
            label={t("code")}
            htmlFor="code"
            hint={isEditing ? t("codeImmutable") : t("codeHint")}
          >
            <Input
              id="code"
              value={codePreview}
              readOnly
              className="bg-bg-subtle font-mono text-muted"
            />
          </Field>
        </div>
      </Card>

      {state.error && (
        <p className="rounded-sm border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger-text">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? tCommon("saving") : tCommon("save")}
        </Button>
        <Link href="/admin/facettes" className="text-sm text-muted hover:underline">
          {tCommon("cancel")}
        </Link>
      </div>
    </form>
  );
}
