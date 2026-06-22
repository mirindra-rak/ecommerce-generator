# Plan : Infrastructure email + Inscription client + Vérification d'email

**Ticket** : [Story 01](01-infrastructure-email.md) + [Story 02](02-inscription-client.md) + [Story 06](06-verification-email.md) · **Statut** 🟡

## Résumé

Câbler le module email existant dans Better Auth (envoi de vérification et reset),
livrer la page d'inscription client sur le storefront, et activer la vérification
d'email à l'inscription — jalon M2 de l'epic auth storefront.

## État des lieux — story 01 (email) déjà implémentée

Le module `packages/core/src/modules/email` est **déjà fonctionnel** :

- `EmailTransport` interface (Strategy pattern) + `consoleTransport` + `smtpTransport`
- `sendEmail` / `sendTemplatedEmail` + template registry + layout HTML
- `setEmailTransport` pour injecter le transport actif
- 8 tests existants (`email.service.test.ts`)
- Dépendance `nodemailer` déjà dans `packages/core`

Ce qui reste à faire pour la story 01 : **câbler le service email dans Better Auth**
(config `emailVerification.sendVerificationEmail` + `emailAndPassword.sendResetPassword`)
et créer les templates auth (vérification + reset).

## Fichiers à créer ou modifier

### Nouveaux fichiers

- `packages/core/src/modules/email/templates/email-verification.ts` — template
  « Vérifiez votre email » (lien avec token)
- `packages/core/src/modules/email/templates/password-reset.ts` — template
  « Réinitialisez votre mot de passe » (lien avec token) — préparé pour la story 05
