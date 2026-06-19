"use client";

import { Tabs } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { StockEditor, type StockVariant } from "../stock-editor";

interface ProductEditTabsProps {
  productForm: ReactNode;
  stockVariants: StockVariant[];
}

export function ProductEditTabs({ productForm, stockVariants }: ProductEditTabsProps) {
  const t = useTranslations("admin.products");

  return (
    <Tabs
      items={[
        { key: "product", label: t("tabs.product"), content: productForm },
        {
          key: "stock",
          label: t("stock.sectionTitle"),
          content: (
            <div className="max-w-3xl space-y-6">
              <p className="text-xs text-muted">{t("stock.sectionDesc")}</p>
              <StockEditor variants={stockVariants} />
            </div>
          ),
        },
      ]}
    />
  );
}
