import { cx } from "../lib/cx";

// Filet hairline éditorial (séparateur).
export function Rule({ className }: { className?: string }) {
  return <hr className={cx("h-px w-full border-0 bg-line", className)} />;
}
