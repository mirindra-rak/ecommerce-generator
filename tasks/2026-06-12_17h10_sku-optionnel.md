# SKU optionnel sur les déclinaisons

**Date:** 2026-06-12 17:10
**Statut:** Terminé

## Contexte

Le SKU d'une déclinaison était obligatoire (`String @unique`). Rendu **facultatif** comme
l'EAN. Spec/plan : `specs/stories/2026-06-12-sku-optionnel-declinaison{,-plan}.md`.
(Story d'abord mise en pause car le dépôt ne compilait pas — refactor parallèle M2M
catégories en cours ; reprise une fois le dépôt revenu au vert.)

## Modifications

- [x] `packages/core/prisma/schema.prisma` — `ProductVariant.sku String? @unique`.
- [x] `packages/core/prisma/migrations/20260612140913_sku_optionnel/migration.sql` — `ALTER
COLUMN "sku" DROP NOT NULL` (généré via `migrate diff`, appliqué via `migrate deploy`).
      Index unique conservé ; PostgreSQL autorise plusieurs `NULL`.
- [x] `product.repository.ts` — `VariantWriteInput.sku?: string | null` ; `toVariantData` →
      `sku: variant.sku ?? null`.
- [x] `product.service.ts` — `ProductVariantInput.sku?: string | null`.
- [x] `produits/_actions.ts` — SKU vide → `null` (validation « SKU requis » retirée) ;
      libellé d'erreur prix/stock tolère un SKU absent (fallback étiquette/volume).
- [x] `produits/variants-editor.tsx` — `required` retiré du champ SKU.
- [x] `produits/[id]/page.tsx` — `sku: v.sku ?? ""` (coercition null → chaîne pour l'input).
- [x] `lib/catalog.ts` — `ProductDetailVM.variants[].sku: string | null`.
- [x] `(storefront)/produit/[slug]/page.tsx` — la liste des références filtre les SKU nuls
      (affiche « — » si aucune).
- [x] Tests `product.service.test.ts` — création sans SKU (`sku = null`) ; plusieurs
      déclinaisons sans SKU coexistent (NULL distinct).

## Notes

- Unicité **conservée** sur les SKU renseignés ; prix toujours requis ; ≥ 1 déclinaison
  inchangé.
- Vérifs : core + app type-check OK, **80 tests** OK (+2), lint OK, prettier OK, migration
  appliquée. Smoke dev non effectué (serveur éteint) — couverture par tests d'intégration.
- `createWithDefaultVariant` (legacy, encore utilisé par un test repository) garde un `sku`
  requis : non concerné (createProduct passe par `createWithVariants`).

## Rollback

- Schéma : remettre `sku String @unique` (⚠️ échoue si des SKU sont déjà nuls en base).
- `git checkout -- packages/core/src/modules/catalog/{product.repository,product.service,product.service.test}.ts apps/pharmacie-1/src/{lib/catalog.ts,app/admin/\(protected\)/produits/,app/\(storefront\)/produit/}`
- `rm -rf packages/core/prisma/migrations/20260612140913_sku_optionnel` ; `db:generate`.
