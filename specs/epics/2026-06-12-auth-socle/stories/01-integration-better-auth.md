# Story : Intégration Better Auth + schéma & config

**Epic parent** : [Socle d'authentification](../epic.md)
**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

Fondation de l'auth : intégrer Better Auth avec l'adapter Prisma, modéliser les tables
d'auth et le rôle utilisateur, et exposer un helper de session serveur. Aucune autre
story d'auth ne peut démarrer sans ce socle.

## User Story

**En tant que** développeur, **je veux** Better Auth intégré (schéma, config, route,
helper de session), **afin de** disposer d'une base d'authentification fiable et réutilisable.

## Critères d'acceptation

### Scénario 1 : Schéma d'auth en base

- **Étant donné** le schéma Prisma
- **Quand** la migration est appliquée
- **Alors** les tables Better Auth existent (`User`, `Session`, `Account`, `Verification`)
- **Et** `User` porte un champ `role` (enum `Role` : `CUSTOMER`, `STAFF`, `ADMIN`,
  défaut `CUSTOMER`)
- **Et** aucune table ne porte de `tenant_id` (modèle Silo)

### Scénario 2 : Configuration Better Auth

- **Étant donné** la config serveur Better Auth (adapter Prisma, email+mot de passe,
  sessions en base)
- **Quand** l'application démarre
- **Alors** le secret et l'URL de base proviennent de variables d'env
- **Et** la vérification d'email est désactivée à ce stade (pas d'ESP) 🚧

### Scénario 3 : Route handler d'auth

- **Étant donné** la route `/api/auth/[...all]` (runtime `nodejs`)
- **Quand** un client appelle un endpoint Better Auth (ex. session)
- **Alors** il répond correctement (création/lecture de session)

### Scénario 4 : Helper de session serveur

- **Étant donné** un helper `getSession()` côté serveur
- **Quand** il est appelé dans un Server Component / Action
- **Alors** il retourne la session + l'utilisateur (avec `role`) si connecté, sinon `null`

### Scénario 5 : Création d'utilisateur avec rôle

- **Étant donné** la couche d'auth
- **Quand** un utilisateur est créé sans rôle précisé
- **Alors** son `role` vaut `CUSTOMER`
- **Et** son mot de passe est stocké **haché** (jamais en clair)

## Non-objectifs

- UI de connexion (story 03), garde RBAC sur `/admin` (story 02), seed admin (story 04).
- Reset mot de passe / vérification email / social login (epic ultérieur).

## Contraintes

- Better Auth + adapter Prisma ; sessions en base (cookie httpOnly).
- Config et instance partagées (`packages/core/src/modules/auth` et/ou app selon la
  contrainte d'exécution Next — à acter en `/plan`).
- Secret de session via env ; ne jamais committer de secret.
- Repository `core` pour l'accès « métier » au `User` (lecture par email/rôle).

## Questions ouvertes

- 🚧 Où instancier Better Auth : `core` (réutilisable) vs app (proximité route handler) ?
  Hypothèse : config dans `core`, montée dans l'app. À confirmer en `/plan`.
- 🚧 Génération du schéma : CLI Better Auth vs écriture manuelle dans `schema.prisma` ?
  Hypothèse : intégrer au `schema.prisma` existant pour une seule source de vérité.
