"use client";

import type { ReactNode } from "react";
import { IconContext, type IconWeight } from "@phosphor-icons/react";

// Définit le poids Phosphor par défaut pour TOUT l'arbre (un seul réglage global).
// On ne fixe que `weight` : `size` (1em) et `color` (currentColor) gardent leurs
// valeurs par défaut, donc className (`h-5 w-5`) et les tokens de couleur priment.
// Un `weight` passé directement sur une icône (ex. StarIcon en « fill ») l'emporte.
export function IconProvider({
  children,
  weight = "regular",
}: {
  children: ReactNode;
  weight?: IconWeight;
}) {
  return <IconContext.Provider value={{ weight }}>{children}</IconContext.Provider>;
}
