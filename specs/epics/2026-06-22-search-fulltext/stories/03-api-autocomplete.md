# Story 03 : API route + autocomplete endpoint

**Epic parent** : [Recherche full-text PostgreSQL](../epic.md)
**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : S (~0.5 jour)

## Contexte

Le repository et le service de recherche sont en place (story 02). Il faut exposer
deux endpoints HTTP pour le storefront : un endpoint de recherche complète (utilisé par
la page résultats) et un endpoint d'autocomplete léger (utilisé par le composant
SearchBox du header).

## User Story

**En tant que** storefront, **je veux** deux API routes pour la recherche, **afin de**
alimenter le composant autocomplete et la page de résultats.

## Critères d'acceptation

### Scénario 1 : Endpoint de recherche complète

- **Étant donné** l'API route `GET /api/storefront/search`
- **Quand** on appelle `?q=doliprane&nature=spray&sort=price-asc&page=2`
- **Alors** :
  - Le service de recherche est appelé avec query, filters, sort, page
  - La réponse JSON contient : `products` (ProductCardVM[]), `facets`
    (FilterFacetVM[]), `total`, `totalPages`, `page`, `query`
  - Le status HTTP est 200

### Scénario 2 : Endpoint autocomplete

- **Étant donné** l'API route `GET /api/storefront/search/suggest`
- **Quand** on appelle `?q=doli`
- **Alors** :
  - Le service retourne max 8 suggestions (produits matchant le préfixe)
  - Chaque suggestion contient : `name`, `slug`, `brandName`, `priceLabel`,
    `imageUrl` (première image du produit, ou null)
  - La réponse est optimisée pour la vitesse (pas de facettes, pas de pagination)
  - Le status HTTP est 200

### Scénario 3 : Recherche préfixe pour l'autocomplete

- **Étant donné** un produit « Doliprane 1000mg »
- **Quand** on cherche via suggest `?q=doli`
- **Alors** le produit est retourné (le dernier mot de la saisie est traité comme
  préfixe via l'opérateur `:*` de tsquery)

### Scénario 4 : Query vide ou trop courte

- **Étant donné** un appel sans `q` ou avec `q` de moins de 2 caractères
- **Quand** on appelle `/api/storefront/search?q=` ou `?q=a`
- **Alors** :
  - L'endpoint search retourne une liste vide (pas d'erreur)
  - L'endpoint suggest retourne un tableau vide

### Scénario 5 : Validation et sécurité

- **Étant donné** une requête avec des caractères spéciaux (`q=<script>alert</script>`)
- **Quand** l'API reçoit la requête
- **Alors** :
  - Le terme est sanitizé (caractères spéciaux tsquery échappés)
  - Pas d'injection SQL possible (requêtes paramétrées)
  - Pas de XSS dans la réponse JSON

## Non-objectifs

- Pas de rate limiting (itération ultérieure).
- Pas de cache HTTP (Cache-Control) — à évaluer après mesures de performance.
- Pas d'endpoint admin de recherche (l'admin utilise ses propres filtres de table).

## Contraintes

- Les routes vivent dans `apps/pharmacie-1/src/app/api/storefront/search/`.
- Runtime `nodejs` (pas edge) pour la compatibilité Prisma.
- Les routes appellent le service via la couche data (`apps/pharmacie-1/src/lib/`) —
  pas d'import direct du repository.
- La sanitization du query doit gérer les opérateurs tsquery (`&`, `|`, `!`, `:*`)
  pour éviter les erreurs de syntaxe PostgreSQL.
