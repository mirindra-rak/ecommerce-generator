# Story 04 — Back-office produit : choix du taux de TVA

**Epic** : [Pricing](../epic.md) · **Priorité** P1 · **Estimation** S · **Dépend de** 03 · **Statut** ✅

## Objectif

Exposer le choix du taux de TVA dans le formulaire produit du back-office, avec
source de vérité issue du référentiel `TaxRate`.

## Critères d'acceptation

- Les pages `new` et `[id]` chargent `taxRateRepository.findActive()`.
- Le formulaire produit affiche un `Select` pour le taux de TVA avec valeur par
  défaut explicite.
- L'action serveur lit `taxRateId` et le transmet au domaine.
- Les labels FR/EN sont présents dans `messages/*.json`.
- Erreur `taxRateInvalid` gérée côté action si le taux est invalide.

## Fichiers modifiés

- `apps/pharmacie-1/src/app/admin/(protected)/produits/new/page.tsx`
- `apps/pharmacie-1/src/app/admin/(protected)/produits/[id]/page.tsx`
- `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx`
- `apps/pharmacie-1/src/app/admin/(protected)/produits/_actions.ts`
- `apps/pharmacie-1/messages/fr.json`
- `apps/pharmacie-1/messages/en.json`
