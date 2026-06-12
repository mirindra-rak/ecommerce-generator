# Story : Éditeur multi-déclinaisons (back-office produit)

**Date** 2026-06-12 · **Statut** 🟡 · **Estimation** L

## Contexte

Le formulaire produit ne gère aujourd'hui qu'**une seule déclinaison** (la déclinaison par
défaut : `variants[0]`). Or un même produit se vend souvent en plusieurs formats (ex. crème
50 ml et 100 ml), chacun avec son prix, code-barres et stock. Le modèle supporte déjà
plusieurs `ProductVariant` par produit ; il manque l'UI d'édition et les services d'écriture.

On retient l'**Option A** (simple) : chaque déclinaison porte une **étiquette libre courte**
(réutilise le champ `volume` déjà présent — ex. « 50 ml », « Lavande ») + SKU/EAN/prix/stock.
**Aucun axe nommé à saisir** (le système multi-axes `ProductOption` reste hors scope).

## User Story

**En tant que** gestionnaire du catalogue,
**je veux** ajouter, modifier et supprimer plusieurs déclinaisons d'un produit,
**afin de** vendre le même produit en plusieurs formats avec prix, code-barres et stock
propres à chacun.

## Critères d'acceptation

### Scénario 1 : fiche adaptative

- **Étant donné** un produit
- **Quand** je l'édite
- **Alors** s'il a **1 déclinaison**, j'ai la vue « simple » actuelle (champs SKU/EAN/prix/stock)
- **Et** s'il a **≥ 2 déclinaisons**, j'ai un **tableau** : une ligne par déclinaison avec
  étiquette, SKU, EAN, prix (€), stock.

### Scénario 2 : ajouter une déclinaison

- **Étant donné** le formulaire produit
- **Quand** j'ajoute une déclinaison (étiquette + SKU + prix, EAN/stock optionnels) et j'enregistre
- **Alors** une nouvelle `ProductVariant` est créée et rattachée au produit
- **Et** la fiche bascule en vue tableau dès la 2ᵉ déclinaison.

### Scénario 3 : modifier / supprimer

- **Étant donné** un produit à plusieurs déclinaisons
- **Quand** je modifie une ligne (prix, stock, étiquette…) ou j'en supprime une, puis j'enregistre
- **Alors** les changements sont persistés (mise à jour / suppression de la `ProductVariant`)
- **Et** je **ne peux pas supprimer la dernière** déclinaison (invariant « tout est déclinaison »).

### Scénario 4 : unicité SKU / EAN

- **Étant donné** l'édition des déclinaisons
- **Quand** je saisis un SKU ou un EAN déjà utilisé (par une autre déclinaison, du même produit
  ou d'un autre)
- **Alors** l'enregistrement est refusé avec un message clair, sans perte de saisie.

### Scénario 5 : non-régression produit simple

- **Étant donné** un produit à 1 déclinaison
- **Quand** je l'édite et l'enregistre sans rien ajouter
- **Alors** le comportement est **identique à aujourd'hui** (mêmes champs, même persistance).

## Non-objectifs

- Axes nommés / multi-axes (`ProductOption`/`ProductOptionValue`) — Option B, hors scope.
- Sélecteur de déclinaison côté **storefront** (page produit / story 06).
- **Regroupement** (transférer un produit en déclinaison d'un autre) — ticket suivant.
- Upload média ; génération automatique de toutes les combinaisons.
- Changement du modèle de données (déjà en place).

## Contraintes

- Modèle inchangé : réutilise `ProductVariant` (dont `volume` comme étiquette) ; pas de
  migration.
- Repository pattern (aucun Prisma hors repository) ; logique dans un service de domaine.
- Prix en **centimes HT** en base, saisi/affiché en euros.
- `sku` et `ean` **uniques** sur la déclinaison ; au moins **1 déclinaison** par produit.
- Services d'écriture à ajouter (création/maj/suppression d'un ensemble de déclinaisons) ;
  aujourd'hui seuls `createWithDefaultVariant` et `updateVariant` existent.

## Questions ouvertes

- 🚧 Édition dynamique des lignes (ajout/suppression) dans un formulaire à server action :
  liste côté client + un seul submit, vs actions par ligne. À trancher en `/plan`.
- 🚧 Libellé de l'en-tête d'étiquette : « Déclinaison » / « Contenance » / « Format ». Défaut
  proposé : « Déclinaison ».

## Références

- Composant cible : `apps/pharmacie-1/src/app/admin/(protected)/produits/produit-form.tsx`
- Domaine : `packages/core/src/modules/catalog/product.{service,repository}.ts`
