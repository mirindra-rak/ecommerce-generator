# Plan : Forgot/reset password + Espace « Mon compte »

**Ticket** : [Story 05](05-forgot-reset-password.md) + [Story 07](07-espace-mon-compte.md) · **Statut** 🟡

## Résumé

Livrer le flux complet de réinitialisation de mot de passe (forgot → email → reset)
et l'espace « Mon compte » (dashboard, profil, changement de mot de passe) — jalon
M3, autonomie complète de l'auth storefront.

## Prérequis déjà en place

- `sendResetPassword` câblé dans `auth-options.ts` (template `password-reset` existant)
- Rate-limit `/request-password-reset` : 3/min par IP
- Middleware auth protège `/compte` (story 04)
- Better Auth expose nativement les endpoints :
  - `POST /request-password-reset` : `{ email, redirectTo? }`
  - `POST /reset-password` : `{ newPassword, token }`
  - `POST /change-password` : `{ currentPassword, newPassword, revokeOtherSessions? }`
  - `POST /update-user` : `{ name, ... }` (session required)

## Fichiers à créer ou modifier

### Nouveaux fichiers

- `apps/pharmacie-1/src/app/[locale]/(storefront)/mot-de-passe-oublie/page.tsx` — page forgot
  (Server Component, noindex)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/mot-de-passe-oublie/forgot-password-form.tsx` —
  formulaire client (email → `authClient.forgetPassword`)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/reset-password/page.tsx` — page reset
  (Server Component, noindex)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/reset-password/reset-password-form.tsx` —
  formulaire client (nouveau mot de passe → `authClient.resetPassword`)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/page.tsx` — dashboard compte
- `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/layout.tsx` — layout compte
  (navigation latérale + vérification session serveur)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/profil/page.tsx` — édition profil
- `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/profil/profile-form.tsx` — formulaire
  profil (Client Component, `authClient.updateUser`)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/mot-de-passe/page.tsx` — changement
  mot de passe
