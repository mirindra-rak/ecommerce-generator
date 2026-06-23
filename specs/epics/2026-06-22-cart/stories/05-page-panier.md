# Story : Storefront — page panier (lignes, quantités, totaux)

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : M (~1 jour)
**Epic parent** : [Cart](../epic.md)

## Contexte

Le panier est fonctionnel côté core et l'ajout est câblé (stories 01-04). On construit
la page `/panier` du storefront avec la liste des articles, la gestion des quantités
et l'affichage des totaux.

## User Story

**En tant que** visiteur,
**je veux** voir mon panier avec les détails de chaque article et les totaux,
**afin de** vérifier ma sélection avant de passer commande.

## Critères d'acceptation

### Scénario 1 : Panier avec articles

- **Étant donné** un panier contenant 2 articles
- **Quand** j'ouvre `/panier`
- **Alors** je vois pour chaque ligne : image produit, nom produit, nom variant,
  prix TTC unitaire, sélecteur de quantité, sous-total TTC, bouton supprimer
- **Et** en bas : total HT, total TVA, total TTC, nombre d'articles

### Scénario 2 : Modifier la quantité

- **Étant donné** une ligne avec quantité 2
- **Quand** je change la quantité à 3
- **Alors** le sous-total et les totaux se mettent à jour

### Scénario 3 : Supprimer une ligne

- **Étant donné** une ligne dans le panier
- **Quand** je clique « Supprimer »
- **Alors** la ligne disparaît, les totaux se mettent à jour

### Scénario 4 : Panier vide

- **Étant donné** un panier sans articles
- **Quand** j'ouvre `/panier`
- **Alors** un message « Votre panier est vide » s'affiche avec un lien vers le
  catalogue

### Scénario 5 : Quantité > stock

- **Étant donné** un variant avec stock de 3
- **Quand** je tente de mettre la quantité à 5
- **Alors** un message d'erreur s'affiche, la quantité reste à 3

## Non-objectifs

- Pas de bouton « Commander » / checkout (module order).
- Pas de code promo (module promotions).
- Pas d'estimation de frais de livraison.

## Contraintes

- Route : `apps/pharmacie-1/src/app/[locale]/(storefront)/panier/page.tsx`.
- SEO : `noindex` (pas de contenu indexable).
- Server actions pour update quantité et suppression.
- i18n : labels FR + EN.
- Design : utiliser les composants `@pharmacie/ui` existants (Card, Button, Input).
- `formatPrice` existant pour l'affichage des montants.
