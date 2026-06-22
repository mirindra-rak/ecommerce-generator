# Story 07 : Espace « Mon compte » (dashboard, profil, mot de passe)

**Epic parent** : [Auth storefront client](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** M · **Priorité** P1
**Dépend de** : 03 (connexion), 04 (middleware)

## Contexte

Une fois connecté, le client a besoin d'un espace dédié pour consulter et modifier
ses informations personnelles. Cette story couvre le **socle** de l'espace compte :
dashboard, édition du profil (nom, email), et changement de mot de passe. Les
sous-sections avancées (adresses, commandes, wishlist) viendront dans des epics
dédiés.

## User Story

**En tant que** client connecté, **je veux** accéder à un espace « Mon compte »
avec mon profil et la possibilité de changer mon mot de passe, **afin de** gérer
mes informations personnelles en autonomie.

## Critères d'acceptation

### Scénario 1 : Dashboard compte

- **Étant donné** un client connecté accédant à `/compte`
- **Quand** la page s'affiche
- **Alors** il voit un dashboard avec : son nom, son email, le statut de
  vérification email, et des liens vers les sections (Profil, Mot de passe,
  Se déconnecter). Les sections futures (Commandes, Adresses, Wishlist) sont
  visibles mais marquées « Bientôt disponible ».

### Scénario 2 : Édition du profil

- **Étant donné** un client sur `/compte/profil`
- **Quand** il modifie son nom et soumet
- **Alors** le nom est mis à jour, un message de succès est affiché, et le header
  reflète le nouveau nom.

### Scénario 3 : Changement de mot de passe

- **Étant donné** un client sur `/compte/mot-de-passe`
- **Quand** il saisit son mot de passe actuel, un nouveau mot de passe (≥ 8 car.)
  et la confirmation, puis soumet
- **Alors** le mot de passe est mis à jour et un message de succès est affiché.

### Scénario 4 : Mot de passe actuel incorrect

- **Étant donné** un client tentant de changer son mot de passe
- **Quand** le mot de passe actuel saisi est incorrect
- **Alors** un message d'erreur « Mot de passe actuel incorrect » est affiché.

### Scénario 5 : Layout compte avec navigation latérale

- **Étant donné** un client dans l'espace `/compte`
- **Quand** il navigue entre les sections
- **Alors** une navigation latérale (sidebar ou tabs mobile) permet de passer entre
  Dashboard, Profil, Mot de passe, et les sections futures.

### Scénario 6 : i18n

- **Étant donné** la locale `en`
- **Quand** le client accède à `/en/account`
- **Alors** tous les textes (navigation, labels, messages) sont en anglais.

### Scénario 7 : SEO

- **Étant donné** les pages de l'espace compte
- **Alors** elles portent `<meta name="robots" content="noindex">`.

## Non-objectifs

- Édition de l'email (nécessite re-vérification → itération).
- Upload d'avatar.
- Suppression de compte / export RGPD → story dédiée.
- Sections avancées (adresses, commandes, wishlist, avis) → epics dédiés.

## Contraintes

- Routes sous `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/` :
  - `page.tsx` (dashboard)
  - `profil/page.tsx`
  - `mot-de-passe/page.tsx`
  - `layout.tsx` (navigation latérale + protection via `getSession`)
- Primitives `@pharmacie/ui` pour tous les composants.
- Better Auth `changePassword` API pour le changement de mot de passe.
- Better Auth `updateUser` API pour la mise à jour du profil.
- Double protection : middleware (story 04) + vérification session dans le layout.
