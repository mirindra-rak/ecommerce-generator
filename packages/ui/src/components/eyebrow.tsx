import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import { Cross } from "./cross";

// Sur-titre éditorial : capitales tracées, précédé du motif croix.
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700",
        className,
      )}
    >
      <Cross className="h-2.5 w-2.5 text-brand-600" />
      {children}
    </p>
  );
}
