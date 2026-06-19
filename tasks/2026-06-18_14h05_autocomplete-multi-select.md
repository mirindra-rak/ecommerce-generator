# Autocomplete sur les champs de sélection multiple

**Date:** 2026-06-18 14:05
**Statut:** Terminé

## Contexte

Les champs de sélection multiple de l'admin doivent être plus ergonomiques quand
la cardinalité des options augmente. L'objectif est d'ajouter une barre de
recherche directement dans la primitive `MultiSelect` pour que tous les formulaires
qui l'utilisent héritent du comportement sans duplication.

## Modifications

- [x] `packages/ui/src/components/multi-select.tsx` - ajout d'une barre de recherche et du filtrage côté client
- [x] `packages/ui/src/index.ts` - export inchangé, API publique conservée
- [x] `tasks/2026-06-18_14h05_autocomplete-multi-select.md` - journalisation de la tâche

## Notes

Approche retenue : enrichir la primitive du design system plutôt que patcher un
écran spécifique. On garde la même API publique avec des props optionnelles.
Validation effectuée : `pnpm lint`, `pnpm build`, `pnpm type-check`.

## Rollback

Revenir au commit précédent ou supprimer le bloc de recherche et le filtrage dans
`packages/ui/src/components/multi-select.tsx`.
