# Filtrage à facettes — sidebar listing catégorie (storefront)

**Date:** 2026-06-12 15:15
**Statut:** Terminé

## Contexte

Le listing catégorie n'avait aucun filtre. Avec la taxonomie de facettes en place, on ajoute
une sidebar de filtres pilotée par l'URL (partageable/indexable, compatible RSC), sémantique
**ET entre facettes, OU à l'intérieur d'une facette**. V1 sans compteurs par valeur ni
tri/pagination (différés).

## Modifications

- [x] `packages/core/src/modules/catalog/product.repository.ts` — `findCardsByCategorySlug`
      accepte `filters: Record<string, string[]>` ; construit un `AND` de clauses
      `facetValues.some.facetValue.facet.code + code in [...]` (jointure indexée, pas de GIN).
- [x] `packages/core/src/modules/catalog/facet.repository.ts` — `findForCategory(slug)` :
      facettes + valeurs **présentes** parmi les produits actifs de la catégorie.
- [x] `apps/pharmacie-1/src/lib/catalog.ts` — `getCategoryWithProducts(slug, filters)` +
      `getCategoryFilters(slug)` (VM `FilterFacetVM`).
- [x] `apps/.../(storefront)/categorie/[slug]/page.tsx` — lit `searchParams`, déduit les
      filtres (param par facette, valeurs en CSV), layout `lg:flex` sidebar + grille.
- [x] `apps/.../(storefront)/_components/category-filters.tsx` — sidebar client : cases à
      cocher groupées, toggle → réécrit l'URL (`useRouter`/`useSearchParams`), « Réinitialiser »
      conditionnel, repliable `<details>` en mobile.
- [x] `packages/core/src/test/db.ts` — `resetDb` truncate désormais les tables facettes
      (sinon collision de `code` entre tests).
- [x] `product.repository.test.ts` — test filtrage (filtre simple, OU interne, ET externe,
      intersection vide).

## Schéma d'URL

`/categorie/visage-soin?nature=creme,serum&specificite=bio`
→ (nature creme OU serum) ET (specificite bio).

## Vérifs

- core type-check OK, **57 tests** OK (+1), app type-check OK, lint OK, prettier OK.
- Smoke dev (`/categorie/visage-soin`) : aucun filtre = 3 produits ; `?nature=creme` = 1 ;
  `?nature=creme,serum` = 2 (OU) ; `?nature=creme&specificite=sans-paraben` = 1 (ET).
  Sidebar rendue (Nature/Conditionnement/Spécificité + toggle mobile), « Réinitialiser » et
  état coché présents avec filtre actif.

## Hors périmètre (différé)

- Compteurs par valeur (drill-down), tri, pagination.
- CRUD admin des facettes.

## Rollback

- `rm apps/pharmacie-1/src/app/\(storefront\)/_components/category-filters.tsx`
- `git checkout -- packages/core/src/modules/catalog/{product.repository,facet.repository}.ts packages/core/src/test/db.ts packages/core/src/modules/catalog/product.repository.test.ts apps/pharmacie-1/src/lib/catalog.ts apps/pharmacie-1/src/app/\(storefront\)/categorie/`
