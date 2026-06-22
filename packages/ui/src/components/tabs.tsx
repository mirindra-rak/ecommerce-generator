"use client";

import { useState, type ReactNode } from "react";
import { cx } from "../lib/cx";

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultKey?: string;
}

export function Tabs({ items, defaultKey }: TabsProps) {
  const [active, setActive] = useState(defaultKey ?? items[0]?.key ?? "");
  const current = items.find((item) => item.key === active) ?? items[0];

  return (
    <div>
      <div className="flex gap-0 border-b border-line" role="tablist">
        {items.map((item) => (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={item.key === active}
            onClick={() => setActive(item.key)}
            className={cx(
              "px-4 py-2.5 text-sm font-medium tracking-tight transition-colors",
              item.key === active
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="pt-6" role="tabpanel">
        {current?.content}
      </div>
    </div>
  );
}
