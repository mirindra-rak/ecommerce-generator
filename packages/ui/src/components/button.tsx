import type { ButtonHTMLAttributes } from "react";
import { cx } from "../lib/cx";

// Bouton « officine éditoriale » : angles nets (rounded-sm, pas de pill), encre
// navy, accent vert pour la variante lien. 100 % piloté par les design tokens.
export type ButtonVariant = "primary" | "secondary" | "ghost" | "link";
export type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-foreground/15 bg-surface text-foreground hover:bg-brand-50",
  ghost: "text-foreground hover:bg-brand-50",
  link: "px-0 py-0 text-brand-700 underline decoration-accent-500 decoration-2 underline-offset-4 hover:decoration-brand-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
};

/** Classes du bouton, réutilisables sur un `<a>`/`<Link>` (navigation). */
export function buttonClasses(opts: { variant?: ButtonVariant; size?: ButtonSize } = {}): string {
  const { variant = "primary", size = "md" } = opts;
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-tight transition-colors disabled:opacity-50",
    variant === "link" ? null : sizeClasses[size],
    variantClasses[variant],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return <button className={cx(buttonClasses({ variant, size }), className)} {...props} />;
}
