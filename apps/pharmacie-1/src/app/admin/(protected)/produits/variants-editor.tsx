"use client";

import { Button, Field, Input } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export interface VariantRow {
  id?: string;
  volume: string;
  sku: string;
  ean: string;
  price: string; // euros HT
  stock: string;
}

interface Row extends VariantRow {
  key: number;
  priceInclTax: string; // euros TTC (derived, never sent to server)
}

const emptyRow = (): Omit<VariantRow, "id"> => ({
  volume: "",
  sku: "",
  ean: "",
  price: "",
  stock: "0",
});

function parseEuros(input: string): number | null {
  const normalized = input.replace(",", ".").trim();
  if (normalized === "") return null;
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function computeInclTax(priceExclTax: string, rateBps: number): string {
  const ht = parseEuros(priceExclTax);
  if (ht === null) return "";
  return ((ht * (10000 + rateBps)) / 10000).toFixed(2);
}

function computeExclTax(priceInclTax: string, rateBps: number): string {
  const ttc = parseEuros(priceInclTax);
  if (ttc === null) return "";
  return ((ttc * 10000) / (10000 + rateBps)).toFixed(2);
}

export function VariantsEditor({ initial, rateBps }: { initial: VariantRow[]; rateBps: number }) {
  const t = useTranslations("admin.products.variants");
  const keyRef = useRef(0);
  const [rows, setRows] = useState<Row[]>(() =>
    (initial.length > 0 ? initial : [emptyRow()]).map((row) => ({
      ...row,
      key: keyRef.current++,
      priceInclTax: computeInclTax(row.price, rateBps),
    })),
  );

  const prevRateBpsRef = useRef(rateBps);
  useEffect(() => {
    if (prevRateBpsRef.current === rateBps) return;
    prevRateBpsRef.current = rateBps;
    setRows((current) =>
      current.map((row) => ({
        ...row,
        priceInclTax: computeInclTax(row.price, rateBps),
      })),
    );
  }, [rateBps]);

  const update = (key: number, patch: Partial<Row>): void =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const add = (): void =>
    setRows((current) => [...current, { ...emptyRow(), key: keyRef.current++, priceInclTax: "" }]);
  const remove = (key: number): void =>
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));

  const handlePriceChange = (key: number, value: string): void => {
    update(key, { price: value, priceInclTax: computeInclTax(value, rateBps) });
  };

  const handlePriceInclTaxChange = (key: number, value: string): void => {
    update(key, { priceInclTax: value, price: computeExclTax(value, rateBps) });
  };

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
                {t("number", { number: index + 1 })}
              </p>
              <button
                type="button"
                onClick={() => remove(row.key)}
                className="text-xs font-medium text-danger-text hover:underline"
              >
                {t("remove")}
              </button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("label")} htmlFor={`volume-${row.key}`}>
              <Input
                id={`volume-${row.key}`}
                value={row.volume}
                placeholder={t("volumePlaceholder")}
                onChange={(e) => update(row.key, { volume: e.target.value })}
              />
            </Field>
            <Field label={t("sku")} htmlFor={`sku-${row.key}`}>
              <Input
                id={`sku-${row.key}`}
                value={row.sku}
                onChange={(e) => update(row.key, { sku: e.target.value })}
              />
            </Field>
            <Field label={t("ean")} htmlFor={`ean-${row.key}`}>
              <Input
                id={`ean-${row.key}`}
                value={row.ean}
                onChange={(e) => update(row.key, { ean: e.target.value })}
              />
            </Field>
            <Field label={t("price")} htmlFor={`price-${row.key}`}>
              <Input
                id={`price-${row.key}`}
                value={row.price}
                inputMode="decimal"
                required
                placeholder={t("pricePlaceholder")}
                onChange={(e) => handlePriceChange(row.key, e.target.value)}
              />
            </Field>
            <Field label={t("priceInclTax")} htmlFor={`price-incl-tax-${row.key}`}>
              <Input
                id={`price-incl-tax-${row.key}`}
                value={row.priceInclTax}
                inputMode="decimal"
                placeholder={t("priceInclTaxPlaceholder")}
                onChange={(e) => handlePriceInclTaxChange(row.key, e.target.value)}
              />
            </Field>
            {/* Stock géré dans la section Stocks (inventory) */}
          </div>
        </div>
      ))}

      <Button type="button" variant="secondary" size="sm" onClick={add}>
        {t("add")}
      </Button>

      <input type="hidden" name="variants" value={serialized} />
    </div>
  );
}
