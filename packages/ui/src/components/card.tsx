import type { ElementType, ReactNode } from "react";
import { cx } from "../lib/cx";

// Panneau « encadré » éditorial : filet hairline, fond surface, pas d'ombre par
// défaut (on évite le look « carte flottante » générique). Angles nets.
export function Card({
  as: Tag = "div",
  children,
  className,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tag className={cx("rounded-sm border border-line bg-surface", className)}>{children}</Tag>
  );
}
