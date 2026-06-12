# Story 01 (auth) — Intégration Better Auth + schéma & config

**Date:** 2026-06-12 07:40
**Statut:** Terminé

## Contexte

Socle d'authentification (epic auth, lots 3.3/5.1). Intégration Better Auth + adapter
Prisma, modèle User+rôles+sessions. Exécution du plan `01-integration-better-auth-plan.md`.

## Modifications

- [x] `apps/pharmacie-1` - dépendance `better-auth@^1.6`
- [x] `core/prisma/schema.prisma` - enum Role + modèles User/Session/Account/Verification (Silo)
- [x] `core/prisma/migrations/20260612071604_auth/` - migration
- [x] `core/src/test/db.ts` - tables d'auth ajoutées au TRUNCATE
- [x] `core/src/modules/auth/role.ts` - type Role, ROLES, isStaff
- [x] `core/src/modules/auth/user.repository.ts` (+ test) - findByEmail/findById/count
- [x] `core/src/modules/auth/index.ts` - exports
- [x] `apps/pharmacie-1/src/lib/auth.ts` - instance Better Auth (prismaAdapter, email+mdp, additionalFields role, nextCookies) + getSession
- [x] `apps/pharmacie-1/src/lib/auth-client.ts` - createAuthClient
- [x] `apps/pharmacie-1/src/app/api/auth/[...all]/route.ts` - toNextJsHandler (runtime nodejs)
- [x] `apps/pharmacie-1/next.config.ts` - serverExternalPackages (Prisma/better-auth)
- [x] `apps/pharmacie-1/tsconfig.json` - declaration:false (TS2742)
- [x] `apps/pharmacie-1/.env.example` - BETTER_AUTH_SECRET/URL (placeholders)

## Notes

- Instance Better Auth dans l'app (couplée Next), réutilise le singleton prisma de core.
- Correctif clé : `serverExternalPackages: ["@prisma/client", ...]` — sans ça, le route
  handler échoue au runtime (vendor-chunk Prisma introuvable, Next+pnpm).
- Correctif TS : `declaration:false` dans le tsconfig de l'app (TS2742 sur le type
  inféré de authClient).
- Smoke runtime validé : signup 200, mot de passe HACHÉ en base (len 161, plaintext=false),
  role=CUSTOMER par défaut, get-session null sans cookie / session valide avec cookie.
- Validation : 32 tests, type-check, lint, build verts.
- Secret réel hors git (`.env` gitignoré) ; `.env.example` = placeholder.
- Dépendances entrelacées : `pnpm-lock.yaml` + `ui/package.json` (phosphor, effort design
  parallèle) committés avec pour garder le lockfile cohérent (frozen-lockfile CI).

## Rollback

- `git revert`. Migration : `prisma migrate resolve --rolled-back 20260612071604_auth`
  - suppression du dossier, ou restauration d'un dump.
