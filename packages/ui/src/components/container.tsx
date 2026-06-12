import type { ReactNode } from "react";
import { cx } from "../lib/cx";

// Largeur de lecture + gouttières standard du storefront.
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-6xl px-6", className)}>{children}</div>;
}
