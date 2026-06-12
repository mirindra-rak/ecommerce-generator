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
  category?: { id: string; name: string; parentId: string | null };
}

export function CategoryForm({ action, parentOptions, category }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-md space-y-5">
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
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-foreground">
          Catégorie parente
        </label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={category?.parentId ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">— Racine (aucune) —</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

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
