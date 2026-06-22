"use client";

import { Button, Field, Input, Select } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { adjustStockAction, updateInventorySettingsAction } from "./_actions";

export interface StockVariant {
  id: string;
  sku: string | null;
  volume: string | null;
  stock: number;
  minOrderQty: number;
  stockLocation: string | null;
  lowStockThreshold: number | null;
  lowStockAlert: boolean;
  outOfStockBehavior: "DENY" | "ALLOW" | "DEFAULT";
  movements: {
    id: string;
    delta: number;
    stockAfter: number;
    reason: string;
    note: string | null;
    createdAt: string;
  }[];
}

function VariantStockSection({ variant }: { variant: StockVariant }) {
  const t = useTranslations("admin.products.stock");

  const [adjustState, adjustAction, adjustPending] = useActionState(adjustStockAction, {});
  const [settingsState, settingsAction, settingsPending] = useActionState(
    updateInventorySettingsAction,
    {},
  );

  const [alertEnabled, setAlertEnabled] = useState(variant.lowStockAlert);

  const label = variant.sku ?? variant.volume ?? variant.id.slice(0, 8);

  return (
    <div className="space-y-6 rounded-sm border border-line p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="text-sm font-bold text-foreground">
          {t("currentStock")} : {variant.stock}
        </p>
      </div>

      {/* Ajustement relatif */}
      <form action={adjustAction} className="space-y-3">
        <input type="hidden" name="variantId" value={variant.id} />
        <p className="text-xs font-medium text-foreground">{t("adjust")}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={t("adjust")} htmlFor={`delta-${variant.id}`}>
            <Input
              id={`delta-${variant.id}`}
              name="delta"
              type="number"
              placeholder={t("adjustPlaceholder")}
              required
            />
          </Field>
          <Field label={t("adjustNote")} htmlFor={`note-${variant.id}`}>
            <Input id={`note-${variant.id}`} name="note" placeholder={t("adjustNotePlaceholder")} />
          </Field>
          <div className="flex items-end">
            <Button type="submit" size="sm" disabled={adjustPending}>
              {adjustPending ? t("adjusting") : t("adjustSubmit")}
            </Button>
          </div>
        </div>
        {adjustState.error && <p className="text-xs text-danger-text">{adjustState.error}</p>}
      </form>

      {/* Settings */}
      <form action={settingsAction} className="space-y-4">
        <input type="hidden" name="variantId" value={variant.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("minOrderQty")} htmlFor={`minOrderQty-${variant.id}`}>
            <Input
              id={`minOrderQty-${variant.id}`}
              name="minOrderQty"
              type="number"
              min={1}
              defaultValue={String(variant.minOrderQty)}
            />
          </Field>
          <Field label={t("stockLocation")} htmlFor={`stockLocation-${variant.id}`}>
            <Input
              id={`stockLocation-${variant.id}`}
              name="stockLocation"
              defaultValue={variant.stockLocation ?? ""}
              placeholder={t("stockLocationPlaceholder")}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                name="lowStockAlert"
                defaultChecked={variant.lowStockAlert}
                className="h-4 w-4"
                onChange={(e) => setAlertEnabled(e.target.checked)}
              />
              {t("lowStockAlert")}
            </label>
          </div>
          {alertEnabled && (
            <Field label={t("lowStockThreshold")} htmlFor={`lowStockThreshold-${variant.id}`}>
              <Input
                id={`lowStockThreshold-${variant.id}`}
                name="lowStockThreshold"
                type="number"
                min={0}
                defaultValue={String(variant.lowStockThreshold ?? "")}
                placeholder={t("lowStockThresholdPlaceholder")}
              />
            </Field>
          )}
        </div>

        <Field label={t("outOfStockBehavior")} htmlFor={`outOfStockBehavior-${variant.id}`}>
          <Select
            id={`outOfStockBehavior-${variant.id}`}
            name="outOfStockBehavior"
            defaultValue={variant.outOfStockBehavior}
            options={[
              { value: "DENY", label: t("behaviorDeny") },
              { value: "ALLOW", label: t("behaviorAllow") },
              { value: "DEFAULT", label: t("behaviorDefault") },
            ]}
          />
        </Field>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={settingsPending}>
            {settingsPending ? t("savingSettings") : t("saveSettings")}
          </Button>
          {settingsState.error && <p className="text-xs text-danger-text">{settingsState.error}</p>}
        </div>
      </form>

      {/* Historique */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {t("history")}
        </p>
        {variant.movements.length === 0 ? (
          <p className="text-xs text-muted">{t("historyEmpty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="pb-1 pr-3 font-medium">{t("historyDate")}</th>
                  <th className="pb-1 pr-3 font-medium">{t("historyDelta")}</th>
                  <th className="pb-1 pr-3 font-medium">{t("historyStockAfter")}</th>
                  <th className="pb-1 pr-3 font-medium">{t("historyReason")}</th>
                  <th className="pb-1 font-medium">{t("historyNote")}</th>
                </tr>
              </thead>
              <tbody>
                {variant.movements.map((m) => (
                  <tr key={m.id} className="border-b border-line/50">
                    <td className="py-1.5 pr-3 text-muted">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="py-1.5 pr-3">
                      <span className={m.delta > 0 ? "text-green-700" : "text-danger-text"}>
                        {m.delta > 0 ? `+${m.delta}` : m.delta}
                      </span>
                    </td>
                    <td className="py-1.5 pr-3">{m.stockAfter}</td>
                    <td className="py-1.5 pr-3">
                      {t(`reason${m.reason}` as "reasonMANUAL_ADJUSTMENT")}
                    </td>
                    <td className="py-1.5 text-muted">{m.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function StockEditor({ variants }: { variants: StockVariant[] }) {
  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <VariantStockSection key={variant.id} variant={variant} />
      ))}
    </div>
  );
}
