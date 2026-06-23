# Story 03 : Connexion / déconnexion client storefront

**Epic parent** : [Auth storefront client](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** M · **Priorité** P0

## Contexte

Le login admin existe (`/admin/login`) mais le storefront n'a aucun point d'entrée
de connexion client. Les sessions Better Auth sont partagées (même cookie, même
table `Session`), donc l'infrastructure serveur est déjà prête. Il faut une **page
de connexion storefront**, un **bouton de déconnexion**, et un **état connecté**
visible dans le header.

## User Story

**En tant que** client inscrit, **je veux** me connecter et me déconnecter depuis
le storefront, **afin de** retrouver mon espace personnel et mes données.

## Critères d'acceptation

### Scénario 1 : Connexion réussie

- **Étant donné** un client sur `/connexion`
- **Quand** il saisit un email et un mot de passe valides et soumet
- **Alors** une session est créée (cookie httpOnly), le client est redirigé vers
  la page d'origine (query param `redirect`) ou `/compte` par défaut, et le header
  affiche son prénom + un lien « Mon compte ».

### Scénario 2 : Identifiants invalides

- **Étant donné** un email ou mot de passe incorrect
- **Quand** le client soumet le formulaire
- **Alors** un message générique « Identifiants invalides » est affiché (pas
  d'énumération).

### Scénario 3 : Déconnexion

- **Étant donné** un client connecté
- **Quand** il clique sur « Se déconnecter »
- **Alors** la session est détruite, le cookie est supprimé, et le client est
  redirigé vers la page d'accueil.

### Scénario 4 : État connecté dans le header

- **Étant donné** un client connecté naviguant sur le storefront
- **Quand** le header est rendu
- **Alors** le lien « Se connecter » est remplacé par le prénom du client + un
  dropdown (Mon compte, Se déconnecter).

### Scénario 5 : Déjà connecté

- **Étant donné** un client déjà connecté
- **Quand** il accède à `/connexion`
- **Alors** il est redirigé vers `/compte` (pas de double connexion).

### Scénario 6 : i18n

- **Étant donné** la locale `en`
- **Quand** le client accède à `/en/login`
- **Alors** le formulaire, les labels, les messages et le `<title>` sont en anglais.

### Scénario 7 : Liens connexes

- **Étant donné** la page de connexion
- **Alors** elle contient des liens vers « Créer un compte » (`/inscription`) et
  « Mot de passe oublié » (`/mot-de-passe-oublie`).

### Scénario 8 : SEO

- **Étant donné** la page de connexion
- **Alors** elle porte `<meta name="robots" content="noindex">` et un `<title>`
  traduit.

## Non-objectifs

- Connexion sociale.
- « Se souvenir de moi » (durée de session configurable → Better Auth default).
- Connexion admin depuis le storefront (les flux restent séparés).

## Contraintes

- Route : `apps/pharmacie-1/src/app/[locale]/(storefront)/connexion/page.tsx`.
- Réutilise `authClient.signIn.email` et `authClient.signOut` de `lib/auth-client.ts`.
- Le header storefront doit détecter la session côté serveur (`getSession`) pour
  le rendu initial (SSR), pas uniquement côté client.
- Rate-limit existant : 5 tentatives/min sur `/sign-in/email` (déjà configuré).
