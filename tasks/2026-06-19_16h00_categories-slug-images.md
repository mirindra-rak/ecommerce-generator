# Catégories admin — slug éditable + images (couverture & miniature)

**Date:** 2026-06-19 16:00
**Statut:** Terminé

## Contexte

Le formulaire admin des catégories manquait de 3 fonctionnalités présentes chez PrestaShop : un slug éditable (SEO), une image de couverture et une miniature. Le slug existait en base mais était invisible/non-modifiable. Les champs images existaient en base mais sans infra d'upload.

## Modifications

- [x] `packages/core/src/modules/catalog/category.repository.ts` — `findBySlug` accepte un `excludeId` optionnel
- [x] `packages/core/src/modules/catalog/category.service.ts` — `slug` optionnel dans Create/UpdateCategoryInput, validation unicité avec exclusion
- [x] `packages/core/src/lib/storage.ts` — **créé** : abstraction `StorageAdapter` + `LocalStorageAdapter` (filesystem)
- [x] `packages/core/package.json` — ajout export `./lib/storage`
- [x] `apps/pharmacie-1/src/app/api/upload/route.ts` — **créé** : route POST upload image (sharp, webp, 5 MB max)
- [x] `apps/pharmacie-1/src/app/admin/(protected)/categories/category-form.tsx` — slug avec auto-sync + section images
- [x] `apps/pharmacie-1/src/app/admin/(protected)/categories/_actions.ts` — lecture slug + coverImageKey/thumbnailKey
- [x] `apps/pharmacie-1/src/app/admin/(protected)/categories/[id]/page.tsx` — passe slug + image keys au formulaire
- [x] `packages/ui/src/components/image-upload.tsx` — **créé** : composant réutilisable d'upload d'image
- [x] `packages/ui/src/components/input.tsx` — ajout support `ref` (React 19)
- [x] `packages/ui/src/icons.tsx` — ajout UploadIcon, ImageIcon, ResetIcon, XIcon, SpinnerIcon
- [x] `packages/ui/src/index.ts` — export ImageUpload
- [x] `apps/pharmacie-1/messages/fr.json` — traductions slug + images
- [x] `apps/pharmacie-1/messages/en.json` — traductions slug + images
- [x] `apps/pharmacie-1/package.json` — ajout dépendance sharp
- [x] `.gitignore` — ignore public/uploads/
- [x] `apps/pharmacie-1/.env.example` — UPLOAD_DIR

## Notes

- Stockage local filesystem pour le MVP. L'abstraction `StorageAdapter` prépare le swap vers S3/MinIO/R2.
- `menuThumbnailKey` existe en base mais n'est pas exposé (différé).
- Le slug est auto-synchronisé depuis le nom côté client, éditable manuellement, validé côté serveur (unicité + slugify).

## Rollback

Revenir au commit précédent. Les champs en base (`slug`, `coverImageKey`, `thumbnailKey`) existaient déjà — aucune migration nécessaire.
