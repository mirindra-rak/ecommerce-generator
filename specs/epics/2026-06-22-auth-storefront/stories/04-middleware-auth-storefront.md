# Story 04 : Middleware auth storefront + protection routes `/compte`

**Epic parent** : [Auth storefront client](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** S · **Priorité** P0
**Dépend de** : 03 (connexion)

## Contexte

Le middleware Next.js actuel ne gère que l'i18n (next-intl). Les routes `/compte`
doivent être protégées : un visiteur anonyme doit être redirigé vers la page de
connexion. Next.js ne supporte qu'un seul middleware — il faut **composer** auth
et i18n dans le même fichier.

## User Story

**En tant que** système, **je veux** protéger les routes `/compte` par
authentification côté middleware, **afin de** rediriger les visiteurs anonymes
vers la connexion avant même le rendu de la page.

## Critères d'acceptation

### Scénario 1 : Anonyme sur route protégée

- **Étant donné** un visiteur non connecté
- **Quand** il accède à `/fr/compte` (ou toute sous-route `/compte/*`)
- **Alors** il est redirigé vers `/fr/connexion?redirect=/fr/compte`.

### Scénario 2 : Client connecté sur route protégée

- **Étant donné** un client avec une session valide
- **Quand** il accède à `/fr/compte`
- **Alors** la page s'affiche normalement (pas de redirection).

### Scénario 3 : i18n non cassé

- **Étant donné** le middleware composé (auth + i18n)
- **Quand** un visiteur accède à `/produit/doliprane` (route publique)
- **Alors** la négociation de locale fonctionne comme avant (redirection vers
  `/fr/produit/doliprane`).

### Scénario 4 : Routes admin non impactées

- **Étant donné** le middleware
- **Quand** un admin accède à `/admin/login` ou `/admin/produits`
- **Alors** le comportement admin existant est inchangé (le middleware exclut
  `/admin` comme aujourd'hui).

### Scénario 5 : Redirect post-login

- **Étant donné** un visiteur redirigé vers `/connexion?redirect=/fr/compte`
- **Quand** il se connecte
- **Alors** il est redirigé vers `/fr/compte` (le param `redirect` est respecté).

## Non-objectifs

- Protection par rôle dans le middleware (ex. vérifier `CUSTOMER` vs `STAFF`) →
  la vérification de rôle reste dans les layouts/actions serveur.
- Protection des routes API storefront (pas encore de routes API client).

## Contraintes

- Fichier unique : `apps/pharmacie-1/src/middleware.ts`. Composer next-intl +
  vérification de session (cookie Better Auth) dans un seul middleware.
- La vérification de session en middleware doit être **légère** : lecture du cookie
  de session (existence), pas d'appel DB. La validation complète reste côté serveur
  dans les layouts.
- Le matcher doit exclure `api`, `admin`, `_next`, fichiers statiques (comme
  aujourd'hui) et ajouter la logique auth uniquement pour les segments `/compte`.
