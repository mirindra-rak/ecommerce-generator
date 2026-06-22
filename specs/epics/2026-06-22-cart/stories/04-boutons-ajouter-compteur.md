# Story : Storefront — boutons « ajouter au panier » + compteur

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : M (~1 jour)
**Epic parent** : [Cart](../epic.md)

## Contexte

Les boutons « Ajouter au panier » existent déjà sur la fiche produit et les cartes
produit mais sont inertes. Le compteur dans le header est hardcodé à 0. On câble
le tout via des server actions.

## User Story

**En tant que** visiteur du storefront,
**je veux** ajouter un produit au panier en un clic et voir le compteur se mettre à jour,
**afin de** constituer mon panier sans quitter la page catalogue.

## Critères d'acceptation

### Scénario 1 : Ajouter depuis la fiche produit

- **Étant donné** une fiche produit avec un variant disponible
- **Quand** je clique « Ajouter au panier »
- **Alors** l'article est ajouté (qty 1), le compteur header se met à jour,
  un feedback visuel confirme l'ajout

### Scénario 2 : Ajouter depuis une carte produit

- **Étant donné** une carte produit dans le listing
- **Quand** je clique le bouton panier sur la carte
- **Alors** le variant par défaut (premier) est ajouté au panier (qty 1)

### Scénario 3 : Produit en rupture

- **Étant donné** un produit dont tous les variants sont en rupture
- **Quand** j'essaie d'ajouter au panier
- **Alors** un message d'erreur s'affiche, rien n'est ajouté

### Scénario 4 : Compteur header dynamique

- **Étant donné** un panier avec 3 articles (somme des quantités)
- **Quand** j'ajoute un article
- **Alors** le compteur passe à 4 sans rechargement complet de page

## Non-objectifs

- Pas de sélecteur de variant sur la carte produit (le premier variant est ajouté).
- Pas de sélecteur de quantité au moment de l'ajout (toujours qty 1).
- Pas de page panier (story 05).

## Contraintes

- Server actions Next.js pour l'ajout au panier (pas d'API route).
- `revalidatePath` ou `revalidateTag` pour rafraîchir le compteur header.
- i18n : labels en FR + EN (`messages/*.json`).
- Le bouton est désactivé pendant la requête (état `pending`).
