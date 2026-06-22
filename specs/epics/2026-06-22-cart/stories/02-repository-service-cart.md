# Story : Repository & service de domaine cart

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : L (~1.5 jour)
**Epic parent** : [Cart](../epic.md)

## Contexte

Les modèles Prisma sont posés (story 01). On construit la couche métier : repository
d'accès données et service de domaine avec les opérations panier, intégration pricing
et inventory.

## User Story

**En tant que** développeur d'un module consommateur (storefront, order),
**je veux** un service `cart` avec des opérations typées (add, update, remove, get, clear),
**afin de** manipuler le panier sans connaître les détails de persistance ni de calcul.

## Critères d'acceptation

### Scénario 1 : Ajouter un item

- **Étant donné** un panier existant et un variant disponible (stock suffisant)
- **Quand** j'appelle `addItem(cartId, variantId, qty)`
- **Alors** une ligne est créée avec le `PriceBreakdown` figé, ou la quantité est
  incrémentée si le variant est déjà dans le panier

### Scénario 2 : Ajouter un item en rupture

- **Étant donné** un variant avec stock insuffisant et `outOfStockBehavior = DENY`
- **Quand** j'appelle `addItem(cartId, variantId, qty)`
- **Alors** une erreur `ItemNotAvailableError` est levée, le panier est inchangé

### Scénario 3 : Modifier la quantité

- **Étant donné** une ligne existante dans le panier
- **Quand** j'appelle `updateItemQty(cartId, variantId, newQty)`
- **Alors** la quantité est mise à jour si le stock est suffisant
- **Et** si `newQty = 0`, la ligne est supprimée

### Scénario 4 : Supprimer un item

- **Étant donné** une ligne existante
- **Quand** j'appelle `removeItem(cartId, variantId)`
- **Alors** la ligne est supprimée du panier

### Scénario 5 : Obtenir le panier avec totaux

- **Étant donné** un panier avec 2 lignes
- **Quand** j'appelle `getCart(cartId)`
- **Alors** le résultat contient les lignes enrichies (nom produit, nom variant,
  image, `PriceBreakdown` unitaire, sous-total) et les totaux globaux
  (totalExclTax, totalTax, totalInclTax, itemCount)

### Scénario 6 : Vider le panier

- **Quand** j'appelle `clearCart(cartId)`
- **Alors** toutes les lignes sont supprimées, le panier existe toujours (vide)

## Non-objectifs

- Pas de gestion de session/cookie (story 03).
- Pas d'UI (stories 04-05).
- Pas de recalcul automatique si le prix produit change (le prix est figé à l'ajout).

## Contraintes

- Repository pattern : `cartRepository` dans `packages/core/src/modules/cart/`.
- Le service consomme `calculatePriceBreakdown` de `pricing` et `isAvailable` de
  `inventory`.
- Erreurs de domaine typées : `CartNotFoundError`, `ItemNotAvailableError`.
- Tests unitaires couvrant les 6 scénarios (mock des dépendances pricing/inventory).
