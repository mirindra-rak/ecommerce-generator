# Section SEO dans le formulaire produit admin

**Date:** 2026-06-22 15:00
**Statut:** Terminé

## Contexte

Les champs `metaTitle` et `metaDescription` existaient en base (schema Prisma) mais n'étaient pas exposés dans le formulaire produit admin. La section SEO manquait dans la story "Refonte design formulaire produit admin".

## Modifications

- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` - ajout du composant `CountedField` (compteur de caractères), de `metaTitle`/`metaDescription` dans `ProductFormValue`, et de la section SEO dans le rendu
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/_actions.ts` - lecture des champs `metaTitle`/`metaDescription` depuis le FormData dans `readBase()`
- [x] `packages/core/src/modules/catalog/product.service.ts` - ajout de `metaTitle`/`metaDescription` dans `CreateProductInput` et persistance dans `createProduct()`/`updateProduct()`
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/[id]/page.tsx` - passage des valeurs existantes au formulaire
- [x] `apps/pharmacie-1/messages/fr.json` - clés i18n section SEO produit (FR)
- [x] `apps/pharmacie-1/messages/en.json` - clés i18n section SEO produit (EN)

## Notes

- Le composant `CountedField` est identique à celui du formulaire catégorie (compteur live, couleur danger au-delà du max)
- Le slug reste auto-généré et non modifiable (contrairement aux catégories) conformément au service existant
- Type-check, lint et tests produit (24/24) passent sans régression

## Rollback

Reverter les 6 fichiers modifiés ci-dessus. Les champs en base n'ont pas changé.
