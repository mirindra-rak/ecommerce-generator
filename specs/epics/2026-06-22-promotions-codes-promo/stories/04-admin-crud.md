# Story 04 : Admin CRUD Catalog Price Rules

**Date** 2026-06-22 · **Statut** 🟡 · **Estimation** M
**Epic parent** : [Catalog Price Rules](../epic.md)

## Contexte

Le schéma et le service existent (stories 01-02). L'admin a besoin d'une interface pour créer, modifier, activer/désactiver et supprimer les règles de prix catalogue.

## User Story

**En tant qu'** administrateur de la pharmacie, **je veux** gérer les Catalog Price Rules depuis le back-office, **afin de** créer et piloter les promotions sur mon catalogue.

## Critères d'acceptation

### Scénario 1 : Liste des règles

- **Étant donné** que je suis connecté comme admin
- **Quand** j'accède à la page Promotions
- **Alors** je vois la liste des règles avec : nom, statut (active/inactive/planifiée/expirée), type de réduction, ciblage, dates, priorité

### Scénario 2 : Création d'une règle

- **Étant donné** que je clique sur "Nouvelle règle"
- **Quand** je remplis le formulaire (nom, type de réduction, valeur, ciblage, dates, priorité, label client, prix plancher)
- **Alors** la règle est créée et apparaît dans la liste

### Scénario 3 : Sélection des cibles

- **Étant donné** que je sélectionne le ciblage "Catégorie"
- **Quand** le sélecteur de cibles s'affiche
- **Alors** je peux rechercher et sélectionner une ou plusieurs catégories parmi celles existantes

### Scénario 4 : Validation du formulaire

- **Étant donné** que je crée une règle pourcentage avec une valeur > 10000 (100%)
- **Quand** je soumets le formulaire
- **Alors** une erreur de validation s'affiche côté client ET serveur

### Scénario 5 : Activation / désactivation

- **Étant donné** une règle active dans la liste
- **Quand** je clique sur le toggle d'activation
- **Alors** la règle passe inactive et les prix catalogue reviennent à la normale

### Scénario 6 : Modification

- **Étant donné** une règle existante
- **Quand** je modifie la valeur de réduction et je sauvegarde
- **Alors** la modification est persistée et les prix du storefront sont mis à jour

### Scénario 7 : Suppression

- **Étant donné** une règle existante
- **Quand** je clique sur supprimer et confirme
- **Alors** la règle est supprimée définitivement

## Non-objectifs

- Prévisualisation des produits impactés avant sauvegarde
- Historique des modifications d'une règle
- Import/export CSV des règles
- Duplication d'une règle

## Contraintes

- Validation Zod côté serveur (même schéma que les types, réutilisé côté client)
- Server Actions Next.js pour les mutations
- Cohérent avec le style des pages admin existantes (produits, catégories, marques, facettes)
- Le sélecteur de cibles (catégories/produits/marques) réutilise les repositories existants du module catalog
