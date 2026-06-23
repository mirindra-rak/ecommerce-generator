# Story : Moteur de templates + template alerte stock faible

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : S (~0.5 jour)
**Epic parent** : [Email transactionnel](../epic.md)

## Contexte

Le service d'envoi (story 01) accepte `{ to, subject, html }`. On ajoute un moteur
de templates pour que les modules appelants passent un nom de template + des données,
sans construire eux-mêmes le HTML.

## User Story

**En tant que** développeur d'un module métier,
**je veux** appeler `emailService.send({ to, template: "low-stock", data: {...} })`,
**afin de** ne pas avoir à construire le HTML moi-même et de garantir un rendu cohérent
entre les emails transactionnels.

## Critères d'acceptation

### Scénario 1 : Résolution de template

- **Étant donné** un template enregistré `"low-stock"`
- **Quand** le service reçoit `{ template: "low-stock", data: { productName, sku, stock, threshold } }`
- **Alors** il produit un `{ subject, html }` valide à partir du template et des données

### Scénario 2 : Template alerte stock faible

- **Étant donné** les données `{ productName: "Crème hydratante", sku: "CRM-001", stock: 2, threshold: 5 }`
- **Quand** le template `"low-stock"` est rendu
- **Alors** le sujet contient le nom du produit
- **Et** le HTML contient le nom du produit, le SKU, le stock actuel et le seuil

### Scénario 3 : Template inconnu

- **Étant donné** un appel avec `template: "inexistant"`
- **Quand** le service tente de résoudre le template
- **Alors** une erreur est loguée et l'envoi est abandonné sans propager d'exception

### Scénario 4 : Signature de template

- **Étant donné** un nouveau template à ajouter
- **Alors** il suffit de créer une fonction `(data) => { subject, html }` et de
  l'enregistrer dans le registre de templates

## Non-objectifs

- Pas de moteur de templating externe (Handlebars, Mjml…) : fonctions TS pures.
- Pas d'éditeur admin.
- Pas d'i18n des templates (français uniquement en V1).

## Contraintes

- Templates dans `packages/core/src/modules/email/templates/`.
- Chaque template est une fonction typée : `(data: T) => { subject: string; html: string }`.
- Le HTML est inline (pas de CSS externe) pour la compatibilité email.
- Tests unitaires : vérifier que le rendu contient les données attendues.
