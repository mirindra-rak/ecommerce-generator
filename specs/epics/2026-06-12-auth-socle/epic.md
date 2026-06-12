# Epic : Socle d'authentification & autorisation

**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation globale** : M/L

## Contexte & vision

Le back-office (`/admin`) est actuellement **non protégé** (banderole « zone non
sécurisée »). Cet epic pose le **socle commun d'authentification** — un modèle `User`
unique avec des **rôles** (`CUSTOMER` / `STAFF` / `ADMIN`) et des sessions — au-dessus
de **Better Auth** (adapter Prisma, PostgreSQL). Priorité : **sécuriser le back-office
par RBAC**. La même fondation servira l'auth client (lot 3.3) ultérieurement.

Contrainte structurante : modèle **Silo** (1 base = 1 pharmacie, **aucun `tenant_id`**),
Repository pattern, module `packages/core/src/modules/auth`.

## Objectifs

- Intégrer **Better Auth** (email + mot de passe, sessions en base, hash géré par la
  lib) avec un schéma Prisma `User`/`Session`/`Account`/`Verification` + enum `Role`.
- **Protéger `/admin`** par RBAC : seuls `STAFF`/`ADMIN` y accèdent ; sinon redirection
  vers la connexion. Retirer la banderole « non sécurisée ».
- Fournir un **helper de session serveur** (`getSession`, `requireStaff`) réutilisable.
- **UI de connexion / déconnexion** admin (primitives `@pharmacie/ui`).
- **Provisionner** un compte admin initial (seed idempotent depuis variables d'env).
- Durcissement de base (cookies sûrs, rate-limit login, pas d'énumération d'utilisateurs).

## Non-objectifs

- **Inscription client, connexion client, espace compte** (lots 3.3 / 4.9 / 6.7) → epic
  ultérieur. On prépare seulement le rôle `CUSTOMER` par défaut.
- **Reset mot de passe par email** et **vérification d'email** → nécessitent l'ESP
  (lot 4.11) ; désactivés pour l'instant. 🚧
- **Connexion sociale** (Apple/Facebook/Google), **2FA**, **organisations**.
- **Permissions fines par ressource** : on se limite à un contrôle par rôle.
- Gestion des comptes STAFF via UI admin (création/désactivation) → itération ultérieure.

## Parcours global

1. Un membre de l'équipe ouvre `/admin` → non connecté → redirigé vers `/admin/login`.
2. Il saisit email + mot de passe → session créée (cookie httpOnly) → accès au back-office.
3. Un rôle insuffisant (`CUSTOMER`) est refusé. La déconnexion détruit la session.
4. Le compte admin initial provient du seed (variables d'env).

## Stories

| #   | Titre                                               | Priorité | Est. | Dépend de |
| --- | --------------------------------------------------- | -------- | ---- | --------- |
| 01  | Intégration Better Auth + schéma & config           | P0       | M    | —         |
| 02  | RBAC & protection du back-office `/admin`           | P0       | M    | 01        |
| 03  | UI connexion / déconnexion admin                    | P1       | M    | 01, 02    |
| 04  | Provisioning du compte admin + durcissement (OWASP) | P1       | S    | 01, 02    |

## Contraintes

- **Stack** : Next.js App Router + PostgreSQL + Prisma ; Better Auth côté `core`/app ;
  route handler `/api/auth/[...all]` (runtime `nodejs`).
- **Silo** : aucune notion de tenant ; le modèle `User` ne porte pas de `tenant_id`.
- **Sécurité (OWASP, lot 9.4)** : cookies `httpOnly`/`secure`/`sameSite`, secret de
  session via env, rate-limit sur la connexion, messages d'erreur non énumérants
  (« identifiants invalides » génériques), hash de mot de passe par Better Auth.
- **RGPD (lot 9)** : PII minimale (email, nom) ; pas de mot de passe en clair ; sessions
  révocables.
- **Repository pattern** : l'accès « métier » au `User` passe par un repository `core` ;
  Better Auth gère sa propre persistance via l'adapter Prisma.

## Jalons

- **M1 — Admin protégé (back)** : stories 01 + 02 → `/admin` exige un rôle STAFF/ADMIN
  côté serveur.
- **M2 — Connexion utilisable + compte** : stories 03 + 04 → login UI, seed admin,
  durcissement ; banderole « non sécurisée » retirée.

## Références

- Back-office à protéger : `apps/pharmacie-1/src/app/admin/*` (banderole dans `layout.tsx`).
- Décisions : `ARCHITECTURE.md` (Silo) ; module cible `packages/core/src/modules/auth`.
- Better Auth (adapter Prisma) — doc à consulter en `/plan`.
- Convention UI : primitives `@pharmacie/ui` (direction « officine éditoriale »).
