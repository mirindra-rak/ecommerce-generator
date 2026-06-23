# Auth storefront — Forgot/reset password + Mon compte

**Date:** 2026-06-22 15:00
**Statut:** Terminé

## Contexte

Epic auth storefront, jalon M3 (stories 05 + 07). Livrer le flux de réinitialisation
de mot de passe et l'espace « Mon compte » (dashboard, profil, changement de mot de
passe).

## Modifications

- [x] `apps/pharmacie-1/messages/fr.json` — clés auth.forgotPassword, auth.resetPassword, auth.account
- [x] `apps/pharmacie-1/messages/en.json` — idem EN
- [x] `apps/pharmacie-1/src/lib/auth-options.ts` — rate-limit /request-password-reset
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/mot-de-passe-oublie/page.tsx` — page forgot password
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/mot-de-passe-oublie/forgot-password-form.tsx` — formulaire
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/reset-password/page.tsx` — page reset password
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/reset-password/reset-password-form.tsx` — formulaire
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/layout.tsx` — layout compte (session guard + nav)
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/_components/account-nav.tsx` — navigation latérale
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/page.tsx` — dashboard
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/profil/page.tsx` — page profil
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/profil/profile-form.tsx` — formulaire profil
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/mot-de-passe/page.tsx` — page changement mdp
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/mot-de-passe/change-password-form.tsx` — formulaire

## Notes

- Better Auth endpoints natifs : requestPasswordReset, resetPassword, changePassword, updateUser
- Les 3 erreurs de type-check sont pré-existantes (module cart, pas liées à ce travail)
- Sections futures dans la nav compte (Commandes, Adresses, Wishlist) marquées « Bientôt »
- Double protection /compte : middleware (cookie check) + layout (getSession redirect)

## Rollback

Revenir au commit précédent sur la branche `feat/auth-storefront`.
