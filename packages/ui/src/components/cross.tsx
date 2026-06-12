import type { SVGProps } from "react";

// Motif signature « croix de pharmacie » — décline l'identité dans tout le DS
// (eyebrow, puces, séparateurs). Hérite de currentColor, taille via className.
export function Cross({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
      className={className}
      {...props}
    >
      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
    </svg>
  );
}
