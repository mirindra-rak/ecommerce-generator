import type { InputHTMLAttributes } from "react";
import { cx } from "../lib/cx";

// Champ texte éditorial : filet hairline, angles nets, focus accent navy.
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "w-full rounded-sm border border-line bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
        className,
      )}
      {...props}
    />
  );
}
