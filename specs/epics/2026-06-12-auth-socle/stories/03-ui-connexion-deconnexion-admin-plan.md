# Plan : UI connexion / déconnexion admin

**Ticket** : [03-ui-connexion-deconnexion-admin](./03-ui-connexion-deconnexion-admin.md) · **Statut** ✅ Terminé (login form, déjà-connecté→/admin, logout détruit la session)

## Résumé

Remplacer le placeholder `/admin/login` par un vrai formulaire (email + mot de passe,
primitives `@pharmacie/ui`) qui authentifie via le client Better Auth, rediriger vers
`/admin` au succès, afficher une erreur générique non énumérante à l'échec, et ajouter un
bouton de déconnexion au layout admin.

## Décisions d'architecture (issues de la doc Better Auth)

- **Connexion côté client** : `authClient.signIn.email({ email, password }, { onError,
onSuccess })` (retourne `{ data, error }`). Plus simple pour gérer pending + erreur
  in-component ; le cookie est posé par la réponse Better Auth. → un **composant client**
  `login-form.tsx`, enveloppé par une **page server** qui gère la redirection « déjà
  connecté ».
- **Authentifie ≠ autorise** : le login authentifie n'importe quel utilisateur valide ;
  l'**autorisation reste au RBAC** (story 02). Un `CUSTOMER` qui se connecte sera renvoyé
  vers `/admin/forbidden` par `requireStaff`. Acceptable (pas de contrôle de rôle dans le
  formulaire).
- **Redirection au succès** : `router.push("/admin")` **puis `router.refresh()`** pour que
  les Server Components voient la nouvelle session (éviter un cache serveur périmé).
- **Déconnexion** : `authClient.signOut({ fetchOptions: { onSuccess } })` dans un **petit
  composant client** (`logout-button.tsx`), monté dans le layout `(protected)` (server).
- **Erreur non énumérante** : toute erreur de `signIn` → message fixe « Identifiants
  invalides. » (ne pas afficher `error.message`).

## Fichiers à créer ou modifier

- `apps/pharmacie-1/src/app/admin/login/page.tsx` — **modifié** : page server ; si déjà
  connecté avec rôle staff (`getCurrentUser` + `isStaff`) → `redirect("/admin")` ; sinon
  rend `<LoginForm/>` dans une mise en page centrée (sans chrome admin).
- `apps/pharmacie-1/src/app/admin/login/login-form.tsx` — **créé** : composant client
  (Input/Button/Card de `@pharmacie/ui`), `authClient.signIn.email`, état pending + erreur.
- `apps/pharmacie-1/src/app/admin/(protected)/logout-button.tsx` — **créé** : composant
  client, `authClient.signOut` → redirige vers `/admin/login`.
- `apps/pharmacie-1/src/app/admin/(protected)/layout.tsx` — **modifié** : intégrer
  `<LogoutButton/>` à côté de l'email/rôle.

## Étapes de développement

1. **Formulaire de connexion (client)** — `login-form.tsx` : champs email + mot de passe
   (`Input`), bouton `Button` avec état pending ; `authClient.signIn.email` ; au succès
   `router.push("/admin")` + `router.refresh()` ; à l'échec, message générique. Test :
   `type-check`/`lint` ; rendu vérifié au smoke.
2. **Page login (server + redirect si connecté)** — `login/page.tsx` : `getCurrentUser()` ;
   si `isStaff(role)` → `redirect("/admin")` ; sinon layout centré + `<LoginForm/>`. Test :
   smoke (anonyme voit le formulaire ; admin connecté est redirigé).
3. **Bouton de déconnexion (client)** — `logout-button.tsx` : `authClient.signOut` +
   redirection `/admin/login`. Test : `type-check`/`lint`.
4. **Intégration layout** — ajouter `<LogoutButton/>` dans `(protected)/layout.tsx`
   (sous l'email/rôle). Test : la page admin affiche le bouton ; build OK.
5. **Smoke runtime** — dev 4321 + compte admin seedé :
   - `GET /admin/login` anonyme → 200, contient les champs email/mot de passe ;
   - `GET /admin/login` avec cookie admin → 307 vers `/admin` ;
   - (API, déjà couverte story 04) `POST /sign-in/email` bon → 200 + cookie / mauvais → 401 ;
   - `POST /api/auth/sign-out` avec cookie → session détruite (`get-session` → null ensuite).
     Test : codes/Location attendus.
6. **Qualité** — `pnpm test` + `type-check` + `lint` + `build` verts.

## Points d'attention

- **Cache session après login client** : sans `router.refresh()`, le rendu serveur de
  `/admin` peut ne pas voir la session fraîche → faux « forbidden ». Refresh obligatoire.
- **Boucle évitée** : `/admin/login` reste **hors** `(protected)` ; la redirection « déjà
  connecté » utilise `getCurrentUser` (pas `requireStaff`).
- **Non énumération** : ne jamais afficher `error.message`/`error.status` ; message fixe.
  Better Auth renvoie déjà un 401 générique pour des identifiants invalides.
- **CUSTOMER qui se connecte** : authentifié puis renvoyé vers `/admin/forbidden` par le
  RBAC. 🚧 Option future : message « compte sans accès » sur le login — hors périmètre ici.
- **Composants client** : `"use client"` + import de `authClient` (lib/auth-client) ;
  `useRouter` de `next/navigation`. Le layout reste server (ne pas le passer en client).
- **Primitives UI** : utiliser `Card`/`Input`/`Button`/`Heading` de `@pharmacie/ui`
  (convention design-system-first) ; vérifier leurs props réelles avant usage.
- **Tests UI interactifs** (submit, erreur, logout) : difficiles en unit/curl (JS client) →
  couverts par le smoke de l'API sous-jacente (story 04) + un e2e Playwright ultérieur
  (lot 11.7). Assumé.
