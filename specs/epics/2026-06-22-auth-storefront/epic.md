# Epic : Auth storefront client

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation globale** : L

## Contexte & vision

L'epic « Socle auth » (2026-06-12) a posé les fondations : Better Auth + Prisma,
RBAC (`CUSTOMER` / `STAFF` / `ADMIN`), login/logout admin, seed admin, auth guards
serveur. Ce socle est **en production pour le back-office**.

Il manque toute la **partie client (storefront)** : un visiteur ne peut ni créer de
compte, ni se connecter, ni récupérer son mot de passe. Sans ça, les modules
dépendants (panier persistant, commandes, wishlist, avis, adresses) sont bloqués.

Cet epic livre l'**auth storefront complète** : inscription, connexion, mot de passe
oublié, vérification d'email, espace « Mon compte », et middleware de protection
des routes authentifiées — le tout intégré au système i18n existant (FR/EN).

## Objectifs

- **Inscription client** (email + mot de passe) avec rôle `CUSTOMER` par défaut.
- **Connexion / déconnexion client** sur le storefront, session partagée avec
  l'infrastructure Better Auth existante.
- **Forgot / reset password** : flux complet avec envoi d'email et page de
  réinitialisation.
- **Vérification d'email** : envoi d'un lien de confirmation à l'inscription ;
  compte non vérifié = accès restreint (pas de commande). 🚧 Nécessite un ESP —
  voir story 01.
- **Espace « Mon compte »** : tableau de bord, profil (nom, email), changement de
  mot de passe. Les sous-sections avancées (adresses, commandes, wishlist) sont
  hors scope.
- **Middleware Next.js** : protéger les routes `/compte` (redirection vers login si
  anonyme) sans interférer avec le middleware i18n existant.
- **i18n** : toutes les pages auth sont multilingues (FR/EN), cohérentes avec
  next-intl et le préfixe locale `always`.
- **SEO** : pages auth en `noindex` (pas d'indexation des formulaires), canonical
  propres, `<title>` / meta description traduits.
- **Sécurité** : rate-limit sur inscription + reset, CSRF via Better Auth, pas
  d'énumération d'utilisateurs, liens de reset expirables (1h).

## Non-objectifs

- **Connexion sociale** (Google, Apple, Facebook) → itération ultérieure.
- **2FA / TOTP / WebAuthn** → itération ultérieure.
- **Adresses, historique commandes, wishlist, avis** dans « Mon compte » → epic
  dédié par module (cart, order, wishlist, reviews).
- **Gestion admin des comptes clients** (liste, ban, édition) → epic admin.
- **Templates email riches** (HTML, branding) → on envoie du texte fonctionnel ;
  le design email viendra avec le module `email` complet.

## Parcours global

1. Visiteur clique « Créer un compte » → formulaire inscription → compte
   `CUSTOMER` créé → email de vérification envoyé → redirection vers « Mon compte »
   avec bandeau « Vérifiez votre email ».
2. Client revient → clique « Se connecter » → formulaire login → session créée →
   storefront avec état connecté (header : nom + lien compte).
3. Client oublie son mot de passe → « Mot de passe oublié » → saisit email →
   reçoit un lien → page de reset → nouveau mot de passe → redirection vers login.
4. Client connecté accède à `/compte` → tableau de bord avec profil, changement de
   mot de passe, déconnexion.
5. Visiteur anonyme tente `/compte` → middleware redirige vers `/connexion?redirect=/compte`.

## Stories

| #   | Titre                                                    | Priorité | Est. | Dépend de |
| --- | -------------------------------------------------------- | -------- | ---- | --------- |
| 01  | Infrastructure email transactionnelle (ESP + service)    | P0       | M    | —         |
| 02  | Inscription client (sign-up)                             | P0       | M    | 01        |
| 03  | Connexion / déconnexion client storefront                | P0       | M    | —         |
| 04  | Middleware auth storefront + protection routes `/compte` | P0       | S    | 03        |
| 05  | Forgot / reset password                                  | P1       | M    | 01, 03    |
| 06  | Vérification d'email                                     | P1       | M    | 01, 02    |
| 07  | Espace « Mon compte » (dashboard, profil, mot de passe)  | P1       | M    | 03, 04    |

## Contraintes

- **Stack** : Next.js App Router, Better Auth (déjà installé), Prisma, next-intl
  (FR/EN), Tailwind v4, primitives `@pharmacie/ui`.
- **Silo** : aucun `tenant_id`, aucune notion de multi-tenant.
- **Repository pattern** : accès métier au `User` via `userRepository` existant
  (extension si nécessaire). Better Auth gère sa propre persistance.
- **Module email** (`packages/core/src/modules/email`) : coquille vide à implémenter
  en story 01. ESP à choisir (Resend, Postmark, ou SMTP générique via env).
- **Module customer** (`packages/core/src/modules/customer`) : coquille vide,
  utilisable si besoin pour la logique profil côté domaine.
- **Sécurité (OWASP)** : rate-limit inscription/reset, tokens expirables, pas
  d'énumération utilisateur, CSRF natif Better Auth, cookies secure en prod.
- **Performances** : pages auth = Client Components minimaux, formulaires légers,
  pas de JS superflu.

## Jalons

- **M1 — Connexion client** : stories 03 + 04 → un client peut se connecter et
  accéder à ses routes protégées. Débloque le développement de « Mon compte ».
- **M2 — Inscription + email** : stories 01 + 02 + 06 → un visiteur peut créer un
  compte et vérifier son email.
- **M3 — Autonomie complète** : stories 05 + 07 → reset mot de passe + espace
  compte. L'auth storefront est fonctionnellement complète.

## Références

- Epic parent (socle admin) : [`specs/epics/2026-06-12-auth-socle/epic.md`](../2026-06-12-auth-socle/epic.md)
- Auth existante : `apps/pharmacie-1/src/lib/auth*.ts`, `packages/core/src/modules/auth/`
- Module email (vide) : `packages/core/src/modules/email/index.ts`
- Module customer (vide) : `packages/core/src/modules/customer/index.ts`
- Config i18n : `apps/pharmacie-1/src/i18n/routing.ts` (localePrefix: `always`)
- Middleware actuel (i18n only) : `apps/pharmacie-1/src/middleware.ts`
