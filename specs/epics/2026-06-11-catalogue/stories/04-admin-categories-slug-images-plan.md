# Plan : Catégories admin — slug éditable + images (couverture & miniature)

**Ticket** : évolution formulaire catégorie (story 04 bis) · **Statut** ✅

## Résumé

Exposer le slug (déjà en base, mais auto-généré et invisible) dans le formulaire admin avec édition manuelle, et ajouter l'upload d'images de couverture et de miniature avec stockage local (filesystem) en attendant S3/MinIO.

## État des lieux

| Élément                                        | Existe déjà                             | Manque                                                              |
| ---------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| Champ `slug` en base                           | ✅ `@unique`                            | Pas exposé dans le formulaire, pas mis à jour dans `updateCategory` |
| Champs `coverImageKey`, `thumbnailKey` en base | ✅ conçus pour S3                       | Pas de route d'upload, pas de client storage, pas d'UI              |
| `sharp` (traitement image)                     | ✅ installé en root                     | Pas utilisé                                                         |
| `slugify()` + `buildUniqueSlug()`              | ✅ `packages/core/src/utils/slugify.ts` | —                                                                   |
| Dossier `public/images/`                       | ✅ images statiques                     | Pas de sous-dossier `uploads/`                                      |

## Fichiers à créer ou modifier

### Slug

