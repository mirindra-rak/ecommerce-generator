# Plan : Admin — catégories (arborescence) & marques

**Ticket** : [04-admin-categories-marques](./04-admin-categories-marques.md) · **Statut** ✅ Terminé (14/14 · 9 nouveaux tests · pages admin vérifiées au runtime)

## Résumé

Back-office fonctionnel pour gérer l'arborescence de catégories (création, édition,
re-parentage anti-cycle, suppression protégée) et les marques (CRUD), via des Server
Actions Next.js qui passent par des services de domaine + repositories — avec un layout
admin minimal et un accès **temporairement non protégé** (auth = lot 5.1).

## Fichiers à créer ou modifier

### Domaine (packages/core)

- `src/modules/catalog/category.service.ts` — **créé** : `buildUniqueSlug`,
  `canReparent` (anti-cycle, pur), et services applicatifs `createCategory`,
  `updateCategory`, `moveCategory`, `deleteCategory` (orchestrent repositories +
  traduisent les erreurs en erreurs métier typées).
- `src/modules/catalog/brand.service.ts` — **créé** : `createBrand`, `updateBrand`,
  `deleteBrand` (slug unique).
- `src/modules/catalog/catalog-errors.ts` — **créé** : erreurs typées
  (`SlugConflictError`, `ReparentCycleError`, `CategoryNotEmptyError`).
- `src/modules/catalog/index.ts` — **modifié** : exporter services + erreurs.
- `src/modules/catalog/category.service.test.ts` — **créé** : anti-cycle, slug unique,
  refus de suppression (intégration).
- `src/modules/catalog/brand.service.test.ts` — **créé** : CRUD + slug unique.

### Back-office (apps/pharmacie-1/src/app/admin)

- `layout.tsx` — **créé** : layout admin (sidebar nav + banderole « zone non sécurisée »).
- `page.tsx` — **modifié** : tableau de bord minimal (liens + compteurs).
- `_components/admin-shell.tsx`, `_components/form-field.tsx` — **créés** : éléments d'UI
  réutilisables (sidebar, champ de formulaire avec message d'erreur).
- `categories/page.tsx` — **créé** : liste arborescente + bouton créer/supprimer.
- `categories/_actions.ts` — **créé** : Server Actions (create, update, move, delete).
- `categories/category-form.tsx` — **créé** : formulaire client (`useActionState`) create/edit + sélecteur de parent.
- `categories/new/page.tsx`, `categories/[id]/page.tsx` — **créés** : écrans création / édition.
- `marques/page.tsx` — **créé** : liste des marques.
- `marques/_actions.ts` — **créé** : Server Actions marques.
- `marques/brand-form.tsx`, `marques/new/page.tsx`, `marques/[id]/page.tsx` — **créés**.

## Étapes de développement

1. **Erreurs métier** — `catalog-errors.ts` : classes `SlugConflictError`,
   `ReparentCycleError`, `CategoryNotEmptyError`. Test : instanciation + `name`.
2. **Slug unique** — `buildUniqueSlug(name, exists)` : slugify + suffixe `-2`, `-3`…
   tant que `exists(slug)` est vrai. Test (pur, `exists` mocké) : collision → `-2`.
3. **Anti-cycle (pur)** — `canReparent(categoryId, newParentId, descendantIds)` :
   faux si `newParentId === categoryId` ou ∈ descendants. Test unitaire.
4. **Service catégories** — `createCategory`/`updateCategory`/`moveCategory`/
   `deleteCategory` : utilisent `categoryRepository` (+ `findDescendants` pour le move,
   `buildUniqueSlug`), lèvent les erreurs typées ; `deleteCategory` traduit l'échec FK
   (Restrict) en `CategoryNotEmptyError`. Test (intégration) : move cyclique refusé,
   suppression d'une catégorie peuplée refusée, slug auto unique.
5. **Service marques** — `createBrand`/`updateBrand`/`deleteBrand` avec slug unique.
   Test (intégration) : CRUD + slug dupliqué → `SlugConflictError`.
6. **Exports** — `index.ts` expose services + erreurs. Test : `type-check` vert.
7. **Layout admin** — `admin/layout.tsx` : sidebar (Tableau de bord, Catégories,
   Marques) + **banderole « zone non sécurisée — auth lot 5.1 »**. Test : pages admin
   rendues avec la sidebar.
8. **Dashboard** — `admin/page.tsx` : compteurs (nb catégories/marques/produits) +
   liens. Test : la page affiche les compteurs.
9. **Liste catégories** — `categories/page.tsx` : rendu **arborescent** (récursif via
   `findChildren`), avec liens éditer + bouton supprimer (Server Action). Test : l'arbre
   seedé s'affiche hiérarchiquement.
10. **Server Actions catégories** — `_actions.ts` : `createCategoryAction`,
    `updateCategoryAction`, `deleteCategoryAction` appellent les services, `revalidatePath`
    (admin + `/` storefront), renvoient `{ error }` en cas d'échec. Test : créer une
    catégorie l'ajoute ; supprimer une catégorie peuplée renvoie une erreur lisible.
11. **Formulaire catégorie** — `category-form.tsx` (client, `useActionState`) : nom +
    sélecteur de parent (exclut la catégorie et ses descendants en édition) ; écrans
    `new` et `[id]`. Test : éditer le parent re-parente ; choix cyclique refusé avec message.
12. **Liste + actions marques** — `marques/page.tsx`, `_actions.ts`, `brand-form.tsx`,
    `new`/`[id]`. Test : CRUD marque fonctionne, slug dupliqué affiche une erreur.
13. **Revalidation storefront** — vérifier que créer/éditer une catégorie met à jour la
    home (CategoryGrid) et les listings. Test : nouvelle catégorie visible sur `/`.
14. **Qualité** — `pnpm test` + `type-check` + `lint` + `build` verts.

## Points d'attention

- **Accès non protégé (temporaire)** : 🚧 décision actée — pas d'auth (lot 5.1). La
  banderole doit être visible et le plan documente la dette. Ne pas déployer en prod.
- **Anti-cycle** : la validation se fait côté domaine (`canReparent` + `findDescendants`).
  La base ne protège PAS contre un cycle de `parentId` → c'est au service de le faire.
- **Suppression protégée** : le refus est garanti par `onDelete: Restrict` (DB). Le
  service doit **catcher** l'erreur Prisma `P2003` et lever `CategoryNotEmptyError`
  (message lisible) plutôt que laisser fuiter l'erreur ORM.
- **Slug** : auto-généré depuis le nom (story 01/03 hypothèse). 🚧 édition manuelle du
  slug non incluse ici (à prévoir story 03 produits si besoin) — à confirmer.
- **Server Actions + services core** : les actions importent les services de
  `@pharmacie/core` (runtime `nodejs`) ; aucun appel Prisma direct dans l'app.
- **Nav header statique** : `site-header.tsx` a une liste de catégories en dur ; elle ne
  reflétera pas l'admin (hors périmètre — la home `CategoryGrid` est déjà dynamique). À
  noter, pas à corriger ici.
- **Revalidation** : `revalidatePath("/")` et des pages catégories après mutation, sinon
  le cache RSC masque les changements.
- **Position / réordonnancement** : champ `position` géré simplement (ordre de saisie) ;
  le glisser-déposer fin est explicitement hors périmètre (cf. spec).
