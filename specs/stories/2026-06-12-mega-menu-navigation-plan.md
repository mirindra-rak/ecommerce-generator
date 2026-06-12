# Plan : Mega menu de navigation storefront

**Ticket** : [2026-06-12-mega-menu-navigation.md](2026-06-12-mega-menu-navigation.md) · **Statut** ✅ Exécuté

## Résumé

Remplacer le tableau `NAV` codé en dur de l'en-tête par une navigation data-driven :
un repository renvoie l'arbre racines + sous-catégories actives, un view-model plat
l'expose, et un composant client affiche un panneau déroulant au survol / focus.

## Fichiers à créer ou modifier

- `packages/core/src/modules/catalog/category.repository.ts` — **modifié** : ajout
  `findActiveMenuTree()` (racines actives + enfants actifs, une requête, tri `position`).
- `packages/core/src/modules/catalog/category.repository.test.ts` — **modifié** : test
  du nouveau repository (tri, filtre `active`, enfants attachés).
- `apps/pharmacie-1/src/lib/catalog.ts` — **modifié** : `MenuCategoryVM` (slug, label,
  children) + `getMenuTree()` qui mappe l'arbre en view-model sérialisable.
- `apps/pharmacie-1/src/app/(storefront)/_components/mega-menu.tsx` — **créé** :
  composant **client** (`"use client"`) recevant `MenuCategoryVM[]`, gérant l'ouverture
  au survol / focus, le rendu des colonnes, `aria-expanded`, fermeture `Échap`.
- `apps/pharmacie-1/src/app/(storefront)/_components/site-header.tsx` — **modifié** :
  composant devient `async`, appelle `getMenuTree()`, supprime `NAV`, rend `<MegaMenu>`
  (les liens spéciaux « Bons plans » / « Premium » restent en place).
- `tasks/AAAA-MM-JJ_HHhmm_mega-menu-navigation.md` — **créé** : journal de tâche.

## Étapes de développement

1. **Repository `findActiveMenuTree`** — dans `category.repository.ts`, méthode qui
   renvoie les catégories racines (`parentId: null, active: true`) avec
   `include: { children: { where: { active: true }, orderBy [position, name] } }`,
   triées par `position` puis `name`. Type de retour explicite (Category + children).
   Test : seed deux racines (une avec enfants actifs + 1 inactif, une sans enfant) →
   l'ordre est respecté, seuls les enfants actifs remontent.

2. **View-model `getMenuTree`** — dans `lib/catalog.ts`, `MenuCategoryVM { slug, label,
children: NavCategoryVM[] }` et `getMenuTree(): Promise<MenuCategoryVM[]>` qui appelle
   le repository et mappe vers des objets plats sérialisables. Réutilise `NavCategoryVM`
   pour les enfants. Test : type-check + vérif manuelle que la sortie est sérialisable.

3. **Composant client `MegaMenu`** — `mega-menu.tsx`, `"use client"`. Props :
   `categories: MenuCategoryVM[]`. Rend la barre (`Container`) avec une entrée par
   racine. Une racine **avec** enfants : bouton/lien déclencheur + panneau absolu en
   dessous, ouvert au survol (`onMouseEnter`/`onMouseLeave`) et au focus ; sous-catégories
   en colonnes (grille auto). Une racine **sans** enfant : simple `Link`, pas de panneau.
   `aria-expanded` sur le déclencheur, fermeture `Échap` rendant le focus au déclencheur.
   Lien racine → `/categorie/<slug>`, liens enfants → `/categorie/<slug>`.
   Test : vérif visuelle desktop (survol ouvre/ferme), focus clavier + `Échap`.

4. **Câblage du header** — dans `site-header.tsx`, rendre la fonction `async`, appeler
   `getMenuTree()`, supprimer le tableau `NAV` et la `<nav>` codée en dur, insérer
   `<MegaMenu categories={...} />` à la même place ; conserver le bloc liens spéciaux
   (« Bons plans », « Premium »). Test : la barre affiche les catégories réelles du seed,
   ordre `position` respecté.

5. **Journal de tâche** — créer le fichier `tasks/…_mega-menu-navigation.md`
   (contexte, modifications cochables, rollback).

6. **Vérifications finales** — `pnpm --filter @pharmacie/core test` (repo),
   `pnpm type-check`, `pnpm lint`. Test : tout passe, pas de `any`, pas de Prisma direct
   hors repository.

## Points d'attention

- **Header async** : le composant `SiteHeader` est aujourd'hui synchrone mais rendu dans
  un layout serveur → le passer en `async` est sûr (pas de `"use client"` sur le header).
  Le panneau interactif est isolé dans `MegaMenu` (client) pour ne pas client-iser tout
  le header.
- **Liens spéciaux** « Bons plans » / « Premium » : ils vivaient dans la même `<nav>` que
  `NAV`. Décider où les replacer — soit dans `MegaMenu` (props `extra`), soit conservés
  dans `site-header.tsx` à côté de `<MegaMenu>`. Préférence : les garder dans le header
  pour que `MegaMenu` ne porte que la nav catalogue.
- **Survol + panneau absolu** : le panneau doit rester ouvert quand le curseur passe de
  l'entrée au panneau (zone de survol continue / `onMouseLeave` sur le conteneur entrée+
  panneau, pas seulement sur le déclencheur).
- **Perf / N+1** : une seule requête grâce au `include` Prisma (pas de boucle de fetch
  par racine).
- 🚧 **« Tous les produits »** : dépend du seed. Si une racine `tous-les-produits` existe,
  elle est rendue nativement ; sinon prévoir un lien fixe en tête (à confirmer en lisant
  le seed `CATEGORIES` au moment du codage).
- 🚧 **Sérialisation Date** : `Category` Prisma porte `createdAt/updatedAt` (Date). Le
  view-model ne doit exposer que `slug`/`label`/`children` (chaînes) — ne pas passer
  l'entité Prisma brute au composant client.
