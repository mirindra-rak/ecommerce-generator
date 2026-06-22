# Éditeur rich text WYSIWYG pour les descriptions catégorie

**Date:** 2026-06-22 17:42
**Statut:** Terminé

## Contexte

La description longue de catégorie utilisait un textarea Markdown brut avec panneau de preview. Un utilisateur non technique ne peut pas s'en servir. Remplacement par un éditeur WYSIWYG (Tiptap) avec toolbar : gras, italique, souligné, titres, listes, liens.

## Modifications

- [x] `apps/pharmacie-1/src/components/rich-text-editor.tsx` — nouveau composant éditeur WYSIWYG (Tiptap + toolbar)
- [x] `apps/pharmacie-1/src/components/rich-text-content.tsx` — nouveau composant de rendu HTML sanitisé (remplace MarkdownContent)
- [x] `apps/pharmacie-1/src/app/admin/(protected)/categories/category-form.tsx` — remplace MarkdownEditorField par RichTextEditor
- [x] `apps/pharmacie-1/src/app/[locale]/(storefront)/categorie/[slug]/page.tsx` — remplace MarkdownContent par RichTextContent
- [x] `apps/pharmacie-1/messages/fr.json` — supprime les clés markdownHint et preview
- [x] `apps/pharmacie-1/messages/en.json` — supprime les clés markdownHint et preview
- [x] `apps/pharmacie-1/src/components/markdown-content.tsx` — supprimé
- [x] `apps/pharmacie-1/package.json` — ajout @tiptap/\*, sanitize-html ; retrait react-markdown, remark-gfm

## Notes

- Tiptap stocke du HTML, pas du Markdown — plus cohérent avec les seed data produits qui étaient déjà en HTML.
- Le rendu storefront utilise sanitize-html avec whitelist stricte (p, strong, em, u, a, h2, h3, ul, ol, li, blockquote).
- Type-check et lint passent.

## Rollback

Réinstaller react-markdown + remark-gfm, restaurer markdown-content.tsx, remettre MarkdownEditorField dans category-form.tsx, supprimer les composants rich-text-\*.
