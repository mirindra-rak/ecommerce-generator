# Story : Logique de domaine catalogue (services)

**Epic parent** : [Catalogue](../epic.md)
**Date** : 2026-06-11 · **Statut** 🟡 · **Estimation** S

## Contexte

Au-dessus des repositories (story 01), exposer une logique de domaine réutilisable par
l'admin et le storefront : résolution des variantes, prix d'affichage, règles
d'« affichabilité ». Ces services encapsulent les règles métier hors des routes.

## User Story

**En tant que** développeur, **je veux** des services de domaine catalogue,
**afin de** réutiliser les règles produit (prix affiché, disponibilité d'affichage,
résolution de variante) sans les redévelopper dans chaque écran.

## Critères d'acceptation

### Scénario 1 : Prix d'affichage HT (fourchette)

- **Étant donné** un produit à variantes de prix HT 1500 et 2500 (centimes)
- **Quand** on demande le prix d'affichage
- **Alors** le service retourne `{ min: 1500, max: 2500 }`
- **Et** pour un produit mono-variante, `min === max`

### Scénario 2 : Produit affichable

- **Étant donné** un produit `active = false` **ou** sans aucune variante
- **Quand** on évalue son affichabilité storefront
- **Alors** le service le marque **non affichable**
- **Et** un produit `active = true` avec ≥ 1 variante est **affichable**

### Scénario 3 : Résolution d'une variante par sélection d'options

- **Étant donné** un produit multi-axes et une sélection { Contenance: "100 ml" }
- **Quand** on résout la variante
- **Alors** le service retourne l'unique variante correspondante
- **Et** si la sélection est incomplète ou sans correspondance, il retourne `null`
  (jamais d'erreur non gérée)

### Scénario 4 : Pas d'accès direct à Prisma

- **Étant donné** un service de domaine
- **Quand** il a besoin de données
- **Alors** il appelle un repository (story 01), jamais le client Prisma directement

## Non-objectifs

- Calcul du TTC / TVA (→ `pricing`), promotions (→ `promotions`).
- Disponibilité basée sur stock réel/réservé (→ `inventory`).

## Contraintes

- Services purs et testables unitairement (Vitest), repositories mockables.
- Localisation : `packages/core/src/modules/catalog` (services de domaine).

## Questions ouvertes

- 🚧 « Affichable » doit-il aussi exiger stock > 0 ? Hypothèse : non à ce stade
  (la disponibilité fine relève d'`inventory`), on affiche en « rupture » plus tard.
