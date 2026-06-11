# Story 01 — Modèle de données catalogue + repositories

**Date:** 2026-06-11 19:40
**Statut:** Terminé

## Contexte

Exécution du plan `specs/epics/2026-06-11-catalogue/stories/01-modele-donnees-repositories-plan.md`.
Socle de données du module catalogue (epic Catalogue, lot 4.1). Décisions actées :
onDelete catégorie = Restrict, slugify partagé dans `core`, productType défaut OTHER.

## Modifications

- [x] `packages/core/prisma/schema.prisma` - enum ProductType, attributs parapharmacie,
      options/valeurs multi-axes, VariantOptionValue, ProductMedia, règles onDelete
- [x] `packages/core/prisma/migrations/20260611155007_catalog_model/` - migration
- [x] `packages/core/src/utils/slugify.ts` (+ test) - utilitaire partagé
- [x] `packages/core/src/modules/catalog/brand.repository.ts`
- [x] `packages/core/src/modules/catalog/category.repository.ts` (arbre + CTE récursif)
- [x] `packages/core/src/modules/catalog/product.repository.ts` (CRUD + relations)
- [x] `packages/core/src/modules/catalog/index.ts` - exports
- [x] `packages/core/src/index.ts` - export slugify
- [x] `packages/core/vitest.config.ts` + `src/test/{global-setup,setup,db}.ts`
- [x] Tests d'intégration : brand, category, product (13 tests verts)
- [x] `.github/workflows/ci.yml` - service PostgreSQL de test
- [x] `packages/core/.env` + `.env.test` (gitignorés)

## Notes

- Bases PostgreSQL locales créées : `pharmacie` (dev) + `pharmacie_test` (test),
  rôle `pharmacie` (CREATEDB) sur l'instance Homebrew locale (Docker daemon éteint).
- Tests d'intégration sur vraie base (cascade/unicité non mockables). globalSetup
  applique `prisma migrate deploy` ; setup truncate entre tests ; fileParallelism off.
- Validation : `pnpm test` (13 ✅), `type-check` ✅, `lint` ✅, `build` ✅.
- Liaison variante↔valeur d'option : créée en 2 temps dans les tests (IDs connus
  après création) — l'API de création « tout-en-un » relève de l'admin (story 03).

## Rollback

- `git revert` du commit de la story.
- Migration : `prisma migrate resolve --rolled-back 20260611155007_catalog_model`
  puis suppression du dossier de migration, ou restauration d'un dump.
