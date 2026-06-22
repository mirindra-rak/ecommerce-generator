# Story 05 : Forgot / reset password

**Epic parent** : [Auth storefront client](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** M · **Priorité** P1
**Dépend de** : 01 (email), 03 (connexion)

## Contexte

Better Auth inclut le flux `forgetPassword` / `resetPassword` nativement. Il
suffit d'activer la config, de câbler l'envoi d'email via le service de la
story 01, et de fournir les pages correspondantes.

## User Story

**En tant que** client ayant oublié mon mot de passe, **je veux** recevoir un
email avec un lien de réinitialisation, **afin de** retrouver l'accès à mon
compte sans intervention du support.

## Critères d'acceptation

### Scénario 1 : Demande de reset

- **Étant donné** un client sur `/mot-de-passe-oublie`
- **Quand** il saisit son email et soumet
- **Alors** un message de confirmation est affiché (« Si un compte existe, un email
  a été envoyé ») quelle que soit l'existence du compte (pas d'énumération).

### Scénario 2 : Email de reset reçu

- **Étant donné** un email correspondant à un compte existant
- **Quand** la demande de reset est soumise
- **Alors** un email contenant un lien de réinitialisation (token unique, expiration
  1h) est envoyé via le service email.

### Scénario 3 : Reset effectif

- **Étant donné** un client ayant cliqué le lien de reset (token valide)
- **Quand** il saisit un nouveau mot de passe (≥ 8 caractères) et confirme
- **Alors** le mot de passe est mis à jour, les sessions existantes sont
  invalidées, et le client est redirigé vers `/connexion` avec un message de
  succès.

### Scénario 4 : Token expiré ou invalide

- **Étant donné** un lien de reset avec un token expiré ou altéré
- **Quand** le client accède à la page de reset
- **Alors** un message « Lien expiré ou invalide — refaire une demande » est
  affiché avec un lien vers `/mot-de-passe-oublie`.

### Scénario 5 : i18n

- **Étant donné** la locale `en`
- **Quand** le client accède à `/en/forgot-password` et `/en/reset-password`
- **Alors** tous les textes sont en anglais.

### Scénario 6 : SEO

- **Étant donné** les pages forgot/reset
- **Alors** elles portent `<meta name="robots" content="noindex">`.

## Non-objectifs

- Notification « votre mot de passe a été changé » (email de confirmation post-
  reset) → itération.
- Politique de complexité du mot de passe au-delà de la longueur minimale.

## Contraintes

- Routes : `/mot-de-passe-oublie` (forgot) et `/reset-password` (page de saisie
  avec token en query param).
- Better Auth gère le token (table `Verification`) — pas de gestion manuelle.
- Rate-limit : max 3 demandes de reset / min par IP.
- Le lien dans l'email utilise `BETTER_AUTH_URL` + path de reset.