- `packages/core/src/modules/catalog/category.service.ts` — **modifier** : accepter `slug` optionnel dans `CreateCategoryInput` et `UpdateCategoryInput` ; si fourni, le slugifier + vérifier unicité (exclure l'id courant en update) ; sinon, auto-générer depuis le nom comme aujourd'hui.
- `apps/pharmacie-1/src/app/admin/(protected)/categories/_actions.ts` — **modifier** : lire le champ `slug` du FormData, le passer au service.
- `apps/pharmacie-1/src/app/admin/(protected)/categories/category-form.tsx` — **modifier** : ajouter champ slug avec auto-génération client-side depuis le nom + possibilité d'édition manuelle.
- `apps/pharmacie-1/src/app/admin/(protected)/categories/[id]/page.tsx` — **modifier** : passer `slug` dans les props de `CategoryForm`.

### Images (upload local filesystem)

- `packages/core/src/lib/storage.ts` — **créer** : abstraction Storage avec implémentation locale (`LocalStorage` : écrit dans `public/uploads/`, retourne la clé relative). Interface simple `put(key, buffer) → url`, `delete(key)`, `url(key)`. Préparé pour swap S3 futur.
- `apps/pharmacie-1/src/app/api/upload/route.ts` — **créer** : route POST pour upload d'image. Accepte `multipart/form-data`, valide type MIME (image/\*), taille max (~5 MB), optimise avec `sharp` (resize, webp), stocke via l'abstraction Storage, retourne `{ key, url }`.
- `apps/pharmacie-1/src/app/admin/(protected)/categories/category-form.tsx` — **modifier** : ajouter section « Images » avec 2 composants d'upload (couverture + miniature). Chaque upload appelle la route API, stocke la `key` dans un hidden input.
- `packages/ui/src/components/image-upload.tsx` — **créer** : composant réutilisable d'upload d'image (preview, drag & drop, suppression). Utilisable aussi pour les produits plus tard.
- `apps/pharmacie-1/src/app/admin/(protected)/categories/_actions.ts` — **modifier** : lire `coverImageKey` et `thumbnailKey` du FormData, les passer au service.
- `packages/core/src/modules/catalog/category.service.ts` — **modifier** (déjà fait) : `toContentData` passe déjà `coverImageKey`/`thumbnailKey` à Prisma, il suffit que l'action les fournisse.

### Configuration

- `apps/pharmacie-1/.env.example` — **modifier** : ajouter `UPLOAD_DIR` (par défaut `public/uploads`).
- `apps/pharmacie-1/.gitignore` — **modifier** : ignorer `public/uploads/` (images uploadées localement).

## Étapes de développement

### Phase 1 — Slug éditable

1. **Service : accepter un slug optionnel** — Modifier `CreateCategoryInput` et `UpdateCategoryInput` pour ajouter `slug?: string`. Dans `createCategory`, si `slug` fourni, le slugifier + vérifier unicité ; sinon, auto-générer. Dans `updateCategory`, si `slug` fourni et différent du slug actuel, slugifier + vérifier unicité (en excluant l'id courant). Test : appel service avec slug custom → persiste en base ; slug dupliqué → suffixe auto.

2. **Repository : findBySlugExcluding** — Ajouter une méthode `findBySlug(slug, excludeId?)` ou adapter l'existante pour supporter un `excludeId` optionnel (nécessaire pour la validation en update). Test : slug unique sauf pour l'enregistrement courant.

3. **Action : lire le slug du formulaire** — Lire `formData.get("slug")` dans `readContentFields` ou à part, le passer au service. Test : soumission formulaire avec slug custom → catégorie créée/mise à jour avec ce slug.

4. **Formulaire : champ slug avec auto-sync** — Ajouter un `Input` slug sous le champ nom. Comportement : tant que l'utilisateur n'a pas touché le slug manuellement, il se met à jour automatiquement en slugifiant le nom (côté client). Dès qu'il est édité manuellement, il se « décroche » du nom. Bouton pour re-synchroniser. En mode édition, pré-rempli avec le slug existant. Test : taper un nom → slug se met à jour ; éditer le slug → il se fige ; cliquer re-sync → il se re-calcule depuis le nom.

### Phase 2 — Infra upload

5. **Abstraction Storage** — Créer `packages/core/src/lib/storage.ts` avec interface `StorageAdapter { put(key: string, buffer: Buffer, contentType: string): Promise<string>; delete(key: string): Promise<void>; url(key: string): string }` et `LocalStorageAdapter` qui écrit dans un dossier configurable. Test : `put` crée le fichier, `url` retourne le chemin relatif, `delete` supprime.

6. **Route API upload** — `POST /api/upload` : parse multipart (Next.js native `request.formData()`), valide MIME image (jpeg/png/webp/avif), taille ≤ 5 MB, resize avec `sharp` (max 1200px large, webp 80%), stocke via `LocalStorageAdapter`, retourne `{ key, url }`. Authentification via `requireStaff()`. Test : upload d'une image → fichier créé dans `public/uploads/`, réponse JSON correcte ; fichier trop gros → 413 ; mauvais type → 415.

7. **Gitignore uploads** — Ajouter `public/uploads/` au `.gitignore`. `.env.example` : ajouter `UPLOAD_DIR`.

### Phase 3 — UI upload dans le formulaire

8. **Composant ImageUpload** — `packages/ui/src/components/image-upload.tsx` : zone de drop / clic pour choisir un fichier, preview de l'image actuelle, bouton supprimer, appel à une `onUpload(file) → Promise<{ key, url }>` fournie par le parent. État : `idle | uploading | uploaded | error`. Test : rendu sans image = placeholder ; upload → preview ; supprimer → retour placeholder.

9. **Intégrer dans le formulaire catégorie** — Nouvelle section « Images » dans `category-form.tsx` avec 2 `ImageUpload` (couverture : recommandation taille ~1200×400, miniature : ~300×300). Chaque composant stocke la `key` dans un `<input type="hidden">`. Test : upload image → hidden input rempli → soumission formulaire → catégorie sauvée avec `coverImageKey`/`thumbnailKey`.

10. **Actions : passer les clés images** — Lire `coverImageKey` et `thumbnailKey` du FormData dans `readContentFields`. Le service les propage déjà via `toContentData`. Test : soumission avec clés images → persisté en base ; soumission sans image → champs restent `null`.

## Points d'attention

- **Stockage local = dev/MVP seulement** — Les images dans `public/uploads/` ne survivent pas à un redéploiement sur une infra éphémère. L'abstraction `StorageAdapter` prépare le swap vers S3/MinIO/R2 sans toucher au reste du code. 🚧 Prévoir une story dédiée au storage cloud.
- **Slug : unicité en update** — Le `findBySlug` doit exclure la catégorie courante lors de la validation, sinon sauver une catégorie sans changer son slug échouera toujours.
- **Slug : synchronisation client** — Utiliser `slugify` côté client (l'utilitaire est dans `packages/core`, importable). Le slug affiché est un aperçu ; la validation finale (unicité, suffixe) se fait côté serveur.
- **Sharp + Next.js** — `sharp` fonctionne uniquement en runtime `nodejs` (pas edge). La route `/api/upload` doit être en `export const runtime = "nodejs"`.
- **Suppression d'image** — Si l'utilisateur supprime une image existante et sauvegarde, il faut aussi supprimer le fichier physique. Prévoir un `storage.delete(oldKey)` dans le service avant de mettre à jour la clé.
- **`menuThumbnailKey`** — Le champ existe en base mais on ne l'expose pas (jugé différable). Le mentionner dans la section « Images » comme « à venir ».

✅ Plan rédigé dans `specs/epics/2026-06-11-catalogue/stories/04-admin-categories-slug-images-plan.md`. À relire avant /coder.
