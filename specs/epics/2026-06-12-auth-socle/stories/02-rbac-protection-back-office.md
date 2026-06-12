# Story : RBAC & protection du back-office /admin

**Epic parent** : [Socle d'authentification](../epic.md)
**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

Le back-office est ouvert à tous. Cette story le ferme : seuls les utilisateurs au rôle
`STAFF` ou `ADMIN` peuvent accéder à `/admin`, via un contrôle côté serveur réutilisable.

## User Story

**En tant que** responsable de la pharmacie, **je veux** que seul le personnel autorisé
accède au back-office, **afin de** protéger le catalogue et les données.

## Critères d'acceptation

### Scénario 1 : Accès refusé aux non-connectés

- **Étant donné** un visiteur non authentifié
- **Quand** il ouvre une page `/admin` (ou sous-page)
- **Alors** il est redirigé vers la page de connexion admin
- **Et** aucune donnée admin n'est rendue

### Scénario 2 : Accès refusé aux rôles insuffisants

- **Étant donné** un utilisateur connecté avec le rôle `CUSTOMER`
- **Quand** il ouvre `/admin`
- **Alors** l'accès est refusé (redirection connexion ou page 403)

### Scénario 3 : Accès autorisé au staff

- **Étant donné** un utilisateur connecté `STAFF` ou `ADMIN`
- **Quand** il ouvre `/admin`
- **Alors** le back-office s'affiche normalement

### Scénario 4 : Helper d'autorisation réutilisable

- **Étant donné** un helper `requireStaff()` côté serveur
- **Quand** il est appelé dans une page/Action admin
- **Alors** il retourne l'utilisateur si autorisé, sinon déclenche la redirection
- **Et** il est utilisable par toutes les pages et Server Actions admin

### Scénario 5 : Banderole retirée

- **Étant donné** que `/admin` est désormais protégé
- **Quand** un membre du staff l'utilise
- **Alors** la banderole « zone non sécurisée » n'apparaît plus

## Non-objectifs

- UI de connexion / déconnexion (story 03).
- Permissions fines par ressource (un simple contrôle par rôle suffit).
- Distinction de droits entre `STAFF` et `ADMIN` (les deux accèdent ; affinage ultérieur).

## Contraintes

- Contrôle **côté serveur** (layout/page server + Server Actions) ; ne pas se reposer
  uniquement sur le middleware (défense en profondeur).
- 🚧 Middleware Next pour une redirection précoce (optionnel) + garde serveur obligatoire.
- Les **Server Actions** admin (catégories/marques déjà existantes) doivent aussi être
  protégées, pas seulement le rendu des pages.

## Questions ouvertes

- 🚧 Rôle insuffisant : redirection vers login ou page 403 dédiée ? Hypothèse : 403
  pour un utilisateur connecté, redirection login pour un anonyme.