- `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/mot-de-passe/change-password-form.tsx` —
  formulaire changement mot de passe (Client Component, `authClient.changePassword`)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/compte/_components/account-nav.tsx` —
  navigation latérale de l'espace compte

### Fichiers modifiés

- `apps/pharmacie-1/messages/fr.json` — ajouter namespaces `auth.forgotPassword`,
  `auth.resetPassword`, `auth.account`
- `apps/pharmacie-1/messages/en.json` — idem EN
- `apps/pharmacie-1/src/app/[locale]/(storefront)/connexion/login-form.tsx` — le
  lien `/mot-de-passe-oublie` ne sera plus un lien mort
- `apps/pharmacie-1/src/middleware.ts` — aucune modification nécessaire (les routes
  `/compte` sont déjà protégées)

## Étapes de développement

### 1. Clés i18n (forgot, reset, account)

Ajouter dans `fr.json` et `en.json` :

- `auth.forgotPassword` : titre, subtitle, label email, submit, pending, message
  confirmation générique.
- `auth.resetPassword` : titre, label nouveau mot de passe, label confirmation,
  submit, pending, succès, erreur token expiré, lien vers forgot.
- `auth.account` : titre dashboard, nav (Dashboard, Profil, Mot de passe, Se
  déconnecter), sections futures (Commandes, Adresses, Wishlist → « Bientôt
  disponible »), profil (titre, label nom, submit, succès), mot de passe (titre,
  label actuel, label nouveau, label confirmation, submit, succès, erreur actuel
  incorrect).

**Test** : les clés existent dans les deux fichiers JSON.

### 2. Page forgot password (`/mot-de-passe-oublie`)

Créer `mot-de-passe-oublie/page.tsx` (Server Component) :

- `generateMetadata` : `<title>` traduit + `robots: noindex`.
- Si connecté → redirect vers `/`.
- Rendu du `ForgotPasswordForm`.

Créer `forgot-password-form.tsx` (Client Component) :

- Formulaire email uniquement. `authClient.forgetPassword({ email, redirectTo })`.
- `redirectTo` pointe vers `/{locale}/reset-password` (la page de saisie du nouveau
  mot de passe). Better Auth y ajoutera `?token=xxx`.
- Après soumission, affiche le message de confirmation générique (pas d'énumération).
- Lien retour vers `/connexion`.

**Test** : accès à `/fr/mot-de-passe-oublie` affiche le formulaire. Type-check OK.

### 3. Page reset password (`/reset-password`)

Créer `reset-password/page.tsx` (Server Component) :

- `generateMetadata` : noindex.
- Rendu du `ResetPasswordForm`.

Créer `reset-password-form.tsx` (Client Component) :

- Lit le query param `token` (fourni par Better Auth dans le redirect).
- Si `error` param est présent (token expiré) → affiche message + lien vers forgot.
- Formulaire : nouveau mot de passe (≥ 8 car.) + confirmation.
- Appel `authClient.resetPassword({ newPassword, token })`.
- Succès → message + lien vers `/connexion`.
- Erreur → message générique.

**Test** : accès à `/fr/reset-password?error=INVALID_TOKEN` affiche le message
d'erreur. Type-check OK.

### 4. Rate-limit `/request-password-reset`

Ajouter dans `auth-options.ts` le custom rule :
`"/request-password-reset": { window: 60, max: 3 }`.

**Test** : la clé est présente dans la config.

### 5. Layout compte + navigation

Créer `compte/layout.tsx` :

- Server Component, appelle `getSession()`.
- Si pas de session → redirect vers `/connexion` (double protection middleware + layout).
- Passe le user au layout (nom, email, emailVerified).
- Rendu d'une sidebar (`AccountNav`) + slot `children`.

Créer `compte/_components/account-nav.tsx` (Client Component) :

- Navigation verticale : Dashboard, Profil, Mot de passe, Se déconnecter.
- Sections futures grisées : Commandes, Adresses, Wishlist (« Bientôt disponible »).
- Highlight de l'item actif (via `usePathname`).
- Responsive : sidebar sur desktop, tabs/menu horizontal sur mobile.

**Test** : accès connecté à `/fr/compte` affiche la navigation. Type-check OK.

### 6. Dashboard compte (`/compte`)

Créer `compte/page.tsx` :

- Affiche un résumé : nom, email, statut vérification email.
- Liens rapides vers Profil et Mot de passe.
- Noindex.

**Test** : accès connecté à `/fr/compte` affiche le nom et l'email de l'utilisateur.

### 7. Profil (`/compte/profil`)

Créer `compte/profil/page.tsx` + `profile-form.tsx` :

- Formulaire pré-rempli avec le nom actuel.
- Appel `authClient.updateUser({ name })`.
- Succès → message + `router.refresh()` (le header reflète le nouveau nom).
- Noindex.

**Test** : modification du nom → message de succès. Type-check OK.

### 8. Changement de mot de passe (`/compte/mot-de-passe`)

Créer `compte/mot-de-passe/page.tsx` + `change-password-form.tsx` :

- Formulaire : mot de passe actuel, nouveau mot de passe (≥ 8), confirmation.
- Validation client : les deux champs correspondent.
- Appel `authClient.changePassword({ currentPassword, newPassword })`.
- Succès → message de succès.
- Erreur → « Mot de passe actuel incorrect ».
- Noindex.

**Test** : type-check OK. Soumission avec mot de passe actuel incorrect → erreur.

### 9. Tests + vérification globale

- `pnpm test`, `pnpm lint`, `pnpm type-check` verts.
- Middleware test existant (7 tests) toujours vert.
- Vérification que le redirect post-login (`/connexion?redirect=/fr/compte`)
  aboutit correctement maintenant que `/compte` existe.

## Points d'attention

- **`authClient.forgetPassword`** (pas `forgotPassword`) : c'est le nom dans le
  client Better Auth pour `POST /request-password-reset`. Vérifier le nom exact.
- **`redirectTo` dans forgetPassword** : Better Auth redirige vers `redirectTo?token=xxx`
  si le token est valide. Si le token est expiré, il redirige vers
  `redirectTo?error=INVALID_TOKEN`. La page reset doit gérer les deux cas.
- **Session dans le layout compte** : `getSession()` dans le layout + dans les
  sous-pages risque de doubler l'appel. Passer le user via le layout context
  ou accepter le double appel (Better Auth cache la session dans la requête).
- **Navigation responsive** : la sidebar desktop → menu horizontal mobile. Garder
  simple : `flex-col lg:flex-row` ou similaire. Pas de drawer complexe.
- **Sections futures grisées** : utiliser un simple `<span>` avec `opacity-50` et
  un badge « Bientôt ». Pas de lien.
- **Confirmation mot de passe** : la validation « les deux champs correspondent »
  est côté client uniquement. Better Auth ne reçoit que `newPassword`.
