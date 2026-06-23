# Auth storefront — Connexion client + Middleware

**Date:** 2026-06-22 14:30
**Statut:** Terminé

## Contexte

Epic auth storefront, jalon M1 (stories 03 + 04). Livrer la page de connexion/
déconnexion client sur le storefront et le middleware composé (i18n + auth) qui
protège les routes `/compte`.

## Modifications

- [x] `apps/pharmacie-1/messages/fr.json` — ajout namespace `auth` (login + userMenu)
- [x] `apps/pharmacie-1/messages/en.json` — idem EN
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/connexion/page.tsx` — page connexion (Server Component, noindex, redirect si connecté)
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/connexion/login-form.tsx` — formulaire client (authClient.signIn.email, redirect query param)
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/user-menu.tsx` — dropdown état connecté/anonyme
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx` — remplacement IconButton compte par UserMenu
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/layout.tsx` — getSession() + prop user vers header
- [x] `apps/pharmacie-1/src/middleware.ts` — composition next-intl + auth guard (cookie check sur /compte)
- [x] `apps/pharmacie-1/src/middleware.test.ts` — 7 tests (redirect anon, passthrough auth, routes publiques/admin)

## Notes

- Cookie Better Auth confirmé : `better-auth.session_token` (dev) / `__Secure-better-auth.session_token` (prod)
- Liens vers `/inscription` et `/mot-de-passe-oublie` sont des liens morts pour l'instant (stories 02 et 05)
- Redirect post-login pointe vers `/` tant que la page `/compte` n'existe pas (story 07)

## Rollback

Revenir au commit précédent sur la branche `feat/i18n-storefront`.
