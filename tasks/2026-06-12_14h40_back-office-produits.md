# Back-office produits (V1 : CRUD + déclinaison par défaut)

**Date:** 2026-06-12 14:40
**Statut:** Terminé

## Contexte

L'admin gérait catégories et marques mais pas les produits — le plus gros manque. Cette V1
livre le CRUD produit en calquant le pattern CRUD catégories, sur le modèle
`produit → déclinaison` : chaque produit a 1 **déclinaison par défaut** éditable (SKU, EAN,
prix, stock). Médias (infra MinIO greenfield) et éditeur multi-axes sont hors V1.

## Modifications

- [x] `packages/core/src/modules/catalog/catalog-errors.ts` — `DuplicateProductFieldError`
      (traduction de la violation d'unicité Prisma P2002 sur SKU/EAN).
- [x] `packages/core/src/modules/catalog/product.repository.ts` — `findMany()` (liste admin :
      marque + `_count.variants`) ; `updateVariant()` ; type `ProductListItem`.
- [x] `packages/core/src/modules/catalog/product.service.ts` — services d'écriture
      `createProduct` (via `createWithDefaultVariant`, slug unique, validation attributs),
      `updateProduct` (produit + déclinaison par défaut, slug stable), `deleteProduct`
      (cascade) ; traduction P2002.
- [x] `packages/core/src/modules/catalog/index.ts` — exports des services + types +
      `DuplicateProductFieldError`.
- [x] `apps/.../admin/(protected)/produits/_actions.ts` — server actions (requireStaff,
      conversion euros→centimes, revalidate, redirect, traduction erreurs domaine).
- [x] `apps/.../admin/(protected)/produits/produit-form.tsx` — formulaire client
      (`useActionState`) : infos produit + bloc déclinaison par défaut + attributs descriptifs.
- [x] `apps/.../admin/(protected)/produits/{page,new/page,[id]/page}.tsx` — liste (badges
      « simple » / « N décl. » / « masqué »), création, édition.
- [x] `apps/.../admin/(protected)/_components/admin-shell.tsx` — entrée NAV « Produits »
      (`PackageIcon`) + titre breadcrumb.
- [x] `packages/core/src/modules/catalog/product.service.test.ts` — 6 tests d'intégration
      (création + déclinaison, slug unique, attributs invalides, update, delete cascade,
      doublon SKU/EAN).

## Notes

- Prix en CENTIMES HT en base, saisi/affiché en euros (`Math.round(€×100)` / `÷100`).
- Édition V1 « produit simple » : on édite la **première** déclinaison (`variants[0]`).
  Les produits seed multi-variantes ne montrent que leur 1re déclinaison (éditeur multi-axes
  à venir).
- Vérifs : core type-check OK, **55 tests** OK (+6), app type-check OK, lint OK, prettier OK.
  Smoke dev (port 4000) : `/` 200, `/admin/login` 200, `/admin/produits` + `/new`
  307→login (guard + compilation OK).

## Hors périmètre (tranches suivantes)

- Upload médias produit (infra MinIO/S3, route upload, `next/image` remote, docker).
- Éditeur multi-axes (`ProductOption`/`Value` + tableau de déclinaisons) + fiche adaptative ≥ 2.

## Rollback

- `rm -rf "apps/pharmacie-1/src/app/admin/(protected)/produits"`
- `git checkout -- packages/core/src/modules/catalog/{catalog-errors,product.repository,product.service,product.service.test,index}.ts apps/pharmacie-1/src/app/admin/\(protected\)/_components/admin-shell.tsx`
- Pas de migration DB dans cette tâche (modèle inchangé).
