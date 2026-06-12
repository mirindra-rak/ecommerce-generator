# Story : Enrichissement du modèle Catégorie (contenu + SEO)

**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

Notre `Category` est minimale (nom, slug, parent, position) alors que la migration
PrestaShop (laparaducoin.fr, lot 10) apporte de nombreux champs : visibilité, descriptions,
SEO, images, douane. Cette story enrichit `Category` avec les **champs de contenu et SEO**
(en colonnes), adapte le formulaire admin et ajoute une **validation réutilisable**. Les
groupes clients (ACL) et l'upload d'images riche sont **hors périmètre** (différés).

## User Story

**En tant que** gestionnaire de la pharmacie, **je veux** des catégories enrichies
(description, SEO, visibilité, images), **afin de** préparer la migration PrestaShop et
soigner les pages catégorie.

## Critères d'acceptation

### Scénario 1 : Schéma enrichi

- **Étant donné** le schéma Prisma
- **Quand** la migration est appliquée
- **Alors** `Category` porte : `active Boolean @default(true)`, `description String?`,
  `additionalInfo String?`, `shortDescription String?`, `metaTitle String?`,
  `metaDescription String?`, `metaKeywords String[] @default([])`, `coverImageKey
String?`, `thumbnailKey String?`, `menuThumbnailKey String?`, `countryOfOrigin
String?`, `hsCode String?`
- **Et** `slug` reste l'« URL simplifiée » (inchangé)

### Scénario 2 : Validation caractères interdits

- **Étant donné** une règle Zod réutilisable interdisant `< > ; = # { }`
- **Quand** on crée/édite une catégorie avec un de ces caractères dans **nom** ou un champ
  **SEO court** (metaTitle, metaDescription, metaKeywords)
- **Alors** l'opération est rejetée avec un message lisible
- **Et** les champs riches (`description`, `additionalInfo`) sont **exemptés** (peuvent
  contenir du HTML issu de la migration) 🚧

### Scénario 3 : Formulaire admin enrichi

- **Étant donné** l'admin catégories (création/édition)
- **Quand** j'ouvre le formulaire
- **Alors** je peux saisir : Affichée (active), description, informations complémentaires,
  description courte, balise titre, meta description, mots-clés
- **Et** ces valeurs sont persistées via le service catalog

### Scénario 4 : SEO de la page catégorie

- **Étant donné** une catégorie avec `metaTitle`/`metaDescription`
- **Quand** la page `/categorie/[slug]` est servie
- **Alors** son `<title>` et sa meta description utilisent ces valeurs (fallback : `name`)

### Scénario 5 : Contenu éditorial de la page catégorie

- **Étant donné** une catégorie avec `description` et/ou `coverImageKey`
- **Quand** la page catégorie s'affiche
- **Alors** la description (texte) et l'image de couverture (si présente) sont affichées
- **Et** une catégorie sans ces champs s'affiche sans erreur (rendu dégradé propre)

### Scénario 6 : Visibilité

- **Étant donné** une catégorie `active = false`
- **Quand** le storefront liste/affiche les catégories (home `CategoryGrid`, racines)
- **Alors** elle n'apparaît pas côté client (mais reste visible/éditable en admin)

## Non-objectifs

- **Groupes clients + ACL** (Visiteur/Invité/Client) → feature dédiée ultérieure
  (dépend d'une notion de groupes clients inexistante).
- **Upload d'images riche** (composant admin, S3/MinIO) : on ajoute les colonnes
  `storageKey` (remplies par la migration) ; l'upload viendra avec l'admin médias.
- **Éditeur WYSIWYG** riche pour la description (un textarea suffit ici).
- **Facettes / recherche** par catégorie.

## Contraintes

- Validation **dans `core`** (Zod, déjà dépendance) ; règle « caractères interdits »
  réutilisable (catégorie + futurs modèles).
- **Descriptions HTML** : à **assainir au rendu** (XSS, OWASP lot 9.4) — noté, pas
  implémenté finement ici (rendu texte sûr par défaut). 🚧
- Modèle **Silo** inchangé ; accès via Repository ; mutations via service catalog.
- Mettre à jour le **seed** (au moins quelques descriptions/SEO de démo).

## Questions ouvertes

- 🚧 Images : retenu **3 colonnes `storageKey`** (cover/thumbnail/menu) plutôt qu'une
  table `CategoryMedia` (3 slots fixes, mapping 1:1 PrestaShop). À confirmer.
- 🚧 `countryOfOrigin` / `hsCode` au niveau **Category** (défauts douaniers PrestaShop,
  hérités par les produits) — confirmé, même si sémantiquement « produit ».
- 🚧 `metaKeywords` en `String[]` (liste) ; affichage admin = champ tags ou texte séparé
  par virgules. À acter en `/plan`.
- 🚧 Rendu HTML de la description : texte échappé par défaut maintenant ; sanitization
  riche (DOMPurify/sanitize-html) à brancher avec le volet sécurité (lot 9.4).

## Références

- Source : formulaire catégorie PrestaShop (laparaducoin.fr) — migration lot 10.
- Modèle actuel : `packages/core/prisma/schema.prisma` (Category).
- Admin existant : `apps/.../admin/(protected)/categories/`, `category.service.ts`.
