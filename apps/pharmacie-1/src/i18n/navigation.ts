import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Helpers de navigation locale-aware. À utiliser à la place de `next/link` et des hooks
// de `next/navigation` (usePathname/useRouter) côté storefront : ils préservent le préfixe
// de locale courant sur tous les liens et redirections internes.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
