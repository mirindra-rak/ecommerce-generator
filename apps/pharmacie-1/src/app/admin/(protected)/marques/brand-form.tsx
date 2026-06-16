"use client";

import { Button } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "../_lib/form-state";

interface BrandFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  brand?: { id: string; name: string };
}

export function BrandForm({ action, brand }: BrandFormProps) {
  const t = useTranslations("admin");
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {brand && <input type="hidden" name="id" value={brand.id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          {t("brands.form.name")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={brand?.name}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? t("common.saving") : t("common.save")}
        </Button>
        <Link href="/admin/marques" className="text-sm text-muted hover:underline">
          {t("common.cancel")}
        </Link>
      </div>
    </form>
  );
}
