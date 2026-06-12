"use client";

import { Button, Card, Field, Input, Select, Textarea } from "@pharmacie/ui";
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

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {category && <input type="hidden" name="id" value={category.id} />}

      <FormSection title="Identité" description="Nom, visibilité et place dans l'arborescence.">
        <div className="space-y-5">
          <Field label="Nom" htmlFor="name">
            <Input id="name" name="name" required defaultValue={category?.name} />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="active"
              defaultChecked={category?.active ?? true}
              className="h-4 w-4"
            />
            Affichée (visible sur la boutique)
          </label>

          <Field label="Catégorie parente" htmlFor="parentId">
            <Select
              id="parentId"
              name="parentId"
              defaultValue={category?.parentId ?? ""}
              options={[
                { value: "", label: "— Racine (aucune) —" },
                ...parentOptions.map((option) => ({ value: option.id, label: option.label })),
              ]}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Contenu" description="Textes éditoriaux affichés sur la page catégorie.">
        <div className="space-y-5">
          <Field label="Description courte" htmlFor="shortDescription">
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={category?.shortDescription ?? ""}
            />
          </Field>
          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={category?.description ?? ""}
            />
          </Field>
          <Field label="Informations complémentaires" htmlFor="additionalInfo">
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={3}
              defaultValue={category?.additionalInfo ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="SEO" description="Métadonnées pour les moteurs de recherche.">
        <div className="space-y-5">
          <CountedField
            label="Balise titre"
            htmlFor="metaTitle"
            name="metaTitle"
            max={70}
            hint="Idéalement 50–60 caractères."
            defaultValue={category?.metaTitle ?? ""}
          />
          <CountedField
            label="Meta description"
            htmlFor="metaDescription"
            name="metaDescription"
            max={160}
            hint="Idéalement 150–160 caractères."
            defaultValue={category?.metaDescription ?? ""}
            multiline
          />
          <Field label="Mots-clés" htmlFor="metaKeywords" hint="Séparés par des virgules.">
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
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Link href="/admin/categories" className="text-sm text-muted hover:underline">
          Annuler
        </Link>
      </div>
    </form>
  );
}
