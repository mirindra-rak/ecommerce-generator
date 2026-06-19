# Champ INCI en textarea

**Date:** 2026-06-19 15:46
**Statut:** Terminé

## Contexte

Le champ INCI du formulaire produit était rendu avec un `Input` simple, alors que
les compositions cosmétiques peuvent être longues. Le contrôle doit devenir un
`Textarea` pour rester ergonomique en back-office.

## Modifications

- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` - remplacer le contrôle INCI par un textarea multi-ligne
- [x] `tasks/2026-06-19_15h46_inci-textarea.md` - journalisation de la tâche

## Notes

Changement purement UI : aucun impact sur le schéma, la Server Action ou la
persistance (`inci` reste une chaîne dans `Product.attributes`).
Validation effectuée : `pnpm lint`, `pnpm build`.

## Rollback

Remettre le champ `INCI` sous forme de `Input` dans `produit-form.tsx`.
