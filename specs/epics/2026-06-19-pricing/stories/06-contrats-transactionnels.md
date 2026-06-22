# Story 06 — Contrats transactionnels : préparation cart / order

**Epic** : [Pricing](../epic.md) · **Priorité** P2 · **Estimation** M · **Dépend de** 02, 03 · **Statut** ✅

## Objectif

Formaliser le contrat `PriceBreakdown` comme type réutilisable par les modules
transactionnels (`cart`, `order`, `returns`, `payment`) et documenter la règle
architecturale : ces modules ne recalculent jamais HT/TVA/TTC eux-mêmes.

## Critères d'acceptation

- `PriceBreakdown` et `PriceBreakdownRange` sont ré-exportés depuis les modules
  `cart` et `order`.
- `ARCHITECTURE.md` contient un ADR explicitant que les modules transactionnels
  consomment `pricing`.
- Aucun module hors `pricing` ne contient de logique de calcul TVA.

## Fichiers modifiés

- `packages/core/src/modules/cart/index.ts`
- `packages/core/src/modules/order/index.ts`
- `ARCHITECTURE.md`
