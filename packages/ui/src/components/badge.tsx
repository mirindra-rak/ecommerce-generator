import type { ReactNode } from "react";
import { cx } from "../lib/cx";

type BadgeTone = "accent" | "brand" | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  accent: "bg-accent-600 text-white",
  brand: "bg-brand-600 text-white",
  neutral: "bg-foreground/5 text-foreground",
};

// Étiquette compacte (promo, statut). Angles nets, capitales tracées.
export function Badge({
  children,
  tone = "accent",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
