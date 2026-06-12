import type { ReactNode } from "react";
import { cx } from "../lib/cx";

// Ligne de formulaire : label lié au contrôle (`htmlFor`), aide et erreur optionnelles.
// Le contrôle (Input/Select/Textarea/checkbox…) est passé en enfant.
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {children}
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </div>
  );
}
