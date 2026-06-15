# Story : Fondation i18n & routing par locale (`/[locale]`)

**Epic parent** : [Internationalisation (i18n) — UI multilingue](../epic.md)
**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

Aucune lib i18n n'est installée, l'app rend à la racine sans segment de locale et
`<html lang="fr">` est codé en dur. Cette story pose le **socle** : lib, routing par
locale en sous-chemin, middleware de négociation et configuration Silo des locales.
Toutes les autres stories de l'epic en dépendent.

## User Story

**En tant que** visiteur, **je veux** que le site s'ouvre dans une langue déterminée et
reflétée dans l'URL (`/fr/...`, `/en/...`), **afin de** naviguer dans ma langue et de
pouvoir partager une URL qui conserve cette langue.

## Critères d'acceptation

### Scénario 1 : négociation à l'arrivée

- **Étant donné** un visiteur sans cookie de langue
- **Quand** il accède à `/`
- **Alors** le middleware choisit la locale via `Accept-Language` (sinon `defaultLocale`)
  et il est servi/redirigé sous le préfixe correspondant (`/fr` ou `/en`).

### Scénario 2 : locale explicite dans l'URL

- **Étant donné** un visiteur
- **Quand** il ouvre `/en/...`
- **Alors** la page rend en contexte locale `en` et `<html lang="en">` est émis.

### Scénario 3 : locale invalide rejetée

- **Étant donné** une URL avec un segment de locale non supporté (`/de/...`)
- **Quand** elle est demandée
- **Alors** elle renvoie un 404 (ou redirige vers `defaultLocale`) — **jamais** de rendu
  d'une locale hors `supportedLocales`, pas d'open-redirect via ce paramètre.

### Scénario 4 : configuration Silo

- **Étant donné** `site.config.ts`
- **Quand** un intégrateur définit `supportedLocales` et `defaultLocale`
- **Alors** ces valeurs pilotent le routing, le middleware et la liste des locales ;
  aucune locale n'est codée en dur ailleurs.

### Scénario 5 : API de traduction disponible

- **Étant donné** un composant serveur (RSC) et un composant client
- **Quand** ils demandent une traduction pour la locale active
- **Alors** chacun obtient le message via l'API de la lib, en chargeant **uniquement** les
  messages de la locale active.

## Non-objectifs

- Externalisation effective des chaînes des composants (→ story 02).
- Sélecteur de langue (→ story 03) ; ici la locale change uniquement par l'URL/headers.
- Balises `hreflang`/sitemap (→ story 04).
- Externalisation des chaînes admin (→ story 05) ; ici on garantit seulement que `/admin`
  reste **hors** de l'arbre `[locale]` (pas de préfixe de locale).

## Contraintes

- **next-intl** (candidat de tête) ou équivalent App Router + RSC ; choix justifié au `/plan`.
- Middleware edge-compatible ; restructuration de l'arbre `app/` sous `app/[locale]/`.
- `LocaleConfig` étendu : `supportedLocales: string[]` + `defaultLocale: string`
  (remplace le littéral `"fr-FR"`), typage strict, sans casser les consommateurs existants.
- Performance : pas de bundle multi-locale ; messages chargés par locale.
- Sécurité : whitelist stricte de la locale (URL + headers).

## Questions ouvertes

- 🚧 Préfixer la locale par défaut ou non (cf. décision epic — pencher « toujours préfixer »).
- 🚧 Le segment `(storefront)` et `admin` cohabitent : `admin` reste-t-il hors `[locale]`
  (recommandé, back-office FR) — à valider au `/plan`.
