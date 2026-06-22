# Plan : Email transactionnel (lot 4.10)

**Ticket** : [epic.md](./epic.md) · **Statut** 🟡

## Résumé

Construire le module d'envoi d'emails transactionnels avec transport Strategy
(SMTP + console), moteur de templates TS, et branchement sur le notifier inventory.

## Fichiers à créer ou modifier

### Story 01 — Service d'envoi + transport Strategy

- `packages/core/package.json` — modifié : ajout dépendance `nodemailer` + `@types/nodemailer`
- `packages/core/src/modules/email/email.types.ts` — créé : types `EmailMessage`, `EmailTransport`, `SendOptions`
- `packages/core/src/modules/email/transports/console.transport.ts` — créé : transport console (log)
- `packages/core/src/modules/email/transports/smtp.transport.ts` — créé : transport SMTP (Nodemailer)
- `packages/core/src/modules/email/email.service.ts` — créé : service d'envoi (sélection transport, fail-safe)
- `packages/core/src/modules/email/email.service.test.ts` — créé : tests unitaires avec mock transport
- `packages/core/src/modules/email/index.ts` — modifié : exports publics

### Story 02 — Moteur de templates

- `packages/core/src/modules/email/templates/low-stock.ts` — créé : template alerte stock faible
- `packages/core/src/modules/email/templates/registry.ts` — créé : registre de templates (map nom → fonction)
- `packages/core/src/modules/email/templates/layout.ts` — créé : layout HTML commun (header, footer, styles inline)
- `packages/core/src/modules/email/email.service.ts` — modifié : ajout surcharge `send` avec `template` + `data`
- `packages/core/src/modules/email/email.service.test.ts` — modifié : tests templates

### Story 03 — Branchement inventory

- `packages/core/src/modules/inventory/email-notifier.ts` — modifié : appel service email réel
- `packages/core/src/modules/inventory/inventory.service.test.ts` — vérifié : tests existants passent

## Étapes de développement

### Story 01 — Service d'envoi + transport Strategy

1. **Installer nodemailer** — Ajouter `nodemailer` et `@types/nodemailer` dans
   `packages/core/package.json`. Lancer `pnpm install`.
   Test : `pnpm install` sans erreur.

2. **Définir les types** — Créer `email.types.ts` avec les interfaces `EmailMessage`
   (`to`, `subject`, `html`, `from?`) et `EmailTransport` (`send(message): Promise<void>`).
   Test : type-check passe.

3. **Implémenter le transport console** — Créer `transports/console.transport.ts` :
   log `console.info` avec sujet, destinataire et extrait du HTML.
   Test : appeler `send()` → pas d'exception, log visible.

4. **Implémenter le transport SMTP** — Créer `transports/smtp.transport.ts` : crée
   un `nodemailer.createTransport` à partir des variables d'environnement SMTP.
   Test : type-check passe (pas de test d'intégration SMTP).

5. **Construire le service d'envoi** — Créer `email.service.ts` : sélection du
   transport (SMTP si variables présentes, sinon console), méthode `send()` en
   try/catch fail-safe.
   Test : test unitaire avec mock transport → vérifie l'appel + le fail-safe.

6. **Exporter le module** — Mettre à jour `index.ts` avec les exports publics.
   Test : type-check passe.

### Story 02 — Moteur de templates

7. **Créer le layout commun** — `templates/layout.ts` : fonction qui wrappe un
   contenu HTML dans un squelette email (doctype, table, styles inline, header logo,
   footer pharmacie).
   Test : le HTML retourné contient doctype et le contenu injecté.

8. **Créer le template low-stock** — `templates/low-stock.ts` : fonction
   `(data: LowStockData) => { subject, html }`. Le sujet inclut le nom produit.
   Le HTML inclut produit, SKU, stock, seuil.
   Test : vérifier la présence des données dans le rendu.

9. **Créer le registre de templates** — `templates/registry.ts` : map
   `templateName → renderFunction`. Expose `resolveTemplate(name, data)`.
   Test : résoudre `"low-stock"` retourne subject + html. Résoudre un nom inconnu
   retourne `null`.

10. **Intégrer les templates dans le service** — Ajouter une surcharge `send()` qui
    accepte `{ to, template, data }`, résout le template, puis délègue au transport.
    Test : appeler `send({ to, template: "low-stock", data })` → le mock transport
    reçoit le message rendu.

### Story 03 — Branchement inventory

11. **Modifier le notifier inventory** — Remplacer le `console.warn` dans
    `email-notifier.ts` par un appel au service email avec le template
    `"low-stock"` et les données du variant.
    Test : les 19 tests inventory passent. Test unitaire du notifier avec mock
    transport → vérifie l'envoi.

12. **Vérification finale** — Type-check + lint + tests complets.
    Test : `pnpm type-check && pnpm lint && pnpm test` — tout vert.

## Points d'attention

- **Fail-safe critique** : le `try/catch` dans le service doit intercepter les
  erreurs sync ET async. Un email raté ne doit jamais casser un ajustement de stock.
- **Lazy initialization du transport SMTP** : ne pas créer le transporter Nodemailer
  au chargement du module (les variables env peuvent ne pas être définies en test).
  Créer le transporter au premier appel `send()`.
- **HTML email** : pas de CSS externe, pas de `<style>` dans le `<head>` (certains
  clients les strippent). Tout en styles inline.
- **Couplage inventory → email** : le notifier importe uniquement la fonction `send`
  depuis le module email, pas les types de transport ni les templates internes.
