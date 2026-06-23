# Story 05 : SEO — structured data prix réduit

**Date** 2026-06-22 · **Statut** 🟡 · **Estimation** S
**Epic parent** : [Catalog Price Rules](../epic.md)

## Contexte

La fiche produit affiche le prix barré (story 03). Les moteurs de recherche doivent aussi voir le prix réduit dans les structured data JSON-LD pour afficher le bon prix dans les résultats et le badge "promo".

## User Story

**En tant que** pharmacie, **je veux** que les structured data reflètent le prix réduit et l'offre promotionnelle, **afin d'** améliorer la visibilité dans les résultats de recherche (rich snippets avec prix barré).

## Critères d'acceptation

### Scénario 1 : Produit en promo — JSON-LD Offer

- **Étant donné** un produit avec une Catalog Price Rule active
- **Quand** Google crawle la fiche produit
- **Alors** le JSON-LD `Product > Offer` contient : `price` = prix réduit TTC, `priceValidUntil` = endDate de la règle (si définie), et un champ `discount` ou `priceSpecification` avec le prix original

### Scénario 2 : Produit sans promo — pas de changement

- **Étant donné** un produit sans règle active
- **Quand** Google crawle la fiche produit
- **Alors** le JSON-LD reste identique à l'existant (prix normal)

### Scénario 3 : Promo expirée — retour au prix normal

- **Étant donné** une règle dont la `endDate` est passée
- **Quand** Google crawle la fiche produit
- **Alors** le JSON-LD affiche le prix original, sans mention de réduction

## Non-objectifs

- Sitemap spécifique pour les promos
- Balise `<meta>` Open Graph pour le prix réduit
- Flux Google Merchant Center (futur module)

## Contraintes

- Format JSON-LD conforme à Schema.org `Product` + `Offer` + `PriceSpecification`
- `priceValidUntil` au format ISO 8601
- Tester avec le Rich Results Test de Google (validation manuelle)
