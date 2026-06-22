# Fix JSON Build Error In English Messages

**Date:** 2026-06-19 17:04
**Statut:** Terminé

## Contexte

Le build Next.js échouait pendant le parsing de `apps/pharmacie-1/messages/en.json` à cause d'une chaîne JSON invalide dans les messages i18n.

## Modifications

- [x] `apps/pharmacie-1/messages/en.json` - échappement des guillemets dans la clé `filters.edit.title` pour restaurer un JSON valide
- [x] `tasks/2026-06-19_17h04_fix-json-build-en.md` - journalisation de l'intervention conformément au protocole projet

## Notes

Le symptôme était un `Module parse failed` Webpack avec une erreur JSON à la ligne 397 colonne 25. La correction est volontairement minimale pour remettre le runtime en état rapidement.

## Rollback

Remettre la valeur précédente de `filters.edit.title` dans `apps/pharmacie-1/messages/en.json` puis relancer la validation JSON.
