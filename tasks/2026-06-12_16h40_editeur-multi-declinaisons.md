# Éditeur multi-déclinaisons (back-office produit)

**Date:** 2026-06-12 16:40
**Statut:** Terminé

## Contexte

Le formulaire produit ne gérait qu'une déclinaison (`variants[0]`). On permet d'éditer
**plusieurs déclinaisons** par produit (Option A : étiquette libre `volume` + SKU/EAN/prix/
stock, pas d'axe nommé). Voir spec/plan :
`specs/stories/2026-06-12-editeur-multi-declinaisons-produit{,-plan}.md`.

## Modifications

- [x] `catalog-errors.ts` — `ProductRequiresVariantError` (+ export `index.ts`).
- [x] `product.service.ts` — `ProductVariantInput` (+`id?`, +`volume?`) ;
      `Create/UpdateProductInput.variants: []` (au lieu de `defaultVariant`/`variantId`) ;
      `createProduct` (N déclinaisons, ≥ 1) ; `updateProduct` réconcilie + garde ≥ 1.
- [x] `product.repository.ts` — `VariantWriteInput` + `toVariantData` ; `createWithVariants` ;
      `reconcileVariants` (transaction : supprime absentes / met à jour `id` / crée nouvelles).
- [x] `produits/_actions.ts` — lit le champ caché `variants` (JSON, parse défensif),
      euros→centimes par ligne, validations, `ProductRequiresVariantError` géré.
- [x] `produits/variants-editor.tsx` — **créé** : éditeur client (état des lignes, ajout/
      suppression — pas la dernière, champ caché JSON, rendu adaptatif 1 → simple / ≥ 2 → blocs).
- [x] `produits/produit-form.tsx` — section « Déclinaisons » → `<VariantsEditor>` ;
      `ProductFormValue.variants` (suppr. champs uniques + `variantId`).
- [x] `produits/[id]/page.tsx` — mappe **toutes** `product.variants` en lignes.
- [x] Tests : `product.service.test.ts` (création multi, réconciliation, refus vide/dernière,
      doublon, non-régression mono) ; `product.repository.test.ts` (`reconcileVariants`).

## Notes

- **TDD** sur le domaine (tests rouges d'abord).
- Vérifs : `@pharmacie/{core,ui}` + `pharmacie-1` type-check OK, **74 tests** OK (+15), lint OK,
  prettier OK. Smoke dev : storefront `/categorie/beaute` + `/produit/…` 200, `/admin/produits/
new` 307→login. L'éditeur admin est sous auth (non cliquable en smoke) ; le domaine est
  couvert de bout en bout par les tests d'intégration.
- **Base dev** : trouvée vide (réinitialisée par la migration `externalId` du travail parallèle
  via `migrate dev`) → re-seedée (98 produits, tous mono-déclinaison). Aucune donnée perdue.
- Produits seed avec axes : l'Option A les ignore ; suppression cascade les `VariantOptionValue`,
  une `ProductOption` peut rester orpheline (cosmétique, hors scope).

## Hors périmètre (tickets suivants)

- Axes nommés / multi-axes ; sélecteur de déclinaison storefront (story 06) ; regroupement ;
  upload média.

## Rollback

- `rm apps/pharmacie-1/src/app/admin/\(protected\)/produits/variants-editor.tsx`
- `git checkout -- packages/core/src/modules/catalog/{catalog-errors,product.service,product.repository,product.service.test,product.repository.test,index}.ts apps/pharmacie-1/src/app/admin/\(protected\)/produits/`
