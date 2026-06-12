"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Container, cx } from "@pharmacie/ui";
import type { MenuCategoryVM } from "@/lib/catalog";
import { ChevronDownIcon } from "./icons";

// Mega menu de navigation (desktop). L'arbre catégories est fourni par le serveur
// (view-model sérialisable) ; ce composant ne gère que l'interaction : ouverture du
// panneau au survol / focus, fermeture à la sortie souris ou via « Échap ». Une racine
// sans sous-catégorie reste un simple lien (aucun panneau).
export function MegaMenu({ categories }: { categories: MenuCategoryVM[] }) {
  // Slug de l'univers dont le panneau est ouvert (null = tous fermés).
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  // Références des déclencheurs pour rendre le focus à « Échap ».
  const triggerRefs = useRef(new Map<string, HTMLAnchorElement>());

  const active = categories.find((c) => c.slug === openSlug && c.children.length > 0) ?? null;

  function close(restoreFocus = false) {
    if (restoreFocus && openSlug) triggerRefs.current.get(openSlug)?.focus();
    setOpenSlug(null);
  }

  return (
    <nav
      className="relative border-t border-line bg-paper"
      aria-label="Catégories"
      onMouseLeave={() => close()}
      onKeyDown={(event) => {
        if (event.key === "Escape" && openSlug) {
          event.stopPropagation();
          close(true);
        }
      }}
    >
      <Container className="hidden items-center gap-1 lg:flex">
        <Link
          href="/categorie/tous-les-produits"
          className="border-b-2 border-transparent px-4 py-5 text-sm font-medium text-foreground/70 transition-colors hover:border-accent-500 hover:text-brand-700"
          onMouseEnter={() => setOpenSlug(null)}
        >
          Tous les produits
        </Link>

        {categories.map((category) => {
          const hasChildren = category.children.length > 0;
          const isOpen = openSlug === category.slug && hasChildren;
          return (
            <div
              key={category.slug}
              onMouseEnter={() => setOpenSlug(category.slug)}
              onFocus={() => setOpenSlug(category.slug)}
            >
              <Link
                ref={(node) => {
                  if (node) triggerRefs.current.set(category.slug, node);
                  else triggerRefs.current.delete(category.slug);
                }}
                href={`/categorie/${category.slug}`}
                aria-haspopup={hasChildren || undefined}
                aria-expanded={hasChildren ? isOpen : undefined}
                className={cx(
                  "flex items-center gap-1 border-b-2 px-4 py-5 text-sm font-medium transition-colors",
                  isOpen
                    ? "border-accent-500 text-brand-700"
                    : "border-transparent text-foreground/70 hover:border-accent-500 hover:text-brand-700",
                )}
              >
                {category.label}
                {hasChildren && (
                  <ChevronDownIcon
                    aria-hidden
                    className={cx("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                  />
                )}
              </Link>
            </div>
          );
        })}

        <span className="ml-auto flex items-center gap-2 py-2">
          <Link
            href="/categorie/bons-plans"
            className="rounded-sm bg-brand-600 px-4 py-2 text-xs font-medium tracking-tight text-white transition-colors hover:bg-brand-700"
          >
            Bons plans
          </Link>
          <Link
            href="/premium"
            className="rounded-sm bg-foreground px-4 py-2 text-xs font-medium tracking-tight text-white transition-colors hover:bg-foreground/90"
          >
            Premium
          </Link>
        </span>
      </Container>

      {/* Panneau déroulant — pleine largeur, colonnes de sous-catégories. */}
      {active && (
        <div className="absolute inset-x-0 top-full z-40 border-t border-line bg-paper shadow-sm">
          <Container className="py-6">
            <Link
              href={`/categorie/${active.slug}`}
              className="mb-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-700 hover:text-brand-600"
            >
              Tout {active.label}
              <ChevronDownIcon aria-hidden className="h-3 w-3 -rotate-90" />
            </Link>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              {active.children.map((child) => (
                <li key={child.slug}>
                  <Link
                    href={`/categorie/${child.slug}`}
                    className="block py-1.5 text-sm text-foreground/70 transition-colors hover:text-brand-700"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      )}
    </nav>
  );
}
