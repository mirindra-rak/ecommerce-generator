# Plan : Connexion / déconnexion client storefront + Middleware auth

**Ticket** : [Story 03](03-connexion-deconnexion-client.md) + [Story 04](04-middleware-auth-storefront.md) · **Statut** 🟡

## Résumé

Livrer la page de connexion/déconnexion client sur le storefront, l'état connecté
dans le header, et le middleware composé (i18n + auth) qui protège les routes
`/compte` — jalon M1 de l'epic auth storefront.

## Fichiers à créer ou modifier

### Nouveaux fichiers

- `apps/pharmacie-1/src/app/[locale]/(storefront)/connexion/page.tsx` — page de
  connexion (Server Component : redirect si déjà connecté, metadata noindex)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/connexion/login-form.tsx` — formulaire
  client (Client Component, `authClient.signIn.email`, gestion du `redirect` query param)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/user-menu.tsx` — Client
  Component dropdown état connecté (prénom + Mon compte / Se déconnecter) avec
  fallback IconButton « Se connecter »

### Fichiers modifiés

- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/site-header.tsx` — remplacer
  l'IconButton « compte » statique par le `UserMenu` (passer la session serveur en prop)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/layout.tsx` — appeler `getSession()`
  pour transmettre l'utilisateur au header
- `apps/pharmacie-1/src/middleware.ts` — composer next-intl + vérification de cookie
  de session pour les segments `/compte`
- `apps/pharmacie-1/messages/fr.json` — ajouter namespace `auth` (login, labels, erreurs)
- `apps/pharmacie-1/messages/en.json` — idem en anglais

## Étapes de développement

### 1. Clés i18n auth

Ajouter le namespace `auth` dans `fr.json` et `en.json` : clés pour titre page
connexion, labels email/mot de passe, bouton « Se connecter », message « Identifiants
invalides », lien « Créer un compte », lien « Mot de passe oublié », état connecté
(« Mon compte », « Se déconnecter »), pending state.

**Test** : `pnpm build` compile sans erreur de clé manquante ; les clés apparaissent
dans les deux fichiers JSON.

### 2. Page de connexion (`/connexion`)

Créer la route `[locale]/(storefront)/connexion/page.tsx` (Server Component) :

- `generateMetadata` : `<title>` traduit + `robots: "noindex"`.
- Appel `getSession()` → si connecté, `redirect` vers `/compte` (ou `/` en attendant
  que la page compte existe).
- Rendu du `LoginForm` (Client Component).

Créer `connexion/login-form.tsx` (Client Component) :

- Formulaire avec `Input` email + password, `Button` submit (primitives `@pharmacie/ui`).
- Appel `authClient.signIn.email({ email, password })` au submit.
- Gestion du query param `redirect` (via `useSearchParams`) : redirect vers cette URL
  si présent, sinon vers `/compte` (ou `/`).
