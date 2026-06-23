# Story 06 : Vérification d'email

**Epic parent** : [Auth storefront client](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** M · **Priorité** P1
**Dépend de** : 01 (email), 02 (inscription)

## Contexte

Après inscription, le client doit vérifier son email pour confirmer son identité.
Better Auth propose un plugin `emailVerification` natif : envoi d'un lien avec
token, vérification au clic, marquage du compte comme vérifié. Le service email
de la story 01 fournit le transport.

## User Story

**En tant que** nouveau client inscrit, **je veux** recevoir un email de
vérification et confirmer mon adresse, **afin de** prouver que l'email
m'appartient et débloquer les fonctionnalités complètes.

## Critères d'acceptation

### Scénario 1 : Email envoyé à l'inscription

- **Étant donné** un client qui vient de s'inscrire
- **Quand** le compte est créé
- **Alors** un email de vérification (lien avec token, expiration 24h) est envoyé
  automatiquement.

### Scénario 2 : Vérification réussie

- **Étant donné** un client ayant reçu l'email de vérification
- **Quand** il clique sur le lien (token valide)
- **Alors** le compte est marqué comme vérifié (`emailVerified = true`), et le
  client est redirigé vers `/compte` avec un message de succès.

### Scénario 3 : Token expiré

- **Étant donné** un lien de vérification expiré (> 24h)
- **Quand** le client clique dessus
- **Alors** un message « Lien expiré » est affiché avec un bouton « Renvoyer
  l'email de vérification ».

### Scénario 4 : Renvoi d'email

- **Étant donné** un client connecté avec email non vérifié
- **Quand** il est sur `/compte` et clique « Renvoyer l'email de vérification »
- **Alors** un nouvel email est envoyé (rate-limit : 1 renvoi / 2 min).

### Scénario 5 : Bandeau de rappel

- **Étant donné** un client connecté avec email non vérifié
- **Quand** il navigue sur l'espace compte
- **Alors** un bandeau persistant « Vérifiez votre email — Renvoyer » est affiché
  en haut de la page.

### Scénario 6 : i18n

- **Étant donné** la locale `en`
- **Quand** le client reçoit l'email de vérification ou accède à la page de
  callback
- **Alors** les textes (email + page) sont en anglais.

## Non-objectifs

- Bloquer complètement la navigation si email non vérifié (le compte reste
  utilisable, mais les futures actions sensibles — commandes — pourront exiger
  la vérification).
- Changement d'email + re-vérification → itération ultérieure.

## Contraintes

- Better Auth `emailVerification` plugin — config dans `auth-options.ts`.
- Le callback de vérification est une route storefront :
  `apps/pharmacie-1/src/app/[locale]/(storefront)/verify-email/page.tsx`.
- Token géré par Better Auth (table `Verification`).
- L'email contient le lien construit avec `BETTER_AUTH_URL` + callback path.
