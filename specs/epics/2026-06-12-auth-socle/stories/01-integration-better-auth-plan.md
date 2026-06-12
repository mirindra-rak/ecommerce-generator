# Plan : Intégration Better Auth + schéma & config

**Ticket** : [01-integration-better-auth](./01-integration-better-auth.md) · **Statut** ✅ Terminé (smoke runtime OK : signup, hash, session)

## Résumé

Intégrer Better Auth (adapter Prisma, PostgreSQL) : modéliser les 4 tables d'auth + un
rôle utilisateur dans `schema.prisma`, instancier Better Auth côté app (Next-couplé),
exposer le route handler `/api/auth/[...all]` et un helper `getSession()`, et fournir un
`userRepository` côté `core`.

## Décisions d'architecture (issues de la doc Better Auth)

- **Où vit l'instance Better Auth** : dans l'**app** (`apps/pharmacie-1/src/lib/auth.ts`),
  car elle dépend de `better-auth/next-js` (plugin `nextCookies`, `toNextJsHandler`) et de
  l'env de l'app. Elle réutilise le **client Prisma de `core`** via l'adapter. → `core`
  garde les **modèles** (schéma), le **type `Role`** et le **`userRepository`** ; l'app
  garde l'instance Next-couplée.
- **Schéma** : écrit **à la main** dans `schema.prisma` (source de vérité unique),
  d'après le schéma cœur documenté (User/Session/Account/Verification), avec `id` en
  `cuid()` pour rester cohérent. La CLI `@better-auth/cli generate` sert de **vérification
  croisée**, pas de générateur principal.
- **Rôle** : enum Prisma `Role { CUSTOMER STAFF ADMIN }`, `User.role @default(CUSTOMER)`,
  déclaré aussi à Better Auth via `user.additionalFields.role` (type des valeurs,
  `defaultValue: "CUSTOMER"`, `input: false`). 🚧 repli `String` si friction adapter.

## Fichiers à créer ou modifier

- `packages/core/prisma/schema.prisma` — **modifié** : `enum Role` + modèles `User`,
  `Session`, `Account`, `Verification` (Silo, aucun `tenant_id`).
- `packages/core/prisma/migrations/**` — **créé** : migration `auth`.
- `packages/core/src/modules/auth/role.ts` — **créé** : type `Role`, constantes, `isStaff`.
- `packages/core/src/modules/auth/user.repository.ts` — **créé** : `findByEmail`,
  `findById`, `count`.
- `packages/core/src/modules/auth/index.ts` — **modifié** : exports.
- `packages/core/src/modules/auth/user.repository.test.ts` — **créé**.
- `packages/core/src/test/db.ts` — **modifié** : ajouter les tables d'auth au TRUNCATE.
- `apps/pharmacie-1/src/lib/auth.ts` — **créé** : instance `betterAuth` (prismaAdapter,
  emailAndPassword, additionalFields role, secret/baseURL env, plugin `nextCookies`) +
  `getSession()`.
- `apps/pharmacie-1/src/lib/auth-client.ts` — **créé** : `createAuthClient` (better-auth/react).
- `apps/pharmacie-1/src/app/api/auth/[...all]/route.ts` — **créé** : `toNextJsHandler(auth)`.
- `apps/pharmacie-1/.env` (+ `.env.example`) — **modifié** : `BETTER_AUTH_SECRET`,
  `BETTER_AUTH_URL`.
- `apps/pharmacie-1/package.json` — **modifié** : dépendance `better-auth`.

## Étapes de développement

1. **Dépendance** — installer `better-auth` (app). Test : `pnpm install` OK, import
   résolu au build.
2. **Schéma d'auth** — `enum Role` + modèles `User`/`Session`/`Account`/`Verification`
   (champs documentés ; relations `Session.user`, `Account.user` en cascade ; `id` cuid ;
   `role Role @default(CUSTOMER)`). Test : `prisma validate` OK.
3. **Migration** — `db:migrate --name auth` (base dev). Test : les 4 tables existent
   (psql), client régénéré, `type-check` vert.
4. **Reset de test** — ajouter `User/Session/Account/Verification` au TRUNCATE de
   `src/test/db.ts`. Test : la suite existante reste verte.
5. **Module rôle** — `role.ts` : type `Role`, `ROLES`, `isStaff(role)` (true pour
   STAFF/ADMIN). Test unitaire : matrice des rôles.
6. **userRepository** — `findByEmail`, `findById`, `count`. Test (intégration) : un
   `User` créé sans rôle a `role = CUSTOMER` ; `findByEmail` retrouve l'utilisateur.
7. **Instance Better Auth** — `lib/auth.ts` : `betterAuth({ database: prismaAdapter(prisma,
{ provider: "postgresql" }), emailAndPassword: { enabled: true }, user: { additionalFields:
{ role } }, plugins: [nextCookies()] })` + secret/baseURL via env ; export `getSession()`
   = `auth.api.getSession({ headers: await headers() })`. Test : `type-check` + build OK.
8. **Client auth** — `lib/auth-client.ts` (`createAuthClient`, baseURL). Test : `type-check`.
9. **Route handler** — `app/api/auth/[...all]/route.ts` exporte `GET/POST` =
   `toNextJsHandler(auth)` (runtime nodejs). Test : build ; au runtime, un GET sur un
   endpoint d'auth répond.
10. **Env** — `BETTER_AUTH_SECRET` (généré), `BETTER_AUTH_URL=http://localhost:4321` dans
    `.env` (gitignoré) + documentés dans `.env.example`. Test : l'app démarre sans erreur.
11. **Smoke runtime** — créer un utilisateur via l'endpoint signup Better Auth, puis :
    (a) vérifier en base que le mot de passe est **haché** dans `Account` ; (b) `getSession`
    sans cookie retourne `null`/non authentifié. Test : curl + inspection psql.
12. **Qualité** — `pnpm test` + `type-check` + `lint` + `build` verts.

## Points d'attention

- **Régénérer le client Prisma** après l'ajout des modèles (`db:generate`) **avant**
  d'instancier Better Auth, sinon l'adapter ne voit pas `prisma.user` etc.
- **Pool Prisma partagé** : l'adapter doit réutiliser le singleton `prisma` de `core`
  (import depuis `@pharmacie/core`), pas une nouvelle instance.
- **Runtime nodejs** obligatoire pour le route handler (Prisma) — jamais edge.
- **`headers()` async** (Next 15) dans `getSession` → `await headers()`.
- **Vérification email désactivée** : `emailAndPassword.enabled` sans
  `requireEmailVerification` (pas d'ESP) — cohérent avec le non-objectif.
- **Tests d'auth (hash, session)** : difficilement unitaires (contexte HTTP + instance
  Next). On couvre le **data layer** par Vitest (userRepository) et le **flux Better Auth**
  par un **smoke runtime** (étape 11) — assumé et documenté.
- 🚧 **enum `Role` vs `String`** : si l'adapter Prisma force `String` sur l'additionalField,
  replier le champ en `String` + union TS (la valeur reste CUSTOMER/STAFF/ADMIN).
- **Secret** : `BETTER_AUTH_SECRET` jamais committé ; `.env.example` ne contient qu'un
  placeholder + la commande `openssl rand -base64 32`.
- **CI** : aucune table seedée requise ; le smoke runtime reste local (pas en CI) pour ne
  pas alourdir — la CI valide test/type-check/lint/build.
