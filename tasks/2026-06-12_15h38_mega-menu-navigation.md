# Mega menu de navigation storefront

**Date:** 2026-06-12 15:38
**Statut:** Terminé

## Contexte

L'en-tête vitrine alimentait sa barre de navigation par un tableau `NAV` codé en dur
(liens plats, sans survol). Les catégories forment pourtant un arbre en base
(`Category.parentId` / `children`). On rend la navigation **data-driven** : un mega menu
qui ouvre, au survol / focus, un panneau de sous-catégories actives en colonnes.

Story : `specs/stories/2026-06-12-mega-menu-navigation.md`
Plan : `specs/stories/2026-06-12-mega-menu-navigation-plan.md`

## Modifications

- [x] `packages/core/src/modules/catalog/category.repository.ts` — `findActiveMenuTree()`
      (racines actives + enfants actifs, une requête, tri `position`) + type `CategoryWithChildren`.
- [x] `packages/core/src/modules/catalog/index.ts` — export du type `CategoryWithChildren`.
- [x] `packages/core/src/modules/catalog/category.repository.test.ts` — test du tri et
      du filtre `active` (racines + enfants).
- [x] `apps/pharmacie-1/src/lib/catalog.ts` — `MenuCategoryVM` + `getMenuTree()` (view-model plat).
- [x] `apps/pharmacie-1/src/app/(storefront)/_components/mega-menu.tsx` — **créé** : composant
      client (survol / focus, `aria-expanded`, fermeture `Échap`, colonnes de sous-catégories).
- [x] `apps/pharmacie-1/src/app/(storefront)/_components/site-header.tsx` — devient `async`,
      appelle `getMenuTree()`, supprime `NAV`, rend `<MegaMenu>`.
- [x] `packages/ui/src/icons.tsx` + `…/_components/icons.tsx` — ajout `ChevronDownIcon`.
- [x] `packages/core/prisma/seed.ts` — sous-catégories de démonstration (Visage, Cheveux,
      Compléments, Solaires) ; « Corps & Bain » et « Maman & Bébé » laissés en feuilles.

## Notes

- Décision one-shot : enrichissement du seed avec un niveau 2 — sinon le mega menu n'a
  aucune sous-catégorie à afficher et la feature n'est pas démontrable / testable.
- Liens spéciaux « Bons plans » / « Premium » déplacés du header vers `MegaMenu` (même nav).
- « Tous les produits » : pas de catégorie racine correspondante en base → conservé comme
  lien fixe en tête de barre (hypothèse de la story confirmée).
- Panneau positionné en absolu au niveau du `<nav>` (pleine largeur du `Container`).

## Rollback

- `git checkout -- packages/core/src/modules/catalog/category.repository.ts \
packages/core/src/modules/catalog/index.ts packages/core/prisma/seed.ts \
packages/ui/src/icons.tsx apps/pharmacie-1/src/lib/catalog.ts \
apps/pharmacie-1/src/app/(storefront)/_components/site-header.tsx \
apps/pharmacie-1/src/app/(storefront)/_components/icons.tsx`
- `rm apps/pharmacie-1/src/app/(storefront)/_components/mega-menu.tsx`
- Re-seed : `pnpm --filter @pharmacie/core db:seed` (revient au catalogue précédent).
