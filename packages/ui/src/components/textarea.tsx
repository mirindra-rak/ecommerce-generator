import type { TextareaHTMLAttributes } from "react";
import { cx } from "../lib/cx";

// Zone de texte multi-lignes : même habillage que `Input`.
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        "w-full rounded-sm border border-line bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15",
        className,
      )}
      {...props}
    />
  );
}
