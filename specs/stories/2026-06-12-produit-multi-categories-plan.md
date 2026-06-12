# Plan : Produit dans plusieurs catégories (M2M + catégorie par défaut)

**Ticket** : [2026-06-12-produit-multi-categories.md](2026-06-12-produit-multi-categories.md) · **Statut** ✅ Exécuté

## Résumé

Passer `Product`↔`Category` de many-to-one à **many-to-many** (relation implicite Prisma)

- une **catégorie principale** nommée, et propager le changement (repos, service, admin,
  view-models, seed, tests).

## Fichiers à créer ou modifier

- `packages/core/prisma/schema.prisma` — **modifié** : retirer `categoryId`/`category` +
  `@@index([categoryId])` ; ajouter M2M `categories Category[] @relation("ProductCategories")`
  (côté `Category` : `products Product[] @relation("ProductCategories")`) ; ajouter
  `primaryCategoryId String?` + `primaryCategory Category? @relation("ProductPrimaryCategory",
fields:[primaryCategoryId], references:[id], onDelete:SetNull)` (côté `Category` :
  `primaryOf Product[] @relation("ProductPrimaryCategory")`).
- `packages/core/prisma/migrations/<ts>_product_categories_m2m/` — **créé** (diff + deploy).
- `packages/core/src/modules/catalog/product.repository.ts` — **modifié** : `productInclude`
  `category` → `categories` (+ `primaryCategory`) ; `findCardsByCategorySlug` filtre
  `categories: { some: { slug } }`.
- `packages/core/src/modules/catalog/product.service.ts` — **modifié** : `CreateProductInput`
  `categoryId` → `categoryIds: string[]` + `primaryCategoryId?: string | null` ; validation
  « principale ∈ liste » ; `create` → `categories.connect[]` + `primaryCategory` ;
  `update` → `categories.set[]` + `primaryCategory` connect/disconnect.
- `packages/core/src/modules/catalog/catalog-errors.ts` — **modifié** : nouvelle
  `PrimaryCategoryNotAssignedError`.
- `packages/core/src/modules/catalog/index.ts` — **modifié** : export de la nouvelle erreur.
- `packages/core/src/modules/catalog/category.repository.ts` — **modifié** :
  `countProducts(id)` (via `product.count({ where: { categories: { some: { id } } } })`).
- `packages/core/src/modules/catalog/category.service.ts` — **modifié** : `deleteCategory`
  **n'empêche plus** la suppression pour des produits associés (M2M détachée) ; conserve le
  catch P2003 → `CategoryNotEmptyError` pour les **sous-catégories**.
- `apps/pharmacie-1/src/lib/catalog.ts` — **modifié** : `ProductDetailVM` expose
  `categories: NavCategoryVM[]` + `primaryCategory: NavCategoryVM | null`.
- `packages/core/prisma/seed.ts` — **modifié** : produit → `categories.connect[1]` +
  `primaryCategory.connect` (la catégorie unique du dataset).
- Admin produit (**modifié**, adaptation minimale) :
  `apps/.../produits/produit-form.tsx` (multi-sélection catégories + select « principale »),
  `apps/.../produits/_actions.ts` (`getAll("categoryIds")` + `primaryCategoryId`),
  `apps/.../produits/new/page.tsx` & `[id]/page.tsx` (props `categoryIds`/`primaryCategoryId`).
