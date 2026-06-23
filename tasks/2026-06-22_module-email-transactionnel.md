# Module email transactionnel (lot 4.10)

**Date:** 2026-06-22
**Statut:** Terminé

## Contexte

Le module `email` était un stub vide. Le notifier inventory loguait en `console.warn`.
Implémentation complète du service d'envoi, transport Strategy, templates et branchement inventory.

## Modifications

- [x] `packages/core/package.json` — ajout dépendance `nodemailer` + `@types/nodemailer`
- [x] `packages/core/src/modules/email/email.types.ts` — types EmailMessage, EmailTransport, TemplateResult
- [x] `packages/core/src/modules/email/email.service.ts` — service d'envoi (sendEmail, sendTemplatedEmail, setEmailTransport)
- [x] `packages/core/src/modules/email/transports/console.transport.ts` — transport console (dev/test)
- [x] `packages/core/src/modules/email/transports/smtp.transport.ts` — transport SMTP (Nodemailer, lazy init)
- [x] `packages/core/src/modules/email/templates/layout.ts` — layout HTML commun
- [x] `packages/core/src/modules/email/templates/low-stock.ts` — template alerte stock faible
- [x] `packages/core/src/modules/email/templates/registry.ts` — registre nom → render function
- [x] `packages/core/src/modules/email/email.service.test.ts` — 5 tests unitaires
- [x] `packages/core/src/modules/email/index.ts` — exports publics
- [x] `packages/core/src/modules/inventory/email-notifier.ts` — branché sur le vrai service email

## Notes

- Transport SMTP lazy-initialized (pas de crash si variables env absentes)
- Fail-safe : un échec d'envoi ne propage jamais d'exception
- Sans `ALERT_EMAIL_TO` → fallback `console.warn` avec message explicite
- 124 tests passent (dont les 19 inventory existants — pas de régression)

## Rollback

Supprimer les fichiers créés dans `modules/email/`, restaurer `email-notifier.ts`, retirer `nodemailer` du `package.json`.
