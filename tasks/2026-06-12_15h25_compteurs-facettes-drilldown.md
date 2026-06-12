# Compteurs par valeur (drill-down) sur la sidebar de filtres

**Date:** 2026-06-12 15:25
**Statut:** Terminé

## Contexte

La sidebar de filtres affichait les valeurs sans compteur. Ajout du **compteur drill-down**
par valeur : pour une valeur d'une facette, on compte les produits actifs de la catégorie
satisfaisant les filtres des AUTRES facettes (la facette courante est exclue, car ses valeurs
sont en OU). Ainsi les compteurs d'une facette restent stables quand on (dé)coche dans cette
même facette, et reflètent les contraintes des autres.

## Modifications

- [x] `packages/core/src/modules/catalog/facet.repository.ts` — `findForCategoryWithCounts(slug, filters)` :
      une requête `groupBy` par facette présente, `where` = facette courante + produits de la
      catégorie satisfaisant les filtres des autres facettes. Types `FacetWithCounts`/`FacetValueCount`.
      Les filtres inconnus / hors-catégorie sont ignorés (sanitation interne).
- [x] `index.ts` — export des nouveaux types.
- [x] `apps/pharmacie-1/src/lib/catalog.ts` — `getCategoryFilters(slug, filters)` renvoie les
      compteurs ; `FilterFacetVM.values` gagne `count`.
- [x] `apps/.../categorie/[slug]/page.tsx` — parse les filtres bruts de l'URL, calcule les
      compteurs avec, puis restreint les filtres aux facettes présentes pour la requête produits.
- [x] `apps/.../_components/category-filters.tsx` — affiche `count` par valeur ; valeur à 0
      non cochée = grisée + case désactivée.
- [x] `packages/core/src/modules/catalog/facet.repository.test.ts` — tests : compteurs sans
      filtre ; drill-down (filtre sur une facette ajuste les autres, facette courante exclue).

## Vérifs

- core type-check OK, **59 tests** OK (+2), app type-check OK, lint OK, prettier OK.
- Smoke dev (`/categorie/visage-soin`) : base → Crème 1 / Sérum 1 / Lotion 1 / Sans paraben 2
  / Sans parfum 1. Avec `?specificite=sans-paraben` → **Lotion passe à 0** (drill-down), les
  compteurs de Spécificité restent 2/1 (facette auto-exclue).

## Hors périmètre (différé)

- Tri + pagination du listing ; CRUD admin des facettes.

## Rollback

- `git checkout -- packages/core/src/modules/catalog/{facet.repository,index}.ts apps/pharmacie-1/src/lib/catalog.ts apps/pharmacie-1/src/app/\(storefront\)/categorie/ apps/pharmacie-1/src/app/\(storefront\)/_components/category-filters.tsx`
- `rm packages/core/src/modules/catalog/facet.repository.test.ts`
