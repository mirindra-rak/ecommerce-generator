# Architecture — pharmacie-generator

**Date** : 2026-06-11 · **Statut** : 🟢 Fondations

## Vision

Plateforme e-commerce **parapharmacie** entièrement sur-mesure : storefront client,
back-office d'administration, moteur commerce et intégrations paiement/livraison
**recodés** (pas de PrestaShop). Migration totale des données depuis l'existant.

- **Utilisateurs** : clients B2C (invité + connecté) côté storefront ; équipe pharmacie
  (catalogue, commandes, stock, CMS) côté back-office.
- **Contraintes fortes** : conformité RGPD + parapharmacie (mentions, allégations),
  SEO (reprise d'un site existant, redirections 301), paiement & livraison FR
  (Stripe/LCL, Colissimo, Mondial Relay), PostgreSQL **auto-hébergé**.

## Modèle de déploiement — Silo (instance-per-tenant)

> **Décision structurante.** On retient le modèle **Silo** : **1 déploiement =
> 1 pharmacie = 1 base PostgreSQL dédiée**. Un « site » (une pharmacie) est défini par
> une **configuration** (variables d'environnement + thème), **jamais une donnée**.
> (Note de vocabulaire : on n'emploie pas le terme « tenant » dans notre code — il
> appartient au monde multi-tenant qu'on a justement écarté ; on parle de **site**.)

**Conséquences contraignantes :**

- ❌ **Aucun** `tenant_id` sur les tables, **aucune** table `tenants`, **aucune** RLS
  multi-tenant. Ne pas introduire de scoping multi-tenant.
- ✅ Réutilisation pour une autre pharmacie = **nouveau déploiement** avec une autre
  config + un autre thème. ~100 % du code partagé.
- ✅ La mutualisation n'existe pas : côté visiteur, chaque site est un site normal sur
  son propre domaine. La contrainte « bizarre de voir du multi-tenant sur un site
  perso » est résolue par construction.

**Évolution SaaS** : si un jour on vend la solution, ce sera en **« managed
instances »** (un déploiement opéré par client), **pas** en Pool mutualisé tant que le
volume ne le justifie pas. Le **Repository pattern** (cf. plus bas) est la police
d'assurance qui rendrait cette bascule possible sans réécrire l'app.

## Stack

| Couche        | Choix                                        | Justification                                              |
| ------------- | -------------------------------------------- | ---------------------------------------------------------- |
| Langage       | TypeScript (strict)                          | Type-safety bout-en-bout front/back.                       |
| Framework     | Next.js (App Router)                         | SSR/SSG/ISR pour SEO, RSC, un seul runtime front+back.     |
| Base          | PostgreSQL (auto-hébergé)                    | Domaine relationnel, transactions ACID, full-text natif.   |
| ORM           | Prisma                                       | DX + migrations ; pas de complexité RLS (Silo) à arbitrer. |
| Monorepo      | pnpm workspaces + Turborepo                  | Partage `core`/`ui` entre déploiements, cache de tâches.   |
| Design system | Tailwind v4 + design tokens                  | Theming par swap de tokens, sans forker les composants.    |
| Lint/format   | ESLint + Prettier                            | Standard écosystème Next.                                  |
| Tests         | Vitest (unit/intégration) + Playwright (e2e) | Cf. lot 11.7.                                              |

## Architecture

**Monolithe modulaire** (un seul process Next.js), organisé **par module métier**.

```
┌───────────────────────────────────────────────────────────┐
│  apps/pharmacie-1  (Next.js)                                │
│  ┌─────────────────────┐   ┌──────────────────────────┐    │
│  │ (storefront) routes │   │ admin routes (back-office)│    │
│  └──────────┬──────────┘   └────────────┬─────────────┘    │
│             │  site.config + thème       │                  │
└─────────────┼────────────────────────────┼─────────────────┘
              ▼                            ▼
        ┌───────────────────────────────────────┐
        │  packages/core                          │
        │  modules métier → services de domaine   │
        │  ───────────── Repository ───────────── │  ← frontière unique d'accès données
        │  Prisma Client → PostgreSQL             │
        └───────────────────────────────────────┘
        ┌───────────────────────────────────────┐
        │  packages/ui  (design system thémable) │
        └───────────────────────────────────────┘
```

**Flux de données** : route Next (RSC/handler) → service de domaine du module →
Repository → Prisma → PostgreSQL. La logique métier ne touche jamais Prisma
directement : elle passe par un Repository.

## Patterns

- **Repository** (Fowler/Evans) — frontière unique d'accès aux données. Tout accès
  passe par un repository ; aucune requête Prisma dispersée dans les routes/services.
  → bonne isolation + assurance migration future.
- **Service / Domain** — la logique métier (règles TVA, totaux panier, transitions de
  statut commande) vit dans des services de domaine, pas dans les routes.
- **Strategy** — intégrations interchangeables : PSP (Stripe / LCL Sherlocks),
  transporteurs (Colissimo / Mondial Relay).
- **Factory** — résolution de la config + du thème du site au démarrage.

## Modules

Dans `packages/core/src/modules/` (responsabilité de chacun) :

| Module       | Responsabilité                                                  |
| ------------ | --------------------------------------------------------------- |
| `catalog`    | Produits, variantes, catégories, marques, médias.               |
| `pricing`    | Prix & TVA (HT/TTC, règles FR).                                 |
| `inventory`  | Stock & disponibilité.                                          |
| `search`     | Recherche full-text Postgres + facettes/filtres.                |
| `cart`       | Panier (persistance, totaux, règles).                           |
| `promotions` | Codes promo, remises, règles de réduction.                      |
| `order`      | Checkout, commandes, statuts, factures, avoirs, remboursements. |
| `customer`   | Comptes clients, profils, adresses, alertes.                    |
| `wishlist`   | Wishlist + comparateur.                                         |
| `reviews`    | Avis produits (soumission, modération, affichage).              |
| `returns`    | Retours produits / RMA.                                         |
| `payment`    | Intégration PSP + webhooks + 3-D Secure.                        |
| `shipping`   | Colissimo, Mondial Relay, règles de frais de port.              |
| `email`      | Emails transactionnels + service d'envoi.                       |
| `cms`        | CMS + blog (articles, commentaires).                            |
| `admin`      | Back-office (RBAC, layout admin).                               |
| `auth`       | Authentification & sessions (client, invité, reset mdp).        |

## Structure des dossiers

```
pharmacie-generator/
├── apps/
│   └── pharmacie-1/            # 1 app = 1 pharmacie (Silo)
│       ├── src/app/(storefront)/   # routes publiques
│       ├── src/app/admin/          # back-office
│       ├── site.config.ts          # config du site (marque, features, FR)
│       └── themes/default/         # design tokens du site
├── packages/
│   ├── core/                  # moteur commerce + domaine + repositories
│   │   ├── prisma/schema.prisma
│   │   └── src/{db,repositories,config,modules/*}
│   └── ui/                    # design system thémable + tokens
├── ARCHITECTURE.md
├── CLAUDE.md
└── (configs racine : turbo, eslint, prettier, tsconfig.base, docker-compose…)
```

## Qualité

- TypeScript **strict** (`any` interdit, `noUncheckedIndexedAccess`).
- ESLint + Prettier ; pre-commit via **husky + lint-staged**.
- Tests : **Vitest** (unit/intégration), **Playwright** (e2e).
- CI **GitHub Actions** : install → lint → type-check → test → build.
- Commits : **Conventional Commits**.

## Déploiement

- **Docker** + **VPS auto-hébergé** (reverse proxy + SSL), **un déploiement + une base
  PostgreSQL par pharmacie**.
- Environnements : **dev · staging · prod**.
- `docker-compose.yml` fournit un PostgreSQL local pour le dev.

## Décisions notables (ADR courts)

### ADR-001 — Modèle Silo plutôt que Pool multi-tenant

- **Contexte** : objectif double (site mono-pharmacie réutilisable + SaaS éventuel).
- **Décision** : Silo (instance-per-tenant), site = config (pas de notion de tenant).
- **Alternatives rejetées** : Pool mutualisé (`tenant_id` + RLS) → +25 à +40 JH
  d'upfront et taxe permanente sur chaque feature, surdimensionné pour un premier site.
- **Conséquences** : zéro complexité multi-tenant ; réutilisation par re-déploiement ;
  SaaS futur en managed-instances.

### ADR-002 — Monorepo pnpm + Turborepo, packages partagés en TS brut

- **Décision** : `core`/`ui` consommés en TypeScript brut via `transpilePackages` de
  Next (pas d'étape de build des packages).
- **Conséquences** : itération rapide ; pas de pipeline de build intermédiaire.

### ADR-003 — Prisma (et non Drizzle)

- **Contexte** : en Silo, pas de RLS multi-tenant à arbitrer (le point faible de Prisma).
- **Décision** : Prisma pour la DX et les migrations.
- **Conséquences** : à réévaluer si un besoin SQL fin/perf apparaît sur la recherche.
