# AGENTS.md — Instructions projet (pharmacie-generator)

## Stack

- **TypeScript** strict · **Next.js** (App Router) · **React 19**
- **PostgreSQL** auto-hébergé · **Prisma** (ORM)
- **Monorepo** : pnpm workspaces + Turborepo
- **Tailwind v4** + design tokens · **ESLint + Prettier**
- Tests : **Vitest** + **Playwright**

## Commandes usuelles

Lancer depuis la **racine** (Turborepo orchestre les workspaces) :

- Install : `pnpm install`
- Dev : `pnpm dev` (ou `pnpm --filter pharmacie-1 dev`)
- Build : `pnpm build`
- Tests : `pnpm test`
- Lint : `pnpm lint`
- Type-check : `pnpm type-check`
- Format : `pnpm format`
- DB (depuis `packages/core`) : `pnpm --filter @pharmacie/core db:migrate`,
  `pnpm --filter @pharmacie/core db:generate`
- PostgreSQL local : `docker compose up -d`

## Conventions de code

- **Strict TS** : `any` **interdit** (règle ESLint en `error`). Pas de `console.log`
  committé (`console.warn`/`error` tolérés).
- **Organisation par module métier**, pas par couche technique.
- **Repository pattern obligatoire** : tout accès aux données passe par un repository
  (`packages/core/src/repositories` + repos par module). **Jamais** d'appel Prisma
  direct depuis une route Next ou un composant.
- Logique métier dans des **services de domaine**, pas dans les routes.
- Nommage : terminologie canonique (Repository, Service, Strategy, Factory…).
- Imports : packages internes via `@pharmacie/core`, `@pharmacie/ui`.

## ⛔ Règle non-négociable — Silo, pas de multi-tenant

Le projet est en modèle **Silo** : **1 déploiement = 1 pharmacie = 1 base dédiée**.

- **JAMAIS** de colonne `tenant_id`, de table `tenants`, ni de RLS multi-tenant.
- On ne parle pas de « tenant » dans le code : un site (une pharmacie) est défini par
  une **configuration** : `apps/<app>/site.config.ts` + thème dans `apps/<app>/themes/`.
  Pas une donnée en base.
- Décliner pour une autre pharmacie = nouveau dossier `apps/<pharmacie>` (ou nouveau
  déploiement) avec config + thème. Pas de logique de séparation de données.

## Architecture

Monolithe modulaire Next.js. `packages/core` = moteur commerce + domaine +
repositories + Prisma ; `packages/ui` = design system thémable ; `apps/*` = un
déploiement par pharmacie. Détails et ADR : voir **ARCHITECTURE.md**.

## Modules

`packages/core/src/modules/` : `catalog`, `pricing`, `inventory`, `search`, `cart`,
`promotions`, `order`, `customer`, `wishlist`, `reviews`, `returns`, `payment`,
`shipping`, `email`, `cms`, `admin`, `auth`.

## Tests

- **Vitest** : unitaires + intégration, colocalisés (`*.test.ts`) près du code testé.
- **Playwright** : e2e dans `apps/pharmacie-1` (parcours invité + connecté,
  desktop/mobile).
- Couverture attendue : tests ≈ 30-40 % du dev (jamais moins).

## Git

- Branches : `main` (stable), `feat/*`, `fix/*`.
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`…).
- Pre-commit : husky + lint-staged (prettier + eslint --fix).
- Commit/push uniquement à la demande explicite.

## Journalisation des tâches

Toute modification significative est documentée dans `tasks/` à la racine
(format `YYYY-MM-DD_HHhmm_nom-de-la-tache.md`), conformément au AGENTS.md global.

## Pièges connus

- **Ne pas** introduire de multi-tenant « au cas où » (cf. règle Silo).
- Packages `core`/`ui` consommés en **TS brut** via `transpilePackages` (Next) — pas
  d'étape de build des packages ; vérifier `next.config.ts` si un import casse.
- **Stripe / webhooks PSP** : route Node.js (runtime `nodejs`), jamais edge.
- Tailwind v4 : config **CSS-first** (`@theme` dans le CSS), pas de `tailwind.config.js`.
- Prisma : client généré ignoré par git ; lancer `db:generate` après `pnpm install`.
