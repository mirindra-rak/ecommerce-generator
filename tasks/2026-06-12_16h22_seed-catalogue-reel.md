# Seed catalogue réel (laparaducoin) + enrichissement modèle Product

**Date:** 2026-06-12 16:22
**Statut:** Terminé

## Contexte

Le seed était un jeu de démo écrit à la main (6 univers, 8 produits). On voulait un
catalogue réaliste issu du projet voisin `laparaducoin` (export PrestaShop). L'audit
d'adéquation a révélé des champs source sans équivalent dans `Product` (TVA, SEO,
description courte, identifiant d'origine) → enrichissement du modèle puis import curé.

Story : `specs/stories/2026-06-12-seed-catalogue-reel.md`
Plan : `specs/stories/2026-06-12-seed-catalogue-reel-plan.md`

## Modifications

- [x] `packages/core/prisma/schema.prisma` — `Product` += `vatRate Int @default(2000)`,
      `metaTitle?`, `metaDescription?`, `shortDescription?`, `externalId Int? @unique` ;
      `Brand` et `Category` += `externalId Int? @unique`.
- [x] `packages/core/prisma/migrations/20260612161237_enrich_product_seed_fields/` — créée.
- [x] `packages/core/scripts/generate-catalog-seed.ts` — **créé** : générateur dev (tsx)
      qui lit les exports laparaducoin et écrit le dataset curé.
- [x] `packages/core/prisma/seed-data/catalog.json` — **créé & committé** : 46 catégories,
      72 marques, 98 produits.
- [x] `packages/core/package.json` — script `db:seed:generate`.
- [x] `packages/core/prisma/seed.ts` — lit `catalog.json` (plus de listes codées en dur) ;
      marques + arbre catégories (univers→sous-cat par externalId) + produits/variantes.
- [x] `packages/core/src/modules/catalog/seed-dataset.test.ts` — **créé** : 9 invariants
      d'intégrité du dataset committé.

## Notes

- **Migration non-interactive** : `prisma migrate dev` refuse l'environnement non-interactif ;
  migration créée via `prisma migrate diff` (SQL) + `prisma migrate deploy`.
- **TVA** en points de base (Int) : 550 = 5,5 %, 2000 = 20 % (4 taux FR dans la source).
  Coquille corrigée dans la story (Scénario 5 : {210, 550, 1000, 2000}).
- **Échantillonnage à pas régulier** dans le générateur : les petits `id` PrestaShop ne
  couvraient que 2 marques (import pilote) ; le pas régulier rétablit la diversité
  (72 marques, prix 2,45–73,33 €, TVA {5,5 %:25, 10 %:2, 20 %:71}).
- **Coercion `asText()`** : certains champs source sont typés en nombre/null.
- Univers `épilation` (0 produit) et `naturel-et-bio` (1) : peu d'éligibles côté source ;
  les univers restent dans l'arbre (mega menu).
- **Hors scope** : images (id_default_image non mappé vers storageKey), liaisons facettes
  des produits importés, calcul HT→TTC (module `pricing` reste un stub).

## Rollback

- Schéma/migration : `git checkout -- packages/core/prisma/schema.prisma` puis recréer la
  base (`prisma migrate reset`) — ou supprimer le dossier de migration + colonnes à la main.
- Code : `git checkout -- packages/core/prisma/seed.ts packages/core/package.json` ;
  `rm -r packages/core/scripts packages/core/prisma/seed-data` ;
  `rm packages/core/src/modules/catalog/seed-dataset.test.ts`.
- Re-seed : `pnpm --filter @pharmacie/core db:seed`.
