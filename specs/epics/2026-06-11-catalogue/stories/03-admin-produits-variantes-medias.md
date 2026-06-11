# Story : Admin — produits, variantes & médias

**Epic parent** : [Catalogue](../epic.md)
**Date** : 2026-06-11 · **Statut** 🟡 · **Estimation** L

## Contexte

Permettre à l'équipe pharmacie de gérer le catalogue depuis le back-office : créer et
éditer des produits, leurs variantes multi-axes, et leurs médias (upload vers MinIO).

## User Story

**En tant que** gestionnaire de la pharmacie, **je veux** créer et modifier des
produits avec variantes et photos, **afin de** tenir le catalogue à jour sans
intervention technique.

## Critères d'acceptation

### Scénario 1 : Créer un produit

- **Étant donné** le back-office
- **Quand** je saisis nom, description, type de produit, marque (optionnelle),
  catégorie, EAN, INCI, précautions et que je valide
- **Alors** le produit est créé avec un `slug` auto-généré (modifiable)
- **Et** un EAN ou slug déjà utilisé affiche une erreur de validation claire

### Scénario 2 : Gérer les options et variantes

- **Étant donné** un produit en édition
- **Quand** j'ajoute une option « Contenance » avec valeurs « 50 ml » et « 100 ml »
- **Alors** je peux créer une variante par valeur, chacune avec son `sku`, prix HT et
  stock initial
- **Et** un `sku` dupliqué est refusé

### Scénario 3 : Upload de médias

- **Étant donné** un produit en édition
- **Quand** j'uploade une ou plusieurs images
- **Alors** chaque fichier est stocké dans MinIO (S3) et un `ProductMedia` est créé
  avec sa `storageKey`, son `alt` et sa `position`
- **Et** je peux réordonner et supprimer les médias

### Scénario 4 : Modifier / désactiver un produit

- **Étant donné** un produit existant
- **Quand** je l'édite ou le passe `active = false`
- **Alors** les changements sont persistés et le produit inactif n'apparaît plus côté
  storefront (cf. story 02/05)

### Scénario 5 : Accès protégé

- **Étant donné** un utilisateur non authentifié en admin
- **Quand** il tente d'accéder aux écrans catalogue
- **Alors** l'accès est refusé (auth admin — socle lot 5.1) 🚧

## Non-objectifs

- Retouche d'image / recadrage ; import en masse (→ lot 10 migration).
- Gestion des catégories & marques (→ story 04).
- RBAC fin par rôle (socle admin lot 5.1).

## Contraintes

- Écrans dans `apps/pharmacie-1/src/app/admin` ; mutations via services de domaine +
  repositories (jamais Prisma direct depuis la route).
- Upload : client S3 (MinIO) côté serveur (runtime `nodejs`) ; validation type/poids.
- Validation des entrées côté serveur (schéma) + messages d'erreur explicites.

## Questions ouvertes

- 🚧 Dépend du **socle admin (lot 5.1)** : auth, layout, permissions. À cadrer/ordonner
  avant cette story (ou stub d'auth temporaire).
- 🚧 Génération des miniatures (responsive) : maintenant via `sharp`, ou plus tard ?
  Hypothèse : plus tard (perf, lot 8.6).
