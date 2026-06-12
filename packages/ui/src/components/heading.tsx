import type { ReactNode } from "react";
import { cx } from "../lib/cx";

// Titre display (serif Fraunces). Filet d'accent optionnel sous le titre.
type HeadingAs = "h1" | "h2" | "h3";

const sizeByAs: Record<HeadingAs, string> = {
  h1: "text-4xl sm:text-5xl",
  h2: "text-3xl sm:text-[2rem]",
  h3: "text-xl",
};

export function Heading({
  as = "h2",
  rule = false,
  children,
  className,
}: {
  as?: HeadingAs;
  rule?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const Tag = as;
  return (
    <Tag
      className={cx(
        "font-display font-bold leading-[1.1] tracking-tight text-foreground",
        sizeByAs[as],
        className,
      )}
    >
      {children}
      {rule && <span className="mt-4 block h-px w-12 bg-accent-500" />}
    </Tag>
  );
}
