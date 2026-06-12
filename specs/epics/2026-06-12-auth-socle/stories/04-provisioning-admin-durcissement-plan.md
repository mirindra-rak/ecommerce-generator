# Plan : Provisioning du compte admin + durcissement

**Ticket** : [04-provisioning-admin-durcissement](./04-provisioning-admin-durcissement.md) · **Statut** ✅ Terminé (seed idempotent, sign-in admin 200, rate-limit 429)

## Résumé

Créer un compte ADMIN initial (idempotent, depuis variables d'env) via l'API Better
Auth pour un hash compatible, puis durcir la connexion (rate-limit sur `/sign-in/email`,
cookies sûrs) — afin de pouvoir se connecter au back-office en sécurité.

## Décisions d'architecture (issues de la doc Better Auth)

- **Création via `auth.api.signUpEmail({ body: { name, email, password } })`** (hash géré
  par la lib) — **jamais** d'insert Prisma du mot de passe. Le champ `role` est `input:
false` → **non settable via l'API** ; on **met à jour le rôle à `ADMIN` après création**
  par `prisma.user.update` (colonne DB, sans toucher au mot de passe).
- **Script headless sans `nextCookies`** : `lib/auth.ts` charge le plugin `nextCookies`
  (qui appelle `next/headers`) → inutilisable hors contexte requête. On **extrait les
  options communes** (`auth-options.ts`) et le script de seed instancie un Better Auth
  **sans plugin** (+ `autoSignIn: false`) pour éviter toute écriture de cookie.
- **Rate-limit natif** : `rateLimit` dans la config, avec `customRules["/sign-in/email"]`
  (ex. 5 tentatives / 60 s). Activé en prod par défaut ; on l'active aussi en dev pour le
  vérifier. Les appels serveur `auth.api` (seed) **contournent** le rate-limit.
- **Cookies** : Better Auth pose `httpOnly` + `sameSite` par défaut ; `secure` en prod
  (baseURL https). On l'explicite via `advanced.useSecureCookies` selon `NODE_ENV`.

## Fichiers à créer ou modifier

- `apps/pharmacie-1/src/lib/auth-options.ts` — **créé** : options Better Auth partagées
  (database, emailAndPassword, additionalFields role, rateLimit, advanced cookies).
- `apps/pharmacie-1/src/lib/auth.ts` — **modifié** : `betterAuth({ ...authOptions,
plugins: [nextCookies()] })`.
- `apps/pharmacie-1/scripts/seed-admin.ts` — **créé** : seed idempotent du compte ADMIN.
- `apps/pharmacie-1/package.json` — **modifié** : script `seed:admin` + devDep `tsx`.
- `apps/pharmacie-1/.env` (+ `.env.example`) — **modifié** : `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- `README.md` — **modifié** : documenter `pnpm --filter pharmacie-1 seed:admin`.

## Étapes de développement

1. **Extraction des options** — `auth-options.ts` exporte `authOptions` (database,
   emailAndPassword, user.additionalFields.role). `lib/auth.ts` consomme `...authOptions`
   - `nextCookies()`. Test : `type-check` + build OK ; smoke story 01/02 toujours vert.
2. **Rate-limit + cookies** — ajouter à `authOptions` : `rateLimit: { enabled: true,
customRules: { "/sign-in/email": { window: 60, max: 5 } } }` et `advanced:
{ useSecureCookies: NODE_ENV === "production" }`. Test : build OK.
3. **Variables d'env** — `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `.env` (gitignoré) +
   placeholders dans `.env.example`. Test : présentes au runtime.
4. **Script de seed admin** — `scripts/seed-admin.ts` : charge l'env, instancie un Better
   Auth headless (`...authOptions`, sans plugin, `autoSignIn:false`) ; si un user avec
   `ADMIN_EMAIL` existe → idempotent (garantir `role=ADMIN`, sortir) ; sinon `signUpEmail`
   puis `prisma.user.update({ role: "ADMIN" })`. Test : 1ʳᵉ exécution crée l'ADMIN.
5. **Script package + lancement** — `seed:admin` dans `package.json` (tsx + chargement
   `.env`). Test : `pnpm --filter pharmacie-1 seed:admin` s'exécute sans erreur.
6. **Idempotence** — relancer le seed. Test : pas de doublon (1 seul user pour l'email),
   pas d'erreur.
7. **Smoke runtime — connexion admin** — `POST /api/auth/sign-in/email` avec les creds →
   200 + cookie ; `GET /admin` avec ce cookie → 200 (rôle ADMIN). Test : codes attendus.
8. **Smoke runtime — rate-limit** (best-effort) — > 5 `POST /sign-in/email` rapprochés en
   échec → un `429`. Test : 429 observé (sinon documenté comme non bloquant).
9. **Doc** — README : commande de seed admin + note env. Test : relecture.
10. **Qualité** — `pnpm test` + `type-check` + `lint` + `build` verts.

## Points d'attention

- **Rôle non settable à la création** (`input:false`) : on crée puis on **met à jour** le
  rôle à `ADMIN`. Sans cette étape, le compte serait `CUSTOMER` → `requireStaff` le
  renverrait vers `/admin/forbidden` (régression silencieuse).
- **`nextCookies` + script** : importer `lib/auth.ts` tel quel dans un script planterait
  (appel `next/headers` hors requête). D'où l'instance headless via `authOptions`. 🚧
  Vérifier que `signUpEmail` headless n'essaie pas de poser un cookie (`autoSignIn:false`).
- **Chargement `.env` en tsx** : tsx ne charge pas `.env` automatiquement. Utiliser
  `tsx --env-file=.env` (Node 22) ou un petit loader inline. 🚧 à acter au codage.
- **Secret/mot de passe jamais committés** : `.env` gitignoré ; `.env.example` =
  placeholders ; ne pas logguer le mot de passe.
- **Rate-limit en mémoire** : suffisant pour un déploiement Silo mono-instance ; multi-
  instance nécessiterait un store partagé (hors périmètre). 🚧
- **Cible du seed = base dev** (`DATABASE_URL` de `.env`) ; ne pas viser la base de test.
- **Non énumération** : Better Auth renvoie déjà des erreurs génériques au sign-in ; le
  message UI « identifiants invalides » est traité en story 03.
- **Idempotence par email** : vérifier l'existence avant `signUpEmail` (qui échouerait sur
  email déjà pris) pour garder le script ré-exécutable sans erreur.
