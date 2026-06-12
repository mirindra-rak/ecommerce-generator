# Story : Attributs produit flexibles (jsonb + attribute-sets)

**Date** : 2026-06-12 · **Statut** 🟡 · **Estimation** M

## Contexte

Aujourd'hui les attributs descriptifs propres à la parapharmacie (`inci`, `precautions`,
`productType` enum) sont des colonnes en dur sur `Product` → tout nouveau vertical
imposerait une migration Prisma. Cette story pose **la couture** (niveau 3, option A) :
un champ `attributes` jsonb + un `productType` ouvert + une validation Zod par type, **en
le dogfoodant sur la parapharmacie**. Hors périmètre : l'admin dynamique (option B).

## User Story

**En tant que** développeur de la plateforme, **je veux** que les attributs descriptifs
d'un produit vivent dans un champ flexible validé par type, **afin d'**ajouter un nouveau
vertical e-commerce sans migration de schéma.

## Critères d'acceptation

### Scénario 1 : Schéma ouvert

- **Étant donné** le schéma Prisma
- **Quand** la migration est appliquée
- **Alors** `Product` porte `attributes Json @default("{}")` et `productType String`
  (plus d'enum Prisma `ProductType`)
- **Et** les colonnes `inci` et `precautions` sont **supprimées** (déplacées dans
  `attributes`)
- **Et** `ean` **reste** une colonne (identifiant unique indexé), tout comme prix/stock/
  sku/slug (champs commerce **jamais** dans le jsonb)

### Scénario 2 : Registre d'attribute-sets (config TS)

- **Étant donné** un registre central `attribute-sets` qui mappe un `productType` à un
  schéma Zod
- **Quand** on demande le schéma d'un type (`COSMETIC`, `SUPPLEMENT`, `DEVICE`, `OTHER`)
- **Alors** il retourne le schéma Zod correspondant (parapharmacie : `inci?`,
  `precautions?`, extensible)
- **Et** un type inconnu retombe sur un schéma par défaut permissif (objet vide/passthrough)

### Scénario 3 : Validation à l'écriture

- **Étant donné** la création/mise à jour d'un produit via le service catalog
- **Quand** les `attributes` ne respectent pas le schéma du `productType`
- **Alors** l'opération est rejetée avec une erreur métier lisible
- **Et** des `attributes` valides sont persistés tels quels

### Scénario 4 : Lecture typée

- **Étant donné** un produit chargé
- **Quand** on lit ses attributs via un helper de domaine
- **Alors** il retourne les attributs **parsés/typés** selon le `productType`
  (jamais de `any` propagé)

### Scénario 5 : Fiche produit storefront inchangée pour l'utilisateur

- **Étant donné** la fiche `/produit/[slug]`
- **Quand** elle s'affiche
- **Alors** `inci` et `precautions` sont lus depuis `attributes` (plus depuis des colonnes)
- **Et** le rendu visible reste identique (mêmes infos affichées)

### Scénario 6 : Ajout d'un type sans migration

- **Étant donné** un nouveau `productType` (ex. `"WELLNESS"`) + son attribute-set Zod
- **Quand** on l'ajoute au registre
- **Alors** aucune migration Prisma n'est nécessaire pour créer des produits de ce type

## Non-objectifs

- **Admin dynamique / form-builder** par attribute-set (option B) — ultérieur.
- **Recherche/facettes par attribut** (→ module `search`, lot 4.4) ; index GIN fin remis
  à ce moment.
- **Multi-tenant / Pool** : la flexibilité des attributs ne touche pas le Silo.
- Migration d'un **vrai 2ᵉ vertical** : on prépare la couture, on n'ajoute pas de vertical.

## Contraintes

- `jsonb` réservé aux attributs **descriptifs** ; prix (centimes), stock, sku, slug, ean
  restent des **colonnes typées**.
- Validation **centralisée dans `core`** (services catalog) ; accès via Repository.
- **Zod** ajouté comme dépendance de `@pharmacie/core`.
- Mettre à jour le **seed** (`prisma/seed.ts`) : `inci`/`precautions` dans `attributes`,
  `productType` en chaîne.
- Modèle **Silo** inchangé (aucun `tenant_id`).

## Questions ouvertes

- 🚧 `ean` : confirmé **colonne** (unique, indexé, clé d'import migration). À garder hors jsonb.
- 🚧 Faut-il un **index GIN** sur `attributes` dès maintenant ? Hypothèse : non (pas de
  requête par attribut tant que `search` n'est pas là) — à ajouter avec le lot 4.4.
- 🚧 Helper de lecture : exposer les attributs typés **fusionnés** au produit, ou via un
  appel séparé `getAttributes(product)` ? Hypothèse : helper séparé, pour garder le type
  Prisma `Product` brut intact. À acter en `/plan`.

## Références

- Stratégie d'adaptabilité (niveaux 1/2/3) discutée avec l'architecte — option A « couture ».
- Schéma actuel : `packages/core/prisma/schema.prisma` (Product).
- Pattern « string ouvert + union TS » déjà utilisé pour `Role` (`modules/auth/role.ts`).
