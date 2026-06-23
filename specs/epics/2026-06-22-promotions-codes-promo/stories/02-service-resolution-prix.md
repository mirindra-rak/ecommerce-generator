# Story 02 : Service de domaine — résolution du prix catalogue

**Date** 2026-06-22 · **Statut** 🟡 · **Estimation** M
**Epic parent** : [Catalog Price Rules](../epic.md)

## Contexte

Le repository (story 01) permet de stocker et récupérer les règles. Il faut maintenant le service de domaine qui évalue quelle règle s'applique à un produit et calcule le prix réduit.

## User Story

**En tant que** système, **je veux** un service qui résout le prix catalogue d'un produit en tenant compte des Catalog Price Rules actives, **afin d'** afficher le bon prix (original ou réduit) sur le storefront.

## Critères d'acceptation

### Scénario 1 : Aucune règle applicable

- **Étant donné** un produit sans règle active correspondante
- **Quand** on appelle `resolvePrice(variant, productContext)`
- **Alors** le résultat contient `originalPrice`, `finalPrice` identique, `discount: null`

### Scénario 2 : Réduction pourcentage

- **Étant donné** une règle active ciblant la catégorie du produit, type `PERCENTAGE`, valeur 2000 (20%)
- **Quand** on résout le prix d'un variant à 1000 centimes HT
- **Alors** `finalPrice` = 800, `discount` = `{ type: 'PERCENTAGE', value: 2000, amount: 200, rule }`, et le breakdown TVA est recalculé sur 800

### Scénario 3 : Réduction montant fixe

- **Étant donné** une règle active ciblant le produit, type `FIXED_AMOUNT`, valeur 300 (3,00€)
- **Quand** on résout le prix d'un variant à 1000 centimes HT
- **Alors** `finalPrice` = 700, `discount.amount` = 300

### Scénario 4 : Prix plancher

- **Étant donné** une règle avec `discountValue` 5000 (50%) et `floorPrice` 600
- **Quand** on résout le prix d'un variant à 1000 centimes HT
- **Alors** `finalPrice` = 600 (plancher), pas 500

### Scénario 5 : Priorité — la plus haute gagne

- **Étant donné** deux règles actives applicables, priorité 10 (-10%) et priorité 20 (-5%)
- **Quand** on résout le prix
- **Alors** la règle priorité 20 (-5%) est appliquée (pas de cumul)

### Scénario 6 : Dates de validité

- **Étant donné** une règle avec `startDate` demain
- **Quand** on résout le prix aujourd'hui
- **Alors** la règle est ignorée, pas de réduction

### Scénario 7 : Résolution batch pour le listing

- **Étant donné** une liste de 20 produits avec variants
- **Quand** on appelle `resolvePrices(products)`
- **Alors** les prix sont résolus en une seule requête DB (pas N+1), et chaque produit a son prix résolu

## Non-objectifs

- Affichage UI (story 03)
- Gestion admin des règles (story 04)
- Cache des prix résolus (optimisation future)

## Contraintes

- Réutiliser `calculatePriceBreakdown` du module pricing pour le recalcul TVA après réduction
- Le service est une pure function sur les données (pas d'effet de bord)
- La résolution batch doit faire au maximum 2 requêtes DB (règles actives + données produits)
- Tests unitaires couvrant chaque scénario ci-dessus
