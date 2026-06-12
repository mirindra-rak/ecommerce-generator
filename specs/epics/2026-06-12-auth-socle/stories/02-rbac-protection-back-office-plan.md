# Plan : RBAC & protection du back-office /admin

**Ticket** : [02-rbac-protection-back-office](./02-rbac-protection-back-office.md) · **Statut** ✅ Terminé (smoke RBAC : anonyme→login, CUSTOMER→403, STAFF→200)

## Résumé

Fermer le back-office : un helper serveur `requireStaff()` garde le rendu des pages
`/admin` (via un layout de route group `(protected)`) **et** chaque Server Action ;
les anonymes sont redirigés vers `/admin/login`, les rôles insuffisants vers une page
403 ; la banderole « zone non sécurisée » disparaît.

## Décision structurante — route group `(protected)`

Le layout admin actuel enveloppe **toutes** les routes `/admin/*`. Si on y met la garde,
la future page `/admin/login` (story 03) serait elle aussi gardée → **boucle de
redirection**. Solution App Router : déplacer le back-office gardé sous un route group
**`app/admin/(protected)/`** (groupe transparent : les URLs ne changent pas), et laisser
`/admin/login` et `/admin/forbidden` **hors** de ce groupe (non gardés).

→ On déplace `page.tsx`, `categories/`, `marques/`, `_lib/` sous `(protected)/` (avec
`git mv`, en bloc, pour préserver les imports relatifs internes). La garde vit dans
`(protected)/layout.tsx`.

## Fichiers à créer ou modifier

- `apps/pharmacie-1/src/lib/auth-guard.ts` — **créé** : `requireStaff()` (redirige selon
  le cas), `getCurrentUser()`.
- `apps/pharmacie-1/src/app/admin/(protected)/layout.tsx` — **créé** : chrome admin
  (sidebar, **sans banderole**) + appel `requireStaff()` + affichage email/rôle connecté.
- `apps/pharmacie-1/src/app/admin/(protected)/page.tsx` — **déplacé** (dashboard).
- `apps/pharmacie-1/src/app/admin/(protected)/categories/**` — **déplacé**.
- `apps/pharmacie-1/src/app/admin/(protected)/marques/**` — **déplacé**.
- `apps/pharmacie-1/src/app/admin/(protected)/_lib/**` — **déplacé**.
- `apps/pharmacie-1/src/app/admin/layout.tsx` — **supprimé** (remplacé par le layout du
  groupe ; plus de banderole).
- `apps/pharmacie-1/src/app/admin/login/page.tsx` — **créé** : placeholder minimal (le
  vrai formulaire arrive en story 03) — évite un 404 sur la redirection.
- `apps/pharmacie-1/src/app/admin/forbidden/page.tsx` — **créé** : page 403 simple.
- `.../categories/_actions.ts` & `.../marques/_actions.ts` — **modifiés** : `await
requireStaff()` en tête de chaque action (défense en profondeur).

## Étapes de développement

1. **Helper `requireStaff`** — `auth-guard.ts` : lit `getSession()` ; si pas de session
   → `redirect("/admin/login")` ; si `!isStaff(user.role)` → `redirect("/admin/forbidden")` ;
   sinon retourne l'utilisateur. `getCurrentUser()` = session?.user ?? null. Test :
   `type-check` (la logique `isStaff` est déjà couverte ; le reste = smoke runtime).
2. **Page 403** — `admin/forbidden/page.tsx` : message « accès refusé », lien retour
   storefront. Test : la page rend un 403 lisible.
3. **Placeholder login** — `admin/login/page.tsx` : note « connexion (à venir story 03) ».
   Test : la route existe (pas de 404 à la redirection).
4. **Route group `(protected)`** — `git mv` de `page.tsx`, `categories/`, `marques/`,
   `_lib/` sous `admin/(protected)/`. Test : URLs inchangées, build OK, imports relatifs
   intacts.
5. **Layout gardé** — `(protected)/layout.tsx` (depuis l'ancien layout, **sans
   banderole**) : `await requireStaff()` en tête, affiche email + rôle, sidebar. Supprimer
   `admin/layout.tsx`. Test : rendu d'une page admin avec sidebar, sans banderole.
6. **Protéger les Server Actions** — ajouter `await requireStaff()` au début de chaque
   action (catégories : create/update/delete ; marques : create/update/delete). Test :
   relecture + smoke (action sans session refusée).
7. **Smoke runtime** — démarrer le dev (4321) : (a) `GET /admin` anonyme → redirection
   `/admin/login` ; (b) signup (CUSTOMER) + cookie → `GET /admin` → redirection
   `/admin/forbidden` ; (c) passer le rôle à `STAFF` en base → `GET /admin` → 200 ;
   nettoyage. Test : codes/Location attendus.
8. **Qualité** — `pnpm test` + `type-check` + `lint` + `build` verts.

## Points d'attention

- **Boucle de redirection** : `/admin/login` et `/admin/forbidden` doivent rester **hors**
  du groupe `(protected)` (non gardés), sinon redirection infinie. C'est tout l'enjeu du
  route group.
- **Server Actions = porte dérobée** : un POST d'action peut contourner le rendu de page.
  Chaque action **doit** appeler `requireStaff()` (pas seulement le layout). Défense en
  profondeur.
- **Typage du rôle** : `session.user.role` peut être typé `string` par l'inférence Better
  Auth ; caster vers `Role` (`@pharmacie/core`) avant `isStaff` (🚧 vérifier le type réel
  exposé ; sinon `as Role`).
- **`redirect()` lève** une exception de contrôle (NEXT_REDIRECT) : l'appeler hors des
  `try/catch` qui avalent l'erreur ; dans les actions, `requireStaff()` en première ligne
  (avant tout `try`).
- **Placeholder login** : story 02 ne livre qu'un écran minimal ; le vrai formulaire +
  logout = story 03. La redirection doit néanmoins pointer vers `/admin/login` dès
  maintenant.
- **Middleware Next** : optionnel/secondaire (redirection précoce) ; la garde serveur
  reste la source de vérité. Non requis pour cette story.
- **Cookies sûrs & rate-limit** : hors périmètre (story 04).
- **`git mv`** : déplacer en bloc le sous-arbre pour préserver les imports relatifs
  (`../_lib`, `./_actions`, `../category-form`) — ne pas réécrire ces chemins.
