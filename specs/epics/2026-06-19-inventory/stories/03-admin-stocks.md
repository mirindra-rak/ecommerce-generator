# Story 03 : Admin — onglet Stocks (ajustement, config, historique)

**Epic parent** : [Inventory — Stock & disponibilité](../epic.md)

**Date** : 2026-06-19 · **Statut** 🟢 · **Estimation** : L

## Contexte

Le service inventory est en place (story 02). L'admin peut actuellement modifier
le stock uniquement via un champ numérique brut dans le variant editor. On ajoute
un **onglet « Stocks »** dans le formulaire produit, avec une vue par variant
permettant l'ajustement relatif, la configuration des paramètres inventory, et la
consultation de l'historique des mouvements.

## User Story

**En tant qu'** opérateur du back-office,
**je veux** un onglet Stocks dans le formulaire produit avec ajustement relatif et
configuration des alertes,
**afin de** gérer mon inventaire de manière traçable sans devoir modifier le stock
à l'aveugle.

## Critères d'acceptation

### Scénario 1 : Onglet Stocks visible dans le formulaire produit

- **Étant donné** l'admin sur la page d'édition d'un produit
- **Quand** il clique sur l'onglet « Stocks »
- **Alors** il voit une section par variant (ou une seule section si mono-variant)
- **Et** chaque section affiche le stock actuel en lecture seule

### Scénario 2 : Ajustement relatif du stock

- **Étant donné** un variant avec un stock de 86
- **Quand** l'opérateur saisit `+10` (ou `-5`) dans le champ d'ajustement et valide
- **Alors** le stock passe à 96 (ou 81)
- **Et** un `StockMovement` de type `MANUAL_ADJUSTMENT` est créé
- **Et** le stock affiché se met à jour

### Scénario 3 : Configuration de la quantité minimale de commande

- **Étant donné** un variant
- **Quand** l'opérateur modifie le champ « Quantité minimale pour la vente » à 3
- **Alors** `minOrderQty` est persisté à 3
- **Et** la valeur par défaut est 1

### Scénario 4 : Configuration de l'emplacement du stock

- **Étant donné** un variant
- **Quand** l'opérateur saisit « Rayon B - Étagère 3 » dans le champ emplacement
- **Alors** `stockLocation` est persisté avec cette valeur

### Scénario 5 : Configuration de l'alerte stock faible

- **Étant donné** un variant
- **Quand** l'opérateur active le toggle « Alerte stock faible »
- **Et** saisit un seuil de 10
- **Alors** `lowStockAlert` est `true` et `lowStockThreshold` est 10

### Scénario 6 : Configuration du comportement en rupture

- **Étant donné** un variant
- **Quand** l'opérateur sélectionne « Accepter les commandes » dans le sélecteur
- **Alors** `outOfStockBehavior` est persisté à `ALLOW`
- **Et** les trois options sont : « Refuser les commandes » (DENY),
  « Accepter les commandes » (ALLOW), « Utiliser le comportement par défaut » (DEFAULT)

### Scénario 7 : Historique des mouvements

- **Étant donné** un variant avec des mouvements de stock
- **Quand** l'opérateur consulte la section historique
- **Alors** il voit les N derniers mouvements (date, delta, stock après, motif, note)
- **Et** les mouvements sont triés du plus récent au plus ancien

### Scénario 8 : i18n

- **Étant donné** l'admin en mode FR ou EN
- **Quand** l'onglet Stocks est affiché
- **Alors** tous les labels, placeholders et options sont traduits
- **Et** les clés sont ajoutées dans `messages/fr.json` et `messages/en.json`

## Non-objectifs

- Pas de vue « inventaire global » (listing cross-produits de tous les stocks) —
  lot ultérieur.
- Pas d'import/export CSV.
- Pas de pagination de l'historique dans ce premier jet (les N derniers suffisent).

## Contraintes

- L'onglet Stocks est un **nouvel onglet** dans le formulaire produit, à côté des
  onglets existants. Le champ stock brut dans le variant editor reste en lecture
  seule (ou est supprimé au profit de l'onglet dédié).
- Les ajustements passent par une **server action** qui appelle
  `inventoryService.adjust()` — pas de mutation directe du stock.
- Composants UI via `@pharmacie/ui` (pas de markup natif).
- Le formulaire des settings inventory (minOrderQty, stockLocation, alerte, rupture)
  peut être sauvegardé indépendamment de l'ajustement de stock.
