# Facettes (filtres produit) — modèle + back-office + seed pharma/parapharma

**Date:** 2026-06-12 14:55
**Statut:** Terminé

## Contexte

Besoin de filtres produit (Nature, Conditionnement, Spécificité, Indication/CI). Ce sont
des données **requêtées** (faceted navigation) à vocabulaire contrôlé et multi-valuées →
pas du `attributes` jsonb, mais une **taxonomie normalisée** : `Facet` / `FacetValue` /
`ProductFacetValue` (équiv. « Features » PrestaShop, distinct des `ProductOption` qui
génèrent des déclinaisons). Ajouter une facette/valeur = INSERT, jamais de migration.

## Modifications

- [x] `packages/core/prisma/schema.prisma` — modèles `Facet`, `FacetValue`,
      `ProductFacetValue` (M:N) + relation `Product.facetValues`. Index : `Facet.code` unique,
      `FacetValue (facetId, code)` unique, `ProductFacetValue.facetValueId` (le filtre).
- [x] `packages/core/prisma/migrations/20260612114704_facets_taxonomy/` — migration générée
      via `prisma migrate diff` (non interactif) puis appliquée par `migrate deploy`.
- [x] `packages/core/src/modules/catalog/facet.repository.ts` — `findAllWithValues()`.
- [x] `product.repository.ts` — `setFacetValues(productId, ids)` (purge + recrée, atomique) ;
      `findByIdWithRelations` charge désormais `facetValues`.
- [x] `product.service.ts` — `CreateProductInput.facetValueIds` ; `createProduct` /
      `updateProduct` persistent les facettes via `setFacetValues`.
- [x] `index.ts` — export `facetRepository` + `FacetWithValues`.
- [x] `produits/produit-form.tsx` — section « Filtres / Caractéristiques » : cases à cocher
      groupées par facette (`name="facetValueIds"`).
- [x] `produits/_actions.ts` — lit `formData.getAll("facetValueIds")`.
- [x] `produits/{new,[id]}/page.tsx` — chargent les facettes ; l'édition pré-coche les
      valeurs du produit.
- [x] `packages/core/prisma/seed.ts` — taxonomie pharma + parapharma : 4 facettes / 43
      valeurs (formes galéniques + cosmétiques, conditionnements, spécificités,
      indications/CI) + assignation à chaque produit. TRUNCATE étendu aux tables facettes.
- [x] `product.service.test.ts` — test assignation + remplacement de facettes.

## Notes

- Filtrage cible (story `search`) : `AND` entre facettes, `OR` dans une facette →
  `where.AND[ { facetValues: { some: { facetValueId: { in: [...] } } } } ]`. Jointure
  indexée, pas de GIN, pas de scan jsonb.
- `attributes` jsonb conservé pour le **texte libre non filtré** (INCI, précautions).
- Vérifs : core type-check OK, **56 tests** OK (+1), app type-check OK, lint OK, prettier OK,
  migrate deploy OK, seed OK (4 facettes / 43 valeurs / 29 liaisons), routes dev 200/307.

## Hors périmètre (différé, annoncé)

- CRUD d'administration des facettes elles-mêmes (la taxonomie vient du seed).
- Sidebar de filtres côté storefront (story `search` / listing catégorie).
- Facettes au niveau **déclinaison** (si une facette distingue les variantes).

## Rollback

- `git checkout -- packages/core/prisma/schema.prisma packages/core/prisma/seed.ts packages/core/src/modules/catalog/{product.repository,product.service,product.service.test,index}.ts apps/pharmacie-1/src/app/admin/\(protected\)/produits/`
- `rm packages/core/src/modules/catalog/facet.repository.ts`
- `rm -rf packages/core/prisma/migrations/20260612114704_facets_taxonomy`
- Restaurer la base : `prisma migrate reset` puis `db:seed` ; `db:generate`.
