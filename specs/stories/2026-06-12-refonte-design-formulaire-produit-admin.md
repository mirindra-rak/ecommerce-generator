# Story : Refonte du design du formulaire produit (back-office)

**Date** 2026-06-12 · **Statut** 🟡 · **Estimation** S

## Contexte

Le back-office admin a été modernisé (style « Able » : sidebar navy, topbar, cartes). Mais le
formulaire produit (`produit-form.tsx`, utilisé par `/admin/produits/new` et
`/admin/produits/[id]`) est resté en **inputs bruts empilés sur une colonne** (`fieldClass`
bordure slate), peu hiérarchisé et visuellement en décalage avec le reste de l'admin. On veut
un formulaire clair, structuré en sections, aligné au design system `@pharmacie/ui`.

## User Story

**En tant que** gestionnaire du catalogue,
**je veux** un formulaire produit structuré et soigné,
**afin de** saisir et modifier une fiche produit rapidement, sans me perdre dans une longue
liste de champs indifférenciés.

## Critères d'acceptation

### Scénario 1 : structure en sections lisibles

- **Étant donné** la page de création ou d'édition d'un produit
- **Quand** je l'affiche
- **Alors** le formulaire est découpé en **blocs visuellement distincts** (cartes/sections
  avec titre) : `Identité` (nom, actif, type, marque, catégorie, description),
  `Déclinaison par défaut` (SKU, EAN, prix, stock), `Attributs descriptifs` (INCI,
  précautions), `Filtres / Caractéristiques` (facettes)
- **Et** chaque bloc a un intitulé clair et une brève aide contextuelle si pertinent.

### Scénario 2 : alignement design system

- **Étant donné** le formulaire refondu
- **Quand** j'inspecte ses champs
- **Alors** les champs texte utilisent les primitives `@pharmacie/ui` (ex. `Input`) plutôt
  qu'un `fieldClass` ad hoc, et toutes les couleurs/bordures/rayons proviennent des **tokens**
  (`border-line`, `surface`, `foreground`, `muted`, rayons `rounded-sm`…), cohérents avec le
  shell admin et les pages catégories/marques.

### Scénario 3 : iso-fonctionnel (aucune régression)

- **Étant donné** le formulaire refondu
- **Quand** je crée puis édite un produit
- **Alors** ce sont **exactement les mêmes champs** qu'avant (nom, actif, type, marque,
  catégorie, description, SKU, EAN, prix en €, stock, INCI, précautions, facettes)
- **Et** la soumission persiste les mêmes données (produit + déclinaison par défaut + valeurs
  de facettes), avec la même validation et les mêmes messages d'erreur.

### Scénario 4 : mise en page responsive

- **Étant donné** un grand écran
- **Quand** j'affiche le formulaire
- **Alors** les champs courts (type, marque, catégorie / SKU, EAN, prix, stock) se répartissent
  sur **plusieurs colonnes**, et la mise en page repasse en **une colonne** sur mobile.

### Scénario 5 : actions claires

- **Étant donné** le formulaire
- **Quand** je veux l'enregistrer ou annuler
- **Alors** les actions « Enregistrer » (primaire, `Button` DS) et « Annuler » sont visibles
  et accessibles, avec l'état « Enregistrement… » pendant la soumission, et l'éventuel message
  d'erreur affiché en évidence.

## Non-objectifs

- Aucun changement fonctionnel : pas de nouveau champ, pas de modification du modèle ni des
  server actions / services de domaine.
- Pas d'éditeur multi-variantes ni d'upload média (hors périmètre, tranches dédiées).
- Pas de refonte des autres écrans admin (catégories, marques, dashboard).
- Pas d'introduction de dépendance UI tierce.

## Contraintes

- Stack : Next.js App Router, React 19, Tailwind v4 (tokens CSS-first), `@pharmacie/ui`.
- Réutiliser les primitives existantes (`Input`, `Button`…) ; étendre le design system si une
  primitive de formulaire manque (ex. `Select`, `Textarea`, `Field`/`FormRow`) plutôt que du
  markup natif stylé à la main.
- `produit-form.tsx` reste un Client Component (`useActionState`) ; signatures de props et
  noms de champs (`name="…"`) inchangés.

## Questions ouvertes

- 🚧 Layout cible supposé : **sections-cartes empilées pleine largeur** avec grilles internes
  multi-colonnes (hypothèse retenue faute d'intention visuelle précise). À confirmer si une
  disposition à colonne latérale « Publication/État » est souhaitée.
- 🚧 Création de primitives de formulaire DS (`Select`, `Textarea`, `Field`) : à acter en
  `/plan` (réutilisables ensuite par les formulaires catégories/marques).

## Références

- Composant cible : `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx`
- Style admin de référence : `apps/pharmacie-1/src/app/admin/(protected)/_components/admin-shell.tsx`
