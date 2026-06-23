# Story 02 : Inscription client (sign-up)

**Epic parent** : [Auth storefront client](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** M · **Priorité** P0
**Dépend de** : 01 (email)

## Contexte

Better Auth supporte déjà `emailAndPassword` mais seul le login admin est câblé.
Il faut exposer un formulaire d'inscription côté storefront qui crée un compte
`CUSTOMER` et déclenche l'envoi d'un email de vérification (story 06).

## User Story

**En tant que** visiteur du site, **je veux** créer un compte avec mon email et un
mot de passe, **afin de** pouvoir accéder aux fonctionnalités réservées aux clients
(commandes, wishlist, avis).

## Critères d'acceptation

### Scénario 1 : Inscription réussie

- **Étant donné** un visiteur sur la page `/inscription`
- **Quand** il saisit un nom, un email valide et un mot de passe (≥ 8 caractères)
  et soumet le formulaire
- **Alors** un compte `CUSTOMER` est créé, une session est ouverte, le visiteur est
  redirigé vers `/compte` et un email de vérification est envoyé.

### Scénario 2 : Email déjà utilisé

- **Étant donné** un email déjà enregistré
- **Quand** le visiteur tente de s'inscrire avec cet email
- **Alors** un message générique « Impossible de créer le compte » est affiché (pas
  d'énumération d'utilisateurs).

### Scénario 3 : Validation côté client

- **Étant donné** le formulaire d'inscription
- **Quand** un champ est invalide (email mal formé, mot de passe < 8 caractères,
  nom vide)
- **Alors** un message d'erreur inline est affiché avant soumission (validation
  HTML5 + feedback UX).

### Scénario 4 : i18n

- **Étant donné** un visiteur avec la locale `en`
- **Quand** il accède à `/en/sign-up`
- **Alors** le formulaire, les labels, les messages d'erreur et le `<title>` sont
  en anglais.

### Scénario 5 : Lien vers connexion

- **Étant donné** la page d'inscription
- **Quand** le visiteur a déjà un compte
- **Alors** un lien « Déjà un compte ? Se connecter » mène vers `/connexion`.

### Scénario 6 : SEO

- **Étant donné** la page d'inscription
- **Quand** un crawler l'indexe
- **Alors** la page porte `<meta name="robots" content="noindex">` et un
  `<title>` traduit.

## Non-objectifs

- Inscription sociale (Google, etc.).
- Captcha → itération ultérieure si abus constaté.
- Conditions générales / checkbox RGPD → à ajouter quand les CGV existent.

## Contraintes

- Route storefront i18n : `apps/pharmacie-1/src/app/[locale]/(storefront)/inscription/page.tsx`
  (+ équivalent `/sign-up` pour EN via next-intl pathnames ou alias).
- Primitives `@pharmacie/ui` (Input, Button, Card, Heading).
- Rate-limit sur `signUpEmail` : max 3/min par IP (config Better Auth).
- Mot de passe haché par Better Auth (jamais en clair).
