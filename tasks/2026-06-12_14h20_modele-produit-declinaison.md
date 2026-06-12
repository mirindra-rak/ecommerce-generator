# Modèle catalogue « produit → déclinaison »

**Date:** 2026-06-12 14:20
**Statut:** Terminé

## Contexte

Cadrage du modèle de données produit pour le back-office à venir. Décision actée :
convention « tout est déclinaison ». Le `Product` est un **regroupeur éditorial** (nom,
description, marque, catégorie, attributs descriptifs, médias) ; la `ProductVariant`
(déclinaison) est **la seule unité vendable** (SKU, EAN, prix, stock). Un produit
« simple » = 1 produit + 1 déclinaison par défaut. Le schéma y était déjà à ~90 % ;
restaient 2 écarts à corriger.

## Modifications

- [x] `packages/core/prisma/schema.prisma` — retire `ean` de `Product`, ajoute
      `ean String? @unique` sur `ProductVariant` (le code-barres identifie la déclinaison).
- [x] `packages/core/prisma/migrations/20260612112108_move_ean_to_variant/migration.sql`
      — migration rédigée à la main (drop colonne `Product.ean` + index, add
      `ProductVariant.ean` + index unique). Appliquée via `prisma migrate deploy`
      (`migrate dev` non interactif en CI/headless + avertissement de perte de données).
- [x] `packages/core/src/modules/catalog/product.repository.ts` :
  - `findByEan` interroge désormais `ProductVariant` et remonte le produit parent
    (retourne `ProductWithRelations`).
  - Ajout de `createWithDefaultVariant(input)` : crée produit + déclinaison par défaut
    en une écriture atomique (nested write Prisma) → garantit l'invariant « ≥ 1
    déclinaison » côté écriture.
- [x] `packages/core/src/modules/catalog/product.service.ts` — `isDisplayable` documenté
      comme garde **lecture** de l'invariant (la garantie écriture est dans le repository).
- [x] `packages/core/prisma/seed.ts` — `ean` déplacé de `ProductSpec` vers `VariantSpec`
      (chaque déclinaison son code-barres ; EAN distincts par variante).
- [x] `packages/core/src/modules/catalog/product.repository.test.ts` — EAN testé au
      niveau déclinaison (doublon EAN entre 2 variantes rejeté) ; nouveau test
      `createWithDefaultVariant` (1 déclinaison portant SKU/EAN/prix/stock, `isDisplayable`).

## Notes

- Modèle multi-axes existant (`ProductOption`/`ProductOptionValue`/`VariantOptionValue`)
  inchangé et déjà plus riche que nécessaire.
- Vérifs : `type-check` OK, `test` 49/49 OK, `lint` OK, `prettier` OK, `db deploy` OK,
  `db seed` OK (8 produits / 11 déclinaisons).
- Hors périmètre (plans ultérieurs) : back-office produits (CRUD, fiche adaptative,
  upload médias), import en masse, `weight`/`active`/image sur la déclinaison, cross-sell.

## Rollback

- `git checkout -- packages/core/prisma/schema.prisma packages/core/prisma/seed.ts packages/core/src/modules/catalog/product.repository.ts packages/core/src/modules/catalog/product.service.ts packages/core/src/modules/catalog/product.repository.test.ts`
- Supprimer le dossier `packages/core/prisma/migrations/20260612112108_move_ean_to_variant/`.
- Restaurer la base dev : `pnpm --filter @pharmacie/core db:deploy` après rollback du
  schéma, ou `prisma migrate reset` puis `db:seed`.
- `pnpm --filter @pharmacie/core db:generate` pour régénérer le client.