- Erreur affichée : message générique traduit (pas d'énumération).
- Liens vers `/inscription` et `/mot-de-passe-oublie` (liens morts pour l'instant,
  stories 02 et 05).
- Pattern calqué sur `admin/login/login-form.tsx`.

**Test** : navigation vers `/fr/connexion` affiche le formulaire en FR ; `/en/connexion`
en EN. Connexion avec un compte existant (seed admin ou CUSTOMER créé via Better Auth
API) redirige vers `/`. Mauvais identifiants → message d'erreur.

### 3. Composant `UserMenu` (état connecté / anonyme)

Créer `_components/user-menu.tsx` (Client Component) :

- Props : `user: { name: string } | null`.
- Si `user` est null → `Link` vers `/connexion` avec `UserIcon` (comportement actuel).
- Si `user` est présent → bouton avec prénom, dropdown au clic (Mon compte, Se
  déconnecter). Déconnexion via `authClient.signOut()` + `router.refresh()`.
- Dropdown : markup simple (div positionné), pas de lib externe.

**Test** : en étant déconnecté, l'icône compte mène à `/connexion`. En étant connecté,
le menu affiche le prénom et la déconnexion fonctionne (retour état anonyme).

### 4. Intégration header + layout storefront

Modifier `layout.tsx` : appeler `getSession()` et passer `session?.user ?? null` comme
prop au `SiteHeader` (ou via un context/prop drilling vers `UserMenu`).

Modifier `site-header.tsx` : accepter une prop `user` optionnelle, remplacer
l'`IconButton` « compte » par `<UserMenu user={user} />`.

**Test** : le header affiche l'état correct (anonyme ou connecté) au premier rendu
serveur (pas de flash). La navigation catalogue, le mega menu, le language switcher
ne sont pas impactés.

### 5. Middleware composé (i18n + auth)

Modifier `middleware.ts` :

- Importer `createMiddleware` de next-intl (existant).
- Avant d'appeler le middleware i18n, détecter si le pathname matche un segment
  protégé (`/compte` ou `/<locale>/compte`).
- Si segment protégé : vérifier l'existence du cookie de session Better Auth
  (`better-auth.session_token` ou son nom configuré). Si absent → `NextResponse.redirect`
  vers `/<locale>/connexion?redirect=<pathname>`.
- Si présent ou route publique → déléguer au middleware next-intl normalement.
- Le matcher reste le même (exclut `api`, `admin`, `_next`, fichiers statiques).

**Test** : accès anonyme à `/fr/compte` → redirect vers `/fr/connexion?redirect=/fr/compte`.
Accès connecté à `/fr/compte` → page affichée (404 attendu pour l'instant, mais pas de
redirect). Routes publiques (`/fr/produit/...`) et admin (`/admin/...`) inchangées.

### 6. Vérification du redirect post-login

S'assurer que le `LoginForm` lit le query param `redirect` et l'utilise après une
connexion réussie : un visiteur renvoyé vers `/connexion?redirect=/fr/compte` qui
se connecte arrive bien sur `/fr/compte`.

**Test** : parcours complet anonyme → `/compte` → redirect login → connexion →
retour `/compte`.

### 7. Tests unitaires

- Test Vitest pour `isStaff` (existe déjà, vérifier non-régression).
- Test du composant `LoginForm` : rendu avec les bons labels, soumission appelle
  `signIn.email`.
- Test du middleware : mock du cookie → vérifie la logique de redirect vs passthrough.

**Test** : `pnpm test` passe ; `pnpm lint` et `pnpm type-check` sans erreur.

## Points d'attention

- **Cookie de session Better Auth** : le nom exact du cookie (`better-auth.session_token`)
  doit être vérifié dans la doc Better Auth ou dans les DevTools. En edge middleware,
  on ne peut lire que les cookies (pas appeler le serveur) — vérification d'existence
  seulement, pas de validation.
- **Composition middleware** : next-intl expose `createMiddleware` qui retourne un
  handler classique. On peut l'appeler conditionnellement après la vérification auth.
  S'assurer que le `NextResponse` du redirect auth est retourné AVANT l'appel i18n.
- **Session dans le storefront layout** : `getSession()` appelle `auth.api.getSession`
  avec les headers → nécessite que la route soit en runtime `nodejs` ou que le layout
  ait accès aux headers (RSC par défaut, c'est le cas). Vérifier que ça ne casse pas
  le static rendering des pages catalogue.
- **Liens morts** : `/inscription` et `/mot-de-passe-oublie` n'existent pas encore.
  Les liens seront présents mais mèneront à une 404 → acceptable, corrigé par les
  stories 02 et 05.
- 🚧 **Page `/compte`** : elle n'existe pas encore (story 07). Le redirect post-login
  pointera temporairement vers `/` ou affichera une 404 sur `/compte`. Choix : pointer
  vers `/` tant que la story 07 n'est pas faite.
