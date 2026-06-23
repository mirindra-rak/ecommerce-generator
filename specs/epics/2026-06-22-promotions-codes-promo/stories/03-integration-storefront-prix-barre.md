# Story 03 : Intégration storefront — prix barré listing & fiche produit

**Date** 2026-06-22 · **Statut** 🟡 · **Estimation** M
**Epic parent** : [Catalog Price Rules](../epic.md)

## Contexte

Le service de résolution (story 02) sait calculer les prix réduits. Il faut maintenant câbler le storefront pour afficher le prix barré et le prix réduit sur le listing catégorie et la fiche produit.

## User Story

**En tant que** client, **je veux** voir le prix barré et le prix réduit sur les produits en promotion, **afin de** comprendre l'avantage de la promo et être incité à acheter.

## Critères d'acceptation

### Scénario 1 : Prix barré sur le listing catégorie

- **Étant donné** un produit avec une Catalog Price Rule active (-20%)
- **Quand** je visite la page listing de la catégorie ciblée
- **Alors** le produit affiche : prix original barré, prix réduit TTC mis en avant, et le label promo s'il existe

### Scénario 2 : Prix barré sur la fiche produit

- **Étant donné** un produit avec une Catalog Price Rule active
- **Quand** je visite la fiche produit
- **Alors** le prix affiché montre : prix original barré, prix réduit TTC, pourcentage ou montant de réduction, label promo

### Scénario 3 : Produit sans promo — aucun changement

- **Étant donné** un produit sans règle active
- **Quand** je visite le listing ou la fiche produit
- **Alors** le prix s'affiche normalement, sans prix barré ni badge

### Scénario 4 : Ajout au panier avec prix réduit

- **Étant donné** un produit en promo affiché avec son prix réduit
- **Quand** je l'ajoute au panier
- **Alors** le prix stocké dans le CartItem est le prix réduit HT (pas le prix original)

### Scénario 5 : Accessibilité du prix barré

- **Étant donné** un produit en promo
- **Quand** un lecteur d'écran lit le composant prix
- **Alors** le prix original est annoncé comme "prix habituel" et le prix réduit comme "prix actuel"

## Non-objectifs

- Filtre "en promo" dans les facettes du listing (future story)
- Badge promo sur la vignette produit (nice-to-have, pas V1)
- Animation ou compte à rebours sur la promo

## Contraintes

- Le prix réduit est en TTC pour l'affichage (recalculé via `calculatePriceBreakdown`)
- Le composant prix doit être un composant réutilisable (listing + fiche + futur cart)
- `<del>` pour le prix barré (sémantique HTML), `aria-label` pour l'accessibilité
- Performance : la résolution batch (story 02) est utilisée sur le listing, pas de requête par produit
