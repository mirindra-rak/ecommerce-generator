# Story : Service d'envoi + transport Strategy (SMTP + console)

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : M (~1 jour)
**Epic parent** : [Email transactionnel](../epic.md)

## Contexte

Le module `email` est un stub vide. On pose le socle : un service d'envoi découplé du
transport via le pattern Strategy, avec deux implémentations (SMTP via Nodemailer et
console pour dev/test).

## User Story

**En tant que** développeur du projet,
**je veux** un service d'envoi d'email avec transport interchangeable,
**afin de** pouvoir envoyer des emails transactionnels en production (SMTP) et loguer
en développement (console) sans changer le code appelant.

## Critères d'acceptation

### Scénario 1 : Envoi via transport SMTP

- **Étant donné** les variables d'environnement SMTP configurées
- **Quand** le service envoie un email `{ to, subject, html }`
- **Alors** Nodemailer transmet le message via le serveur SMTP configuré

### Scénario 2 : Fallback transport console

- **Étant donné** aucune variable SMTP configurée (ou `NODE_ENV=test`)
- **Quand** le service envoie un email
- **Alors** le message est logué via `console.info` sans erreur

### Scénario 3 : Fail-safe

- **Étant donné** un transport SMTP qui échoue (serveur injoignable)
- **Quand** le service tente d'envoyer un email
- **Alors** l'erreur est loguée (`console.error`), l'appel ne propage pas d'exception

### Scénario 4 : Interface Transport

- **Étant donné** le type `EmailTransport`
- **Alors** il expose une méthode `send(message: EmailMessage): Promise<void>`
- **Et** un nouveau transport peut être ajouté en implémentant cette interface

## Non-objectifs

- Pas de file d'attente / retry.
- Pas de templates (story 02).
- Pas de pièces jointes.

## Contraintes

- Dépendance `nodemailer` + `@types/nodemailer` ajoutée dans `packages/core`.
- Variables d'environnement : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
  `SMTP_FROM`.
- Le service est un singleton exporté depuis `packages/core/src/modules/email/index.ts`.
- Tests unitaires avec un transport mock (pas de vrai serveur SMTP).
