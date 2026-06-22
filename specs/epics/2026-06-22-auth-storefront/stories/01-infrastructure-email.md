# Story 01 : Infrastructure email transactionnelle (ESP + service)

**Epic parent** : [Auth storefront client](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** M · **Priorité** P0

## Contexte

Le module `email` (`packages/core/src/modules/email`) est une coquille vide. Les
stories d'inscription, de vérification d'email et de reset mot de passe en
dépendent. On a besoin d'un **service d'envoi transactionnel** abstrait derrière
une interface (Strategy pattern), avec un premier provider concret.

## User Story

**En tant que** système (back-end), **je veux** pouvoir envoyer des emails
transactionnels via un ESP configurable, **afin de** supporter la vérification
d'email, le reset de mot de passe et les futures notifications.

## Critères d'acceptation

### Scénario 1 : Service d'envoi fonctionnel

- **Étant donné** un ESP configuré via variables d'environnement (`EMAIL_PROVIDER`,
  `EMAIL_FROM`, credentials)
- **Quand** le service envoie un email (destinataire, sujet, corps texte, corps HTML
  optionnel)
- **Alors** l'email est transmis au provider et l'appel retourne sans erreur.

### Scénario 2 : Strategy interchangeable

- **Étant donné** une interface `EmailSender` dans le module email
- **Quand** on change `EMAIL_PROVIDER` (ex. `resend` → `smtp`)
- **Alors** le service utilise l'implémentation correspondante sans modification de
  code appelant.

### Scénario 3 : Mode développement (console)

- **Étant donné** `EMAIL_PROVIDER=console` (ou variable absente)
- **Quand** un email est envoyé
- **Alors** le contenu est écrit dans `console.warn` (sujet, destinataire, corps)
  et aucun email réel n'est envoyé.

### Scénario 4 : Intégration Better Auth

- **Étant donné** le service email fonctionnel
- **Quand** Better Auth a besoin d'envoyer un email (vérification, reset)
- **Alors** Better Auth utilise le `sendEmail` du module via sa config
  `emailAndPassword.sendResetPassword` / `emailVerification.sendVerificationEmail`.

## Non-objectifs

- Templates HTML riches / branding → texte fonctionnel uniquement.
- File d'attente / retry automatique → envoi synchrone, erreurs loguées.
- Choix définitif de l'ESP → on livre `console` + `resend` ; SMTP générique en
  itération si besoin.

## Contraintes

- Le service vit dans `packages/core/src/modules/email` (Repository pattern non
  applicable ici : pas de données en base, c'est un service d'infrastructure).
- Variables d'env documentées dans `.env.example`.
- Aucune dépendance lourde : `resend` (SDK léger) en optional peer ou
  `dependencies` du core.

## Questions ouvertes

- 🚧 ESP de production : Resend est le choix par défaut (DX simple, API REST,
  free tier généreux). Confirmer ou substituer par Postmark / SES / SMTP si
  préférence existante.
