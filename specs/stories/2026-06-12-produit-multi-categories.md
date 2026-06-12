# Story : Produit dans plusieurs catégories (M2M + catégorie par défaut)

**Date** 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

Aujourd'hui `Product` a un `categoryId` **unique** (many-to-one) : un produit ne vit que
dans une seule catégorie. C'est un défaut de modèle pour un catalogue e-commerce (et par
rapport à PrestaShop) : un produit doit pouvoir apparaître dans **plusieurs** catégories.
On corrige la cardinalité **avant publication**, avec une **catégorie par défaut** pour
l'URL canonique / le fil d'Ariane / le SEO (équivalent `id_category_default`).

## User Story

**En tant que** gestionnaire du catalogue,
**je veux** rattacher un produit à plusieurs catégories (avec une catégorie principale),
**afin de** qu'il soit trouvable dans chaque rubrique pertinente tout en gardant une URL canonique.

## Critères d'acceptation

### Scénario 1 : Modèle many-to-many + catégorie par défaut

- **Étant donné** le schéma actuel (`Product.categoryId` unique)
- **Quand** la migration est appliquée
- **Alors** `Product` est lié à `Category` en **many-to-many** (table de jointure)
- **Et** `Product` porte une **catégorie par défaut** optionnelle (`primaryCategory`,
  relation distincte) pour le canonical / fil d'Ariane
- **Et** `db:generate` + `type-check` passent (code adapté, plus de `categoryId` simple)

### Scénario 2 : Un produit dans plusieurs catégories

- **Étant donné** un produit
- **Quand** on le rattache à deux catégories C1 et C2
- **Alors** il apparaît dans le listing de C1 **et** dans celui de C2
- **Et** un produit reste affichable même sans aucune catégorie

### Scénario 3 : Listing de catégorie

- **Étant donné** une catégorie et des produits qui lui sont associés (parmi d'autres
  catégories)
- **Quand** on charge le listing de cette catégorie
- **Alors** `findCardsByCategorySlug` renvoie les produits dont **l'une** des catégories
  a ce slug (filtre `categories: { some: { slug } }`), filtres facettes inchangés

### Scénario 4 : Fiche produit et catégorie principale

- **Étant donné** un produit avec plusieurs catégories et une catégorie par défaut
- **Quand** on charge sa fiche (`findBySlugWithRelations`)
- **Alors** la fiche expose **la liste** de ses catégories et **la catégorie principale**
  (view-model `catalog.ts` adapté ; la principale sert de canonical/fil d'Ariane)

### Scénario 5 : Service produit — écriture des catégories

- **Étant donné** `createProduct` / `updateProduct`
- **Quand** on fournit une liste de catégories + une catégorie principale
- **Alors** le produit est associé à toutes les catégories fournies
- **Et** la catégorie principale **doit faire partie** de la liste (sinon erreur de validation)
- **Et** `updateProduct` remplace l'ensemble des associations par la nouvelle liste

### Scénario 6 : Suppression d'une catégorie associée à des produits

- **Étant donné** une catégorie associée à N produits (N ≥ 0)
- **Quand** on la supprime depuis l'admin
- **Alors** une **alerte de confirmation** indique le **nombre N** de produits qui seront
  détachés
- **Et** après confirmation la catégorie est supprimée et les produits sont **conservés**
  (simplement détachés de cette catégorie via la table de jointure)
- **Et** une catégorie ayant des **sous-catégories** reste **non supprimable**
  (`CategoryNotEmptyError`, sens « a des enfants »)

### Scénario 8 : Refonte de l'écran ajout/édition de catégorie

- **Étant donné** le formulaire catégorie en markup HTML natif (`fieldClass` manuel)
- **Quand** on ouvre l'écran d'ajout ou d'édition d'une catégorie
- **Alors** les champs utilisent les **primitives `@pharmacie/ui`** (plus de markup brut)
- **Et** le formulaire est structuré en **sections** (Identité, Visibilité, Contenu, SEO),
  présentées en cartes, avec libellés d'aide
- **Et** les champs SEO (balise titre, meta description) affichent un **compteur de caractères**

### Scénario 7 : Seed compatible

- **Étant donné** le dataset curé (1 catégorie par produit, faute de mieux côté source)
- **Quand** on lance le seed
- **Alors** chaque produit est associé à cette catégorie **et** elle est sa catégorie
  par défaut
- **Et** le mega menu et les listings continuent de fonctionner

## Non-objectifs

- **Import de vraies associations multi-catégories** : la source ne fournit que
  `id_category_default` → le seed reste mono-catégorie (le modèle, lui, supporte N).
- **UI admin multi-sélection** de catégories : hors scope si l'écran produit n'existe pas
  encore ; sinon adaptation minimale. 🚧 à confirmer.
- **Rendu du fil d'Ariane** côté storefront : on **expose** la donnée, on ne refait pas
  l'UI de breadcrumb ici.
- **Module `pricing`** et calcul TTC : inchangés.
- **Refonte de la LISTE des catégories** : hors scope, hormis l'ajout du compteur de
  produits et l'alerte de suppression. Seul l'écran ajout/édition est redesigné.

## Contraintes

- Stack : Prisma + PostgreSQL, TypeScript strict (`any` interdit), monorepo pnpm.
- Repository pattern : tout accès données via repository ; pas de Prisma dans les composants.
- Deux relations distinctes Product↔Category (la M2M `categories` + la `primaryCategory`)
  → relations Prisma **nommées**.
- Migration **non-interactive** (cf. environnement) : `migrate diff` + `migrate deploy`.
- Modèle **Silo** : aucune notion de tenant.

## Questions ouvertes

- **Suppression** : avec la table de jointure, les FK implicites Prisma cascadent — la
  suppression détache les produits sans erreur, ce qui correspond au comportement voulu
  (alerte du nombre, pas de blocage). Le **blocage subsiste uniquement** pour les
  sous-catégories (self-relation `Restrict` → P2003 → `CategoryNotEmptyError`). Le nombre
  de produits associés est fourni par `categoryRepository.countProducts` pour l'alerte.
- 🚧 **Jointure implicite vs explicite** : relation M2M implicite Prisma (`_CategoryToProduct`)
  suffisante, ou table explicite (si on veut ordonner/poser des attributs plus tard) ?
  Hypothèse : implicite pour rester simple.
- 🚧 **Migration des données existantes** : convertir l'actuel `categoryId` en (association
  - `primaryCategory`) lors de la migration, ou s'appuyer sur un re-seed ? Hypothèse :
    re-seed (base de dev), la migration ne préserve pas l'ancienne colonne.

## Références

- `packages/core/prisma/schema.prisma` (`Product`, `Category`)
- `packages/core/src/modules/catalog/product.repository.ts`
  (`findCardsByCategorySlug`, `findBySlugWithRelations`, `productInclude`)
- `packages/core/src/modules/catalog/product.service.ts` (`createProduct`/`updateProduct`)
- `packages/core/src/modules/catalog/category.service.ts` (`deleteCategory` / `CategoryNotEmptyError`)
- `apps/pharmacie-1/src/lib/catalog.ts` (view-models `CategoryPageVM`, `ProductDetailVM`)
- `packages/core/prisma/seed.ts` (+ `seed-data/catalog.json`)
- Admin catégories : `apps/.../admin/(protected)/categories/category-form.tsx`,
  `categories/_actions.ts` (`deleteCategoryAction`), `categories/page.tsx` (liste + suppression)
