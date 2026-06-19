# Story 02 : Repository & service de domaine inventory

**Epic parent** : [Inventory — Stock & disponibilité](../epic.md)

**Date** : 2026-06-19 · **Statut** 🟡 · **Estimation** : M

## Contexte

Le schéma Prisma est en place (story 01). Il faut maintenant construire la couche
métier : un repository pour l'accès aux données inventory, et un service de domaine
exposant les opérations clés (ajustement relatif, contrôle de disponibilité, lecture
de l'historique). Ce service sera consommé par l'admin (story 03) et à terme par
les modules `cart` et `order`.

## User Story

**En tant que** développeur du moteur e-commerce,
**je veux** un service inventory avec ajustement relatif et contrôle de disponibilité,
**afin que** les modules consommateurs puissent manipuler le stock de manière fiable
et traçable.

## Critères d'acceptation

### Scénario 1 : Repository — accès aux données

- **Étant donné** le module `packages/core/src/modules/inventory/`
- **Quand** le repository est implémenté
- **Alors** il expose au minimum :
  - `getVariantStock(variantId)` → stock actuel + champs inventory du variant
  - `getMovements(variantId, opts?)` → liste paginée des mouvements (tri `createdAt` desc)
  - `createMovement(data)` → insère un `StockMovement` et met à jour `ProductVariant.stock` atomiquement
  - `updateInventorySettings(variantId, settings)` → met à jour les champs inventory du variant (minOrderQty, stockLocation, lowStockThreshold, lowStockAlert, outOfStockBehavior)
- **Et** aucun appel Prisma n'existe en dehors du repository

### Scénario 2 : Service — adjust()

- **Étant donné** un variant avec un stock de 50
- **Quand** on appelle `adjust(variantId, { delta: -10, reason: MANUAL_ADJUSTMENT, note: "Inventaire" })`
- **Alors** `ProductVariant.stock` passe à 40
- **Et** un `StockMovement` est créé avec `delta: -10`, `stockAfter: 40`, `reason: MANUAL_ADJUSTMENT`
- **Et** l'opération est atomique (transaction)

### Scénario 3 : Service — adjust() refuse delta zéro

- **Étant donné** un appel à `adjust()` avec `delta: 0`
- **Quand** le service valide l'entrée
- **Alors** une erreur est levée (pas de mouvement à delta zéro)

### Scénario 4 : Service — adjust() et stock négatif

- **Étant donné** un variant avec un stock de 5
- **Quand** on appelle `adjust(variantId, { delta: -10, reason: SALE })`
- **Alors** le stock passe à -5 (le service ne bloque pas les stocks négatifs — c'est
  le contrôle de disponibilité qui gère la politique)
- **Et** un `StockMovement` est créé avec `stockAfter: -5`

### Scénario 5 : Service — isAvailable()

- **Étant donné** un variant avec stock = 3, minOrderQty = 2, outOfStockBehavior = DENY
- **Quand** on appelle `isAvailable(variantId, qty: 2)`
- **Alors** le résultat est `true` (stock suffisant, qty >= minOrderQty)

- **Étant donné** un variant avec stock = 0, outOfStockBehavior = ALLOW
- **Quand** on appelle `isAvailable(variantId, qty: 1)`
- **Alors** le résultat est `true` (rupture acceptée)

- **Étant donné** un variant avec stock = 0, outOfStockBehavior = DENY
- **Quand** on appelle `isAvailable(variantId, qty: 1)`
- **Alors** le résultat est `false`

- **Étant donné** un variant avec stock = 0, outOfStockBehavior = DEFAULT
- **Quand** on appelle `isAvailable(variantId, qty: 1)`
- **Alors** le résultat dépend de la politique globale du site 🚧

### Scénario 6 : Service — getMovementHistory()

- **Étant donné** un variant avec 15 mouvements de stock
- **Quand** on appelle `getMovementHistory(variantId, { page: 1, perPage: 10 })`
- **Alors** on reçoit les 10 mouvements les plus récents, triés par date décroissante
- **Et** la réponse inclut le total pour la pagination

### Scénario 7 : Tests unitaires

- **Étant donné** le service inventory
- **Quand** les tests sont lancés (`pnpm test`)
- **Alors** les scénarios 2 à 6 sont couverts par des tests unitaires
- **Et** les tests passent au vert

## Non-objectifs

- Pas d'admin UI — story 03.
- Pas de notification email — story 04.
- La politique globale `DEFAULT` (🚧 scénario 5) peut retourner `false` par défaut
  en attendant un mécanisme de configuration site-level.

## Contraintes

- **Transaction atomique** : l'update du stock et la création du mouvement sont
  dans la même transaction Prisma.
- **Immutabilité des mouvements** : le repository ne propose aucune méthode
  d'update ou delete sur `StockMovement`.
- Fichiers attendus dans `packages/core/src/modules/inventory/` :
  `inventory.repository.ts`, `inventory.service.ts`, `inventory.types.ts`, `index.ts`.
- Tests colocalisés : `inventory.service.test.ts`.
