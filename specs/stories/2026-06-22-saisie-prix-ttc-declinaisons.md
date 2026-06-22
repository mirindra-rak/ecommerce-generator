# Story : Saisie bidirectionnelle HT ↔ TTC dans l'éditeur de déclinaisons

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : S (~0.5-1 jour)

## Contexte

L'éditeur de déclinaisons produit (back-office) ne propose qu'un champ « Prix HT (€) ».
Or le vendeur qui intègre ses produits connaît souvent le prix TTC affiché en rayon, pas
le HT. Il doit aujourd'hui sortir une calculette pour retrouver le HT à saisir. Ajouter
un champ TTC synchronisé avec le HT — piloté par le taux de TVA sélectionné sur le
produit — supprime cette friction.

## User Story

**En tant qu'** administrateur de la pharmacie,
**je veux** pouvoir saisir indifféremment le prix HT ou le prix TTC d'une déclinaison,
**afin de** ne pas avoir à calculer manuellement la conversion selon le taux de TVA.

## Critères d'acceptation

### Scénario 1 : Saisie du HT → recalcul du TTC

- **Étant donné** un produit avec un taux de TVA à 20 % sélectionné
- **Quand** je saisis « 12.50 » dans le champ « Prix HT (€) »
- **Alors** le champ « Prix TTC (€) » affiche « 15.00 » (12.50 × 1.20)

### Scénario 2 : Saisie du TTC → recalcul du HT

- **Étant donné** un produit avec un taux de TVA à 20 % sélectionné
- **Quand** je saisis « 15.00 » dans le champ « Prix TTC (€) »
- **Alors** le champ « Prix HT (€) » affiche « 12.50 » (15.00 / 1.20)

### Scénario 3 : Changement du taux de TVA → recalcul du TTC

- **Étant donné** une déclinaison avec un prix HT de « 10.00 » et un taux à 20 %
  (TTC affiché : « 12.00 »)
- **Quand** je change le taux de TVA du produit à 5,5 %
- **Alors** le champ TTC de chaque déclinaison se met à jour (« 10.55 »),
  le champ HT reste inchangé

### Scénario 4 : Arrondi au centime

- **Étant donné** un taux de TVA à 5,5 %
- **Quand** je saisis un TTC de « 9.99 »
- **Alors** le HT calculé est arrondi au centime le plus proche (affiché « 9.47 »),
  et un re-calcul HT → TTC redonne « 9.99 » ou un centime d'écart au maximum

### Scénario 5 : Chargement d'un produit existant

- **Étant donné** un produit existant avec des déclinaisons en base
- **Quand** j'ouvre le formulaire d'édition
- **Alors** les deux champs HT et TTC sont pré-remplis correctement
  selon le taux de TVA du produit

### Scénario 6 : Champ vide

- **Étant donné** un champ HT vide
- **Alors** le champ TTC est également vide (pas de « 0.00 » parasite)

## Non-objectifs

- **Pas de stockage du TTC en base** : le prix de référence reste `priceExclTax`
  (centimes, entier). Le TTC est un champ dérivé côté UI uniquement.
- **Pas de modification du noyau pricing** (`pricing.service.ts`) : la conversion
  inverse (TTC → HT) est un calcul UI local, pas une règle métier à centraliser.
- **Pas de prix TTC par déclinaison différent du taux produit** : le taux de TVA
  reste porté par le produit, pas par la déclinaison.
- **Pas de gestion multi-devise** : tout reste en EUR.

## Contraintes

- Le calcul de conversion utilise la même logique d'arrondi que le noyau pricing
  (arrondi au centime, `Math.round`).
- Le taux de TVA est en basis points (`rateBps`) : la conversion TTC → HT est
  `Math.round(ttcCents * 10000 / (10000 + rateBps))`.
- Le composant `VariantsEditor` reçoit le `rateBps` du taux de TVA sélectionné
  depuis le formulaire parent (`ProductForm`).
- Supporter les formats de saisie décimaux FR (virgule) et EN (point), comme
  le champ HT actuel.
- Pas de migration Prisma, pas de changement de schema.

## Questions ouvertes

- 🚧 Disposition visuelle : les deux champs côte à côte sur la même ligne,
  ou HT au-dessus et TTC en dessous ? Hypothèse retenue : côte à côte, avec
  labels « Prix HT (€) » et « Prix TTC (€) ».