- `apps/pharmacie-1/src/app/[locale]/(storefront)/inscription/page.tsx` — page
  d'inscription (Server Component, noindex, redirect si connecté)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/inscription/register-form.tsx` —
  formulaire inscription (Client Component, `authClient.signUp.email`)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/verify-email/page.tsx` — page de
  callback vérification email (token en query param, appel `authClient.verifyEmail`)
- `apps/pharmacie-1/src/app/[locale]/(storefront)/_components/email-verification-banner.tsx` —
  bandeau « Vérifiez votre email — Renvoyer » (Client Component)

### Fichiers modifiés

- `packages/core/src/modules/email/templates/registry.ts` — enregistrer les
  templates `email-verification` et `password-reset`
- `packages/core/src/modules/email/index.ts` — exporter les nouveaux templates
- `apps/pharmacie-1/src/lib/auth-options.ts` — ajouter la config
  `emailVerification` (sendVerificationEmail, sendOnSignUp, expiresIn) et
  `emailAndPassword.sendResetPassword` ; câbler le `sendEmail` du module core
- `apps/pharmacie-1/src/lib/auth-client.ts` — exporter `signUp` et
  `sendVerificationEmail` en plus de `signIn`/`signOut`/`useSession`
- `apps/pharmacie-1/src/app/[locale]/(storefront)/layout.tsx` — passer
  `emailVerified` au header pour conditionner le bandeau
- `apps/pharmacie-1/messages/fr.json` — ajouter clés `auth.register`,
  `auth.verifyEmail`, `auth.emailBanner`
- `apps/pharmacie-1/messages/en.json` — idem EN
- `apps/pharmacie-1/.env.example` — documenter les variables SMTP

## Étapes de développement

### 1. Templates email auth (core)

Créer `email-verification.ts` : fonction `renderEmailVerification({ url, name })` →
retourne sujet + HTML (layout wrappé) avec un bouton/lien de vérification.

Créer `password-reset.ts` : fonction `renderPasswordReset({ url, name })` →
retourne sujet + HTML avec un bouton/lien de reset (expiration 1h mentionnée).

Enregistrer les deux dans `registry.ts`. Exporter depuis `index.ts`.

**Test** : ajouter 2 cas dans `email.service.test.ts` — `sendTemplatedEmail` avec
template `email-verification` et `password-reset` produit un email avec le bon
sujet et le lien dans le HTML.

### 2. Câblage Better Auth ← module email

Modifier `auth-options.ts` :

- Importer `sendEmail` de `@pharmacie/core` (module email).
- Ajouter `emailVerification.sendVerificationEmail` : reçoit `{ user, url, token }`
  de Better Auth → appelle `sendEmail({ to: user.email, subject, html })` en
  résolvant le template `email-verification`.
- Ajouter `emailVerification.sendOnSignUp: true` et `expiresIn: 86400` (24h).
- Ajouter `emailAndPassword.sendResetPassword` : reçoit `{ user, url, token }`
  → appelle `sendEmail` avec le template `password-reset`.
- Ajouter rate-limit custom sur `/sign-up/email` : max 3/min.

Initialiser le transport email au démarrage de l'app : dans `auth-options.ts` ou
un fichier d'init, appeler `setEmailTransport(smtpTransport)` si `SMTP_HOST` est
défini, sinon laisser le `consoleTransport` par défaut.

**Test** : lancer le dev server, créer un compte via Better Auth API (`auth.api.signUpEmail`),
vérifier que le console.warn affiche l'email de vérification avec le bon template.

### 3. Clés i18n (inscription + vérification)

Ajouter dans `fr.json` et `en.json` les namespaces :

- `auth.register` : titre, subtitle, labels (nom, email, mot de passe), bouton,
  message d'erreur générique, lien « Déjà un compte ? Se connecter », pending.
- `auth.verifyEmail` : titre page callback, message succès, message lien expiré,
  bouton renvoyer.
- `auth.emailBanner` : texte bandeau, bouton renvoyer, message renvoyé.

**Test** : les clés existent dans les deux fichiers JSON.

### 4. Export `signUp` depuis auth-client

Modifier `auth-client.ts` : exporter `signUp` et `sendVerificationEmail` en plus
des exports existants.

**Test** : `pnpm type-check` passe ; `authClient.signUp.email` et
`authClient.sendVerificationEmail` sont typés.

### 5. Page d'inscription (`/inscription`)

Créer `inscription/page.tsx` (Server Component) :

- `generateMetadata` : `<title>` traduit + `robots: noindex`.
- `getSession()` → si connecté, redirect vers `/`.
- Rendu du `RegisterForm`.

Créer `inscription/register-form.tsx` (Client Component) :

- Formulaire : nom, email, mot de passe (Input, Button, Card de `@pharmacie/ui`).
- Appel `authClient.signUp.email({ name, email, password })` au submit.
- Validation client : email requis, mot de passe ≥ 8 caractères, nom requis.
- Erreur : message générique traduit (pas d'énumération).
- Succès : `router.push("/")` + `router.refresh()` (l'utilisateur est auto-connecté
  par Better Auth après inscription).
- Lien vers `/connexion` (« Déjà un compte ? »).

**Test** : accès à `/fr/inscription` affiche le formulaire. Type-check et lint OK.

### 6. Page de callback vérification email (`/verify-email`)

Créer `verify-email/page.tsx` :

- Lit le query param `token` (fourni par le lien dans l'email).
- Client Component qui appelle `authClient.verifyEmail({ token })` au montage.
- Affiche un état : loading → succès (« Email vérifié ») ou erreur (« Lien expiré »
  - bouton « Renvoyer »).
- Le bouton « Renvoyer » appelle `authClient.sendVerificationEmail({ email })`.

**Test** : accès à `/fr/verify-email?token=invalid` affiche le message d'erreur.

### 7. Bandeau « Vérifiez votre email »

Créer `email-verification-banner.tsx` (Client Component) :

- Props : `emailVerified: boolean`.
- Si `emailVerified` est `false` : bandeau jaune/info avec texte + bouton
  « Renvoyer l'email de vérification ».
- Le bouton appelle `authClient.sendVerificationEmail` avec rate-limit UX
  (désactivé 2 min après clic, message « Email renvoyé »).
- Si `emailVerified` est `true` : ne rend rien.

Modifier `layout.tsx` du storefront : passer `emailVerified` (depuis `getSession`)
au layout. Afficher le bandeau entre le header et le main pour les utilisateurs
connectés non vérifiés.

**Test** : en tant qu'utilisateur connecté avec `emailVerified: false`, le bandeau
est visible. Avec `emailVerified: true` ou anonyme, il est absent.

### 8. Variables d'environnement

Mettre à jour `.env.example` : documenter `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASS`, `SMTP_FROM` avec des commentaires.

**Test** : le fichier `.env.example` contient les variables documentées.

### 9. Tests unitaires

- Tests templates auth : `email-verification` et `password-reset` dans
  `email.service.test.ts` (ou fichier dédié).
- Test de la page `verify-email` : rendu avec token invalide → message d'erreur.
- `pnpm test`, `pnpm lint`, `pnpm type-check` verts.

## Points d'attention

- **Better Auth `signUp.email` auto-connecte** : après inscription, Better Auth
  crée une session automatiquement (sauf si `autoSignIn: false`). On garde ce
  comportement — le client est connecté immédiatement après inscription.
- **`emailVerified` est un `Boolean`** dans le schéma Prisma, pas un `DateTime` —
  Better Auth le gère correctement (vérifié dans la source : il set `emailVerified`
  à `true`).
- **Transport email en dev** : sans `SMTP_HOST`, le `consoleTransport` s'active
  et affiche les emails dans la console. Le lien de vérification apparaît dans
  les logs — suffisant pour tester.
- **Rate-limit inscription** : Better Auth accepte un `customRules` pour
  `/sign-up/email` — à configurer dans `rateLimit.customRules`.
- **Lien de vérification** : Better Auth construit l'URL à partir de
  `BETTER_AUTH_URL` + `/api/auth/verify-email?token=xxx&callbackURL=xxx`. Le
  `callbackURL` est la page storefront `/verify-email`. Vérifier que la config
  `BETTER_AUTH_URL` est correcte.
- **Template password-reset** : créé maintenant (cohérence module email) mais la
  page de reset elle-même viendra dans la story 05. Better Auth ne l'appellera
  que quand `sendResetPassword` est configuré ET que l'endpoint est sollicité.
- 🚧 **Locale dans les emails** : Better Auth ne passe pas la locale de l'utilisateur
  dans le callback `sendVerificationEmail`. Les templates seront en français par
  défaut. Pour supporter l'anglais, il faudrait stocker la locale préférée sur le
  `User` ou la déduire du header `Accept-Language` — décision reportée.
