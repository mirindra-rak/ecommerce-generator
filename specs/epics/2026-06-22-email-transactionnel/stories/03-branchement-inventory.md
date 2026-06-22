# Story : Branchement inventory → service email réel

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation** : S (~0.5 jour)
**Epic parent** : [Email transactionnel](../epic.md)

## Contexte

Le module `inventory` dispose d'un `emailNotifier` qui log en `console.warn` les
alertes de stock faible. Le service email et le template `"low-stock"` étant prêts
(stories 01-02), on branche le notifier sur le vrai service d'envoi.

## User Story

**En tant qu'** administrateur de la pharmacie,
**je veux** recevoir un email quand le stock d'un produit passe sous le seuil d'alerte,
**afin de** pouvoir réapprovisionner avant la rupture.

## Critères d'acceptation

### Scénario 1 : Alerte email envoyée

- **Étant donné** un variant avec alerte activée, seuil à 5, stock à 6
- **Quand** un ajustement fait passer le stock à 4
- **Alors** le service email envoie un email avec le template `"low-stock"` à
  l'adresse configurée dans `ALERT_EMAIL_TO`

### Scénario 2 : Pas de variable `ALERT_EMAIL_TO`

- **Étant donné** `ALERT_EMAIL_TO` non configurée
- **Quand** une alerte de stock faible se déclenche
- **Alors** l'email n'est pas envoyé et un warning est logué

### Scénario 3 : Échec d'envoi

- **Étant donné** un transport SMTP en erreur
- **Quand** l'alerte tente d'envoyer l'email
- **Alors** l'ajustement de stock a réussi, l'erreur email est loguée mais ne
  bloque pas l'opération

### Scénario 4 : Pas de régression

- **Étant donné** les 19 tests unitaires existants du module inventory
- **Quand** le branchement est effectué
- **Alors** tous les tests passent sans modification

## Non-objectifs

- Pas de page admin pour configurer les destinataires (variable d'environnement).
- Pas de templates pour d'autres types d'email (confirmation commande, etc.) — seront
  ajoutés avec les modules correspondants.

## Contraintes

- Le fichier `email-notifier.ts` du module inventory est modifié pour appeler le
  service email au lieu de `console.warn`.
- L'adresse destinataire reste dans `ALERT_EMAIL_TO` (variable d'environnement).
- Le couplage est minimal : `inventory` importe uniquement la fonction d'envoi depuis
  `@pharmacie/core/modules/email`.
