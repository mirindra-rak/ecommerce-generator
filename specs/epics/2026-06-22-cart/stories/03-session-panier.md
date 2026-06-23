# Story : Gestion de session panier (cookie anonyme + fusion)

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : M (~1 jour)
**Epic parent** : [Cart](../epic.md)

## Contexte

Le service cart (story 02) opère sur un `cartId`. On doit maintenant résoudre ce
`cartId` à partir du contexte HTTP : cookie de session anonyme ou utilisateur connecté,
avec fusion du panier anonyme dans le panier connecté à la connexion.

## User Story

**En tant que** visiteur (anonyme ou connecté),
**je veux** que mon panier persiste entre les pages et survive à une connexion,
**afin de** ne pas perdre mes articles.

## Critères d'acceptation

### Scénario 1 : Création de panier anonyme

- **Étant donné** un visiteur sans cookie panier
- **Quand** il ajoute un article au panier
- **Alors** un `Cart` est créé avec un `sessionToken`, un cookie `cart_session`
  HttpOnly est posé (durée 30 jours)

### Scénario 2 : Récupération de panier anonyme

- **Étant donné** un visiteur avec un cookie `cart_session` valide
- **Quand** il charge une page
- **Alors** le panier est retrouvé via le `sessionToken`

### Scénario 3 : Panier connecté

- **Étant donné** un utilisateur connecté sans cookie panier
- **Quand** il ajoute un article
- **Alors** un `Cart` est créé avec son `userId`, pas de cookie anonyme

### Scénario 4 : Fusion à la connexion

- **Étant donné** un visiteur anonyme avec un panier contenant 2 articles, qui se connecte
- **Quand** la session est établie
- **Alors** les lignes du panier anonyme sont transférées dans le panier connecté
  (quantités additionnées si même variant), et le panier anonyme est supprimé

### Scénario 5 : Pas de panier

- **Étant donné** un visiteur sans cookie et non connecté
- **Quand** il charge la page panier
- **Alors** le panier est vide (pas de création à vide)

## Non-objectifs

- Pas de nettoyage automatique des paniers abandonnés (cron futur).
- Pas de panier localStorage.

## Contraintes

- Cookie `cart_session` : `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=30j`.
- La fusion se fait côté server action ou middleware, pas côté client.
- La fonction `getOrCreateCart(context)` est le point d'entrée unique pour résoudre
  le panier depuis le contexte HTTP (cookies + session user).
