# Story : SKU optionnel sur les déclinaisons

**Date** 2026-06-12 · **Statut** 🟡 · **Estimation** S

## Contexte

Le SKU d'une déclinaison (`ProductVariant.sku`) est aujourd'hui **obligatoire** (colonne
`String @unique`, champ requis dans le formulaire produit et validé côté server action). Or
toutes les déclinaisons n'ont pas forcément de référence interne à la création. On veut rendre
le SKU **facultatif**, exactement comme l'EAN.

## User Story

**En tant que** gestionnaire du catalogue,
**je veux** créer ou éditer une déclinaison **sans renseigner de SKU**,
**afin de** ne pas être bloqué quand la référence interne n'est pas (encore) connue.

## Critères d'acceptation

### Scénario 1 : création sans SKU

- **Étant donné** le formulaire produit
- **Quand** j'enregistre une déclinaison avec un prix mais **sans SKU**
- **Alors** la déclinaison est créée et persistée (SKU vide → **null** en base), sans erreur.

### Scénario 2 : le SKU reste unique quand il est renseigné

- **Étant donné** une déclinaison ayant déjà le SKU « ABC »
- **Quand** je saisis « ABC » sur une autre déclinaison
- **Alors** l'enregistrement est refusé (unicité conservée pour les SKU **non nuls**)
- **Et** plusieurs déclinaisons **sans** SKU coexistent sans conflit.

### Scénario 3 : édition — vider un SKU existant

- **Étant donné** une déclinaison ayant un SKU
- **Quand** j'efface le champ SKU et j'enregistre
- **Alors** le SKU devient null, sans erreur.

### Scénario 4 : le prix reste requis

- **Étant donné** le formulaire produit
- **Quand** j'enregistre une déclinaison **sans prix** (ou prix ≤ 0)
- **Alors** l'enregistrement est refusé (le prix reste obligatoire, inchangé).

## Non-objectifs

- Modifier l'EAN (déjà optionnel) ou tout autre champ du formulaire.
- Changer l'invariant « au moins 1 déclinaison par produit ».
- Refonte UI : on retire seulement la contrainte « requis » sur le SKU.

## Contraintes

- Stack : Prisma/PostgreSQL, Next.js. Migration nécessaire (`sku String? @unique`).
  PostgreSQL autorise plusieurs `NULL` dans un index unique → unicité garantie sur les valeurs
  renseignées.
- Repository pattern ; prix toujours en centimes ; ≥ 1 déclinaison par produit conservé.
- Le SKU reste **unique** lorsqu'il est renseigné.

## Questions ouvertes

- 🚧 Aucune (changement direct). Hypothèse : l'affichage en liste/admin tolère déjà un SKU
  absent ; à vérifier en `/plan` si un écran suppose un SKU non nul.

## Références

- Modèle : `packages/core/prisma/schema.prisma` (`ProductVariant.sku`)
- Domaine : `packages/core/src/modules/catalog/product.{service,repository}.ts`
- UI/action : `apps/pharmacie-1/src/app/admin/(protected)/produits/{variants-editor.tsx,_actions.ts}`
