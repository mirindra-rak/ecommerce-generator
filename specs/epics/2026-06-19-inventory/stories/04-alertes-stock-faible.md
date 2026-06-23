# Story 04 : Alertes stock faible (email)

**Epic parent** : [Inventory — Stock & disponibilité](../epic.md)

**Date** : 2026-06-19 · **Statut** 🟢 · **Estimation** : S

## Contexte

Le service inventory (story 02) gère les ajustements de stock et connaît le seuil
d'alerte de chaque variant. Il reste à brancher la notification : quand un
ajustement fait passer le stock sous le seuil configuré, un email d'alerte est
envoyé à l'opérateur.

## User Story

**En tant qu'** opérateur du back-office,
**je veux** recevoir un email quand le stock d'un produit passe sous le seuil d'alerte,
**afin de** pouvoir réapprovisionner avant la rupture.

## Critères d'acceptation

### Scénario 1 : Déclenchement de l'alerte

- **Étant donné** un variant avec `lowStockAlert: true`, `lowStockThreshold: 10`, stock = 12
- **Quand** un ajustement de `delta: -5` est appliqué (stock passe à 7)
- **Alors** une alerte stock faible est déclenchée
- **Et** le stock (7) est inférieur au seuil (10)

### Scénario 2 : Pas d'alerte si seuil non franchi

- **Étant donné** un variant avec `lowStockAlert: true`, `lowStockThreshold: 10`, stock = 20
- **Quand** un ajustement de `delta: -5` est appliqué (stock passe à 15)
- **Alors** aucune alerte n'est déclenchée (stock reste au-dessus du seuil)

### Scénario 3 : Pas d'alerte si désactivée

- **Étant donné** un variant avec `lowStockAlert: false`, `lowStockThreshold: 10`, stock = 12
- **Quand** un ajustement de `delta: -5` est appliqué (stock passe à 7)
- **Alors** aucune alerte n'est déclenchée (alerte désactivée)

### Scénario 4 : Pas d'alerte si déjà sous le seuil

- **Étant donné** un variant avec `lowStockAlert: true`, `lowStockThreshold: 10`, stock = 5
- **Quand** un ajustement de `delta: -2` est appliqué (stock passe à 3)
- **Alors** aucune alerte n'est déclenchée (le stock était déjà sous le seuil —
  l'alerte ne se déclenche qu'au **franchissement**)

### Scénario 5 : Contenu de l'email

- **Étant donné** une alerte déclenchée pour le variant SKU « DOLIPRANE-1000-X30 »
  du produit « Doliprane 1000mg »
- **Quand** l'email est envoyé
- **Alors** il contient : nom du produit, identifiant du variant (SKU ou volume),
  stock actuel, seuil configuré
- **Et** le destinataire est l'adresse configurée dans les settings du site 🚧

### Scénario 6 : Test unitaire du déclenchement

- **Étant donné** le service inventory
- **Quand** les tests sont lancés
- **Alors** les scénarios 1 à 4 sont couverts (le service appelle un port
  `notifyLowStock` injectable, testé avec un mock)

## Non-objectifs

- Pas de tableau de bord des alertes dans l'admin (la notification est email-only).
- Pas de configuration du destinataire dans l'admin — 🚧 on utilise une variable
  d'environnement ou un setting site-level pour l'adresse email.
- Pas de throttle / debounce des alertes (une alerte par franchissement suffit).

## Contraintes

- Le déclenchement de l'alerte est un **effet de bord** de `adjust()`, pas un
  cron ou un job asynchrone. Le service détecte le franchissement de seuil et
  appelle le port de notification.
- L'envoi d'email utilise le module `email` existant (ou un port injectable si le
  module n'est pas encore implémenté — 🚧 à vérifier).
- Le service inventory reste testable unitairement : l'envoi d'email est derrière
  une interface injectable (Strategy / Port pattern).
