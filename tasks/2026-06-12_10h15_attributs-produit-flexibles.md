# Attributs produit flexibles (jsonb + attribute-sets) — couture niveau 3

**Date:** 2026-06-12 10:15
**Statut:** Terminé

## Contexte

Ouvrir le schéma produit pour un futur vertical sans migration, dogfoodé sur la
parapharmacie. Option A (« la couture »), pas la machinerie complète (option B).
Exécution du plan `2026-06-12-attributs-produit-flexibles-plan.md`.

## Modifications

- [x] `core/package.json` - dépendance zod@4
- [x] `core/prisma/schema.prisma` - Product : +attributes Json, productType String,
      suppression enum ProductType + colonnes inci/precautions ; ean reste colonne
- [x] `core/prisma/migrations/20260612101500_product_flexible_attributes/` - migration
      écrite À LA MAIN (migrate dev refuse en non-interactif sur perte de données),
      appliquée via migrate deploy
- [x] `core/.../catalog/product-attributes.ts` - ProductType union + PRODUCT_TYPES,
      schémas Zod par type, getAttributeSchema (défaut permissif looseObject),
      validateAttributes (throw), parseAttributes (lecture typée, zéro any)
- [x] `core/.../catalog/catalog-errors.ts` - InvalidProductAttributesError
- [x] `core/.../catalog/index.ts` - exports
- [x] `core/.../catalog/product-attributes.test.ts` - 7 tests
- [x] `core/.../catalog/product.repository.test.ts` - fixture (inci → attributes)
- [x] `core/prisma/seed.ts` - inci/precautions dans attributes, productType en chaîne
- [x] `apps/.../lib/catalog.ts` - getProductDetail lit inci/precautions via parseAttributes
- [x] fiche produit (produit/[slug]/page.tsx) INCHANGÉE (VM identique)

## Notes

- Migration DESTRUCTIVE (drop inci/precautions/enum) — OK car données dev/seed only ;
  en prod réelle : copier colonnes → attributes AVANT le drop.
- migrate dev bloque en non-interactif sur perte de données → migration hand-written +
  migrate deploy ; migrate status = up to date.
- Zod v4 : z.looseObject({}) pour le schéma permissif (type inconnu ne casse pas la lecture).
- Validation prête + testée mais PAS encore branchée (pas de write-service produit ;
  admin produits = story future). Le seed insère des données connues valides.
- Smoke : /produit/creme-hydratante-visage affiche INCI + précautions lus du jsonb ;
  /produit/complement-magnesium-b6 (SUPPLEMENT) affiche précautions seules.
- Validation : 39 tests, type-check, lint, build verts. Build home « collect page data »
  a flanché une fois (hiccup DB transitoire sur page dynamique) puis stable.
- Bénéfice : ajouter un vertical = nouvel attribute-set Zod dans REGISTRY, sans migration.

## Rollback

- `git revert` + `prisma migrate resolve --rolled-back 20260612101500_product_flexible_attributes`
  ou restaurer un dump. Re-seed après.
