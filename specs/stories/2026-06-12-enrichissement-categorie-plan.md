# Plan : Enrichissement du modèle Catégorie (contenu + SEO)

**Ticket** : [2026-06-12-enrichissement-categorie](./2026-06-12-enrichissement-categorie.md) · **Statut** ✅ Terminé (12 champs, form admin, SEO/description page, filtre active ; 48 tests)

## Résumé

Enrichir `Category` (12 colonnes contenu/SEO/visibilité/images/douane), valider les champs
texte (caractères interdits), exposer ces champs dans le formulaire admin, et enrichir la
page catégorie (SEO + description + image + masquage des catégories inactives).

## Fichiers à créer ou modifier

### Domaine (packages/core)

- `prisma/schema.prisma` — **modifié** : `Category` + `active`, `description`,
  `additionalInfo`, `shortDescription`, `metaTitle`, `metaDescription`, `metaKeywords
String[] @default([])`, `coverImageKey`, `thumbnailKey`, `menuThumbnailKey`,
  `countryOfOrigin`, `hsCode`.
- `prisma/migrations/**` — **créé** : migration **additive** (defaults/nullable → non
  destructive).
- `prisma/seed.ts` — **modifié** : quelques `description`/`metaTitle` de démo.
- `src/modules/catalog/category-fields.ts` — **créé** : règle Zod réutilisable
  « caractères interdits `<>;=#{}` » (`safeTextField`) + helper de validation des champs
  catégorie (name + SEO).
- `src/modules/catalog/catalog-errors.ts` — **modifié** : `InvalidCategoryFieldError`.
- `src/modules/catalog/category.service.ts` — **modifié** : `CreateCategoryInput`/
  `UpdateCategoryInput` étendus ; validation (name + SEO) ; persistance de tous les champs.
- `src/modules/catalog/category.repository.ts` — **modifié** : ajouter `findActiveChildren
(parentId)` (filtre `active: true`, pour le storefront).
- `src/modules/catalog/index.ts` — **modifié** : exports.
- `src/modules/catalog/category-fields.test.ts` + `category.service.test.ts` — **créé/
  modifié** : validation + persistance + filtre actif.

### App (apps/pharmacie-1)

- `src/app/admin/(protected)/categories/_actions.ts` — **modifié** : lire les nouveaux
  `formData` (active, descriptions, SEO ; `metaKeywords` = liste séparée par virgules).
- `src/app/admin/(protected)/categories/category-form.tsx` — **modifié** : champs
  supplémentaires (toggle active, textareas, SEO, mots-clés) — primitives `@pharmacie/ui`.
- `src/lib/catalog.ts` — **modifié** : `getCategoryWithProducts` renvoie les champs
  enrichis (description, SEO, coverImageKey) + 404 si `active = false` ; `getRootCategories`
  filtre les catégories actives.
- `src/app/(storefront)/categorie/[slug]/page.tsx` — **modifié** : `generateMetadata`
  (metaTitle/metaDescription, fallback name) + affichage description + image de couverture.

## Étapes de développement

1. **Schéma** — ajouter les 12 colonnes à `Category` (defaults sûrs : `active true`,
   `metaKeywords []`, reste nullable). Test : `prisma validate`.
2. **Migration** — `db:migrate --name category_enrichment` (additive → non destructive,
   devrait passer en non-interactif ; sinon hand-written + `migrate deploy`). Régénérer le
   client. Test : colonnes présentes, suite de tests existante toujours verte (défauts OK).
3. **Règle de validation** — `category-fields.ts` : `safeTextField` (Zod, rejette
   `<>;=#{}`) + `validateCategoryFields({ name, metaTitle, metaDescription, metaKeywords })`.
   Test unitaire : valides/invalides par champ ; descriptions exemptées.
4. **Erreur métier** — `InvalidCategoryFieldError(field)` dans `catalog-errors.ts`. Test :
   instanciation.
5. **Service catégorie** — étendre `CreateCategoryInput`/`UpdateCategoryInput` (champs
   optionnels) ; valider (name + SEO) avant écriture ; persister tous les champs via le
   repository. Test (intégration) : création/maj avec champs → persistés ; caractère
   interdit → `InvalidCategoryFieldError` ; création minimale (name seul) → OK (défauts).
6. **Repository — filtre actif** — `findActiveChildren(parentId)` (`where active`). Test :
   exclut une catégorie `active = false`.
7. **Exports** — `index.ts`. Test : `type-check`.
8. **Server Actions admin** — lire les nouveaux `formData` ; `metaKeywords` (CSV → `string[]`,
   trim, filtrer vides) ; transmettre au service. Test : relecture + smoke.
9. **Formulaire admin** — `category-form.tsx` : toggle « Affichée », textareas
   (description, infos complémentaires, description courte), champs SEO (balise titre, meta
   description, mots-clés) ; pré-remplissage en édition. Pas d'upload image (différé). Test :
   `type-check`/`lint` + smoke.
10. **Couche data app** — `getCategoryWithProducts` enrichi + 404 si inactif ;
    `getRootCategories` via `findActiveChildren(null)`. Test : `type-check`.
11. **Page catégorie** — `generateMetadata` (metaTitle/description) + rendu description
    (texte échappé) + image de couverture (placeholder si pas de clé). Test : smoke.
12. **Seed** — ajouter description + metaTitle à 2-3 catégories ; re-seed. Test : `db:seed` OK.
13. **Qualité + smoke** — `pnpm test` + `type-check` + `lint` + `build` ; smoke : édition
    admin d'une catégorie persiste les champs ; `/categorie/visage-soin` affiche
    description + `<title>` SEO ; une catégorie `active=false` n'apparaît pas côté client.

## Points d'attention

- **Migration additive** : aucune perte de données → `migrate dev` non-interactif devrait
  fonctionner (contrairement à la story attributs). Si Prisma bloque malgré tout : migration
  hand-written + `migrate deploy` (pattern déjà éprouvé).
- **Défauts indispensables** : `active @default(true)` + `metaKeywords @default([])` pour
  que les tests/seed créant des catégories minimales (name + parent) passent sans changement.
- **`metaKeywords` `String[]`** : en base = array Postgres ; en form = CSV ↔ array (parser
  au niveau Server Action). 🚧 simple champ texte séparé par virgules (pas de composant tags).
- **Caractères interdits** : règle appliquée à **name + SEO courts uniquement** ;
  `description`/`additionalInfo`/`shortDescription` **exemptés** (HTML). Bien tester que la
  description peut contenir `<` sans rejet.
- **Sécurité rendu HTML** : la `description` est rendue en **texte échappé** par défaut
  (pas de `dangerouslySetInnerHTML`) → pas de XSS maintenant ; sanitization riche = lot 9.4. 🚧
- **Visibilité (active)** : `findActiveChildren` pour le storefront ; l'admin continue
  d'utiliser `findMany` (voit tout). Une catégorie inactive ouverte en direct côté client →
  404 (cohérence). L'admin reste éditable.
- **Images** : seulement les **colonnes `storageKey`** (remplies par migration) ; pas
  d'upload ; la page catégorie affiche un **placeholder** si la clé est absente/non servie.
- **`countryOfOrigin`/`hsCode`** : colonnes présentes (migration) ; exposition dans le form
  admin optionnelle. 🚧 décider : les inclure au form ou les laisser « migration-only » pour
  l'instant (recommandé : migration-only, le form reste focalisé contenu/SEO).
- **Régression form** : `category-form.tsx` et `_actions.ts` doivent rester rétro-compatibles
  (création/édition existantes ne cassent pas).
