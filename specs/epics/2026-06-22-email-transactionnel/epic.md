# Epic : Email transactionnel (lot 4.10)

**Date** : 2026-06-22 · **Statut** 🟡 · **Estimation globale** : M (~2-3 jours)

## Contexte & vision

Le projet dispose d'un module `email` stub vide dans `packages/core/src/modules/email/`.
Plusieurs modules ont besoin d'envoyer des emails transactionnels : `inventory` (alertes
stock faible, actuellement en `console.warn`), et à terme `order` (confirmation),
`auth` (reset password), `customer` (bienvenue).

Cet epic construit le **socle d'envoi d'emails transactionnels** :

- un **service d'envoi** avec transport configurable (Strategy pattern) ;
- un **transport SMTP** via Nodemailer comme implémentation par défaut ;
- un **moteur de templates** HTML minimal pour les emails transactionnels ;
- le **branchement** du notifier `inventory` sur le vrai service d'envoi.

Contrainte structurante : modèle **Silo** (1 base = 1 pharmacie) et **Repository
pattern** obligatoire dans `packages/core`.

## Objectifs

- Construire un **service de domaine `email`** dans `packages/core/src/modules/email/`
  avec une interface d'envoi découplée du transport (`EmailTransport` Strategy).
- Implémenter un **transport SMTP** (Nodemailer) configurable via variables
  d'environnement (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
- Fournir un **transport console** (dev/test) qui log les emails sans les envoyer.
- Créer un **moteur de templates** simple : templates HTML inline (fonctions TS qui
  retournent `{ subject, html }`) pour chaque type d'email transactionnel.
- Livrer le **premier template** : alerte stock faible.
- **Brancher** le `emailNotifier` du module `inventory` sur le service d'envoi réel.
- **Tester** le service avec des tests unitaires (transport mocké).

## Non-objectifs

- **Newsletter / email marketing** : hors scope, module dédié si besoin.
- **File d'attente / retry async** (Bull, SQS…) : l'envoi est synchrone dans cette
  V1. Un retry/queue sera ajouté si le volume le justifie.
- **Éditeur de templates admin** : les templates sont codés en TS, pas éditables
  depuis le back-office.
- **Tracking d'ouverture / clics** : hors scope.
- **Multi-provider** (SendGrid, SES, Resend…) : le pattern Strategy le permet mais
  seul SMTP est implémenté ici.
- **Pièces jointes** : hors scope V1.

## Parcours global

1. Le **service email** reçoit un appel `send({ to, template, data })`.
2. Le **moteur de templates** résout le template et produit `{ subject, html }`.
3. Le **transport actif** (SMTP ou console) envoie le message.
4. En cas d'erreur, le service log l'échec (`console.error`) et ne propage pas
   l'exception (l'envoi d'email ne doit pas casser un flux métier critique).

## Stories

| #   | Titre                                                 | Priorité | Est. | Dépend de |
| --- | ----------------------------------------------------- | -------- | ---- | --------- |
| 01  | Service d'envoi + transport Strategy (SMTP + console) | P0       | M    | —         |
| 02  | Moteur de templates + template alerte stock faible    | P0       | S    | 01        |
| 03  | Branchement inventory → service email réel            | P0       | S    | 01, 02    |

## Contraintes

- **Repository pattern** : pas d'accès données dans le module email (il n'a pas de
  table propre en V1). Le service est un pur envoyeur.
- **Variables d'environnement** : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
  `SMTP_FROM`. Si absentes → fallback sur le transport console.
- **Fail-safe** : un échec d'envoi d'email ne doit jamais faire échouer l'opération
  métier appelante (try/catch + log).
- **Nodemailer** : dépendance ajoutée dans `packages/core/package.json`.
- **Tests** : le transport console + un mock transport suffisent pour les tests
  unitaires, pas besoin d'un vrai serveur SMTP.
- **i18n** : les templates sont en français (langue unique du storefront V1). L'i18n
  des templates sera traitée quand le storefront sera réellement multilingue.

## Jalons

1. **M1 — Service + transport** (story 01) : le module sait envoyer un email via
   SMTP ou loguer en console.
2. **M2 — Templates** (story 02) : le premier template (alerte stock) est prêt.
3. **M3 — Intégration** (story 03) : le notifier inventory envoie de vrais emails.

## Références

- Module email stub : `packages/core/src/modules/email/index.ts`
- Notifier inventory : `packages/core/src/modules/inventory/email-notifier.ts`
- Interface `LowStockNotifier` : `packages/core/src/modules/inventory/inventory.types.ts`
