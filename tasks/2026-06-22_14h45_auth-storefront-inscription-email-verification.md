# Auth storefront — Inscription client + Vérification email

**Date:** 2026-06-22 14:45
**Statut:** Terminé

## Contexte

Epic auth storefront, jalon M2 (stories 01 + 02 + 06). Câbler le module email
dans Better Auth, livrer la page d'inscription client et la vérification d'email.

## Modifications

- [x] `packages/core/src/modules/email/templates/email-verification.ts` — template vérification email
- [x] `packages/core/src/modules/email/templates/password-reset.ts` — template reset mot de passe
- [x] `packages/core/src/modules/email/templates/registry.ts` — enregistrement des 2 nouveaux templates
- [x] `packages/core/src/modules/email/index.ts` — exports des nouveaux templates
- [x] `packages/core/src/modules/email/email.service.test.ts` — 2 tests ajoutés (templates auth)
- [x] `apps/pharmacie-1/src/lib/auth-options.ts` — câblage emailVerification + sendResetPassword + transport SMTP
- [x] `apps/pharmacie-1/src/lib/auth-client.ts` — export signUp
- [x] `apps/pharmacie-1/messages/fr.json` — clés auth.register, auth.verifyEmail, auth.emailBanner
- [x] `apps/pharmacie-1/messages/en.json` — idem EN
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/inscription/page.tsx` — page inscription
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/inscription/register-form.tsx` — formulaire client
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/verify-email/page.tsx` — page callback vérification
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/verify-email/verify-email-client.tsx` — client component
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/email-verification-banner.tsx` — bandeau
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/layout.tsx` — bandeau conditionnel emailVerified
- [x] `apps/pharmacie-1/.env.example` — variables SMTP documentées

## Notes

- Better Auth verifyEmail est un GET server-side → redirect vers callbackURL avec ?error= si échec
- Transport email : consoleTransport par défaut, smtpTransport si SMTP_HOST défini
- Template password-reset préparé pour la story 05 (page reset pas encore faite)
- Locale dans les emails : FR par défaut, i18n des emails reporté (🚧)

## Rollback

Revenir au commit précédent sur la branche `feat/auth-storefront`.
