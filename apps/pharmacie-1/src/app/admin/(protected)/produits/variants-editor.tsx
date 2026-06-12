"use client";

import { Button, Field, Input } from "@pharmacie/ui";
import { useRef, useState } from "react";

// Ligne de déclinaison côté formulaire. Prix/stock en chaînes (saisie) ; `id` présent = existante.
export interface VariantRow {
  id?: string;
  volume: string; // étiquette libre (« 50 ml », « Lavande »)
  sku: string;
  ean: string;
  price: string; // euros
  stock: string;
}

interface Row extends VariantRow {
  key: number;
}

const emptyRow = (): Omit<VariantRow, "id"> => ({
  volume: "",
  sku: "",
  ean: "",
  price: "",
  stock: "0",
});

// Éditeur de déclinaisons : liste de lignes en état React, sérialisée dans un champ caché
// `variants` (JSON). Rendu adaptatif : 1 déclinaison → vue simple ; ≥ 2 → blocs numérotés.
export function VariantsEditor({ initial }: { initial: VariantRow[] }) {
  const keyRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length > 0 ? initial : [emptyRow()]).map((row) => ({ ...row, key: keyRef.current++ })),
  );

  const update = (key: number, patch: Partial<VariantRow>): void =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const add = (): void =>
    setRows((current) => [...current, { ...emptyRow(), key: keyRef.current++ }]);
  const remove = (key: number): void =>
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));

  const serialized = JSON.stringify(
    rows.map((row) => ({
      id: row.id,
      volume: row.volume,
      sku: row.sku,
      ean: row.ean,
      price: row.price,
      stock: row.stock,
    })),
  );

  const multi = rows.length > 1;

  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <div key={row.key} className={multi ? "rounded-sm border border-line p-4" : ""}>
          {multi && (
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Déclinaison {index + 1}
              </p>
              <button
                type="button"
                onClick={() => remove(row.key)}
                className="text-xs font-medium text-danger-text hover:underline"
              >
                Supprimer
              </button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Déclinaison" htmlFor={`volume-${row.key}`}>
              <Input
                id={`volume-${row.key}`}
                value={row.volume}
                placeholder="50 ml"
                onChange={(e) => update(row.key, { volume: e.target.value })}
              />
            </Field>
            <Field label="SKU" htmlFor={`sku-${row.key}`}>
              <Input
                id={`sku-${row.key}`}
                value={row.sku}
                onChange={(e) => update(row.key, { sku: e.target.value })}
              />
            </Field>
            <Field label="Code-barres (EAN)" htmlFor={`ean-${row.key}`}>
              <Input
                id={`ean-${row.key}`}
                value={row.ean}
                onChange={(e) => update(row.key, { ean: e.target.value })}
              />
            </Field>
            <Field label="Prix HT (€)" htmlFor={`price-${row.key}`}>
              <Input
                id={`price-${row.key}`}
                value={row.price}
                inputMode="decimal"
                required
                placeholder="14.90"
                onChange={(e) => update(row.key, { price: e.target.value })}
              />
            </Field>
            <Field label="Stock" htmlFor={`stock-${row.key}`}>
              <Input
                id={`stock-${row.key}`}
                type="number"
                min={0}
                value={row.stock}
                onChange={(e) => update(row.key, { stock: e.target.value })}
              />
            </Field>
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={add}>
        + Ajouter une déclinaison
      </Button>

      <input type="hidden" name="variants" value={serialized} />
    </div>
  );
}
