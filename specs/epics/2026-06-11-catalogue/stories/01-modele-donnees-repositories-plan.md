# Plan : Modèle de données catalogue + repositories

**Ticket** : [01-modele-donnees-repositories](./01-modele-donnees-repositories.md) · **Statut** ✅ Terminé (14/14 étapes · 13 tests verts)

## Résumé

Compléter le schéma Prisma du catalogue (variantes multi-axes, médias, attributs
parapharmacie), générer la migration, et exposer l'accès aux données via des
repositories typés dans `packages/core/src/modules/catalog`, le tout couvert par des
tests d'intégration Vitest sur une base PostgreSQL de test.

## Fichiers à créer ou modifier

- `packages/core/prisma/schema.prisma` — **modifié** : enum `ProductType` ; extension de
  `Product` (ean, inci, productType, precautions) et `ProductVariant` (volume) ; ajout
  de `ProductOption`, `ProductOptionValue`, `ProductVariant`↔`VariantOptionValue`,
  `ProductMedia` ; règles `onDelete` ; index/contraintes uniques.
- `packages/core/prisma/migrations/**` — **créé** : migration générée (`migrate dev`).
- `packages/core/src/modules/catalog/product.repository.ts` — **modifié** : passage en
  CRUD complet + lecture avec relations (options/valeurs/variantes/médias) + recherches
  (`findBySlug`, `findByEan`).
- `packages/core/src/modules/catalog/category.repository.ts` — **créé** : CRUD +
  lecture d'arbre (enfants/descendants) + `findBySlug`.
- `packages/core/src/modules/catalog/brand.repository.ts` — **créé** : CRUD + `findBySlug`.
- `packages/core/src/modules/catalog/index.ts` — **modifié** : exporter les 3 repositories.
- `packages/core/src/modules/catalog/*.repository.test.ts` — **créé** : tests
  d'intégration (CRUD, unicité, cascade, arbre, médias ordonnés).
- `packages/core/vitest.config.ts` — **créé** : config Vitest (env node, setup, timeout).
- `packages/core/src/test/db.ts` — **créé** : helpers de test (reset/truncate entre tests).
- `.env.test` (+ `.env.example` **modifié**) — **créé** : `DATABASE_URL` de la base de test.
- `.github/workflows/ci.yml` — **modifié** : service PostgreSQL + `migrate deploy` avant
  les tests d'intégration.
- `packages/core/package.json` — **modifié** si besoin : script de préparation de la base
  de test (ex. `test` qui applique les migrations avant `vitest`).

## Étapes de développement

1. **Enum + attributs produit** — ajouter `enum ProductType { COSMETIC SUPPLEMENT DEVICE OTHER }`
   et les champs `ean` (unique, nullable), `inci`, `productType` (défaut `OTHER`),
   `precautions` sur `Product`. Test : `prisma validate` + génération du client OK.
2. **Champ variante** — ajouter `volume` (nullable) sur `ProductVariant`. Test :
   `prisma validate` OK.
3. **Options multi-axes** — modéliser `ProductOption` (productId, name, position ;
   unique (productId, name)) et `ProductOptionValue` (optionId, value, position ;
   unique (optionId, value)), `onDelete: Cascade` depuis le produit/l'option. Test :
   `prisma validate` OK.
4. **Liaison variante↔valeur** — modéliser `VariantOptionValue` (variantId,
   optionValueId ; clé composite unique), cascade depuis variante et valeur. Test :
   schéma validé ; une variante peut référencer une valeur par option.
5. **Médias** — modéliser `ProductMedia` (productId, storageKey, alt, position ; index
   productId), `onDelete: Cascade`. Test : `prisma validate` OK.
6. **Règles de suppression** — fixer les `onDelete` : produit→(variantes, options,
   médias) en cascade ; catégorie (parent + produits) en `Restrict` (la règle métier
   « refus » sera affinée en story 04). Test : revue du schéma ; cf. point 🚧.
7. **Migration** — `pnpm --filter @pharmacie/core db:migrate` (DB via `docker compose up`)
   pour générer la migration `catalog_model`. Test : migration appliquée, client régénéré,
   `type-check` vert.
8. **Socle de test d'intégration** — créer `vitest.config.ts` + `src/test/db.ts`
   (truncate des tables catalogue entre tests, base de test dédiée via `.env.test`).
   Test : un test trivial se connecte et nettoie la base.
9. **brandRepository** — CRUD + `findBySlug`. Test : créer/lire/màj/supprimer une marque ;
   `slug` dupliqué rejeté.
10. **categoryRepository** — CRUD + `findBySlug` + `findChildren`/`findDescendants`
    (CTE récursif ou parcours). Test : créer un arbre (racine→enfant→petit-enfant),
    lire les descendants, `slug` dupliqué rejeté.
11. **productRepository (lecture)** — `findById`, `findBySlug`, `findByEan`, `findActive`,
    `findWithRelations` (options, valeurs, variantes, médias triés par `position`). Test :
    relations correctement chargées et médias ordonnés.
12. **productRepository (écriture)** — `create` (avec options/valeurs/variantes/médias
    imbriqués), `update`, `delete`. Test : `sku`/`ean`/`slug` dupliqués rejetés ;
    suppression du produit ⇒ variantes, liaisons et médias supprimés (cascade vérifiée).
13. **Index export** — exporter `brandRepository`, `categoryRepository`,
    `productRepository` depuis `index.ts`. Test : import depuis `@pharmacie/core/modules/catalog`
    résout ; `type-check` + `lint` verts.
14. **CI** — ajouter un service PostgreSQL au workflow et appliquer les migrations avant
    `pnpm test`. Test : pipeline CI vert (lint, type-check, test, build).

## Points d'attention

- **Tests = intégration, pas unitaires** : cascade et contraintes d'unicité sont des
  comportements PostgreSQL ; les mocker n'aurait aucune valeur. Il faut une **vraie base
  de test**. Mitigation : base dédiée + truncate entre tests ; `docker compose up` en local,
  service `postgres` en CI (le workflow actuel n'en a pas → étape 14).
- **CI sans base de données** : `.github/workflows/ci.yml` exécute `pnpm test` sans
  PostgreSQL. À corriger sous peine de tests d'intégration rouges.
- **Référentiel `onDelete` catégorie** : 🚧 `Restrict` (refus au niveau DB) vs `SetNull`
  (détachement des produits). Le ticket renvoie la règle « refus » à la story 04 ; ici on
  choisit un défaut sûr (`Restrict`) et on documente. À trancher avant l'étape 6.
- **Génération du `slug`** : 🚧 hors périmètre repository (auto/saisi tranché en story 03).
  Les repositories reçoivent le `slug` en entrée et garantissent seulement l'unicité.
  Décider si un utilitaire `slugify` partagé est créé maintenant (dans `core`) ou en story 03.
- **`productType` par défaut** : proposé `OTHER` pour faciliter l'import de migration
  (lot 10). À confirmer côté métier.
- **Réutilisation du `Media`** : 🚧 le ticket retient `ProductMedia` dédié (pas de modèle
  `Media` générique CMS pour l'instant) — acté, à ne pas sur-anticiper.
- **`Omit<TEntity,"id">` du `Repository` de base** : le contrat générique ne couvre pas les
  écritures imbriquées (options/variantes/médias). Les repositories concrets exposeront des
  signatures dédiées ; ne pas forcer le contrat générique au détriment de la lisibilité.
