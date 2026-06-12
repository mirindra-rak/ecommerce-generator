# Story : Mega menu de navigation storefront

**Date** 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

L'en-tête vitrine (`site-header.tsx`) affiche une barre de navigation alimentée par
un tableau `NAV` **codé en dur** : 7 liens plats, sans sous-niveaux ni survol. Or les
catégories forment déjà un **arbre** en base (`Category.parentId` / `children`, champ
`position`, visibilité `active`). On veut une navigation **data-driven** : au survol
d'un univers (catégorie racine), un panneau déroulant (« mega menu ») présente ses
sous-catégories actives en colonnes, branché sur le catalogue réel.

## User Story

**En tant que** visiteur de la boutique,
**je veux** survoler un univers dans la barre de navigation et voir ses sous-catégories,
**afin de** parcourir l'offre et atteindre une rubrique précise en un geste.

## Critères d'acceptation

### Scénario 1 : Barre de navigation alimentée par le catalogue

- **Étant donné** des catégories racines `active` triées par `position` en base
- **Quand** la page vitrine se charge
- **Alors** la barre de navigation affiche ces racines (libellé = `name`), dans l'ordre
  `position`, à la place du tableau `NAV` codé en dur
- **Et** chaque libellé pointe vers `/categorie/<slug>`

### Scénario 2 : Ouverture du panneau au survol d'un univers

- **Étant donné** une catégorie racine qui possède au moins une sous-catégorie `active`
- **Quand** je survole (souris) son entrée dans la barre
- **Alors** un panneau déroulant s'ouvre sous la barre
- **Et** il liste les sous-catégories `active` (triées par `position`) en **colonnes**,
  chacune étant un lien vers `/categorie/<slug>`
- **Et** le panneau se ferme quand le curseur quitte l'entrée et le panneau

### Scénario 3 : Univers sans sous-catégorie

- **Étant donné** une catégorie racine sans sous-catégorie `active`
- **Quand** je survole son entrée
- **Alors** aucun panneau ne s'ouvre
- **Et** l'entrée reste un simple lien vers `/categorie/<slug>`

### Scénario 4 : Navigation au clavier (accessibilité)

- **Étant donné** un univers avec sous-catégories
- **Quand** je l'atteins au clavier (focus) et que je l'active (Entrée/Espace ou focus)
- **Alors** le panneau devient visible et ses liens sont focusables dans l'ordre
- **Et** `Échap` referme le panneau et rend le focus à l'entrée parente
- **Et** les entrées exposent `aria-expanded` reflétant l'état ouvert/fermé

### Scénario 5 : Accès données conforme à l'architecture

- **Étant donné** la règle « jamais de Prisma direct dans un composant »
- **Quand** le header récupère l'arbre de navigation
- **Alors** les données proviennent d'un **repository** (`categoryRepository`) exposé via
  un **view-model** sérialisable de `lib/catalog.ts` (racines + sous-catégories actives)
- **Et** le composant interactif (survol/clavier) est un composant client recevant ce
  view-model en props (aucune requête dans le client)

## Non-objectifs

- Menu **mobile** (drawer / hamburger) : l'icône menu reste un placeholder, hors scope.
- **3ᵉ niveau** de catégories : on s'arrête à racines → sous-catégories (2 niveaux).
- **Vignette / bloc promo** dans le panneau (`menuThumbnailKey`) : non, colonnes seules.
- Liens spéciaux existants (« Bons plans », « Premium », recherche) : inchangés.
- Administration des positions / visibilité des catégories : déjà couverte ailleurs.

## Contraintes

- Stack : Next.js App Router, React 19, Tailwind v4 (tokens CSS), TypeScript strict
  (`any` interdit). UI via primitives `@pharmacie/ui` (pas de markup natif réinventé).
- Repository pattern obligatoire ; logique de récupération dans `lib/catalog.ts`.
- Modèle **Silo** : aucune notion de tenant.
- Perf : une seule requête pour l'arbre (racines + enfants), pas de N+1.
- Accessibilité : `aria-expanded`, focus visible, fermeture `Échap`.

## Questions ouvertes

- 🚧 Position de « Tous les produits » : entrée catalogue réelle (catégorie racine) ou
  lien fixe en tête de barre ? Hypothèse : si une racine `tous-les-produits` existe en
  base elle est rendue comme les autres ; sinon on conserve un lien fixe en tête.
- 🚧 Largeur du panneau : pleine largeur du conteneur vs largeur calée sur l'univers.
  Hypothèse : panneau pleine largeur du `Container`, colonnes auto-réparties.
- 🚧 Ouverture au survol uniquement, ou clic aussi sur desktop ? Hypothèse : survol +
  focus clavier (pas de bascule au clic, qui suit le lien vers la catégorie racine).

## Références

- Composant cible : `apps/pharmacie-1/src/app/(storefront)/_components/site-header.tsx`
- Données : `packages/core/src/modules/catalog/category.repository.ts`,
  `apps/pharmacie-1/src/lib/catalog.ts` (`getRootCategories`)
- Modèle : `packages/core/prisma/schema.prisma` (`model Category`)
