# Facettes produit en sélection multiple avec recherche

**Date:** 2026-06-19 15:48
**Statut:** Terminé

## Contexte

Les facettes produit (par exemple « Nature de produit », « Conditionnement »,
« Spécificité ») étaient rendues sous forme de listes de checkboxes. Comme ces
taxonomies peuvent grossir, elles doivent être remplacées par des contrôles de
sélection multiple avec recherche, en réutilisant la primitive `MultiSelect`.

## Modifications

- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` - remplacer les checkboxes de facettes par des `MultiSelect`
- [x] `tasks/2026-06-19_15h48_facettes-produit-multiselect.md` - journalisation de la tâche

## Notes

Le backend est déjà compatible : la Server Action lit `formData.getAll("facetValueIds")`,
et `MultiSelect` émet déjà un input hidden par valeur sélectionnée.
Validation effectuée : `pnpm lint`, `pnpm build`.

## Rollback

Revenir au rendu checkbox dans `produit-form.tsx`.