- Admin catégories — suppression :
  `apps/.../categories/_actions.ts` (l'alerte du nombre ne bloque plus sur produits),
  `apps/.../categories/page.tsx` (compteur de produits par ligne + bouton suppression),
  `apps/.../categories/delete-category-button.tsx` (**créé**, client : `confirm` avec le nombre).
- Admin catégories — **refonte UI** (Scénario 8) :
  `apps/.../categories/category-form.tsx` (**refonte** : primitives `@pharmacie/ui`, sections
  en cartes, compteurs SEO). Possible petit composant `char-counter.tsx` (**créé**).
- Tests **modifiés** : `product.repository.test.ts`, `product.service.test.ts`,
  `category.service.test.ts` (associations M2M + suppression : produits OK / enfants bloqués).
- `tasks/AAAA-MM-JJ_HHhmm_produit-multi-categories.md` — **créé**.

## Étapes de développement

1. **Schéma M2M + principale** — éditer `schema.prisma` (relations nommées, retrait de
   `categoryId`). Générer la migration via `migrate diff` (DB → datamodel) puis
   `migrate deploy` ; `db:generate`. Test : `type-check` du package core (le client reflète
   `categories`/`primaryCategory`), table `_ProductCategories` créée.

2. **Repository produit** — `productInclude` charge `categories` + `primaryCategory` ;
   `findCardsByCategorySlug` utilise `categories: { some: { slug } }`. Test (vitest) :
   un produit associé à C1 **et** C2 ressort des deux listings ; la fiche
   (`findBySlugWithRelations`) renvoie ses catégories + la principale.

3. **Erreur + repository catégorie** — ajouter `PrimaryCategoryNotAssignedError` (export
   index) et `categoryRepository.countProducts(id)`. Test : `countProducts` renvoie le bon
   nombre d'associations.

4. **Service produit** — `CreateProductInput` (`categoryIds` + `primaryCategoryId`) ;
   `createProduct`/`updateProduct` écrivent les associations (`connect`/`set`) et la
   principale ; rejet si la principale n'est pas dans la liste. Test : création multi-cat OK ;
   `update` remplace la liste ; principale hors liste → `PrimaryCategoryNotAssignedError`.

5. **Suppression de catégorie** — `deleteCategory` ne bloque plus sur les produits (la M2M
   les détache) ; conserve le refus « avec enfants » (P2003 → `CategoryNotEmptyError`).
   Côté admin : `page.tsx` affiche le **compteur de produits** par catégorie ; le bouton
   suppression passe par un composant client `delete-category-button` qui demande
   confirmation en **affichant le nombre** de produits détachés. Test (vitest) : catégorie
   associée à un produit → supprimée (produit conservé) ; catégorie avec enfant → refus.

6. **View-models storefront** — `ProductDetailVM` expose `categories` + `primaryCategory`
   (slugs/labels). Test : `type-check` app + lecture manuelle d'une fiche.

7. **Seed** — produit relié à la catégorie du dataset en M2M **et** comme principale.
   Test : `db:seed` OK, listings de catégorie non vides, mega menu fonctionnel.

8. **Admin produit (minimal)** — `produit-form` : `<select multiple name="categoryIds">`
   - `<Select name="primaryCategoryId">` ; `_actions` lit `getAll` + principale ; pages
     `new`/`[id]` passent `categoryIds`/`primaryCategoryId`. Test : `type-check` + `lint` app,
     création/édition d'un produit avec 2 catégories via l'écran.

9. **Suppression catégorie côté admin** — `categories/page.tsx` affiche le compteur de
   produits par ligne ; `delete-category-button` (client) confirme avec le nombre ;
   `_actions.deleteCategoryAction` ne traite plus les produits comme un blocage (seul
   l'enfant redirige avec erreur). Test : `lint`/`type-check` app ; suppression d'une
   catégorie avec produits OK, avec enfant refusée.

10. **Refonte UI formulaire catégorie** (Scénario 8) — réécrire `category-form.tsx` avec les
    primitives `@pharmacie/ui` (Input/Select/Textarea/Field), sections en cartes (Identité,
    Visibilité, Contenu, SEO), libellés d'aide et compteurs de caractères SEO
    (`char-counter`). Test : `type-check` + `lint` app ; rendu cohérent ajout/édition.

11. **Vérifications** — `pnpm type-check`, `pnpm lint`, `pnpm --filter @pharmacie/core test`,
    `pnpm --filter @pharmacie/core db:seed`. Test : tout vert.

12. **Journal de tâche** — `tasks/…_produit-multi-categories.md`.

## Points d'attention

- **Perte de données à la migration** : retirer `categoryId` supprime les associations
  existantes ; on **re-seed** (base de dev) — cf. hypothèse de la story. Pas de migration
  de données rétrocompatible.
- **Suppression assouplie** : la M2M implicite **cascade** les lignes de jointure (Prisma) →
  supprimer une catégorie détache simplement les produits (comportement voulu). Seuls les
  **enfants** bloquent (`Restrict` → P2003). `countProducts` ne sert qu'à **l'alerte** du
  nombre, pas à bloquer.
- **`primaryCategory` orpheline possible** : supprimer une catégorie qui est la principale
  d'un produit la met à `null` (`onDelete:SetNull`) — le produit reste valide, juste sans
  catégorie principale. Acceptable.
- **UI catégorie** : la refonte garde les **mêmes `name` de champs** (form server action
  inchangée) — on ne change que la présentation (primitives + sections + compteurs).
- **Deux relations Product↔Category** ⇒ relations Prisma **nommées** obligatoires
  (`ProductCategories` pour la M2M, `ProductPrimaryCategory` pour la principale), sinon
  erreur de validation du schéma.
- **Admin produit = adaptation minimale** : multi-select natif + select principale (pas de
  composant riche). 🚧 UX avancée (recherche, arbre) hors scope.
- **`findActive`/cartes** ne dépendent pas de la catégorie → inchangés.
- 🚧 **Validation principale sans catégories** : si `categoryIds` est vide, `primaryCategoryId`
  doit être nul (sinon `PrimaryCategoryNotAssignedError`). Comportement retenu : principale
  optionnelle, mais si fournie elle doit appartenir à la liste non vide.
