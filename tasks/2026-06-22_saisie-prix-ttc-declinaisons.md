# Saisie bidirectionnelle HT ↔ TTC dans l'éditeur de déclinaisons

**Date:** 2026-06-22
**Statut:** Terminé

## Contexte

Le vendeur connaît souvent le prix TTC affiché en rayon mais pas le HT. Ajout d'un champ TTC synchronisé dans l'éditeur de déclinaisons, piloté par le taux de TVA du produit.

## Modifications

- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx` — ajout `rateBps` au type `Option`, Select TVA en mode controlled, passage de `rateBps` à `VariantsEditor`
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/variants-editor.tsx` — champ TTC par déclinaison, sync bidirectionnelle HT↔TTC, recalcul au changement de TVA
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/new/page.tsx` — inclut `rateBps` dans `taxRateOptions`
- [x] `apps/pharmacie-1/src/app/admin/(protected)/produits/[id]/page.tsx` — inclut `rateBps` dans `taxRateOptions`
- [x] `apps/pharmacie-1/messages/fr.json` — clés `priceInclTax`, `priceInclTaxPlaceholder`
- [x] `apps/pharmacie-1/messages/en.json` — clés `priceInclTax`, `priceInclTaxPlaceholder`

## Notes

- Le TTC n'est jamais sérialisé ni envoyé au serveur — champ dérivé purement UI.
- Changement de TVA → recalcul TTC de toutes les lignes (HT reste la source de vérité).
- Arrondi au centime via `toFixed(2)`, cohérent avec le `Math.round` du noyau pricing.

## Rollback

Restaurer les 6 fichiers modifiés à leur état avant ce commit.
