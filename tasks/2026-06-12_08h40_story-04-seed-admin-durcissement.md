# Story 04 (auth) — Provisioning admin + durcissement

**Date:** 2026-06-12 08:40
**Statut:** Terminé

## Contexte

Créer un compte ADMIN initial (idempotent, hash Better Auth) + durcir la connexion.
Exécution du plan `04-provisioning-admin-durcissement-plan.md`. Avec story 03 (login UI),
clôt l'epic auth (jalon M2).

## Modifications

- [x] `apps/pharmacie-1/src/lib/auth-options.ts` - options Better Auth partagées (+ rateLimit, advanced cookies)
- [x] `apps/pharmacie-1/src/lib/auth.ts` - consomme authOptions + nextCookies
- [x] `apps/pharmacie-1/scripts/seed-admin.ts` - seed idempotent (signUpEmail + maj role ADMIN)
- [x] `apps/pharmacie-1/package.json` - devDep tsx + script seed:admin
- [x] `apps/pharmacie-1/.env.example` - ADMIN_EMAIL/PASSWORD (placeholders)
- [x] `README.md` - commande seed:admin

## Notes

- Compte créé via `auth.api.signUpEmail` (hash géré par la lib) puis `prisma.user.update`
  pour role=ADMIN (le champ role input:false n'est pas settable à la création).
- Script HEADLESS : instance Better Auth dédiée SANS nextCookies (next/headers
  indisponible hors requête) + autoSignIn:false ; réutilise authOptions partagées.
- Rate-limit natif : customRules["/sign-in/email"] window 60 max 5 ; appels serveur
  auth.api (seed) contournent le rate-limit. Cookies secure en prod.
- Smoke runtime : seed créé + idempotent (1 user ADMIN) ; sign-in admin 200 + cookie ;
  /admin avec cookie ADMIN → 200 ; 6 sign-in ratés → 429 (tentatives 5-6).
- Validation : 32 tests, type-check, lint, build verts.
- Secret + mot de passe admin réels hors git (.env gitignoré) ; .env.example = placeholders.
- Reste epic : story 03 (UI login/logout) pour finir le jalon M2.

## Rollback

- `git revert`. Supprimer le compte admin : `delete from "User" where email=ADMIN_EMAIL`.
