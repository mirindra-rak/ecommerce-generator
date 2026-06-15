# Story : SEO multilingue (`hreflang`, alternates, sitemap)

**Epic parent** : [Internationalisation (i18n) — UI multilingue](../epic.md)
**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

Le routing par locale (story 01) crée des URLs distinctes par langue pour un même contenu
d'interface. Sans signaux SEO, les moteurs y voient du contenu dupliqué. Cette story déclare
les **alternances de langue** (`hreflang`), expose un **sitemap par locale** et garantit des
canoniques et un `lang` corrects — le SEO étant priorité haute du projet.

## User Story

**En tant que** moteur de recherche, **je veux** des signaux `hreflang` réciproques et un
sitemap déclinant chaque URL par locale, **afin de** servir la bonne version linguistique
sans pénaliser le site pour contenu dupliqué.

## Critères d'acceptation

### Scénario 1 : alternances réciproques par page

- **Étant donné** une page accessible en `/fr/...` et `/en/...`
- **Quand** son HTML est rendu
- **Alors** `generateMetadata` émet `alternates.languages` pour chaque locale **plus**
  `x-default`, et les alternances sont **réciproques** (chaque version pointe vers l'autre).

### Scénario 2 : `lang` exact

- **Étant donné** une page en locale `en`
- **Quand** elle est rendue
- **Alors** `<html lang="en">` (et `fr` pour la version française) — jamais de `lang` figé.

### Scénario 3 : sitemap par locale

- **Étant donné** le sitemap du site
- **Quand** il est généré
- **Alors** chaque URL apparaît pour chaque locale supportée, avec les annotations
  d'alternance (`xhtml:link`/équivalent App Router), cohérentes avec les `hreflang` du HTML.

### Scénario 4 : canoniques cohérentes

- **Étant donné** une URL localisée
- **Quand** sa balise canonique est émise
- **Alors** elle est **auto-référente** (la canonique d'une page `en` pointe sur l'URL `en`),
  sans faire pointer toutes les locales vers une version unique.

### Scénario 5 : robots / indexabilité

- **Étant donné** les versions localisées
- **Quand** un moteur les explore
- **Alors** elles sont indexables (pas de `noindex` involontaire) et le `Accept-Language`
  redirect du middleware n'empêche pas l'exploration directe des URLs préfixées.

## Non-objectifs

- Traduction du **contenu** et **slugs localisés** (V2) — ici, seules les URLs d'UI sont
  déclinées par locale.
- Données structurées (`schema.org`) multilingues avancées au-delà du `inLanguage`.
- i18n du back-office (non indexé).

## Contraintes

- `alternates`/`hreflang` via l'API Metadata de Next (`generateMetadata`), pas de markup
  manuel divergent.
- Domaine canonique tiré de `site.config.ts` (`brand.domain`), cohérent Silo.
- Sitemap généré par l'app (`app/sitemap.ts`), aligné sur `supportedLocales`.
- Performance : génération statique du sitemap quand possible.

## Questions ouvertes

- 🚧 `x-default` → pointe vers `defaultLocale` préfixé ou vers la racine non préfixée
  (dépend de la décision « préfixe par défaut » de la story 01).
