# Bootstrap du monorepo pharmacie-generator

**Date:** 2026-06-11 18:15
**Statut:** Terminé

## Contexte

Initialisation des fondations du projet e-commerce parapharmacie sur-mesure.
Architecture Silo (instance-per-tenant) : 1 déploiement = 1 pharmacie, pas de
multi-tenant Pool. Monorepo pnpm + Turborepo. Voir ARCHITECTURE.md.

## Modifications

- [x] `ARCHITECTURE.md` - décisions techniques
- [x] `CLAUDE.md` - instructions projet
- [x] Racine : `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`
- [x] Lint/format : `eslint.config.mjs`, `.prettierrc.json`, `.editorconfig`
- [x] `.gitignore`, `.npmrc`, `README.md`
- [x] `packages/core` - moteur + domaine + repositories + schéma Prisma
- [x] `packages/ui` - design system thémable + design tokens
- [x] `apps/pharmacie-1` - app Next.js (storefront + admin) + tenant.config + thème
- [x] DevOps : `docker-compose.yml`, `Dockerfile`, `.github/workflows/ci.yml`, husky
- [x] `pnpm install`

## Notes

- ESLint + Prettier retenus (pas Biome).
- Squelette complet demandé (tous les modules métier en placeholder).
- 17 modules métier dérivés des lots 4/5/7.
- Renommage `tenant` → `site`/config (Silo ≠ multi-tenant, vocabulaire clarifié).
- Validation : `pnpm type-check` ✅, `pnpm lint` ✅, `pnpm build` ✅, `pnpm test` ✅.
- Git initialisé, **rien n'est commité** (en attente de validation).

## Rollback

Projet from scratch : `rm -rf` du dossier (hors `.claude/`) suffit. Aucun
système existant impacté.
