# Amélioration des champs Select (dropdown éditorial)

**Date:** 2026-06-12 00:00
**Statut:** Terminé

## Contexte

Tous les champs `<select>` de l'admin utilisent le menu déroulant **natif** du navigateur
(`<option>`), non stylable par CSS — rendu « moche » incohérent avec la direction
« officine éditoriale ». On remplace par un composant `Select` accessible bâti sur
`@radix-ui/react-select`, dont la liste d'options est entièrement stylable via les
design tokens, tout en gardant le clavier/ARIA/typeahead.

## Modifications

- [x] `packages/ui/package.json` — ajout dépendance `@radix-ui/react-select`
- [x] `packages/ui/src/components/select.tsx` — réécriture : wrapper Radix, API `options`,
      sentinel pour la valeur "" (interdite par Radix) + `<input type="hidden">` interne
      pour la soumission native des formulaires
- [x] `apps/.../produits/produit-form.tsx` — selects type + marque → API `options`
- [x] `packages/ui/src/components/multi-select.tsx` — nouveau `MultiSelect` (Radix Popover) :
      multi-sélection à puces, un `<input type="hidden">` par valeur (compat `getAll`)
- [x] `apps/.../produits/produit-form.tsx` — liste de cases « Catégories » → `MultiSelect`
- [x] `apps/.../categories/category-form.tsx` — select natif `parentId` → `Select`
- [x] `apps/.../_components/produits-table.tsx` — 2 filtres (type, statut) + suppression `selectClass`
- [x] `apps/.../_components/categories-table.tsx` — 1 filtre (statut) + suppression `selectClass`

## Notes

- Radix interdit `value=""` sur `Select.Item` → mappé vers un sentinel en interne ;
  le wrapper expose toujours `""` à l'extérieur et émet lui-même le hidden input,
  donc les server actions reçoivent `""` sans modification du domaine.
- API : `options`, `value`/`defaultValue`, `onValueChange`, `name`, `size` ("sm"|"md").

## Rollback

`git checkout` des fichiers ci-dessus + `pnpm install` pour retirer la dépendance Radix.
