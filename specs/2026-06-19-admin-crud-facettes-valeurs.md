# Story : Admin CRUD Facettes & Valeurs

**2026-06-19** · **Statut** 🟡 Draft · **Estimation** M (2-3 jours)

## Contexte

Les facettes (Nature de produit, Conditionnement, Spécificité, Indication/CI) et leurs valeurs sont aujourd'hui injectées uniquement par le seed technique à l'implantation. Le pharmacien ne peut ni ajouter un nouvel axe de filtrage, ni renommer ou compléter les valeurs existantes sans intervention développeur. Pour garantir l'autonomie post-déploiement, il faut une page d'administration dédiée.

## User Story

**En tant que** pharmacien administrateur,
**je veux** gérer mes facettes de filtrage et leurs valeurs depuis le back-office,
**afin de** adapter les critères de filtrage de ma boutique sans intervention technique.

## Critères d'acceptation

### Scénario 1 : Lister les facettes

- **Étant donné** un administrateur connecté
- **Quand** il accède à `/admin/facettes`
- **Alors** il voit la liste des facettes triées par position, chacune affichant son nom, son code, le nombre de valeurs et le nombre de produits associés

### Scénario 2 : Créer une facette

- **Étant donné** un administrateur sur la page facettes
- **Quand** il clique « Ajouter une facette », saisit un nom (ex : « Forme galénique ») et valide
- **Alors** la facette est créée avec un code auto-généré (slugifié depuis le nom), position = dernier rang + 1, et apparaît dans la liste

### Scénario 3 : Renommer une facette

- **Étant donné** une facette existante « Spécificité »
- **Quand** l'administrateur modifie le nom en « Spécificité / Engagement »
- **Alors** le nom est mis à jour ; le code reste inchangé (il sert de clé stable pour les filtres URL)

### Scénario 4 : Réordonner les facettes

- **Étant donné** 4 facettes affichées
- **Quand** l'administrateur déplace « Conditionnement » en première position (drag & drop ou boutons haut/bas)
- **Alors** les positions sont mises à jour et l'ordre est reflété sur la boutique (sidebar filtres) et dans le formulaire produit

### Scénario 5 : Supprimer une facette

- **Étant donné** une facette « Indication/CI » associée à 12 produits
- **Quand** l'administrateur clique « Supprimer » et confirme
- **Alors** la facette et toutes ses valeurs sont supprimées (cascade), les liaisons produit–valeur sont nettoyées, et la facette disparaît des filtres boutique

### Scénario 6 : Gérer les valeurs d'une facette (inline)

- **Étant donné** l'administrateur sur la page détail/édition d'une facette
- **Quand** il voit la section « Valeurs »
- **Alors** il peut :
  - **Ajouter** une valeur (saisir un label → code auto-slugifié, position = dernier + 1)
  - **Renommer** une valeur (modifier le label, code inchangé)
  - **Réordonner** les valeurs (drag & drop ou boutons)
  - **Supprimer** une valeur (avec confirmation ; les liaisons produit sont nettoyées)

### Scénario 7 : Unicité du code

- **Étant donné** une facette avec le code « nature »
- **Quand** l'administrateur tente de créer une autre facette qui produirait le même code
- **Alors** un message d'erreur explicite s'affiche (pas de crash serveur)

### Scénario 8 : Accessibilité navigation

- **Étant donné** la sidebar admin
- **Quand** l'administrateur regarde le menu
- **Alors** un lien « Facettes » (ou « Filtres ») apparaît, groupé avec Catégories / Marques / Produits dans la section catalogue

## Non-objectifs

- Facettes conditionnelles par catégorie (toutes les facettes s'appliquent à tous les produits)
- Facettes avec types de valeur avancés (plage numérique, couleur, booléen) — on reste en label texte
- Traduction i18n des noms de facettes et valeurs (le pharmacien saisit dans sa langue)
- Import/export CSV de facettes

## Contraintes

- **Repository pattern** : tout accès Prisma via `facetRepository` dans `packages/core`
- **Server Actions** Next.js (même pattern que catégories/marques/produits)
- **Hook `useUnsavedChanges`** sur le formulaire de facette
- Le code (facette et valeur) est **immutable après création** (clé stable pour les URLs de filtrage)
- Suppression cascade : `onDelete: Cascade` déjà en place sur `FacetValue` → `Facet` ; vérifier que `ProductFacetValue` suit
- Réordonnement : champ `position` existant sur `Facet` et `FacetValue`
- Traductions FR/EN pour toutes les clés admin

## Questions ouvertes

- 🚧 UX réordonnement : drag & drop natif (comme `MultiImageUpload`) ou boutons ↑/↓ ? Hypothèse : boutons ↑/↓ pour commencer (plus simple, accessible clavier), drag & drop en amélioration future.
