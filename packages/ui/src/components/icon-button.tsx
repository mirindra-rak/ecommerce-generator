import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../lib/cx";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

// Bouton icône carré (header, actions). `label` obligatoire pour l'accessibilité.
export function IconButton({ label, className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx(
        "relative grid h-10 w-10 place-items-center rounded-sm text-foreground/70 transition-colors hover:bg-brand-50 hover:text-brand-700",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
