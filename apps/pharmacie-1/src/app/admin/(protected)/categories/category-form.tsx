"use client";

import { Button } from "@pharmacie/ui";
import Link from "next/link";
import { useActionState } from "react";
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

const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

export function CategoryForm({ action, parentOptions, category }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Nom
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={category?.name}
          className={fieldClass}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="active"
          defaultChecked={category?.active ?? true}
          className="h-4 w-4"
        />
        Affichée (visible sur la boutique)
      </label>

      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-foreground">
          Catégorie parente
        </label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={category?.parentId ?? ""}
          className={fieldClass}
        >
          <option value="">— Racine (aucune) —</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="shortDescription" className="block text-sm font-medium text-foreground">
          Description courte
        </label>
        <input
          id="shortDescription"
          name="shortDescription"
          type="text"
          defaultValue={category?.shortDescription ?? ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={category?.description ?? ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="additionalInfo" className="block text-sm font-medium text-foreground">
          Informations complémentaires
        </label>
        <textarea
          id="additionalInfo"
          name="additionalInfo"
          rows={3}
          defaultValue={category?.additionalInfo ?? ""}
          className={fieldClass}
        />
      </div>

      <fieldset className="space-y-4 border-t border-slate-200 pt-4">
        <legend className="text-sm font-bold text-foreground">SEO</legend>

        <div>
          <label htmlFor="metaTitle" className="block text-sm font-medium text-foreground">
            Balise titre
          </label>
          <input
            id="metaTitle"
            name="metaTitle"
            type="text"
            maxLength={70}
            defaultValue={category?.metaTitle ?? ""}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="metaDescription" className="block text-sm font-medium text-foreground">
            Meta description
          </label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={2}
            maxLength={160}
            defaultValue={category?.metaDescription ?? ""}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="metaKeywords" className="block text-sm font-medium text-foreground">
            Mots-clés (séparés par des virgules)
          </label>
          <input
            id="metaKeywords"
            name="metaKeywords"
            type="text"
            defaultValue={category?.metaKeywords?.join(", ") ?? ""}
            className={fieldClass}
          />
        </div>
      </fieldset>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Link href="/admin/categories" className="text-sm text-muted hover:underline">
          Annuler
        </Link>
      </div>
    </form>
  );
}
