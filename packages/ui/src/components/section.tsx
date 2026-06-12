import type { ReactNode } from "react";
import { cx } from "../lib/cx";

// Rythme vertical homogène entre les sections de page.
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cx("py-20 lg:py-28", className)}>
      {children}
    </section>
  );
}
